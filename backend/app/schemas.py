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

class FeedbackType(str, Enum):
    FEATURE_LIKED = "feature_liked"
    NOT_WORKING = "not_working"
    IMPROVEMENT = "improvement"
    BUG_REPORT = "bug_report"
    OTHER = "other"

class FeedbackSubmission(BaseModel):
    feedback_type: FeedbackType
    message: str
    page: Optional[str] = None
    feature_name: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: str
    feedback_type: str
    message: str
    page: Optional[str]
    feature_name: Optional[str]
    timestamp: str

class FeedbackListResponse(BaseModel):
    success: bool
    feedbacks: List[FeedbackResponse]
    total_count: int
