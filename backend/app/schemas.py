from pydantic import BaseModel
from typing import List, Optional

class JobDescriptionRequest(BaseModel):
    job_title: str
    years_experience: int
    must_have_skills: str
    company_name: str
    employment_type: str
    industry: str
    location: str

from enum import Enum

class EmailType(str, Enum):
    ACCEPTANCE = "acceptance"
    REJECTION = "rejection"

class ResumeAnalysisResult(BaseModel):
    filename: str
    score: float
    missing_skills: List[str]
    remarks: str
    email: Optional[str] = None
    email_type: Optional[EmailType] = None
    email_error: Optional[str] = None
    is_best_match: bool = False

class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None
    error: Optional[str] = None
