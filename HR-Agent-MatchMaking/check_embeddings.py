from pymongo import MongoClient

c = MongoClient('mongodb://mongodb:27017')
db = c['resume_matcher']

print("=== Resumes ===")
for resume in db['resumes'].find():
    embedding = resume.get('embedding', [])
    print(f"Resume {resume.get('_id')}: {len(embedding)} dims")

print("\n=== Sample Jobs ===")
for job in db['jobs'].find().limit(3):
    embedding = job.get('embedding', [])
    title = job.get('title', 'N/A')
    print(f"Job '{title}': {len(embedding)} dims")

print(f"\nTotal jobs: {db['jobs'].count_documents({})}")
print(f"Total resumes: {db['resumes'].count_documents({})}")
