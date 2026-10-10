"""initial migration

Revision ID: 001
Revises:
Create Date: 2024-01-01

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, ENUM

# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create job_status enum explicitly
    job_status = ENUM(
        "PENDING", "PROCESSING", "COMPLETED", "COMPLETED_WITH_ERRORS", "FAILED",
        name="job_status",
        create_type=False,
    )
    job_status.create(op.get_bind(), checkfirst=True)

    # Create certificate_status enum explicitly
    cert_status = ENUM(
        "PENDING", "PROCESSING", "COMPLETED", "FAILED",
        name="certificate_status",
        create_type=False,
    )
    cert_status.create(op.get_bind(), checkfirst=True)

    # Create jobs table
    op.create_table(
        "jobs",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("status", job_status, nullable=False, server_default="PENDING"),
        sa.Column("template_name", sa.String(100), nullable=False, server_default="classic_gold"),
        sa.Column("course_name", sa.String(500), nullable=False, server_default="Certificate Program"),
        sa.Column("organization_name", sa.String(500), nullable=False, server_default="Organization"),
        sa.Column("total_count", sa.Integer, nullable=False, server_default="0"),
        sa.Column("processed_count", sa.Integer, nullable=False, server_default="0"),
        sa.Column("success_count", sa.Integer, nullable=False, server_default="0"),
        sa.Column("failure_count", sa.Integer, nullable=False, server_default="0"),
        sa.Column("idempotency_key", sa.String(255), nullable=False),
        sa.Column("request_hash", sa.String(64), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("idempotency_key", name="uq_jobs_idempotency_key"),
    )
    op.create_index("ix_jobs_status", "jobs", ["status"])

    # Create certificates table
    op.create_table(
        "certificates",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "job_id",
            UUID(as_uuid=True),
            sa.ForeignKey("jobs.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("recipient_name", sa.String(255), nullable=False),
        sa.Column("recipient_email", sa.String(320), nullable=False),
        sa.Column("status", cert_status, nullable=False, server_default="PENDING"),
        sa.Column("storage_key", sa.String(1024), nullable=True),
        sa.Column("error_message", sa.Text, nullable=True),
        sa.Column("attempt_count", sa.Integer, nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_certificates_job_id", "certificates", ["job_id"])
    op.create_index("ix_certificates_status", "certificates", ["status"])


def downgrade() -> None:
    op.drop_table("certificates")
    op.drop_table("jobs")

    ENUM(name="certificate_status").drop(op.get_bind(), checkfirst=True)
    ENUM(name="job_status").drop(op.get_bind(), checkfirst=True)
