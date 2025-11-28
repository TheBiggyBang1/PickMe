# HR-Agent

**AI-Powered Resume-to-Job Matching Platform**

HR-Agent is a comprehensive data science project that helps job/internship seekers find their perfect match using semantic similarity and multi-API job aggregation. Built with FastAPI, MongoDB, Sentence-BERT embeddings, and React.

This project is part of our educational program at ESPRIT University.


## 🚀 Features

- **8 Job API Integrations**: Reed (UK), USAJobs (Gov), ArbeitNow (EU), JSearch, APILayer, Findwork (Tech), TheMuse, Adzuna
- **Semantic Matching**: Sentence-BERT embeddings (multi-qa-MiniLM-L6-cos-v1) with cosine similarity
- **Resume Processing**: PDF, DOCX, TXT extraction with automated skill detection
- **Background Scheduling**: Auto-fetch jobs every 3 hours (configurable)
- **Deduplication**: Smart job merging across APIs by title/company/location
- **FastAPI Backend**: Async, type-safe, with OpenAPI docs
- **MongoDB Storage**: Efficient indexing and retrieval
- **Docker Support**: One-command deployment

## 📁 Project Structure

```
HR-Agent/
├── models/
│   ├── schemas/                    # Pydantic models
│   │   ├── job_schema.py
│   │   ├── resume_schema.py
│   │   ├── match_schema.py
│   │   └── api_response_schema.py
│   └── model_metaData.json
│
├── notebooks/
│   ├── data/
│   │   └── data.csv
│   ├── dataExploration/
│   │   └── explore_jobs.ipynb
│   └── preprocessing/
│       └── data_preprocessing*.ipynb
│
├── src/
│   ├── backend/
│   │   ├── api/
│   │   │   ├── config/             # Settings, DB connections
│   │   │   ├── routes/             # FastAPI routers
│   │   │   ├── services/           # Business logic
│   │   │   │   ├── job_api_aggregator.py
│   │   │   │   ├── text_processor.py
│   │   │   │   ├── embedding_engine.py
│   │   │   │   ├── matching_engine.py
│   │   │   │   └── skill_extractor.py
│   │   │   └── utils/
│   │   ├── app.py                  # FastAPI app entry
│   │   ├── main.py                 # Uvicorn runner
│   │   ├── requirements.txt
│   │   └── README.md
│   │
│   ├── frontend/
│   │   └── src/                    # React app (placeholder)
│   │
│   └── modelScripts/
│       ├── train.py
│       └── evaluate.py
│
├── docker-compose.yml              # MongoDB + Redis + Backend
├── Dockerfile
├── .env.example                    # Environment template
├── .gitignore
├── README.md
└── requirements.txt
```

## 🛠️ Quick Start

### Prerequisites

- **Python 3.11+** (3.12 recommended)
- **MongoDB** (local or Docker)
- **Redis** (optional)
- **API Keys** (see `.env.example`)

### 1. Clone & Setup

```bash
git clone <repository-url>
cd HR-Agent-main

# Create virtual environment
python -m venv venv

# Activate (Windows PowerShell)
venv\Scripts\Activate.ps1

# Install dependencies
cd src/backend
pip install -r requirements.txt
```

### 2. Configure API Keys

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your API keys:
# REED_API_KEY, USAJOBS_API_KEY, JSEARCH_API_KEY, etc.
```

**Get API Keys:**
- Reed: https://www.reed.co.uk/developers
- USAJobs: https://developer.usajobs.gov/
- JSearch (RapidAPI): https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
- Adzuna: https://developer.adzuna.com/
- Others: See `.env.example` for URLs

### 3. Start Services

**Option A: Docker (Recommended)**

```bash
# From project root
docker-compose up -d
```

**Option B: Local MongoDB**

```bash
# Start MongoDB (if not running)
mongod --dbpath <your-db-path>

# Run backend
python -m src.backend.main
```

### 4. Access API

- **Swagger Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/health
- **Job Stats**: http://localhost:8000/api/jobs/stats

## 📡 API Endpoints

### Health
- `GET /api/health` - Service health check
- `GET /api/api/status` - API status

### Jobs
- `GET /api/jobs/stats` - Total jobs indexed, breakdown by source, last sync time
- `POST /api/jobs/trigger-refresh` - Manually trigger job fetch from all APIs

### Resume
- `POST /api/resume/upload-resume` - Upload resume (PDF/DOCX/TXT), extract skills

### Matching
- `POST /api/match/match-resume/{resume_id}` - Get top job matches with scores
  - Query params: `top_k=50`, `source_filter=all`

## 🧪 Example Usage

**1. Upload Resume**

```bash
curl -X POST "http://localhost:8000/api/resume/upload-resume" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@resume.pdf"
```

**Response:**
```json
{
  "resume_id": "67890abc...",
  "filename": "resume.pdf",
  "status": "processed",
  "skills_extracted": {
    "technical": ["python", "aws", "docker"],
    "soft": [],
    "certifications": []
  }
}
```

**2. Get Matches**

```bash
curl -X POST "http://localhost:8000/api/match/match-resume/67890abc?top_k=10"
```

**Response:**
```json
{
  "resume_id": "67890abc...",
  "total_matches": 10,
  "matches_by_source": {
    "jsearch": 4,
    "reed": 3,
    "findwork": 3
  },
  "top_matches": [
    {
      "job_id": "jsearch_123",
      "job_title": "Senior Python Developer",
      "company": "Google",
      "location": "San Francisco, USA",
      "match_score": 87.5,
      "salary_min": 180000,
      "url": "https://..."
    }
  ]
}
```

## 🔧 Configuration

Edit `.env` to customize:

```env
# Job sync interval (hours)
JOB_SYNC_INTERVAL=3

# Default search keywords
DEFAULT_SEARCH_KEYWORDS=python developer

# Locations to search
DEFAULT_SEARCH_LOCATIONS=USA,UK,Germany,Remote

# Model name
MODEL_NAME=multi-qa-MiniLM-L6-cos-v1
```

## 📊 Architecture

**Layer 1: Data Ingestion**
- Async parallel fetching from 8 APIs
- Exponential backoff retry logic
- Rate limiting per API

**Layer 2: Processing**
- Text extraction (PyPDF2, python-docx)
- Skill extraction (keyword-based)
- Normalization to unified schema

**Layer 3: Embedding & Storage**
- Sentence-BERT embeddings (384-dim)
- MongoDB with deduplication
- Indexed by source, title, date

**Layer 4: Matching**
- Cosine similarity scoring
- Top-K retrieval
- Source filtering

**Layer 5: Scheduling**
- APScheduler AsyncIOScheduler
- Integrated with FastAPI lifespan
- Configurable interval

## 🧑‍💻 Development

### Run Tests

```bash
pytest tests/
```

### Format Code

```bash
black src/backend/
ruff check src/backend/
```

### Database Inspection

```bash
# Connect to MongoDB
mongosh

use resume_matcher
db.jobs.countDocuments()
db.jobs.find({source: "jsearch"}).limit(5)
```

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down

# Rebuild
docker-compose up -d --build
```

## 📝 TODO

- [ ] Add resume routes (upload, process)
- [ ] Implement report_generator service (fit/gap analysis)
- [ ] Add Pinecone vector DB integration
- [ ] Build React frontend
- [ ] Add authentication middleware
- [ ] Implement Celery workers for async tasks
- [ ] Add unit/integration tests
- [ ] Deploy to production

## 🤝 Contributing

This is an educational project at ESPRIT University. Contributions welcome!

## 📄 License

MIT License

## 🙏 Acknowledgments

- **APIs**: Reed, USAJobs, ArbeitNow, JSearch, APILayer, Findwork, TheMuse, Adzuna
- **ML Model**: Sentence-Transformers (multi-qa-MiniLM-L6-cos-v1)
- **Framework**: FastAPI, MongoDB, Docker

