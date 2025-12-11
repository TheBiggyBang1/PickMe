from functools import lru_cache
from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path
import os


class Settings(BaseSettings):
    # Core
    DEBUG: bool = Field(default=False)
    LOG_LEVEL: str = Field(default="INFO")

    # DBs
    MONGODB_URI: str = Field(default="mongodb://localhost:27017")
    REDIS_URL: str = Field(default="redis://localhost:6379")

    # Model
    MODEL_NAME: str = Field(default="multi-qa-MiniLM-L6-cos-v1")
    EMBEDDING_DIM: int = Field(default=384)

    # API keys
    REED_API_KEY: str | None = None
    USAJOBS_API_KEY: str | None = None
    USAJOBS_USER_AGENT: str | None = None
    ARBEITNOW_API_KEY: str | None = None
    JSEARCH_API_KEY: str | None = None
    APILAYER_JOBS_KEY: str | None = None
    FINDWORK_API_KEY: str | None = None
    THEMUSE_API_KEY: str | None = None
    ADZUNA_APP_ID: str | None = None
    ADZUNA_APP_KEY: str | None = None

    # Rate limits
    ADZUNA_RATE_LIMIT: int = 60
    REED_RATE_LIMIT: int = 60
    USAJOBS_RATE_LIMIT: int = 120
    ARBEITNOW_RATE_LIMIT: int = 60
    JSEARCH_RATE_LIMIT: int = 100
    APILAYER_RATE_LIMIT: int = 100
    FINDWORK_RATE_LIMIT: int = 60
    THEMUSE_RATE_LIMIT: int = 100

    # App settings
    MAX_FILE_SIZE: int = 10 * 1024 * 1024
    ALLOWED_FILE_EXTENSIONS: str = ".pdf,.docx,.txt"

    # Scheduler
    JOB_SYNC_INTERVAL: int = 3
    DEFAULT_SEARCH_KEYWORDS: str = "java developer,javascript developer,c# developer,node.js developer,.net developer,react developer,angular developer,vue developer,frontend developer,backend developer,full stack developer,typescript developer,php developer,ruby developer,golang developer,rust developer,devops engineer,cloud architect,aws engineer,azure engineer,gcp engineer,kubernetes engineer"
    DEFAULT_SEARCH_LOCATIONS: str = "United States,United Kingdom,Canada,Germany,Remote"
    API_TIMEOUT: int = 10
    MAX_JOBS_PER_API: int = 1000

    # Pydantic v2 settings configuration
    # Look for .env in the container root or app directory
    model_config = SettingsConfigDict(env_file=["/app/.env", ".env"], env_prefix="", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
