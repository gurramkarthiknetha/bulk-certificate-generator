"""Job service for business logic around certificate generation jobs."""

import hashlib
import json
import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.models.certificate import Certificate, CertificateStatus
from app.models.job import Job, JobStatus
from app.repositories.certificate_repository import CertificateRepository
from app.repositories.job_repository import JobRepository
from app.schemas import JobCreateRequest


class JobService:
    """Service for managing certificate generation jobs."""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.job_repo = JobRepository(session)
        self.cert_repo = CertificateRepository(session)
        self.settings = get_settings()

    def _compute_request_hash(self, request: JobCreateRequest) -> str:
        """Compute a deterministic hash of the request payload."""
        payload = json.dumps(
            {
                "template_name": request.template_name,
                "course_name": request.course_name,
                "organization_name": request.organization_name,
                "recipients": [
                    {"name": r.name, "email": r.email}
                    for r in sorted(request.recipients, key=lambda x: x.email)
                ],
            },
            sort_keys=True,
        )
        return hashlib.sha256(payload.encode()).hexdigest()

    async def create_job(
        self, request: JobCreateRequest, idempotency_key: str
    ) -> tuple[Job, bool]:
        """Create a new certificate generation job.

        Returns:
            Tuple of (job, is_new) where is_new is False if an existing job
            was found for the idempotency key.
        """
        # Check for existing job with same idempotency key
        existing_job = await self.job_repo.get_by_idempotency_key(idempotency_key)
        request_hash = self._compute_request_hash(request)

        if existing_job:
            if existing_job.request_hash != request_hash:
                raise ValueError(
                    "Idempotency key already used with a different request payload"
                )
            return existing_job, False

        # Validate recipient count
        if len(request.recipients) > self.settings.MAX_RECIPIENTS_PER_REQUEST:
            raise ValueError(
                f"Maximum {self.settings.MAX_RECIPIENTS_PER_REQUEST} recipients allowed per request"
            )

        # Create job
        job = Job(
            status=JobStatus.PENDING,
            template_name=request.template_name,
            course_name=request.course_name,
            organization_name=request.organization_name,
            total_count=len(request.recipients),
            idempotency_key=idempotency_key,
            request_hash=request_hash,
        )
        job = await self.job_repo.create(job)

        # Create certificate records
        certificates = [
            Certificate(
                job_id=job.id,
                recipient_name=recipient.name,
                recipient_email=recipient.email,
                status=CertificateStatus.PENDING,
            )
            for recipient in request.recipients
        ]
        await self.cert_repo.create_bulk(certificates)

        return job, True

    async def get_job(self, job_id: uuid.UUID) -> Job | None:
        return await self.job_repo.get_by_id(job_id)

    async def list_jobs(
        self,
        page: int = 1,
        page_size: int = 20,
        status: str | None = None,
        search: str | None = None,
    ) -> tuple[list[Job], int]:
        return await self.job_repo.list_jobs(page, page_size, status, search)

    async def get_dashboard_stats(self) -> dict:
        """Get combined dashboard statistics."""
        job_stats = await self.job_repo.get_stats()
        cert_stats = await self.cert_repo.get_stats()
        recent_jobs = await self.job_repo.get_recent_jobs(5)

        return {
            **job_stats,
            **cert_stats,
            "recent_jobs": recent_jobs,
        }
