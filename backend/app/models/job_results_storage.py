from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class CandidateResultResponse(BaseModel):
    id: str
    candidate_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    qualification_score: Optional[float] = None
    is_qualified: bool
    rejection_reasons: Optional[List[str]] = []
    key_strengths: Optional[List[str]] = []
    experience_summary: Optional[str] = None
    skills_summary: Optional[str] = None
    education_summary: Optional[str] = None
    interview_questions: Optional[List[str]] = []
    analysis_timestamp: Optional[str] = None

class SavedSessionSummary(BaseModel):
    id: str
    job_title: str
    created_at: str
    total_candidates: int
    qualified_candidates: int
    status: str

class SessionDetailsResponse(BaseModel):
    id: str
    job_title: str
    job_description: str
    elimination_conditions: Optional[str] = None
    qualification_threshold: float
    created_at: str
    total_candidates: int
    qualified_candidates: int
    status: str
    candidates: List[CandidateResultResponse]

class SaveSessionRequest(BaseModel):
    job_title: str
    job_description: str
    elimination_conditions: Optional[str] = ""
    qualification_threshold: float = 0.85
    candidates: List[dict]  # Analysis results