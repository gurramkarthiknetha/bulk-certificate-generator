"""Modern Minimal certificate template using ReportLab."""

from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import inch, mm
from reportlab.pdfgen import canvas

from app.templates.base import BaseTemplate


class ModernMinimalTemplate(BaseTemplate):
    """Clean, modern certificate with minimal design elements."""

    @property
    def template_id(self) -> str:
        return "modern_minimal"

    @property
    def template_name(self) -> str:
        return "Modern Minimal"

    @property
    def description(self) -> str:
        return "A clean, contemporary design with bold typography and subtle geometric accents."

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
        buffer = BytesIO()
        page_size = landscape(A4)
        w, h = page_size
        c = canvas.Canvas(buffer, pagesize=page_size)

        # White background
        c.setFillColor(colors.white)
        c.rect(0, 0, w, h, fill=1, stroke=0)

        # Left accent bar
        c.setFillColor(colors.HexColor("#2563EB"))
        c.rect(0, 0, 12, h, fill=1, stroke=0)

        # Top thin accent line
        c.setFillColor(colors.HexColor("#2563EB"))
        c.rect(12, h - 8, w - 12, 8, fill=1, stroke=0)

        # Geometric circle accent (top-right)
        c.setFillColor(colors.HexColor("#EFF6FF"))
        c.circle(w - 80, h - 80, 100, fill=1, stroke=0)
        c.setStrokeColor(colors.HexColor("#BFDBFE"))
        c.setLineWidth(1)
        c.circle(w - 80, h - 80, 100, fill=0, stroke=1)

        # Organization name
        c.setFillColor(colors.HexColor("#6B7280"))
        c.setFont("Helvetica", 11)
        c.drawString(60, h - 60, organization_name.upper())

        # Certificate title
        c.setFillColor(colors.HexColor("#111827"))
        c.setFont("Helvetica-Bold", 42)
        c.drawString(60, h - 120, "Certificate")

        c.setFillColor(colors.HexColor("#2563EB"))
        c.setFont("Helvetica-Bold", 42)
        c.drawString(60, h - 170, "of Achievement")

        # Thin separator
        c.setStrokeColor(colors.HexColor("#E5E7EB"))
        c.setLineWidth(1)
        c.line(60, h - 190, 350, h - 190)

        # Presented to text
        c.setFillColor(colors.HexColor("#9CA3AF"))
        c.setFont("Helvetica", 12)
        c.drawString(60, h - 220, "AWARDED TO")

        # Recipient name
        c.setFillColor(colors.HexColor("#111827"))
        font_size = 36
        if len(recipient_name) > 30:
            font_size = 28
        if len(recipient_name) > 45:
            font_size = 22
        c.setFont("Helvetica-Bold", font_size)
        c.drawString(60, h - 268, recipient_name)

        # Blue underline for name
        c.setStrokeColor(colors.HexColor("#2563EB"))
        c.setLineWidth(2)
        c.line(60, h - 278, 500, h - 278)

        # Course name
        c.setFillColor(colors.HexColor("#6B7280"))
        c.setFont("Helvetica", 13)
        c.drawString(60, h - 310, "For successfully completing")

        c.setFillColor(colors.HexColor("#374151"))
        c.setFont("Helvetica-Bold", 16)
        course_display = course_name
        if len(course_display) > 65:
            course_display = course_display[:62] + "..."
        c.drawString(60, h - 335, course_display)

        # Date
        c.setFillColor(colors.HexColor("#9CA3AF"))
        c.setFont("Helvetica", 11)
        c.drawString(60, h - 370, f"Date: {issue_date}")

        # Signature
        if signer_name:
            c.setStrokeColor(colors.HexColor("#D1D5DB"))
            c.setLineWidth(0.5)
            c.line(60, 100, 220, 100)
            c.setFillColor(colors.HexColor("#374151"))
            c.setFont("Helvetica-Bold", 11)
            c.drawString(60, 82, signer_name)
            if signer_title:
                c.setFillColor(colors.HexColor("#9CA3AF"))
                c.setFont("Helvetica", 9)
                c.drawString(60, 68, signer_title)

        # Certificate ID
        c.setFillColor(colors.HexColor("#D1D5DB"))
        c.setFont("Helvetica", 7)
        c.drawRightString(w - 30, 25, f"ID: {certificate_id}")

        c.save()
        return buffer.getvalue()
