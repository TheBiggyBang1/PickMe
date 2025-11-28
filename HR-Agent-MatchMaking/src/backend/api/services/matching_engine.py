from typing import Dict, List, Optional
import numpy as np
from ..config.database import get_jobs_collection
from .embedding_engine import embed_text


def cosine(a: np.ndarray, b: np.ndarray) -> float:
    na = np.linalg.norm(a)
    nb = np.linalg.norm(b)
    if na == 0 or nb == 0:
        return 0.0
    return float(np.dot(a, b) / (na * nb))


def match_resume_to_jobs(resume_text: str, top_k: int = 50, source_filter: Optional[str] = None) -> List[Dict]:
    q = embed_text(resume_text)
    qv = np.array(q, dtype=np.float32)
    coll = get_jobs_collection()

    query = {"embedding": {"$exists": True}}
    if source_filter and source_filter != "all":
        query["source"] = source_filter

    jobs = list(coll.find(query, {"_id": 0}))
    scored = []
    for j in jobs:
        ev = np.array(j.get("embedding") or [], dtype=np.float32)
        score = cosine(qv, ev)
        j_copy = dict(j)
        j_copy["match_score"] = round(score * 100.0, 2)
        scored.append(j_copy)

    scored.sort(key=lambda x: x["match_score"], reverse=True)
    return scored[:top_k]
