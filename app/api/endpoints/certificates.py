"""Certificate endpoints for listing all certificates."""

import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.repositories.certificate_repository import CertificateRepository
from app.schemas import CertificateListResponse, CertificateResponse

router = APIRouter()


@router.get("", response_model=CertificateListResponse)
async def list_all_certificates(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    status: str | None = Query(None),
    search: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """List all certificates across all jobs."""
    cert_repo = CertificateRepository(db)
    certs, total = await cert_repo.list_all(page, page_size, status, search)

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
