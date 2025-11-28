import requests
import json

# Test the match endpoint with a small payload
resume_text = """
Python Developer with 5 years experience.
Skills: Python, FastAPI, MongoDB, Docker, AWS
"""

files = {
    'file': ('test.txt', resume_text.encode(), 'text/plain')
}

# First upload resume
print("Uploading resume...")
resp = requests.post('http://localhost:8000/api/resume/upload-resume', files=files)
print(f"Upload status: {resp.status_code}")
resp_data = resp.json()
print(f"Response: {json.dumps(resp_data, indent=2)}")

if 'resume_id' in resp_data:
    resume_id = resp_data['resume_id']
    
    # Now call match endpoint with debug info
    print(f"\nCalling match endpoint with resume_id: {resume_id}")
    match_resp = requests.get(f'http://localhost:8000/api/match/match-resume/{resume_id}')
    print(f"Match status: {match_resp.status_code}")
    match_data = match_resp.json()
    
    print(f"\nMatch response:")
    print(json.dumps(match_data, indent=2))
    
    # Check specific match scores
    if 'matches' in match_data and match_data['matches']:
        print(f"\nFirst match score: {match_data['matches'][0]['match_score']}")
