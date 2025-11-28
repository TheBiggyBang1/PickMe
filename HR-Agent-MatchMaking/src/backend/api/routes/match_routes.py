from fastapi import APIRouter, HTTPException, Query
from datetime import datetime
from typing import Optional
from models.schemas.match_schema import MatchResponse
from ..config.database import get_resumes_collection
from ..services.matching_engine import match_resume_to_jobs

router = APIRouter(prefix="/match", tags=["match"])


@router.post("/match-resume/{resume_id}", response_model=MatchResponse)
async def match_resume(resume_id: str, top_k: int = Query(default=50, ge=1, le=200), source_filter: str = Query(default="all")):
    coll = get_resumes_collection()
    doc = coll.find_one({"resume_id": resume_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Resume not found")

    text = doc.get("content") or ""
    scored = match_resume_to_jobs(text, top_k=top_k, source_filter=source_filter)

    matches_by_source = {}
    for j in scored:
        src = j.get("source", "unknown")
        matches_by_source[src] = matches_by_source.get(src, 0) + 1

    resp = MatchResponse(
        resume_id=resume_id,
        total_matches=len(scored),
        matches_by_source=matches_by_source,
        top_matches=scored,
        generated_at=datetime.utcnow().isoformat(),
    )
    return resp
