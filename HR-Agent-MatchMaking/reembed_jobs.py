#!/usr/bin/env python
"""Re-embed all jobs in the database that have empty or missing embeddings."""
import sys
import asyncio
from src.backend.api.config.database import get_jobs_collection
from src.backend.api.services.embedding_engine import embed_text

def reembed_jobs(batch_size: int = 50):
    """Fetch jobs without embeddings and generate embeddings for them."""
    coll = get_jobs_collection()
    
    # Find jobs with missing or empty embeddings
    query = {"$or": [{"embedding": {"$exists": False}}, {"embedding": []}]}
    total = coll.count_documents(query)
    print(f"Found {total} jobs needing embeddings...")
    
    # Process in batches
    updated = 0
    for skip in range(0, total, batch_size):
        jobs = list(coll.find(query).skip(skip).limit(batch_size))
        print(f"Processing batch {skip // batch_size + 1}...", end=" ")
        
        for job in jobs:
            text = f"{job.get('job_title', '')} {job.get('company', '')} {job.get('description', '')}"
            emb = embed_text(text)
            if emb:
                coll.update_one({"_id": job["_id"]}, {"$set": {"embedding": emb}})
                updated += 1
            else:
                print(f"WARNING: Failed to embed job {job.get('job_id')}")
        
        print(f"Updated {len(jobs)} jobs (total: {updated})")
    
    print(f"\nTotal jobs re-embedded: {updated}")
    
    # Verify
    count_with_emb = coll.count_documents({"embedding": {"$exists": True, "$ne": []}})
    print(f"Jobs now with embeddings: {count_with_emb}")

if __name__ == "__main__":
    reembed_jobs()
