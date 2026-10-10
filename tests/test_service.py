"""Tests for CertificateGenerationService."""

import uuid
import pytest
import tempfile
import shutil
from app.models.certificate import Certificate, CertificateStatus
from app.services.certificate_service import CertificateGenerationService
from app.services.storage import LocalStorage
from app.templates.registry import get_template_registry


@pytest.fixture
def gen_service():
    tmp_dir = tempfile.mkdtemp()
    storage = LocalStorage(tmp_dir)
    registry = get_template_registry()
    service = CertificateGenerationService(registry, storage)
    yield service
    shutil.rmtree(tmp_dir)


@pytest.mark.asyncio
async def test_successful_certificate_generation(gen_service):
    """Test standard certificate generation and persistence."""
    job_id = uuid.uuid4()
    cert_id = uuid.uuid4()
    cert = Certificate(
        id=cert_id,
        job_id=job_id,
        recipient_name="David Chen",
        recipient_email="david@example.com",
        status=CertificateStatus.PENDING,
    )

    storage_key, error_msg = await gen_service.generate_certificate(
        certificate=cert,
        template_name="classic_gold",
        course_name="Advanced Python Architecture",
        organization_name="Python Academy",
    )

    assert error_msg is None
    assert storage_key == f"{job_id}/{cert_id}.pdf"
    assert await gen_service.storage.exists(storage_key) is True

    data = await gen_service.storage.get(storage_key)
    assert data is not None
    assert data.startswith(b"%PDF-")


@pytest.mark.asyncio
async def test_unknown_template_isolated_failure(gen_service):
    """Test graceful failure handling when requested template does not exist."""
    job_id = uuid.uuid4()
    cert_id = uuid.uuid4()
    cert = Certificate(
        id=cert_id,
        job_id=job_id,
        recipient_name="Emma Watson",
        recipient_email="emma@example.com",
        status=CertificateStatus.PENDING,
    )

    storage_key, error_msg = await gen_service.generate_certificate(
        certificate=cert,
        template_name="non_existent_template",
        course_name="Course 101",
        organization_name="Org",
    )

    assert storage_key is None
    assert error_msg == "Template 'non_existent_template' not found"
