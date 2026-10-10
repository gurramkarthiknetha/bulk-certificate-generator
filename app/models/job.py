"""Job model for certificate generation jobs."""

import enum
import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    DateTime,
    Enum,
    Integer,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.certificate import Certificate


class JobStatus(str, enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    COMPLETED_WITH_ERRORS = "COMPLETED_WITH_ERRORS"
    FAILED = "FAILED"


class Job(Base):
    __tablename__ = "jobs"

    __table_args__ = (
        UniqueConstraint(
            "idempotency_key",
            name="uq_jobs_idempotency_key",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    status: Mapped[JobStatus] = mapped_column(
        Enum(JobStatus, name="job_status"),
        default=JobStatus.PENDING,
        nullable=False,
        index=True,
    )

    template_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="classic_gold",
    )

    course_name: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
        default="Certificate Program",
    )

    organization_name: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
        default="Organization",
    )

    total_count: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )
    processed_count: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )
    success_count: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )
    failure_count: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )

    idempotency_key: Mapped[str] = mapped_column(
        String(255), nullable=False
    )
    request_hash: Mapped[str] = mapped_column(
        String(64), nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    certificates: Mapped[list["Certificate"]] = relationship(
        back_populates="job",
        cascade="all, delete-orphan",
    )
