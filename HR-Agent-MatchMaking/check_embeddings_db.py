from src.backend.api.config.database import get_jobs_collection
coll = get_jobs_collection()
count = coll.estimated_document_count()
print(f'Total jobs in DB: {count}')

# Find a document with a non-empty embedding
doc = coll.find_one({'embedding': {'$exists': True, '$ne': []}})
if doc:
    emb = doc.get('embedding', [])
    print(f'Found doc with embedding: True')
    print(f'Embedding length: {len(emb)}')
    print(f'Sample embedding (first 5 values): {emb[:5] if emb else "empty"}')
    print(f'Job title: {doc.get("job_title")}')
else:
    print('No documents found with non-empty embedding')
    # Check if any docs exist at all
    doc_any = coll.find_one({})
    if doc_any:
        print(f'Sample doc embedding field: {doc_any.get("embedding")}')
