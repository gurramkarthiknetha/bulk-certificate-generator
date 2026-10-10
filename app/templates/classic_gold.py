"""Classic Gold certificate template using ReportLab."""

from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import inch, mm
from reportlab.pdfgen import canvas

from app.templates.base import BaseTemplate


class ClassicGoldTemplate(BaseTemplate):
    """Elegant gold-themed certificate with ornamental borders."""

    @property
    def template_id(self) -> str:
        return "classic_gold"

    @property
    def template_name(self) -> str:
        return "Classic Gold"

    @property
    def description(self) -> str:
        return "An elegant certificate with gold accents and a classic ornamental border design."

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

        # Background
        c.setFillColor(colors.HexColor("#FFFEF7"))
        c.rect(0, 0, w, h, fill=1, stroke=0)

        # Outer border - gold
        c.setStrokeColor(colors.HexColor("#C5A55A"))
        c.setLineWidth(4)
        c.rect(20, 20, w - 40, h - 40, fill=0, stroke=1)

        # Inner border
        c.setStrokeColor(colors.HexColor("#D4AF37"))
        c.setLineWidth(2)
        c.rect(35, 35, w - 70, h - 70, fill=0, stroke=1)

        # Decorative corner accents
        c.setStrokeColor(colors.HexColor("#C5A55A"))
        c.setLineWidth(1.5)
        corner_size = 40
        corners = [
            (40, 40), (w - 40, 40), (40, h - 40), (w - 40, h - 40)
        ]
        for cx_pos, cy_pos in corners:
            dx = corner_size if cx_pos < w / 2 else -corner_size
            dy = corner_size if cy_pos < h / 2 else -corner_size
            c.line(cx_pos, cy_pos, cx_pos + dx, cy_pos)
            c.line(cx_pos, cy_pos, cx_pos, cy_pos + dy)

        # Title
        c.setFillColor(colors.HexColor("#C5A55A"))
        c.setFont("Helvetica-Bold", 14)
        c.drawCentredString(w / 2, h - 90, organization_name.upper())

        c.setFillColor(colors.HexColor("#2C2C2C"))
        c.setFont("Helvetica-Bold", 36)
        c.drawCentredString(w / 2, h - 140, "CERTIFICATE")

        c.setFont("Helvetica", 18)
        c.setFillColor(colors.HexColor("#555555"))
        c.drawCentredString(w / 2, h - 170, "OF ACHIEVEMENT")

        # Decorative line
        c.setStrokeColor(colors.HexColor("#D4AF37"))
        c.setLineWidth(1)
        c.line(w / 2 - 120, h - 185, w / 2 + 120, h - 185)

        # Presented to
        c.setFillColor(colors.HexColor("#666666"))
        c.setFont("Helvetica", 14)
        c.drawCentredString(w / 2, h - 215, "This certificate is proudly presented to")

        # Recipient name
        c.setFillColor(colors.HexColor("#1A1A1A"))
        font_size = 40
        if len(recipient_name) > 30:
            font_size = 30
        if len(recipient_name) > 45:
            font_size = 24
        c.setFont("Helvetica-Bold", font_size)
        c.drawCentredString(w / 2, h - 265, recipient_name)

        # Gold line under name
        c.setStrokeColor(colors.HexColor("#D4AF37"))
        c.setLineWidth(1)
        c.line(w / 2 - 180, h - 280, w / 2 + 180, h - 280)

        # Course description
        c.setFillColor(colors.HexColor("#444444"))
        c.setFont("Helvetica", 13)
        c.drawCentredString(w / 2, h - 310, f"for successfully completing the program")

        c.setFillColor(colors.HexColor("#2C2C2C"))
        c.setFont("Helvetica-Bold", 18)
        course_display = course_name
        if len(course_display) > 60:
            course_display = course_display[:57] + "..."
        c.drawCentredString(w / 2, h - 340, f'"{course_display}"')

        # Date
        c.setFillColor(colors.HexColor("#666666"))
        c.setFont("Helvetica", 12)
        c.drawCentredString(w / 2, h - 380, f"Issued on {issue_date}")

        # Signature area
        if signer_name:
            c.setStrokeColor(colors.HexColor("#999999"))
            c.setLineWidth(0.5)
            c.line(w / 2 - 80, 110, w / 2 + 80, 110)
            c.setFillColor(colors.HexColor("#333333"))
            c.setFont("Helvetica-Bold", 12)
            c.drawCentredString(w / 2, 92, signer_name)
            if signer_title:
                c.setFont("Helvetica", 10)
                c.setFillColor(colors.HexColor("#666666"))
                c.drawCentredString(w / 2, 78, signer_title)

        # Certificate ID
        c.setFillColor(colors.HexColor("#AAAAAA"))
        c.setFont("Helvetica", 8)
        c.drawCentredString(w / 2, 50, f"Certificate ID: {certificate_id}")

        c.save()
        return buffer.getvalue()
