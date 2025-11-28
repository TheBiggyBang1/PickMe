"""
Data loading utilities for HR-Agent.

Provides functions to:
- Load job data from MongoDB
- Load resume data
- Export data for training/testing
- Generate synthetic training pairs
"""

import os
import sys
from pathlib import Path
from typing import List, Dict, Optional
import json
import csv
from datetime import datetime

# Add project root to path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()


def get_mongo_connection():
    """Get MongoDB connection."""
    uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    client = MongoClient(uri)
    return client["resume_matcher"]


def load_jobs_from_db(
    source_filter: Optional[str] = None,
    limit: Optional[int] = None
) -> List[Dict]:
    """
    Load jobs from MongoDB.
    
    Args:
        source_filter: Filter by job source (e.g., 'jsearch', 'reed')
        limit: Maximum number of jobs to return
    
    Returns:
        List of job documents
    """
    db = get_mongo_connection()
    coll = db["jobs"]
    
    query = {}
    if source_filter:
        query["source"] = source_filter
    
    cursor = coll.find(query, {"_id": 0})
    
    if limit:
        cursor = cursor.limit(limit)
    
    jobs = list(cursor)
    print(f"Loaded {len(jobs)} jobs from MongoDB")
    return jobs


def load_resumes_from_db(limit: Optional[int] = None) -> List[Dict]:
    """
    Load resumes from MongoDB.
    
    Args:
        limit: Maximum number of resumes to return
    
    Returns:
        List of resume documents
    """
    db = get_mongo_connection()
    coll = db["resumes"]
    
    cursor = coll.find({}, {"_id": 0})
    
    if limit:
        cursor = cursor.limit(limit)
    
    resumes = list(cursor)
    print(f"Loaded {len(resumes)} resumes from MongoDB")
    return resumes


def export_jobs_to_csv(output_path: str, source_filter: Optional[str] = None):
    """Export jobs to CSV file."""
    jobs = load_jobs_from_db(source_filter=source_filter)
    
    if not jobs:
        print("No jobs to export")
        return
    
    # Determine CSV columns
    fieldnames = [
        'job_id', 'job_title', 'company', 'location', 'country',
        'source', 'salary_min', 'salary_max', 'employment_type',
        'url', 'posted_date', 'scraped_date'
    ]
    
    output_dir = Path(output_path).parent
    output_dir.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
        writer.writeheader()
        
        for job in jobs:
            writer.writerow(job)
    
    print(f"Exported {len(jobs)} jobs to: {output_path}")


def export_jobs_to_json(output_path: str, source_filter: Optional[str] = None):
    """Export jobs to JSON file."""
    jobs = load_jobs_from_db(source_filter=source_filter)
    
    output_dir = Path(output_path).parent
    output_dir.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(jobs, f, indent=2, ensure_ascii=False)
    
    print(f"Exported {len(jobs)} jobs to: {output_path}")


def generate_training_pairs(
    num_pairs: int = 1000,
    output_path: str = "data/training_pairs.json"
):
    """
    Generate synthetic training pairs for model fine-tuning.
    
    This creates resume-job pairs with similarity scores based on:
    - Keyword overlap
    - Title matching
    - Skills alignment
    
    Args:
        num_pairs: Number of pairs to generate
        output_path: Where to save the pairs
    """
    jobs = load_jobs_from_db(limit=500)
    resumes = load_resumes_from_db(limit=100)
    
    if not jobs or not resumes:
        print("Error: Need jobs and resumes in database to generate training pairs")
        return
    
    pairs = []
    
    print(f"Generating {num_pairs} training pairs...")
    
    for i in range(num_pairs):
        resume = resumes[i % len(resumes)]
        job = jobs[i % len(jobs)]
        
        # Simple heuristic scoring (replace with actual labels if available)
        resume_text = resume.get('content', '').lower()
        job_text = f"{job.get('job_title', '')} {job.get('description', '')}".lower()
        
        # Count keyword overlap
        resume_words = set(resume_text.split())
        job_words = set(job_text.split())
        
        if len(resume_words) > 0 and len(job_words) > 0:
            overlap = len(resume_words & job_words)
            score = min(overlap / 50.0, 1.0)  # Normalize
        else:
            score = 0.0
        
        pairs.append({
            "resume": resume_text[:500],  # Truncate for training
            "job": job_text[:500],
            "score": round(score, 2)
        })
    
    output_dir = Path(output_path).parent
    output_dir.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(pairs, f, indent=2, ensure_ascii=False)
    
    print(f"Generated {len(pairs)} training pairs")
    print(f"Saved to: {output_path}")


def get_job_statistics() -> Dict:
    """Get statistics about jobs in database."""
    db = get_mongo_connection()
    coll = db["jobs"]
    
    total = coll.count_documents({})
    
    by_source = {}
    for doc in coll.aggregate([
        {"$group": {"_id": "$source", "count": {"$sum": 1}}}
    ]):
        by_source[doc["_id"]] = doc["count"]
    
    by_country = {}
    for doc in coll.aggregate([
        {"$group": {"_id": "$country", "count": {"$sum": 1}}},
        {"$limit": 10}
    ]):
        by_country[doc["_id"]] = doc["count"]
    
    stats = {
        "total_jobs": total,
        "by_source": by_source,
        "top_countries": by_country,
    }
    
    return stats


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Load and export HR-Agent data")
    parser.add_argument("--export-jobs-csv", help="Export jobs to CSV")
    parser.add_argument("--export-jobs-json", help="Export jobs to JSON")
    parser.add_argument("--source-filter", help="Filter by job source")
    parser.add_argument("--generate-training-pairs", type=int, help="Generate N training pairs")
    parser.add_argument("--stats", action="store_true", help="Show database statistics")
    
    args = parser.parse_args()
    
    if args.stats:
        stats = get_job_statistics()
        print(json.dumps(stats, indent=2))
    
    if args.export_jobs_csv:
        export_jobs_to_csv(args.export_jobs_csv, args.source_filter)
    
    if args.export_jobs_json:
        export_jobs_to_json(args.export_jobs_json, args.source_filter)
    
    if args.generate_training_pairs:
        generate_training_pairs(args.generate_training_pairs)
    
    if not any([args.stats, args.export_jobs_csv, args.export_jobs_json, args.generate_training_pairs]):
        parser.print_help()