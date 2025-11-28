from pydantic import BaseModel
from typing import List, Dict, Optional


class MatchReport(BaseModel):
    match_score: float
    score_breakdown: Dict[str, str]
    matched_skills: List[str]
    missing_skills: List[str]
    transferable_skills: List[str]
    recommendations: List[str]


class JobMatch(BaseModel):
    job_id: str
    job_title: str
    company: Optional[str]
    location: Optional[str]
    country: Optional[str]
    source: str
    salary_min: Optional[float]
    salary_max: Optional[float]
    employment_type: Optional[str]
    posted_date: Optional[str]
    match_score: float
    report: Optional[MatchReport] = None
    url: Optional[str]


class MatchResponse(BaseModel):
    resume_id: str
    total_matches: int
    matches_by_source: Dict[str, int]
    top_matches: List[JobMatch]
    generated_at: str
