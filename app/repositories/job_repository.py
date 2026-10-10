"""Job repository for database operations on jobs."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.job import Job, JobStatus


class JobRepository:
    """Repository for Job database operations."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, job: Job) -> Job:
        self.session.add(job)
        await self.session.flush()
        return job

    async def get_by_id(self, job_id: uuid.UUID) -> Job | None:
        result = await self.session.execute(
            select(Job).where(Job.id == job_id)
        )
        return result.scalar_one_or_none()

    async def get_by_idempotency_key(self, key: str) -> Job | None:
        result = await self.session.execute(
            select(Job).where(Job.idempotency_key == key)
        )
        return result.scalar_one_or_none()

    async def list_jobs(
        self,
        page: int = 1,
        page_size: int = 20,
        status: str | None = None,
        search: str | None = None,
    ) -> tuple[list[Job], int]:
        query = select(Job)
        count_query = select(func.count(Job.id))

        if status:
            query = query.where(Job.status == status)
            count_query = count_query.where(Job.status == status)

        if search:
            query = query.where(
                Job.id.cast(String).ilike(f"%{search}%")
            )
            count_query = count_query.where(
                Job.id.cast(String).ilike(f"%{search}%")
            )

        # Get total count
        total_result = await self.session.execute(count_query)
        total = total_result.scalar() or 0

        # Get paginated results
        query = query.order_by(Job.created_at.desc())
        query = query.offset((page - 1) * page_size).limit(page_size)
        result = await self.session.execute(query)
        jobs = list(result.scalars().all())

        return jobs, total

    async def update_status(
        self,
        job_id: uuid.UUID,
        status: JobStatus,
        started_at: datetime | None = None,
        completed_at: datetime | None = None,
    ) -> Job | None:
        job = await self.get_by_id(job_id)
        if job:
            job.status = status
            if started_at:
                job.started_at = started_at
            if completed_at:
                job.completed_at = completed_at
            await self.session.flush()
        return job

    async def increment_counts(
        self,
        job_id: uuid.UUID,
        processed: int = 0,
        success: int = 0,
        failure: int = 0,
    ) -> Job | None:
        job = await self.get_by_id(job_id)
        if job:
            job.processed_count += processed
            job.success_count += success
            job.failure_count += failure
            await self.session.flush()
        return job

    async def get_stats(self) -> dict:
        """Get dashboard statistics."""
        # Total jobs
        total_result = await self.session.execute(
            select(func.count(Job.id))
        )
        total_jobs = total_result.scalar() or 0

        # Jobs by status
        status_counts = {}
        for status in JobStatus:
            result = await self.session.execute(
                select(func.count(Job.id)).where(Job.status == status)
            )
            status_counts[status.value] = result.scalar() or 0

        return {
            "total_jobs": total_jobs,
            "pending_jobs": status_counts.get("PENDING", 0),
            "processing_jobs": status_counts.get("PROCESSING", 0),
            "completed_jobs": status_counts.get("COMPLETED", 0)
            + status_counts.get("COMPLETED_WITH_ERRORS", 0),
        }

    async def get_recent_jobs(self, limit: int = 5) -> list[Job]:
        result = await self.session.execute(
            select(Job).order_by(Job.created_at.desc()).limit(limit)
        )
        return list(result.scalars().all())
