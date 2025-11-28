from pydantic import BaseModel
from typing import List, Optional


class ResumeSkills(BaseModel):
    technical: List[str] = []
    soft: List[str] = []
    certifications: List[str] = []


class Resume(BaseModel):
    resume_id: Optional[str] = None
    filename: Optional[str] = None
    status: Optional[str] = None
    content: Optional[str] = None
    skills_extracted: Optional[ResumeSkills] = None
