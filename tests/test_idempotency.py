"""Tests for Idempotency hash computation and payload matching."""

import pytest
from app.schemas import JobCreateRequest, RecipientCreate
from app.services.job_service import JobService


def test_request_hash_determinism():
    """Verify deterministic SHA-256 computation regardless of recipient order."""
    service = JobService(session=None)

    req1 = JobCreateRequest(
        course_name="Cloud Security",
        organization_name="Cyber Academy",
        template_name="classic_gold",
        recipients=[
            RecipientCreate(name="Bob", email="bob@example.com"),
            RecipientCreate(name="Alice", email="alice@example.com"),
        ],
    )

    req2 = JobCreateRequest(
        course_name="Cloud Security",
        organization_name="Cyber Academy",
        template_name="classic_gold",
        recipients=[
            RecipientCreate(name="Alice", email="alice@example.com"),
            RecipientCreate(name="Bob", email="bob@example.com"),
        ],
    )

    hash1 = service._compute_request_hash(req1)
    hash2 = service._compute_request_hash(req2)

    assert hash1 == hash2
    assert len(hash1) == 64


def test_different_payload_produces_different_hash():
    """Verify modified payload generates a different hash."""
    service = JobService(session=None)

    req1 = JobCreateRequest(
        course_name="Course A",
        organization_name="Org",
        template_name="classic_gold",
        recipients=[RecipientCreate(name="Alice", email="alice@example.com")],
    )

    req2 = JobCreateRequest(
        course_name="Course B",
        organization_name="Org",
        template_name="classic_gold",
        recipients=[RecipientCreate(name="Alice", email="alice@example.com")],
    )

    assert service._compute_request_hash(req1) != service._compute_request_hash(req2)
