from pydantic import BaseModel
from typing import List, Optional

class JobDescription(BaseModel):
    title: str
    years_experience: int
    must_have_skills: List[str]
    company_name: str
    employment_type: str
    industry: str
    location: str
    description: Optional[str] = None

class ResumeAnalysis(BaseModel):
    filename: str
    score: float
    missing_skills: List[str]
    remarks: str
    email: Optional[str] = None
