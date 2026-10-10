"""Tests for FastAPI endpoints."""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check_endpoint():
    """Verify /health returns 200 OK and healthy status."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "service" in data


def test_list_templates_endpoint():
    """Verify /api/v1/templates returns all 3 templates."""
    response = client.get("/api/v1/templates")
    assert response.status_code == 200
    data = response.json()
    assert "templates" in data
    template_ids = [t["id"] for t in data["templates"]]
    assert "classic_gold" in template_ids
    assert "modern_minimal" in template_ids
    assert "academic" in template_ids


def test_get_and_update_settings():
    """Verify organization settings GET and PUT."""
    get_res = client.get("/api/v1/settings/organization")
    assert get_res.status_code == 200

    put_res = client.put(
        "/api/v1/settings/organization",
        json={
            "organization_name": "Updated Test Institute",
            "default_template": "modern_minimal",
            "default_signer_name": "Dr. Vance",
            "default_signer_title": "Provost",
        },
    )
    assert put_res.status_code == 200
    updated_data = put_res.json()
    assert updated_data["organization_name"] == "Updated Test Institute"
    assert updated_data["default_template"] == "modern_minimal"


def test_create_job_requires_idempotency_header():
    """Verify missing Idempotency-Key header returns 422 Unprocessable Entity."""
    response = client.post(
        "/api/v1/certificate-jobs",
        json={
            "course_name": "Test Course",
            "organization_name": "Test Org",
            "template_name": "classic_gold",
            "recipients": [{"name": "Test", "email": "test@example.com"}],
        },
    )
    assert response.status_code == 422
