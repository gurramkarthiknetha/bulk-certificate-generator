"""Tests for ReportLab certificate templates."""

import pytest
from app.templates.registry import TemplateRegistry, get_template_registry
from app.templates.classic_gold import ClassicGoldTemplate
from app.templates.modern_minimal import ModernMinimalTemplate
from app.templates.academic import AcademicTemplate


def test_template_registry():
    """Verify registry loads all templates."""
    registry = get_template_registry()
    templates = registry.list_all()
    template_ids = [t.template_id for t in templates]

    assert "classic_gold" in template_ids
    assert "modern_minimal" in template_ids
    assert "academic" in template_ids


def test_classic_gold_renders_valid_pdf():
    """Verify Classic Gold template produces valid PDF bytes."""
    tmpl = ClassicGoldTemplate()
    pdf_bytes = tmpl.render(
        recipient_name="Alice Johnson",
        course_name="Machine Learning Specialist",
        organization_name="AI Institute",
        issue_date="2025-01-15",
        certificate_id="TEST-001",
        signer_name="Dr. Vance",
        signer_title="Academic Dean",
    )

    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 1000
    assert pdf_bytes.startswith(b"%PDF-")


def test_modern_minimal_renders_valid_pdf():
    """Verify Modern Minimal template produces valid PDF bytes."""
    tmpl = ModernMinimalTemplate()
    pdf_bytes = tmpl.render(
        recipient_name="Bob Smith",
        course_name="Cloud Solutions Architect",
        organization_name="Tech Cloud Academy",
        issue_date="2025-02-01",
        certificate_id="TEST-002",
        signer_name="Sarah Connor",
        signer_title="Chief Instructor",
    )

    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 1000
    assert pdf_bytes.startswith(b"%PDF-")


def test_academic_renders_valid_pdf():
    """Verify Academic template produces valid PDF bytes."""
    tmpl = AcademicTemplate()
    pdf_bytes = tmpl.render(
        recipient_name="Clara Rodriguez",
        course_name="Doctor of Software Systems",
        organization_name="State University",
        issue_date="2025-03-10",
        certificate_id="TEST-003",
        signer_name="Prof. Charles Xavier",
        signer_title="Provost",
    )

    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 1000
    assert pdf_bytes.startswith(b"%PDF-")
