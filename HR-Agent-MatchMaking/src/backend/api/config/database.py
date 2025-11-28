from pymongo import MongoClient, ASCENDING
from .settings import settings


_client: MongoClient | None = None


def get_mongo_client() -> MongoClient:
    global _client
    if _client is None:
        _client = MongoClient(settings.MONGODB_URI)
    return _client


def get_jobs_collection():
    db = get_mongo_client()["resume_matcher"]
    coll = db["jobs"]
    # Ensure indexes once
    coll.create_index([("job_id", ASCENDING)], unique=True)
    coll.create_index([("source", ASCENDING)])
    coll.create_index([("job_title", ASCENDING)])
    coll.create_index([("posted_date", ASCENDING)])
    return coll


def get_resumes_collection():
    db = get_mongo_client()["resume_matcher"]
    coll = db["resumes"]
    coll.create_index([("resume_id", ASCENDING)], unique=True)
    coll.create_index([("created_at", ASCENDING)])
    return coll
