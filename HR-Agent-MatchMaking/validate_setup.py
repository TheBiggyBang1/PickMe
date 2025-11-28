#!/usr/bin/env python3
"""
Quick validation script to check backend setup.
Run from project root: python validate_setup.py
"""

import sys
from pathlib import Path

def check_file(path: str, required: bool = True) -> bool:
    exists = Path(path).exists()
    status = "✓" if exists else ("✗ REQUIRED" if required else "✗ optional")
    print(f"{status} {path}")
    return exists

def main():
    print("=" * 60)
    print("HR-Agent Backend Setup Validation")
    print("=" * 60)
    
    required_files = [
        "src/backend/api/app.py",
        "src/backend/api/config/settings.py",
        "src/backend/api/config/database.py",
        "src/backend/api/routes/health_routes.py",
        "src/backend/api/routes/job_routes.py",
        "src/backend/api/routes/resume_routes.py",
        "src/backend/api/routes/match_routes.py",
        "src/backend/api/services/job_api_aggregator.py",
        "src/backend/api/services/text_processor.py",
        "src/backend/api/services/embedding_engine.py",
        "src/backend/api/services/matching_engine.py",
        "src/backend/api/services/skill_extractor.py",
        "src/backend/main.py",
        "src/backend/requirements.txt",
        "models/schemas/job_schema.py",
        "models/schemas/resume_schema.py",
        "models/schemas/match_schema.py",
        "models/schemas/api_response_schema.py",
        ".env.example",
        "docker-compose.yml",
        "Dockerfile",
    ]
    
    optional_files = [
        ".env",
    ]
    
    print("\nRequired Files:")
    all_required = all(check_file(f, True) for f in required_files)
    
    print("\nOptional Files:")
    for f in optional_files:
        check_file(f, False)
    
    print("\n" + "=" * 60)
    if all_required:
        print("✓ All required files present!")
        print("\nNext steps:")
        print("1. Copy .env.example to .env and add your API keys")
        print("2. Install dependencies: cd src/backend && pip install -r requirements.txt")
        print("3. Run backend: python -m src.backend.main")
        print("4. Visit http://localhost:8000/docs for API documentation")
        return 0
    else:
        print("✗ Some required files are missing!")
        return 1

if __name__ == "__main__":
    sys.exit(main())
