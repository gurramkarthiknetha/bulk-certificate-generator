"""Dashboard endpoints for statistics."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas import DashboardStats, JobResponse
from app.services.job_service import JobService

router = APIRouter()


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
):
    """Get dashboard statistics."""
    service = JobService(db)
    stats = await service.get_dashboard_stats()

    # Convert recent jobs to responses
    recent_jobs = []
    for job in stats.get("recent_jobs", []):
        progress = 0.0
        if job.total_count > 0:
            progress = round((job.processed_count / job.total_count) * 100, 1)
        recent_jobs.append(
            JobResponse(
                job_id=job.id,
                status=job.status.value,
                template_name=job.template_name,
                course_name=job.course_name,
                organization_name=job.organization_name,
                total_count=job.total_count,
                processed_count=job.processed_count,
                success_count=job.success_count,
                failure_count=job.failure_count,
                progress_percentage=progress,
                created_at=job.created_at,
                started_at=job.started_at,
                completed_at=job.completed_at,
            )
        )

    return DashboardStats(
        total_jobs=stats.get("total_jobs", 0),
        total_certificates=stats.get("total_certificates", 0),
        successful_certificates=stats.get("completed_certificates", 0),
        failed_certificates=stats.get("failed_certificates", 0),
        processing_certificates=stats.get("processing_certificates", 0),
        pending_jobs=stats.get("pending_jobs", 0),
        processing_jobs=stats.get("processing_jobs", 0),
        completed_jobs=stats.get("completed_jobs", 0),
        recent_jobs=recent_jobs,
    )
