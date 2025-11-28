# HR-Agent Backend

FastAPI-based resume matching backend with multi-API job aggregation.

## Features

- **8 Job API Integrations**: Reed, USAJobs, ArbeitNow, JSearch, APILayer, Findwork, TheMuse, Adzuna
- **Semantic Matching**: Sentence-BERT embeddings with cosine similarity
- **Resume Processing**: PDF/DOCX/TXT extraction with skill detection
- **Background Scheduling**: Automatic job fetching every 3 hours (configurable)
- **MongoDB Storage**: Job deduplication and indexing
- **FastAPI**: Async endpoints with OpenAPI docs at `/docs`

## Setup

### Prerequisites

- Python 3.11+ (3.12 recommended)
- MongoDB (local or Docker)
- Redis (optional, for caching)

### Install Dependencies

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows PowerShell)
venv\Scripts\Activate.ps1

# Install packages
cd src/backend
pip install -r requirements.txt
```

### Configure Environment

Copy `.env.example` to `.env` in project root and add your API keys:

```bash
cp ../../.env.example ../../.env
```

Edit `.env` with your credentials (Reed, USAJobs, JSearch, Adzuna, etc.).

### Run Backend

**From project root:**

```bash
python -m src.backend.main
```

**Or with uvicorn directly:**

```bash
uvicorn src.backend.api.app:app --reload --host 0.0.0.0 --port 8000
```

### Docker Compose

```bash
# From project root
docker-compose up -d
```

## API Endpoints

### Health
- `GET /api/health` - Health check
- `GET /api/api/status` - Service status

### Jobs
- `GET /api/jobs/stats` - Job statistics by source
- `POST /api/jobs/trigger-refresh` - Manually trigger job fetch from all APIs

### Resume
- `POST /api/resume/upload-resume` - Upload resume (PDF/DOCX/TXT)

### Matching
- `POST /api/match/match-resume/{resume_id}?top_k=50&source_filter=all` - Get top job matches

## API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Architecture

```
src/backend/api/
├── app.py                  # FastAPI app + lifespan scheduler
├── config/
│   ├── settings.py         # Pydantic settings from .env
│   └── database.py         # MongoDB connection helpers
├── routes/
│   ├── health_routes.py    # /health, /api/status
│   ├── job_routes.py       # /jobs/stats, /jobs/trigger-refresh
│   ├── resume_routes.py    # /resume/upload-resume
│   └── match_routes.py     # /match/match-resume/{id}
├── services/
│   ├── job_api_aggregator.py   # Multi-API fetching + APScheduler
│   ├── text_processor.py       # PDF/DOCX extraction
│   ├── skill_extractor.py      # Keyword-based skill detection
│   ├── embedding_engine.py     # Sentence-BERT wrapper
│   └── matching_engine.py      # Cosine similarity matching
└── utils/
    ├── logger.py           # Structured logging
    └── constants.py        # Enums (EmploymentType)
```

## Development

### Install Dev Dependencies

```bash
pip install pytest pytest-asyncio httpx black ruff
```

### Run Tests

```bash
pytest tests/
```

### Format Code

```bash
black src/backend/
ruff check src/backend/
```

## Deployment

See `docker-compose.yml` for production deployment with MongoDB and Redis containers.

## Troubleshooting

**Import errors**: Ensure PYTHONPATH includes project root or run from root with `python -m src.backend.main`

**APScheduler not found**: Run `pip install apscheduler==3.10.4`

**MongoDB connection**: Check `MONGODB_URI` in `.env` points to running instance (default: `mongodb://localhost:27017`)

**API keys missing**: Some APIs will silently skip if keys not configured; check console logs for warnings

**Sentence-transformers download**: First run will download ~90MB model; requires internet connection