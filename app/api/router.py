"""API router aggregation."""

from fastapi import APIRouter

from app.api.endpoints import jobs, certificates, dashboard, templates, settings, downloads

api_router = APIRouter()

api_router.include_router(jobs.router, prefix="/certificate-jobs", tags=["jobs"])
api_router.include_router(certificates.router, prefix="/certificates", tags=["certificates"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(templates.router, prefix="/templates", tags=["templates"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
api_router.include_router(downloads.router, prefix="/downloads", tags=["downloads"])
