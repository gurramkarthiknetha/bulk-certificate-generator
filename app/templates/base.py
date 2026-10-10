"""Base template interface for certificate PDF generation."""

from abc import ABC, abstractmethod
from io import BytesIO


class BaseTemplate(ABC):
    """Abstract base class for certificate templates."""

    @property
    @abstractmethod
    def template_id(self) -> str:
        """Unique template identifier."""
        ...

    @property
    @abstractmethod
    def template_name(self) -> str:
        """Human-readable template name."""
        ...

    @property
    @abstractmethod
    def description(self) -> str:
        """Template description."""
        ...

    @abstractmethod
    def render(
        self,
        recipient_name: str,
        course_name: str,
        organization_name: str,
        issue_date: str,
        certificate_id: str,
        signer_name: str = "",
        signer_title: str = "",
    ) -> bytes:
        """Render a certificate PDF and return the bytes.

        Args:
            recipient_name: Full name of the certificate recipient
            course_name: Name of the course or program
            organization_name: Name of the issuing organization
            issue_date: Date string for the certificate
            certificate_id: Unique certificate identifier
            signer_name: Name of the person signing
            signer_title: Title of the signer

        Returns:
            PDF file as bytes
        """
        ...
