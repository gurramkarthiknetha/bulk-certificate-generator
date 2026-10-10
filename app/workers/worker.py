"""ARQ background worker for certificate generation."""

import logging
import uuid
from datetime import datetime, timezone

from arq import cron
from arq.connections import RedisSettings

from app.core.config import get_settings
from app.db.session import async_session_factory
from app.models.certificate import Certificate, CertificateStatus
from app.models.job import Job, JobStatus
from app.repositories.certificate_repository import CertificateRepository
from app.repositories.job_repository import JobRepository
from app.services.certificate_service import CertificateGenerationService
from app.services.storage import get_storage
from app.templates.registry import get_template_registry

logger = logging.getLogger(__name__)

settings = get_settings()


async def process_job(ctx: dict, job_id: str) -> dict:
    """Process a certificate generation job.

    This function is called by the ARQ worker. It processes certificates
    in batches to control memory usage and provide progress updates.
    """
    job_uuid = uuid.UUID(job_id)
    storage = get_storage()
    registry = get_template_registry()
    gen_service = CertificateGenerationService(registry, storage)

    async with async_session_factory() as session:
        job_repo = JobRepository(session)
        cert_repo = CertificateRepository(session)

        # Mark job as processing
        job = await job_repo.get_by_id(job_uuid)
        if not job:
            logger.error(f"Job {job_id} not found")
            return {"error": "Job not found"}

        if job.status not in (JobStatus.PENDING, JobStatus.PROCESSING):
            logger.info(f"Job {job_id} is in state {job.status}, skipping")
            return {"status": "skipped"}

        await job_repo.update_status(
            job_uuid,
            JobStatus.PROCESSING,
            started_at=datetime.now(timezone.utc),
        )
        await session.commit()

    # Process in batches
    batch_size = settings.BATCH_SIZE
    total_success = 0
    total_failure = 0

    while True:
        async with async_session_factory() as session:
            cert_repo = CertificateRepository(session)
            job_repo = JobRepository(session)

            # Get next batch of pending certificates
            pending = await cert_repo.get_pending_by_job(job_uuid, limit=batch_size)

            if not pending:
                break

            for cert in pending:
                # Skip if already completed (idempotency for retries)
                if cert.status == CertificateStatus.COMPLETED:
                    continue

                # Mark as processing
                cert.status = CertificateStatus.PROCESSING
                await session.flush()

                # Generate the certificate
                storage_key, error = await gen_service.generate_certificate(
                    certificate=cert,
                    template_name=job.template_name,
                    course_name=job.course_name,
                    organization_name=job.organization_name,
                )

                if error:
                    # Check if retryable
                    is_retryable = not _is_permanent_failure(error)
                    cert.attempt_count += 1

                    if is_retryable and cert.attempt_count < settings.MAX_RETRIES:
                        # Reset to pending for retry
                        cert.status = CertificateStatus.PENDING
                        cert.error_message = error
                        logger.warning(
                            f"Certificate {cert.id} failed (attempt {cert.attempt_count}), "
                            f"will retry: {error}"
                        )
                    else:
                        cert.status = CertificateStatus.FAILED
                        cert.error_message = error
                        cert.completed_at = datetime.now(timezone.utc)
                        total_failure += 1
                        logger.error(
                            f"Certificate {cert.id} failed permanently: {error}"
                        )
                else:
                    cert.status = CertificateStatus.COMPLETED
                    cert.storage_key = storage_key
                    cert.completed_at = datetime.now(timezone.utc)
                    cert.attempt_count += 1
                    total_success += 1

                await session.flush()

            # Update job counts
            await job_repo.increment_counts(
                job_uuid,
                processed=len(pending),
                success=total_success,
                failure=total_failure,
            )
            total_success = 0
            total_failure = 0
            await session.commit()

    # Finalize job status
    async with async_session_factory() as session:
        job_repo = JobRepository(session)
        cert_repo = CertificateRepository(session)

        job = await job_repo.get_by_id(job_uuid)
        if job:
            # Recount to ensure accuracy
            certs, total = await cert_repo.list_by_job(job_uuid, page=1, page_size=1)
            stats = await cert_repo.get_stats()

            if job.failure_count > 0 and job.success_count > 0:
                final_status = JobStatus.COMPLETED_WITH_ERRORS
            elif job.failure_count > 0 and job.success_count == 0:
                final_status = JobStatus.FAILED
            else:
                final_status = JobStatus.COMPLETED

            await job_repo.update_status(
                job_uuid,
                final_status,
                completed_at=datetime.now(timezone.utc),
            )
            await session.commit()

    logger.info(f"Job {job_id} completed with status {final_status}")
    return {"status": final_status.value}


def _is_permanent_failure(error: str) -> bool:
    """Determine if an error is permanent (should not be retried)."""
    permanent_indicators = [
        "not found",
        "invalid",
        "validation",
        "missing",
    ]
    error_lower = error.lower()
    return any(indicator in error_lower for indicator in permanent_indicators)


async def startup(ctx: dict) -> None:
    """Worker startup hook."""
    logger.info("Certificate worker starting up")


async def shutdown(ctx: dict) -> None:
    """Worker shutdown hook."""
    logger.info("Certificate worker shutting down")


class WorkerSettings:
    """ARQ worker settings."""

    functions = [process_job]
    on_startup = startup
    on_shutdown = shutdown
    redis_settings = RedisSettings.from_dsn(settings.REDIS_URL)
    max_jobs = settings.WORKER_CONCURRENCY
    job_timeout = 3600  # 1 hour
    max_tries = 1  # We handle retries ourselves
