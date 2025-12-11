from fastapi import APIRouter, UploadFile, File, HTTPException
from datetime import datetime
import re
from models.schemas.resume_schema import Resume, ResumeSkills
from ..config.database import get_resumes_collection
from ..services.text_processor import extract_text
from ..services.skill_extractor import extract_skills
from ..services.embedding_engine import embed_text

router = APIRouter(prefix="/resume", tags=["resume"])


def _validate_resume_content(text: str) -> None:
    """Validate that the uploaded file looks like a resume."""
    if not text or len(text.strip()) < 100:
        raise HTTPException(
            status_code=400, 
            detail="Invalid resume: File is empty or too short"
        )
    
    text_lower = text.lower()
    
    # Strong resume indicators (primary check)
    resume_indicators = [
        r'\bresume\b',
        r'\bcv\b',
        r'\bcurriculum\s+vitae\b',
        r'\bexperience\b',
        r'\beducation\b',
        r'\bskills\b',
        r'\bemployment\b',
        r'\bwork\s+history\b',
        r'\bprofessional\s+summary\b',
        r'\bobjective\b',
    ]
    
    # Check for strong indicators
    strong_match = sum(1 for pattern in resume_indicators if re.search(pattern, text_lower))
    
    # Check for non-resume content patterns
    non_resume_patterns = [
        r'^(lorem ipsum|the quick brown fox|hello world|test content)',
        r'^(this is a test|dummy text|placeholder)',
        r'(^|\n)\s*[a-z0-9]{50,}$',  # Long gibberish lines
        r'(copyright|all rights reserved|disclaimer|terms of service)',  # Legal boilerplate
    ]
    
    has_non_resume = any(re.search(pattern, text_lower, re.MULTILINE) for pattern in non_resume_patterns)
    
    # Need at least 2 strong indicators to be a resume
    if strong_match < 2:
        raise HTTPException(
            status_code=400,
            detail="Invalid resume: File does not appear to be a resume. Please upload a valid resume (CV) document."
        )
    
    if has_non_resume:
        raise HTTPException(
            status_code=400,
            detail="Invalid resume: File content does not appear to be a resume. Please upload a valid resume (CV) document."
        )


@router.post("/upload-resume", response_model=Resume)
async def upload_resume(file: UploadFile = File(...)):
    allowed = {"application/pdf", "text/plain", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Unsupported file type. Please upload PDF, DOCX, or TXT file.")

    filename, text = await extract_text(file)
    
    # Validate that this is actually a resume
    _validate_resume_content(text)
    
    skills = extract_skills(text)
    coll = get_resumes_collection()
    doc = {
        "filename": filename,
        "status": "processed",
        "content": text,
        "skills_extracted": skills,
        "created_at": datetime.utcnow().isoformat(),
    }
    res = coll.insert_one(doc)
    resume_id = str(res.inserted_id)
    coll.update_one({"_id": res.inserted_id}, {"$set": {"resume_id": resume_id}})
    doc["resume_id"] = resume_id
    # Generate embedding for the uploaded resume (best-effort). Store embedding if available.
    try:
        emb = embed_text(text)
        if emb:
            coll.update_one({"_id": res.inserted_id}, {"$set": {"embedding": emb}})
            doc["embedding"] = emb
    except Exception:
        # Do not fail the upload if embedding generation fails; it will be retried later.
        pass
    return Resume(**doc)
