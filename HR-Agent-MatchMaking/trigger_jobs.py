"""
Quick script to manually trigger job fetching from all APIs
"""
import asyncio
import sys
sys.path.insert(0, '.')

from src.backend.api.services.job_api_aggregator import JobAggregatorService
from src.backend.api.config.settings import settings


async def main():
    print("=" * 60)
    print("MANUALLY TRIGGERING JOB FETCH FROM ALL APIS")
    print("=" * 60)
    print(f"Keywords: {settings.DEFAULT_SEARCH_KEYWORDS}")
    print(f"Locations: {settings.DEFAULT_SEARCH_LOCATIONS}")
    print()
    
    service = JobAggregatorService()
    keywords_list = [kw.strip() for kw in settings.DEFAULT_SEARCH_KEYWORDS.split(",")]
    
    for keywords in keywords_list:
        print(f"\n🔍 Fetching jobs for: '{keywords}'")
        print("-" * 60)
        results = await service.fetch_all_jobs(keywords)
        
        print(f"\n✅ Results for '{keywords}':")
        print(f"   Total jobs fetched: {results['total_jobs']}")
        print(f"   Jobs by source:")
        for source, count in results['by_source'].items():
            print(f"      - {source}: {count} jobs")
        
        if results.get('errors'):
            print(f"\n❌ Errors:")
            for source, error in results['errors'].items():
                print(f"      - {source}: {error}")
    
    print("\n" + "=" * 60)
    print("JOB FETCH COMPLETE!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
