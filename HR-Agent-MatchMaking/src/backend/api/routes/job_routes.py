from fastapi import APIRouter, BackgroundTasks, Query
import asyncio
from models.schemas.api_response_schema import TriggerRefreshRequest, TriggerRefreshResponse
from models.schemas.job_schema import JobStats, JobListResponse, JobListItem
from src.backend.api.services.job_api_aggregator import JobAggregatorService, AggregatorScheduler
from src.backend.api.config.database import get_jobs_collection

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("/stats", response_model=JobStats)
async def get_stats():
    stats = AggregatorScheduler.get_stats()
    return stats


@router.post("/trigger-refresh", response_model=TriggerRefreshResponse, status_code=202)
async def trigger_refresh(req: TriggerRefreshRequest, background_tasks: BackgroundTasks):
    async def run_async():
        service = JobAggregatorService()
        await service.fetch_all_jobs(req.keywords, req.locations)

    def kickoff():
        # This function runs in a thread (BackgroundTasks). There's no running
        # event loop in that thread, so create one to run the async job fetcher.
        try:
            asyncio.run(run_async())
        except RuntimeError:
            # Fallback: create a new event loop and run until complete
            loop = asyncio.new_event_loop()
            try:
                loop.run_until_complete(run_async())
            finally:
                loop.close()

    background_tasks.add_task(kickoff)
    return TriggerRefreshResponse(
        status="refresh_started",
        message="Job refresh from all APIs started in background",
        estimated_duration_seconds=45,
    )


@router.get("/list", response_model=JobListResponse)
async def list_jobs(
    q: str | None = Query(default=None, description="Keyword search in title/company/description"),
    source: str | None = Query(default=None, description="Filter by source e.g., reed, adzuna"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    coll = get_jobs_collection()
    filters: dict = {}

    if source and source != "all":
        filters["source"] = source

    if q:
        filters["$or"] = [
            {"job_title": {"$regex": q, "$options": "i"}},
            {"company": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
        ]

    total = coll.count_documents(filters) if filters else coll.estimated_document_count()
    skip = (page - 1) * page_size

    cursor = coll.find(filters, {
        "_id": 0,
        "embedding": 0,
    }).sort("posted_date", -1).skip(skip).limit(page_size)

    items = [JobListItem(**doc) for doc in cursor]

    return JobListResponse(
        total=total,
        page=page,
        page_size=page_size,
        items=items,
    )
