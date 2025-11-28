from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List
from datetime import datetime


class Job(BaseModel):
    job_id: str
    job_title: str
    company: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    country: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    employment_type: Optional[str] = None
    url: Optional[str] = None
    posted_date: Optional[str] = None
    scraped_date: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    source: str


class JobStats(BaseModel):
    total_jobs_indexed: int
    jobs_by_source: dict
    last_sync: Optional[str] = None
    next_sync: Optional[str] = None
    api_health: Optional[dict] = None


class JobListItem(BaseModel):
    job_id: str
    job_title: str
    company: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    country: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    employment_type: Optional[str] = None
    url: Optional[str] = None
    posted_date: Optional[str] = None
    source: str


class JobListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: List[JobListItem]
