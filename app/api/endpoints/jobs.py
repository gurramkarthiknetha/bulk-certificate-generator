"""Job endpoints for creating and managing certificate generation jobs."""

import logging
import uuid

from arq.connections import ArqRedis, create_pool, RedisSettings
from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.db.session import get_db
from app.models.job import Job, JobStatus
from app.repositories.certificate_repository import CertificateRepository
from app.schemas import (
    CertificateListResponse,
    CertificateResponse,
    JobCreateRequest,
    JobCreateResponse,
    JobListResponse,
    JobResponse,
)
from app.services.job_service import JobService

logger = logging.getLogger(__name__)
router = APIRouter()
settings = get_settings()


def _job_to_response(job: Job) -> JobResponse:
    """Convert a Job model to a JobResponse schema."""
    progress = 0.0
    if job.total_count > 0:
        progress = round((job.processed_count / job.total_count) * 100, 1)
    return JobResponse(
        job_id=job.id,
        status=job.status.value,
        template_name=job.template_name,
        course_name=job.course_name,
        organization_name=job.organization_name,
        total_count=job.total_count,
        processed_count=job.processed_count,
        success_count=job.success_count,
        failure_count=job.failure_count,
        progress_percentage=progress,
        created_at=job.created_at,
        started_at=job.started_at,
        completed_at=job.completed_at,
    )


@router.post("", response_model=JobCreateResponse, status_code=202)
async def create_job(
    request: JobCreateRequest,
    idempotency_key: str = Header(..., alias="Idempotency-Key"),
    db: AsyncSession = Depends(get_db),
):
    """Create a new certificate generation job."""
    service = JobService(db)

    try:
        job, is_new = await service.create_job(request, idempotency_key)
    except ValueError as e:
        error_msg = str(e)
        if "already used with a different" in error_msg:
            raise HTTPException(status_code=409, detail=error_msg)
        raise HTTPException(status_code=400, detail=error_msg)

    if is_new:
        # Enqueue background job
        try:
            redis = await create_pool(
                RedisSettings.from_dsn(settings.REDIS_URL)
            )
            await redis.enqueue_job("process_job", str(job.id))
            await redis.close()
        except Exception as e:
            logger.error(f"Failed to enqueue job {job.id}: {e}")
            # Job is persisted in DB, worker recovery can pick it up

    status_code = 202 if is_new else 200
    return JobCreateResponse(
        job_id=job.id,
        status=job.status.value,
        total_count=job.total_count,
    )


@router.get("", response_model=JobListResponse)
async def list_jobs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: str | None = Query(None),
    search: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """List certificate generation jobs with pagination."""
    service = JobService(db)
    jobs, total = await service.list_jobs(page, page_size, status, search)

    return JobListResponse(
        items=[_job_to_response(j) for j in jobs],
        page=page,
        page_size=page_size,
        total=total,
    )


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific certificate generation job."""
    service = JobService(db)
    job = await service.get_job(job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return _job_to_response(job)


@router.get("/{job_id}/certificates", response_model=CertificateListResponse)
async def list_job_certificates(
    job_id: uuid.UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    status: str | None = Query(None),
    search: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """List certificates for a specific job."""
    # Verify job exists
    service = JobService(db)
    job = await service.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    cert_repo = CertificateRepository(db)
    certs, total = await cert_repo.list_by_job(job_id, page, page_size, status, search)

    return CertificateListResponse(
        items=[
            CertificateResponse(
                id=c.id,
                job_id=c.job_id,
                recipient_name=c.recipient_name,
                recipient_email=c.recipient_email,
                status=c.status.value,
                storage_key=c.storage_key,
                error_message=c.error_message,
                attempt_count=c.attempt_count,
                created_at=c.created_at,
                completed_at=c.completed_at,
            )
            for c in certs
        ],
        page=page,
        page_size=page_size,
        total=total,
    )


@router.get(
    "/{job_id}/certificates/{certificate_id}",
    response_model=CertificateResponse,
)
async def get_certificate(
    job_id: uuid.UUID,
    certificate_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific certificate."""
    cert_repo = CertificateRepository(db)
    cert = await cert_repo.get_by_id_and_job(certificate_id, job_id)

    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    return CertificateResponse(
        id=cert.id,
        job_id=cert.job_id,
        recipient_name=cert.recipient_name,
        recipient_email=cert.recipient_email,
        status=cert.status.value,
        storage_key=cert.storage_key,
        error_message=cert.error_message,
        attempt_count=cert.attempt_count,
        created_at=cert.created_at,
        completed_at=cert.completed_at,
    )
