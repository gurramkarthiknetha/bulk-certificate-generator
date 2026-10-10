"""Download endpoints for certificate PDF files."""

import io
import uuid
import zipfile

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.repositories.certificate_repository import CertificateRepository
from app.services.storage import get_storage

router = APIRouter()


@router.get("/{job_id}/zip")
async def download_job_certificates_zip(
    job_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Download all completed certificates for a job as a ZIP archive."""
    cert_repo = CertificateRepository(db)
    certs = await cert_repo.get_completed_by_job(job_id)

    if not certs:
        raise HTTPException(
            status_code=404,
            detail="No completed certificates found for this job",
        )

    storage = get_storage()
    zip_buffer = io.BytesIO()

    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for cert in certs:
            if not cert.storage_key:
                continue
            pdf_data = await storage.get(cert.storage_key)
            if pdf_data:
                clean_name = "".join(
                    c for c in cert.recipient_name if c.isalnum() or c in (" ", "_", "-")
                ).rstrip()
                filename = f"{clean_name}_{str(cert.id)[:8]}.pdf"
                zip_file.writestr(filename, pdf_data)

    zip_buffer.seek(0)
    zip_bytes = zip_buffer.getvalue()

    return Response(
        content=zip_bytes,
        media_type="application/zip",
        headers={
            "Content-Disposition": f'attachment; filename="certificates_{job_id}.zip"',
        },
    )


@router.get("/{job_id}/{certificate_id}")
async def download_certificate(
    job_id: uuid.UUID,
    certificate_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Download a generated certificate PDF."""
    cert_repo = CertificateRepository(db)
    cert = await cert_repo.get_by_id_and_job(certificate_id, job_id)

    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    if not cert.storage_key:
        raise HTTPException(
            status_code=400,
            detail="Certificate PDF not yet generated",
        )

    storage = get_storage()
    pdf_data = await storage.get(cert.storage_key)

    if not pdf_data:
        raise HTTPException(
            status_code=404,
            detail="Certificate file not found in storage",
        )

    filename = f"certificate_{cert.recipient_name.replace(' ', '_')}_{certificate_id}.pdf"

    return Response(
        content=pdf_data,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
        },
    )
