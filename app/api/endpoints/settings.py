"""Settings endpoints for organization configuration."""

from fastapi import APIRouter

from app.schemas import OrganizationSettings

router = APIRouter()

# In-memory settings (would use DB in production)
_org_settings = OrganizationSettings()


@router.get("/organization", response_model=OrganizationSettings)
async def get_organization_settings():
    """Get current organization settings."""
    return _org_settings


@router.put("/organization", response_model=OrganizationSettings)
async def update_organization_settings(settings: OrganizationSettings):
    """Update organization settings."""
    global _org_settings
    _org_settings = settings
    return _org_settings
