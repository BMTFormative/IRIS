# backend/app/models/job_matching.py
from typing import List, Optional, Any, Dict
from pydantic import BaseModel
from datetime import datetime

class CVFile(BaseModel):
    id: str
    name: str
    size: int
    content: str
    type: str
    status: str

class JobPosition(BaseModel):
    job_title: str
    job_description: str
    mandatory_conditions: Optional[str] = None
    qualification_threshold: float = 85.0

class CandidateAnalysis(BaseModel):
    id: str
    name: str
    overall_score: float
    qualified: bool
    strengths: List[str]
    weaknesses: List[str]
    match_summary: str

class AnalysisSummary(BaseModel):
    qualified_count: int
    top_candidates: List[str]
    recommendations: str

class JobMatchingAnalysis(BaseModel):
    total_candidates: int
    qualification_threshold: float
    screening_date: str
    error: Optional[str] = None

class JobMatchingResult(BaseModel):
    success: bool
    analysis: Dict[str, Any]
    timestamp: str

class UploadResponse(BaseModel):
    success: bool
    uploaded_files: int
    files: List[CVFile]
    message: str