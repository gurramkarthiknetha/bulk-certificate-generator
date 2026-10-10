"""Academic certificate template using ReportLab."""

from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import inch, mm
from reportlab.pdfgen import canvas

from app.templates.base import BaseTemplate


class AcademicTemplate(BaseTemplate):
    """Traditional academic-style certificate with formal layout."""

    @property
    def template_id(self) -> str:
        return "academic"

    @property
    def template_name(self) -> str:
        return "Academic"

    @property
    def description(self) -> str:
        return "A traditional academic certificate with a formal, scholarly appearance and navy color scheme."

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

        # Background - light parchment
        c.setFillColor(colors.HexColor("#FAF9F6"))
        c.rect(0, 0, w, h, fill=1, stroke=0)

        # Navy border
        c.setStrokeColor(colors.HexColor("#1E3A5F"))
        c.setLineWidth(3)
        c.rect(25, 25, w - 50, h - 50, fill=0, stroke=1)

        # Double border
        c.setStrokeColor(colors.HexColor("#1E3A5F"))
        c.setLineWidth(1)
        c.rect(32, 32, w - 64, h - 64, fill=0, stroke=1)

        # Top banner
        c.setFillColor(colors.HexColor("#1E3A5F"))
        c.rect(32, h - 64, w - 64, 32, fill=1, stroke=0)

        # Organization name in banner
        c.setFillColor(colors.white)
        c.setFont("Helvetica-Bold", 13)
        c.drawCentredString(w / 2, h - 55, organization_name.upper())

        # Seal circle
        c.setFillColor(colors.HexColor("#1E3A5F"))
        c.circle(w / 2, h - 115, 25, fill=1, stroke=0)
        c.setFillColor(colors.white)
        c.setFont("Helvetica-Bold", 10)
        c.drawCentredString(w / 2, h - 112, "✦")
        c.setFont("Helvetica", 6)

        # Certificate of Completion
        c.setFillColor(colors.HexColor("#1E3A5F"))
        c.setFont("Helvetica-Bold", 32)
        c.drawCentredString(w / 2, h - 170, "CERTIFICATE")

        c.setFont("Helvetica", 16)
        c.setFillColor(colors.HexColor("#4A6D8C"))
        c.drawCentredString(w / 2, h - 195, "OF COMPLETION")

        # Horizontal rule
        c.setStrokeColor(colors.HexColor("#1E3A5F"))
        c.setLineWidth(1)
        c.line(w / 2 - 150, h - 210, w / 2 + 150, h - 210)
        c.setLineWidth(0.5)
        c.line(w / 2 - 130, h - 214, w / 2 + 130, h - 214)

        # This is to certify
        c.setFillColor(colors.HexColor("#555555"))
        c.setFont("Helvetica", 12)
        c.drawCentredString(w / 2, h - 240, "This is to certify that")

        # Recipient name
        c.setFillColor(colors.HexColor("#1E3A5F"))
        font_size = 38
        if len(recipient_name) > 30:
            font_size = 28
        if len(recipient_name) > 45:
            font_size = 22
        c.setFont("Helvetica-Bold", font_size)
        c.drawCentredString(w / 2, h - 282, recipient_name)

        # Underline
        name_width = min(len(recipient_name) * font_size * 0.5, 400)
        c.setStrokeColor(colors.HexColor("#1E3A5F"))
        c.setLineWidth(0.8)
        c.line(w / 2 - name_width / 2, h - 290, w / 2 + name_width / 2, h - 290)

        # Has completed
        c.setFillColor(colors.HexColor("#555555"))
        c.setFont("Helvetica", 12)
        c.drawCentredString(w / 2, h - 315, "has successfully completed the course of study in")

        # Course name
        c.setFillColor(colors.HexColor("#333333"))
        c.setFont("Helvetica-Bold", 17)
        course_display = course_name
        if len(course_display) > 60:
            course_display = course_display[:57] + "..."
        c.drawCentredString(w / 2, h - 345, course_display)

        # Date
        c.setFillColor(colors.HexColor("#666666"))
        c.setFont("Helvetica", 11)
        c.drawCentredString(w / 2, h - 380, f"Awarded on {issue_date}")

        # Signature area
        y_sig = 85
        if signer_name:
            # Left signature
            c.setStrokeColor(colors.HexColor("#1E3A5F"))
            c.setLineWidth(0.5)
            c.line(w / 2 - 120, y_sig + 15, w / 2 + 120, y_sig + 15)
            c.setFillColor(colors.HexColor("#1E3A5F"))
            c.setFont("Helvetica-Bold", 11)
            c.drawCentredString(w / 2, y_sig, signer_name)
            if signer_title:
                c.setFont("Helvetica", 9)
                c.setFillColor(colors.HexColor("#666666"))
                c.drawCentredString(w / 2, y_sig - 14, signer_title)

        # Certificate ID at bottom
        c.setFillColor(colors.HexColor("#BBBBBB"))
        c.setFont("Helvetica", 7)
        c.drawCentredString(w / 2, 42, f"Certificate No. {certificate_id}")

        c.save()
        return buffer.getvalue()
