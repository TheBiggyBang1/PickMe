from fastapi import APIRouter, UploadFile, File, HTTPException
from datetime import datetime
from models.schemas.resume_schema import Resume, ResumeSkills
from ..config.database import get_resumes_collection
from ..services.text_processor import extract_text
from ..services.skill_extractor import extract_skills
from ..services.embedding_engine import embed_text

router = APIRouter(prefix="/resume", tags=["resume"])


@router.post("/upload-resume", response_model=Resume)
async def upload_resume(file: UploadFile = File(...)):
    allowed = {"application/pdf", "text/plain", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    filename, text = await extract_text(file)
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
