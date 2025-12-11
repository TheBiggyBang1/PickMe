from typing import Dict, List, Optional
import numpy as np
import re
from ..config.database import get_jobs_collection
from .embedding_engine import embed_text


def cosine(a: np.ndarray, b: np.ndarray) -> float:
    na = np.linalg.norm(a)
    nb = np.linalg.norm(b)
    if na == 0 or nb == 0:
        return 0.0
    return float(np.dot(a, b) / (na * nb))


def _extract_primary_language(text: str) -> Optional[str]:
    """Extract the primary programming language from job title/description."""
    text_lower = text.lower()
    
    language_patterns = {
        "python": r"\bpython\b",
        "java": r"\bjava\b(?!script)",
        "javascript": r"\b(javascript|js|node\.?js)\b",
        "c#": r"\b(c#|csharp)\b",
        "c++": r"\b(c\+\+|cpp)\b",
        ".net": r"\.net",
        "php": r"\bphp\b",
        "ruby": r"\bruby\b",
        "go": r"\bgo(lang)?\b",
        "rust": r"\brust\b",
        "typescript": r"\btypescript|ts\b",
        "kotlin": r"\bkotlin\b",
        "swift": r"\bswift\b",
        "react": r"\breact\b",
        "angular": r"\bangular\b",
        "vue": r"\bvue\b",
    }
    
    for lang, pattern in language_patterns.items():
        if re.search(pattern, text_lower):
            return lang
    
    return None


def match_resume_to_jobs(resume_text: str, top_k: int = 50, source_filter: Optional[str] = None, diversity: bool = False) -> List[Dict]:
    """
    Match resume to jobs using cosine similarity on embeddings.
    
    Args:
        resume_text: The resume text to match
        top_k: Number of top matches to return
        source_filter: Filter by job source (e.g., 'reed', 'all')
        diversity: If True, actively distribute results across programming languages
    """
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
        j_copy["_language"] = _extract_primary_language(
            f"{j.get('job_title', '')} {j.get('description', '')}"
        )
        scored.append(j_copy)

    scored.sort(key=lambda x: x["match_score"], reverse=True)
    
    if not diversity or len(scored) <= top_k:
        # Return top_k by score
        for job in scored[:top_k]:
            job.pop("_language", None)
        return scored[:top_k]
    
    # Aggressive diversity mode: distribute results across different languages
    # Group jobs by language and interleave them to ensure variety
    language_groups = {}
    for job in scored:
        lang = job.get("_language") or "other"
        if lang not in language_groups:
            language_groups[lang] = []
        language_groups[lang].append(job)
    
    # Sort groups by size (biggest first) to ensure all languages represented
    sorted_langs = sorted(language_groups.items(), key=lambda x: len(x[1]), reverse=True)
    
    # Interleave jobs from different language groups
    result = []
    indices = {lang: 0 for lang, _ in sorted_langs}
    
    # First pass: take one from each language round-robin style
    round_num = 0
    while len(result) < top_k:
        added_in_round = False
        for lang, jobs_in_lang in sorted_langs:
            if len(result) >= top_k:
                break
            
            idx = indices[lang]
            if idx < len(jobs_in_lang):
                # Take from this language's jobs
                job = jobs_in_lang[idx]
                result.append(job)
                indices[lang] += 1
                added_in_round = True
        
        round_num += 1
        # After 3 rounds, if we still need more, just take remaining jobs
        if round_num >= 3 and not added_in_round:
            for lang, jobs_in_lang in sorted_langs:
                for idx in range(indices[lang], len(jobs_in_lang)):
                    if len(result) >= top_k:
                        break
                    result.append(jobs_in_lang[idx])
            break
    
    # Remove the helper field before returning
    for job in result:
        job.pop("_language", None)
    
    return result[:top_k]
