import asyncio
import aiohttp
from typing import List, Dict, Optional
from datetime import datetime
import math
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from ..config.settings import settings
from ..config.database import get_jobs_collection
from ..utils.logger import get_logger

logger = get_logger(__name__)


class JobAggregatorService:
    def __init__(self):
        self.jobs_collection = get_jobs_collection()
        self.timeout = aiohttp.ClientTimeout(total=settings.API_TIMEOUT)

    async def fetch_all_jobs(self, keywords: str = "python", search_locations: Optional[List[str]] = None) -> Dict[str, int]:
        if search_locations is None:
            search_locations = [l.strip() for l in settings.DEFAULT_SEARCH_LOCATIONS.split(",")]

        apis = self._api_configs()

        results = {"total_jobs": 0, "by_source": {}, "errors": {}}

        tasks: list[asyncio.Task] = []
        task_sources: list[str] = []
        for source, cfg in apis.items():
            for location in search_locations:
                tasks.append(asyncio.create_task(self._with_retries(cfg["handler"], keywords, location)))
                task_sources.append(source)

        responses = await asyncio.gather(*tasks, return_exceptions=True)

        for source, resp in zip(task_sources, responses):
            if isinstance(resp, Exception):
                logger.error(f"{source} error: {resp}")
                results["errors"][source] = str(resp)
                results["by_source"][source] = results["by_source"].get(source, 0)
            else:
                count = len(resp)
                results["by_source"][source] = results["by_source"].get(source, 0) + count
                results["total_jobs"] += count
                if count:
                    await self._store_jobs(resp)

        logger.info(f"Total jobs fetched: {results['total_jobs']}")
        return results

    async def _with_retries(self, handler, keywords: str, location: str, attempts: int = 3):
        delay = 1.0
        for i in range(attempts):
            try:
                return await handler(keywords, location)
            except asyncio.TimeoutError:
                logger.warning(f"Timeout calling {handler.__name__} (attempt {i+1})")
            except aiohttp.ClientResponseError as e:
                if e.status in (429, 500, 502, 503):
                    logger.warning(f"{handler.__name__} transient {e.status}, retrying...")
                else:
                    logger.error(f"{handler.__name__} HTTP {e.status}: {e}")
                    break
            except Exception as e:
                logger.error(f"{handler.__name__} error: {e}")
                break
            await asyncio.sleep(delay)
            delay *= 2
        return []

    def _api_configs(self):
        return {
            "reed": {"handler": self._fetch_reed_jobs},
            "usajobs": {"handler": self._fetch_usajobs},
            "arbeitnow": {"handler": self._fetch_arbeitnow_jobs},
            "jsearch": {"handler": self._fetch_jsearch_jobs},
            "apilayer": {"handler": self._fetch_apilayer_jobs},
            "findwork": {"handler": self._fetch_findwork_jobs},
            "themuse": {"handler": self._fetch_themuse_jobs},
            "adzuna": {"handler": self._fetch_adzuna_jobs},
        }

    # === Individual API handlers ===
    async def _fetch_reed_jobs(self, keywords: str, location: str) -> List[Dict]:
        key = settings.REED_API_KEY
        if not key:
            return []
        auth = aiohttp.BasicAuth(key, "")
        params = {"keywords": keywords, "location": location, "resultsToTake": 100}
        async with aiohttp.ClientSession(timeout=self.timeout) as session:
            async with session.get("https://www.reed.co.uk/api/1.0/search", params=params, auth=auth) as resp:
                if resp.status != 200:
                    return []
                data = await resp.json()
                out = []
                for job in data.get("results", []):
                    out.append({
                        "job_id": f"reed_{job.get('jobId')}",
                        "job_title": job.get("jobTitle"),
                        "company": job.get("employerName"),
                        "description": job.get("jobDescription"),
                        "location": job.get("locationName"),
                        "country": "UK",
                        "salary_min": _extract_salary_min(job.get("salary")),
                        "salary_max": _extract_salary_max(job.get("salary")),
                        "employment_type": "full_time",
                        "url": job.get("jobUrl"),
                        "posted_date": job.get("date"),
                        "scraped_date": datetime.utcnow().isoformat(),
                        "source": "reed",
                    })
                return out

    async def _fetch_usajobs(self, keywords: str, location: str) -> List[Dict]:
        key = settings.USAJOBS_API_KEY
        if not key:
            return []
        headers = {"Authorization-Key": key, "User-Agent": settings.USAJOBS_USER_AGENT or "HR-Agent/1.0"}
        params = {"Keyword": keywords, "LocationName": location, "ResultsPerPage": 500}
        async with aiohttp.ClientSession(timeout=self.timeout) as session:
            async with session.get("https://data.usajobs.gov/api/search", params=params, headers=headers) as resp:
                if resp.status != 200:
                    return []
                data = await resp.json()
                out = []
                for item in data.get("SearchResult", {}).get("SearchResultItems", []):
                    job = item.get("MatchedObjectDescriptor", {})
                    out.append({
                        "job_id": f"usajobs_{job.get('PositionID')}",
                        "job_title": job.get("PositionTitle"),
                        "company": job.get("OrganizationName"),
                        "description": job.get("JobDescription"),
                        "location": ", ".join(job.get("LocationNames", [])),
                        "country": "USA",
                        "salary_min": None,
                        "salary_max": None,
                        "employment_type": "full_time",
                        "url": job.get("PositionURI"),
                        "posted_date": job.get("PublicationStartDate"),
                        "scraped_date": datetime.utcnow().isoformat(),
                        "source": "usajobs",
                    })
                return out

    async def _fetch_arbeitnow_jobs(self, keywords: str, location: str) -> List[Dict]:
        key = settings.ARBEITNOW_API_KEY
        if not key:
            return []
        params = {"api_key": key, "search": keywords, "limit": 50}
        async with aiohttp.ClientSession(timeout=self.timeout) as session:
            async with session.get("https://www.arbeitnow.com/api/job-board-api", params=params) as resp:
                if resp.status != 200:
                    return []
                data = await resp.json()
                out = []
                for job in data.get("data", []):
                    out.append({
                        "job_id": f"arbeitnow_{job.get('id')}",
                        "job_title": job.get("title"),
                        "company": job.get("company_name"),
                        "description": job.get("description"),
                        "location": job.get("location", "Remote"),
                        "country": job.get("country"),
                        "salary_min": job.get("salary_min"),
                        "salary_max": job.get("salary_max"),
                        "employment_type": job.get("employment_type", "full_time"),
                        "url": job.get("url"),
                        "posted_date": job.get("date_posted"),
                        "scraped_date": datetime.utcnow().isoformat(),
                        "source": "arbeitnow",
                    })
                return out

    async def _fetch_jsearch_jobs(self, keywords: str, location: str) -> List[Dict]:
        key = settings.JSEARCH_API_KEY
        if not key:
            return []
        headers = {"X-RapidAPI-Key": key, "X-RapidAPI-Host": "jsearch.p.rapidapi.com"}
        params = {"query": keywords, "page": 1}
        async with aiohttp.ClientSession(timeout=self.timeout) as session:
            async with session.get("https://jsearch.p.rapidapi.com/search", params=params, headers=headers) as resp:
                if resp.status != 200:
                    return []
                data = await resp.json()
                out = []
                for job in data.get("data", []):
                    ts = job.get("job_posted_at_timestamp") or 0
                    posted = datetime.utcfromtimestamp(int(ts)).isoformat() if ts else None
                    out.append({
                        "job_id": f"jsearch_{job.get('job_id')}",
                        "job_title": job.get("job_title"),
                        "company": job.get("employer_name"),
                        "description": job.get("job_description"),
                        "location": f"{job.get('job_city')}, {job.get('job_country')}",
                        "country": job.get("job_country"),
                        "salary_min": None,
                        "salary_max": None,
                        "employment_type": job.get("job_employment_type", "full_time"),
                        "url": job.get("job_apply_link"),
                        "posted_date": posted,
                        "scraped_date": datetime.utcnow().isoformat(),
                        "source": "jsearch",
                    })
                return out

    async def _fetch_apilayer_jobs(self, keywords: str, location: str) -> List[Dict]:
        key = settings.APILAYER_JOBS_KEY
        if not key:
            return []
        params = {"query": keywords, "apikey": key, "limit": 50}
        async with aiohttp.ClientSession(timeout=self.timeout) as session:
            async with session.get("https://api.apilayer.com/job_search/search", params=params) as resp:
                if resp.status != 200:
                    return []
                data = await resp.json()
                out = []
                for job in data.get("data", []):
                    out.append({
                        "job_id": f"apilayer_{job.get('job_id')}",
                        "job_title": job.get("job_title"),
                        "company": job.get("employer_name"),
                        "description": job.get("job_description"),
                        "location": f"{job.get('job_city')}, {job.get('job_country')}",
                        "country": job.get("job_country"),
                        "salary_min": None,
                        "salary_max": None,
                        "employment_type": job.get("employment_type", "full_time"),
                        "url": job.get("job_apply_link"),
                        "posted_date": job.get("published_at"),
                        "scraped_date": datetime.utcnow().isoformat(),
                        "source": "apilayer",
                    })
                return out

    async def _fetch_findwork_jobs(self, keywords: str, location: str) -> List[Dict]:
        key = settings.FINDWORK_API_KEY
        if not key:
            return []
        params = {"token": key, "search": keywords, "page_size": 50}
        async with aiohttp.ClientSession(timeout=self.timeout) as session:
            async with session.get("https://findwork.dev/api/jobs", params=params) as resp:
                if resp.status != 200:
                    return []
                data = await resp.json()
                out = []
                for job in data.get("results", []):
                    out.append({
                        "job_id": f"findwork_{job.get('id')}",
                        "job_title": job.get("title"),
                        "company": job.get("company_name"),
                        "description": job.get("description"),
                        "location": job.get("location", "Remote"),
                        "country": "Global",
                        "salary_min": job.get("salary_min"),
                        "salary_max": job.get("salary_max"),
                        "employment_type": job.get("employment_type", "full_time"),
                        "url": job.get("url"),
                        "posted_date": job.get("posted_at"),
                        "scraped_date": datetime.utcnow().isoformat(),
                        "source": "findwork",
                    })
                return out

    async def _fetch_themuse_jobs(self, keywords: str, location: str) -> List[Dict]:
        key = settings.THEMUSE_API_KEY
        if not key:
            return []
        params = {"api_key": key, "category": keywords}
        async with aiohttp.ClientSession(timeout=self.timeout) as session:
            async with session.get("https://www.themuse.com/api/public/jobs", params=params) as resp:
                if resp.status != 200:
                    return []
                data = await resp.json()
                out = []
                for job in data.get("results", []):
                    company = (job.get("company") or {}).get("name")
                    locations = job.get("locations") or []
                    location_str = (locations[0].get("name") if locations else "Remote") if isinstance(locations, list) else "Remote"
                    out.append({
                        "job_id": f"themuse_{job.get('id')}",
                        "job_title": job.get("name"),
                        "company": company,
                        "description": job.get("description"),
                        "location": location_str,
                        "country": "Global",
                        "salary_min": None,
                        "salary_max": None,
                        "employment_type": "full_time",
                        "url": job.get("apply_url"),
                        "posted_date": job.get("published_at"),
                        "scraped_date": datetime.utcnow().isoformat(),
                        "source": "themuse",
                    })
                return out

    async def _fetch_adzuna_jobs(self, keywords: str, location: str) -> List[Dict]:
        app_id, app_key = settings.ADZUNA_APP_ID, settings.ADZUNA_APP_KEY
        if not app_id or not app_key:
            return []
        country_map = {"USA": "us", "UK": "gb", "Germany": "de", "Remote": "us"}
        country_code = country_map.get(location, "us")
        base = f"https://api.adzuna.com/v1/api/jobs/{country_code}/search/1"
        params = {"app_id": app_id, "app_key": app_key, "what": keywords, "results_per_page": 50, "content-type": "json"}
        async with aiohttp.ClientSession(timeout=self.timeout) as session:
            async with session.get(base, params=params) as resp:
                if resp.status != 200:
                    return []
                data = await resp.json()
                out = []
                for job in data.get("results", []):
                    loc = (job.get("location") or {}).get("display_name")
                    out.append({
                        "job_id": f"adzuna_{job.get('id')}",
                        "job_title": job.get("title"),
                        "company": (job.get("company") or {}).get("display_name"),
                        "description": job.get("description"),
                        "location": loc,
                        "country": location,
                        "salary_min": job.get("salary_min"),
                        "salary_max": job.get("salary_max"),
                        "employment_type": job.get("contract_type", "full_time"),
                        "url": job.get("redirect_url"),
                        "posted_date": job.get("created"),
                        "scraped_date": datetime.utcnow().isoformat(),
                        "source": "adzuna",
                    })
                return out

    # === Storage & dedup ===
    async def _store_jobs(self, jobs: List[Dict]) -> None:
        from .embedding_engine import embed_text
        # Deduplicate by job_id and by (title, company, location)
        for job in jobs:
            # First try strict by job_id
            existing = self.jobs_collection.find_one({"job_id": job["job_id"]})
            if existing:
                self.jobs_collection.update_one({"job_id": job["job_id"]}, {"$set": job})
                continue

            # Then try fuzzy dedup by common key
            title = (job.get("job_title") or "").strip().lower()
            company = (job.get("company") or "").strip().lower()
            location = (job.get("location") or "").strip().lower()
            if title and company:
                dup = self.jobs_collection.find_one({
                    "job_title": {"$regex": f"^{title}$", "$options": "i"},
                    "company": {"$regex": f"^{company}$", "$options": "i"},
                    "location": {"$regex": f"^{location}$", "$options": "i"} if location else {"$exists": True},
                })
            else:
                dup = None

            if dup:
                # Keep the more complete document
                def completeness(d: Dict) -> int:
                    keys = [
                        "description",
                        "salary_min",
                        "salary_max",
                        "employment_type",
                        "url",
                        "posted_date",
                        "country",
                    ]
                    return sum(1 for k in keys if d.get(k) not in (None, ""))

                winner = job if completeness(job) >= completeness(dup) else dup
                # Generate embedding before storing
                if "embedding" not in winner:
                    text = f"{winner.get('job_title','')} {winner.get('company','')} {winner.get('description','')}"
                    winner["embedding"] = await asyncio.to_thread(embed_text, text)
                self.jobs_collection.update_one({"_id": dup["_id"]}, {"$set": winner})
            else:
                # Generate embedding before inserting
                if "embedding" not in job:
                    text = f"{job.get('job_title','')} {job.get('company','')} {job.get('description','')}"
                    job["embedding"] = await asyncio.to_thread(embed_text, text)
                self.jobs_collection.insert_one(job)


class AggregatorScheduler:
    """APScheduler-based background scheduler for periodic job fetching."""
    _scheduler: Optional[AsyncIOScheduler] = None
    _last_sync: Optional[str] = None
    _interval_hours: int = settings.JOB_SYNC_INTERVAL

    @classmethod
    def start(cls):
        if cls._scheduler and cls._scheduler.running:
            return
        cls._scheduler = AsyncIOScheduler()
        # Add job: run immediately once and then on interval
        cls._scheduler.add_job(cls._run_once, "interval", hours=cls._interval_hours, next_run_time=datetime.utcnow())
        cls._scheduler.start()

    @classmethod
    def stop(cls):
        if cls._scheduler and cls._scheduler.running:
            cls._scheduler.shutdown(wait=False)

    @classmethod
    async def _run_once(cls):
        service = JobAggregatorService()
        try:
            await service.fetch_all_jobs(settings.DEFAULT_SEARCH_KEYWORDS)
            cls._last_sync = datetime.utcnow().isoformat()
        except Exception as e:
            logger.error(f"Scheduled fetch failed: {e}")

    @classmethod
    def get_stats(cls) -> Dict:
        coll = get_jobs_collection()
        total = coll.estimated_document_count()
        by_source = {}
        for doc in coll.aggregate([
            {"$group": {"_id": "$source", "count": {"$sum": 1}}}
        ]):
            by_source[doc["_id"]] = doc["count"]

        next_sync = None
        if cls._last_sync:
            next_sync = cls._next_sync_from_last(cls._last_sync, cls._interval_hours)

        return {
            "total_jobs_indexed": total,
            "jobs_by_source": by_source,
            "last_sync": cls._last_sync,
            "next_sync": next_sync,
            "api_health": {},
        }

    @staticmethod
    def _next_sync_from_last(last_iso: str, interval_hours: int) -> Optional[str]:
        try:
            last_dt = datetime.fromisoformat(last_iso)
            next_ts = last_dt.timestamp() + interval_hours * 3600
            return datetime.utcfromtimestamp(int(next_ts)).isoformat()
        except Exception:
            return None


def _extract_salary_min(salary_str: Optional[str]) -> Optional[float]:
    if not salary_str:
        return None
    import re
    nums = re.findall(r"\d+", salary_str)
    return float(nums[0]) if nums else None


def _extract_salary_max(salary_str: Optional[str]) -> Optional[float]:
    if not salary_str:
        return None
    import re
    nums = re.findall(r"\d+", salary_str)
    if len(nums) > 1:
        return float(nums[1])
    return float(nums[0]) if nums else None
