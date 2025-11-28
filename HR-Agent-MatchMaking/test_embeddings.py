from src.backend.api.services.embedding_engine import embed_text

test_text = "Senior Python Developer with FastAPI experience"
result = embed_text(test_text)
print(f"embed_text returned: {type(result)}")
print(f"Result length: {len(result)}")
if result:
    print(f"First 5 values: {result[:5]}")
else:
    print("Result is empty!")

# Try importing directly
try:
    from sentence_transformers import SentenceTransformer
    print("SentenceTransformer imported successfully")
except Exception as e:
    print(f"Failed to import SentenceTransformer: {e}")
