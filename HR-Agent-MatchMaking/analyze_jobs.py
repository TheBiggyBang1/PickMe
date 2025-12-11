from pymongo import MongoClient
import re

c = MongoClient('mongodb://mongodb:27017')
db = c['resume_matcher']
jobs = db['jobs']

print(f'Total jobs: {jobs.count_documents({})}')
print('\nJob distribution by source:')
for s in jobs.aggregate([{'$group': {'_id': '$source', 'count': {'$sum': 1}}}]):
    print(f"  {s['_id']}: {s['count']}")

# Count jobs by language keywords
python_jobs = jobs.count_documents({'description': {'$regex': 'python', '$options': 'i'}})
java_jobs = jobs.count_documents({'description': {'$regex': '\\bjava\\b', '$options': 'i'}})
js_jobs = jobs.count_documents({'description': {'$regex': 'javascript|\\bjs\\b', '$options': 'i'}})
csharp_jobs = jobs.count_documents({'description': {'$regex': 'c#|csharp', '$options': 'i'}})
cpp_jobs = jobs.count_documents({'description': {'$regex': 'c\\+\\+|cpp', '$options': 'i'}})

print(f'\nLanguage distribution:')
print(f'Python jobs: {python_jobs}')
print(f'Java jobs: {java_jobs}')
print(f'JavaScript jobs: {js_jobs}')
print(f'C# jobs: {csharp_jobs}')
print(f'C++ jobs: {cpp_jobs}')

# Sample some job titles
print('\nSample job titles:')
for job in jobs.find().limit(20):
    print(f"  {job.get('job_title')} ({job.get('source')})")
