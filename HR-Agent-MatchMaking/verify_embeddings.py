import requests
import json

BASE = "http://localhost:8000/api"

# Upload resume
print("Uploading resume...")
files = {"file": ("test_resume.txt", open("test_resume.txt", "rb"), "text/plain")}
res = requests.post(f"{BASE}/resume/upload-resume", files=files, timeout=60)
print(f"Upload status: {res.status_code}")
data = res.json()
print(json.dumps(data, indent=2))

resume_id = data['resume_id']
print(f"\nResume ID: {resume_id}")

# Match
print("\nMatching resume to jobs...")
match_res = requests.post(f"{BASE}/match/match-resume/{resume_id}?top_k=5", timeout=60)
print(f"Match status: {match_res.status_code}")
result = match_res.json()

print(f"\nTotal matches: {result['total_matches']}")
if result['top_matches']:
    top = result['top_matches'][0]
    print(f"Top match: '{top['job_title']}' at {top['company']}")
    print(f"Match score: {top['match_score']}")
    print(f"URL: {top['url']}")
    print(f"\nTop 5 match scores:")
    for i, j in enumerate(result['top_matches'][:5], 1):
        print(f"  {i}. {j['job_title']}: {j['match_score']}")
