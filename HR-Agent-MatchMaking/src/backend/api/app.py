from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config.settings import settings
from importlib import import_module
from contextlib import asynccontextmanager
from .services.job_api_aggregator import AggregatorScheduler
from .utils.logger import get_logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger = get_logger(__name__)
    try:
        AggregatorScheduler.start()
    except Exception:
        logger.exception("Failed to start AggregatorScheduler; continuing without scheduler")
    yield
    try:
        AggregatorScheduler.stop()
    except Exception:
        logger.exception("Failed to stop AggregatorScheduler")


app = FastAPI(title="HR-Agent Backend", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dynamic import of routers to avoid path resolution issues in some IDEs
health_router = import_module("src.backend.api.routes.health_routes").router
job_router = import_module("src.backend.api.routes.job_routes").router
resume_router = import_module("src.backend.api.routes.resume_routes").router
match_router = import_module("src.backend.api.routes.match_routes").router

app.include_router(health_router, prefix="/api")
app.include_router(job_router, prefix="/api")
app.include_router(resume_router, prefix="/api")
app.include_router(match_router, prefix="/api")


@app.get("/")
async def root():
    return {"status": "ok", "service": "hr-agent-backend"}