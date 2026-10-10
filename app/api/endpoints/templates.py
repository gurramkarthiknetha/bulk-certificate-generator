"""Template endpoints for listing available certificate templates."""

from fastapi import APIRouter

from app.schemas import TemplateInfo, TemplateListResponse
from app.templates.registry import get_template_registry

router = APIRouter()


@router.get("", response_model=TemplateListResponse)
async def list_templates():
    """List all available certificate templates."""
    registry = get_template_registry()
    templates = registry.list_all()

    return TemplateListResponse(
        templates=[
            TemplateInfo(
                id=t.template_id,
                name=t.template_name,
                description=t.description,
            )
            for t in templates
        ]
    )
