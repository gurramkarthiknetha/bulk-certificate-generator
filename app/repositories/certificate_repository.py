"""Certificate repository for database operations on certificates."""

import uuid

from sqlalchemy import String, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.certificate import Certificate, CertificateStatus


class CertificateRepository:
    """Repository for Certificate database operations."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_bulk(self, certificates: list[Certificate]) -> list[Certificate]:
        self.session.add_all(certificates)
        await self.session.flush()
        return certificates

    async def get_by_id(self, cert_id: uuid.UUID) -> Certificate | None:
        result = await self.session.execute(
            select(Certificate).where(Certificate.id == cert_id)
        )
        return result.scalar_one_or_none()

    async def get_by_id_and_job(
        self, cert_id: uuid.UUID, job_id: uuid.UUID
    ) -> Certificate | None:
        result = await self.session.execute(
            select(Certificate).where(
                Certificate.id == cert_id,
                Certificate.job_id == job_id,
            )
        )
        return result.scalar_one_or_none()

    async def list_by_job(
        self,
        job_id: uuid.UUID,
        page: int = 1,
        page_size: int = 50,
        status: str | None = None,
        search: str | None = None,
    ) -> tuple[list[Certificate], int]:
        query = select(Certificate).where(Certificate.job_id == job_id)
        count_query = select(func.count(Certificate.id)).where(
            Certificate.job_id == job_id
        )

        if status:
            query = query.where(Certificate.status == status)
            count_query = count_query.where(Certificate.status == status)

        if search:
            search_filter = Certificate.recipient_name.ilike(f"%{search}%")
            query = query.where(search_filter)
            count_query = count_query.where(search_filter)

        total_result = await self.session.execute(count_query)
        total = total_result.scalar() or 0

        query = query.order_by(Certificate.created_at.asc())
        query = query.offset((page - 1) * page_size).limit(page_size)
        result = await self.session.execute(query)
        certs = list(result.scalars().all())

        return certs, total

    async def list_all(
        self,
        page: int = 1,
        page_size: int = 50,
        status: str | None = None,
        search: str | None = None,
    ) -> tuple[list[Certificate], int]:
        query = select(Certificate)
        count_query = select(func.count(Certificate.id))

        if status:
            query = query.where(Certificate.status == status)
            count_query = count_query.where(Certificate.status == status)

        if search:
            search_filter = Certificate.recipient_name.ilike(f"%{search}%")
            query = query.where(search_filter)
            count_query = count_query.where(search_filter)

        total_result = await self.session.execute(count_query)
        total = total_result.scalar() or 0

        query = query.order_by(Certificate.created_at.desc())
        query = query.offset((page - 1) * page_size).limit(page_size)
        result = await self.session.execute(query)
        certs = list(result.scalars().all())

        return certs, total

    async def get_completed_by_job(
        self, job_id: uuid.UUID
    ) -> list[Certificate]:
        result = await self.session.execute(
            select(Certificate).where(
                Certificate.job_id == job_id,
                Certificate.status == CertificateStatus.COMPLETED,
            )
        )
        return list(result.scalars().all())

    async def get_pending_by_job(
        self, job_id: uuid.UUID, limit: int = 50
    ) -> list[Certificate]:
        result = await self.session.execute(
            select(Certificate)
            .where(
                Certificate.job_id == job_id,
                Certificate.status == CertificateStatus.PENDING,
            )
            .limit(limit)
        )
        return list(result.scalars().all())

    async def update_status(
        self,
        cert_id: uuid.UUID,
        status: CertificateStatus,
        storage_key: str | None = None,
        error_message: str | None = None,
        completed_at=None,
    ) -> Certificate | None:
        cert = await self.get_by_id(cert_id)
        if cert:
            cert.status = status
            cert.attempt_count += 1
            if storage_key:
                cert.storage_key = storage_key
            if error_message:
                cert.error_message = error_message
            if completed_at:
                cert.completed_at = completed_at
            await self.session.flush()
        return cert

    async def get_stats(self) -> dict:
        """Get certificate statistics for dashboard."""
        total_result = await self.session.execute(
            select(func.count(Certificate.id))
        )
        total = total_result.scalar() or 0

        stats = {"total_certificates": total}
        for status in CertificateStatus:
            result = await self.session.execute(
                select(func.count(Certificate.id)).where(
                    Certificate.status == status
                )
            )
            stats[f"{status.value.lower()}_certificates"] = result.scalar() or 0

        return stats
