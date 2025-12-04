from pymongo import MongoClient
c = MongoClient('mongodb://mongodb:27017')
db = c['resume_matcher']
r = db['resumes'].find_one()
print("Resume _id:", r.get('_id'))
print("Resume resume_id:", r.get('resume_id'))
print("Keys:", list(r.keys()))
