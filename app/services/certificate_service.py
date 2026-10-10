"""Certificate generation service for PDF creation."""

import uuid
from datetime import datetime, timezone

from app.models.certificate import Certificate, CertificateStatus
from app.services.storage import StorageBackend
from app.templates.registry import TemplateRegistry


class CertificateGenerationService:
    """Service for generating individual certificate PDFs."""

    def __init__(
        self,
        template_registry: TemplateRegistry,
        storage: StorageBackend,
    ):
        self.template_registry = template_registry
        self.storage = storage

    async def generate_certificate(
        self,
        certificate: Certificate,
        template_name: str,
        course_name: str,
        organization_name: str,
        issue_date: str | None = None,
        signer_name: str = "",
        signer_title: str = "",
    ) -> tuple[str | None, str | None]:
        """Generate a single certificate PDF.

        Returns:
            Tuple of (storage_key, error_message).
            On success: (storage_key, None)
            On failure: (None, error_message)
        """
        template = self.template_registry.get(template_name)
        if not template:
            return None, f"Template '{template_name}' not found"

        if not issue_date:
            issue_date = datetime.now(timezone.utc).strftime("%B %d, %Y")

        try:
            pdf_bytes = template.render(
                recipient_name=certificate.recipient_name,
                course_name=course_name,
                organization_name=organization_name,
                issue_date=issue_date,
                certificate_id=str(certificate.id),
                signer_name=signer_name,
                signer_title=signer_title,
            )
        except Exception as e:
            return None, f"PDF generation failed: {str(e)}"

        # Store the PDF
        storage_key = f"{certificate.job_id}/{certificate.id}.pdf"
        try:
            await self.storage.save(storage_key, pdf_bytes)
        except Exception as e:
            return None, f"Storage failed: {str(e)}"

        return storage_key, None
