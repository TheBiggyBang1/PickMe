from pydantic import BaseModel
from typing import Dict, Any, List, Optional


class FetchResult(BaseModel):
    total_jobs: int
    by_source: Dict[str, int]
    errors: Dict[str, str]


class TriggerRefreshRequest(BaseModel):
    keywords: str
    locations: List[str]


class TriggerRefreshResponse(BaseModel):
    status: str
    message: str
    estimated_duration_seconds: int
