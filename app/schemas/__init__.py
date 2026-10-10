"""Pydantic schemas for API request/response validation."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator


# --- Recipient schemas ---

class RecipientCreate(BaseModel):
    """Schema for a single recipient in a job creation request."""
    name: str = Field(..., min_length=1, max_length=255, description="Recipient full name")
    email: EmailStr = Field(..., description="Recipient email address")

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Recipient name cannot be empty")
        return v


# --- Job schemas ---

class JobCreateRequest(BaseModel):
    """Schema for creating a certificate generation job."""
    template_name: str = Field(
        default="classic_gold",
        max_length=100,
        description="Certificate template to use",
    )
    course_name: str = Field(
        default="Certificate Program",
        max_length=500,
        description="Course or program name",
    )
    organization_name: str = Field(
        default="Organization",
        max_length=500,
        description="Issuing organization name",
    )
    recipients: list[RecipientCreate] = Field(
        ...,
        min_length=1,
        description="List of certificate recipients",
    )

    @field_validator("recipients")
    @classmethod
    def validate_no_duplicate_emails(cls, v: list[RecipientCreate]) -> list[RecipientCreate]:
        emails = [r.email.lower() for r in v]
        seen = set()
        duplicates = set()
        for email in emails:
            if email in seen:
                duplicates.add(email)
            seen.add(email)
        if duplicates:
            raise ValueError(f"Duplicate email addresses: {', '.join(sorted(duplicates))}")
        return v


class JobCreateResponse(BaseModel):
    """Response after creating a job."""
    job_id: UUID
    status: str
    total_count: int

    model_config = {"from_attributes": True}


class JobResponse(BaseModel):
    """Full job details response."""
    job_id: UUID
    status: str
    template_name: str
    course_name: str
    organization_name: str
    total_count: int
    processed_count: int
    success_count: int
    failure_count: int
    progress_percentage: float
    created_at: datetime
    started_at: datetime | None = None
    completed_at: datetime | None = None

    model_config = {"from_attributes": True}


class JobListResponse(BaseModel):
    """Paginated list of jobs."""
    items: list[JobResponse]
    page: int
    page_size: int
    total: int


# --- Certificate schemas ---

class CertificateResponse(BaseModel):
    """Single certificate details."""
    id: UUID
    job_id: UUID
    recipient_name: str
    recipient_email: str
    status: str
    storage_key: str | None = None
    error_message: str | None = None
    attempt_count: int
    created_at: datetime
    completed_at: datetime | None = None

    model_config = {"from_attributes": True}


class CertificateListResponse(BaseModel):
    """Paginated list of certificates."""
    items: list[CertificateResponse]
    page: int
    page_size: int
    total: int


# --- Dashboard schemas ---

class DashboardStats(BaseModel):
    """Dashboard statistics."""
    total_jobs: int = 0
    total_certificates: int = 0
    successful_certificates: int = 0
    failed_certificates: int = 0
    processing_certificates: int = 0
    pending_jobs: int = 0
    processing_jobs: int = 0
    completed_jobs: int = 0
    recent_jobs: list[JobResponse] = []


# --- Template schemas ---

class TemplateInfo(BaseModel):
    """Certificate template information."""
    id: str
    name: str
    description: str
    preview_url: str | None = None


class TemplateListResponse(BaseModel):
    """List of available templates."""
    templates: list[TemplateInfo]


# --- Settings schemas ---

class OrganizationSettings(BaseModel):
    """Organization settings."""
    organization_name: str = "My Organization"
    default_template: str = "classic_gold"
    default_signer_name: str = ""
    default_signer_title: str = ""
