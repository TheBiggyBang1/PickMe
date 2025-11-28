# HR-Agent Job Scraping Guide

## ✅ System Status

Your HR-Agent is now successfully scraping jobs from multiple APIs!

### Current Stats:
- **250 jobs** indexed in MongoDB
- **3 APIs active**: Reed (400 jobs), Adzuna (200 jobs), JSearch (10 jobs)
- **Job deduplication** working correctly
- **Embeddings** generated for semantic matching

---

## 🔄 How to Fetch More Jobs

### Method 1: Automatic Scheduled Refresh
The backend automatically fetches jobs every **3 hours** when running.

### Method 2: Manual Trigger via UI
1. Open the frontend: `http://localhost:3001`
2. Navigate to **🔍 Job Search**
3. Select your desired **Job Category** (e.g., "Data & AI")
4. Pick relevant **Technologies** (e.g., Python, TensorFlow, AWS)
5. Click **"Search Jobs"**
6. Wait ~45 seconds for jobs to be fetched from all APIs

### Method 3: Run Script Manually
```powershell
C:/Users/zghal/Downloads/HR-Agent-main/HR-Agent-main/venv/Scripts/python.exe trigger_jobs.py
```

---

## 🔍 Active Job APIs

### ✅ Working APIs (with API keys configured):
1. **Reed** (UK) - 400 jobs fetched
2. **Adzuna** (US/UK/DE) - 200 jobs fetched  
3. **JSearch** (RapidAPI) - 10 jobs fetched
4. **TheMuse** (Global)
5. **FindWork** (Global)
6. **APILayer** (Global)

### ⚠️ APIs Requiring Keys (currently 0 jobs):
- **USAJobs** - Has key, but no results (might need different keywords)
- **Arbeitnow** - No API key set

---

## 📊 How to View Jobs

### Via Frontend Dashboard:
1. Open `http://localhost:3001`
2. View **Dashboard** for stats:
   - Total jobs indexed
   - Jobs by source (Reed, Adzuna, etc.)
   - Last sync time

### Via MongoDB:
```powershell
mongo resume_matcher --eval "db.jobs.find().limit(5).pretty()"
mongo resume_matcher --eval "db.jobs.count()"
```

### Via API:
```powershell
curl http://localhost:8000/api/jobs/stats
```

---

## 🎯 Search Keywords Configuration

Edit `.env` file to change what types of jobs are fetched:

```env
DEFAULT_SEARCH_KEYWORDS=software engineer,data scientist,web developer,machine learning,full stack developer
DEFAULT_SEARCH_LOCATIONS=USA,UK,Germany,Remote
```

Current keywords focus on **IT & Computer Science** roles.

---

## 🚀 Complete Workflow

1. **Start MongoDB**: `mongod` (should already be running)
2. **Start Backend**: 
   ```powershell
   C:/Users/zghal/Downloads/HR-Agent-main/HR-Agent-main/venv/Scripts/python.exe -m uvicorn src.backend.main:app --reload --host 0.0.0.0 --port 8000
   ```
3. **Start Frontend**:
   ```powershell
   cd src/frontend
   npm start
   ```
4. **Fetch Jobs** (choose one):
   - Wait for automatic schedule (every 3 hours)
   - Use UI Job Search with TechFilter
   - Run `trigger_jobs.py` manually

5. **Upload Resume**:
   - Go to **📄 Upload Resume**
   - Drag & drop your resume (PDF, DOCX, TXT)
   - System automatically matches against all 250+ jobs
   
6. **View Matches**:
   - Navigate to **✨ My Matches**
   - See ranked job matches with similarity scores
   - Filter by source (Reed, Adzuna, JSearch)
   - Click job cards to view full descriptions

---

## 🔧 Troubleshooting

### "No jobs showing"
- Check MongoDB: `mongo resume_matcher --eval "db.jobs.count()"`
- Run manual fetch: `python trigger_jobs.py`
- Check backend logs for API errors

### "API not returning jobs"
- Some APIs require exact keyword matching
- Try different keywords in `.env`
- Check API rate limits (60-120 requests/min)
- Verify API keys in `.env`

### "Duplicate jobs"
- System automatically deduplicates by:
  - Unique `job_id`
  - Matching (title + company + location)
- Keeps the most complete job description

---

## 📈 Next Steps

To get **more job descriptions**:

1. **Add more API keys** (free tier available):
   - Arbeitnow: https://www.arbeitnow.com/api
   - More RapidAPI sources

2. **Expand search keywords** in `.env`:
   ```env
   DEFAULT_SEARCH_KEYWORDS=python,javascript,react,aws,kubernetes,devops,backend,frontend,fullstack,data engineer,ML engineer
   ```

3. **Add more locations**:
   ```env
   DEFAULT_SEARCH_LOCATIONS=USA,UK,Canada,Germany,Netherlands,Remote,France,Spain
   ```

4. **Increase fetch frequency**:
   ```env
   JOB_SYNC_INTERVAL=1  # Fetch every 1 hour instead of 3
   ```

5. **Run manual fetch with custom keywords**:
   ```python
   # Edit trigger_jobs.py to add custom keywords
   keywords_list = ["react developer", "python engineer", "devops", "data scientist"]
   ```

---

## 💡 Tips

- **Best results**: Use specific job titles like "python developer", "react engineer"
- **API limits**: Be mindful of rate limits (automatically handled with retries)
- **Deduplication**: System prevents duplicate jobs across APIs
- **Embeddings**: Jobs are vectorized for semantic matching (not just keyword matching)
- **Scheduler**: Backend auto-fetches jobs every 3 hours when running

---

Enjoy your HR-Agent! 🚀
