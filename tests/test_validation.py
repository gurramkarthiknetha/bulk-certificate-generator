"""Tests for Pydantic input validation."""

import pytest
from pydantic import ValidationError
from app.schemas import RecipientCreate, JobCreateRequest


def test_valid_recipient():
    """Verify valid recipient schema creates properly."""
    r = RecipientCreate(name="Alice Johnson", email="alice@example.com")
    assert r.name == "Alice Johnson"
    assert r.email == "alice@example.com"


def test_empty_recipient_name_fails():
    """Verify empty recipient name raises ValidationError."""
    with pytest.raises(ValidationError):
        RecipientCreate(name="   ", email="alice@example.com")


def test_invalid_recipient_email_fails():
    """Verify invalid email format raises ValidationError."""
    with pytest.raises(ValidationError):
        RecipientCreate(name="Alice", email="not-an-email")


def test_duplicate_emails_rejected():
    """Verify duplicate recipient emails in a single request are rejected."""
    with pytest.raises(ValidationError) as exc_info:
        JobCreateRequest(
            course_name="Kubernetes Deep Dive",
            organization_name="Cloud Org",
            template_name="classic_gold",
            recipients=[
                RecipientCreate(name="User 1", email="user@example.com"),
                RecipientCreate(name="User 2", email="user@example.com"),
            ],
        )
    assert "Duplicate email addresses" in str(exc_info.value)


def test_empty_recipients_list_rejected():
    """Verify empty recipients list fails."""
    with pytest.raises(ValidationError):
        JobCreateRequest(
            course_name="Python Mastery",
            organization_name="Org",
            recipients=[],
        )
