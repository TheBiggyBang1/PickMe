import requests
import sys

BASE = "http://localhost:8000/api"

# Upload resume
files = {"file": ("sample_resume.txt", open("sample_resume.txt", "rb"), "text/plain")}
print('Uploading resume...')
res = requests.post(f"{BASE}/resume/upload-resume", files=files, timeout=60)
print('Upload status:', res.status_code)
print(res.text)
if res.status_code not in (200, 201):
    sys.exit(1)

resume = res.json()
resume_id = resume.get('resume_id')
print('Resume ID:', resume_id)

# Call match
print('Requesting matches...')
match_res = requests.post(f"{BASE}/match/match-resume/{resume_id}?top_k=10", timeout=60)
print('Match status:', match_res.status_code)
print(match_res.text)
