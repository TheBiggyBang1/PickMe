from fastapi import APIRouter
from ..services.embedding_engine import embed_text
from ..utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()


@router.get("/health")
async def health():
    return {"status": "healthy"}


@router.get("/api/status")
async def api_status():
    return {"service": "backend", "status": "ok"}


@router.get("/embeddings-test")
async def embeddings_test():
    """Quick test endpoint that attempts to generate an embedding for a small string.
    Useful to confirm runtime model download and cache mounting.
    """
    try:
        emb = embed_text("test embedding")
        ok = bool(emb)
        if ok:
            return {"ok": True, "embedding_len": len(emb), "sample": emb[:5]}
        else:
            return {"ok": False, "error": "embedding returned empty list"}
    except Exception as e:
        logger.exception("Embedding test failed")
        return {"ok": False, "error": str(e)}
