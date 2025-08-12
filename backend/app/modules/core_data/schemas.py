# backend/app/modules/core_data/schemas.py
"""
Pydantic schemas for Core Data API requests/responses
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict
import uuid

from .models import JobStatus, ApplicationStatus, PriorityLevel


# Base schemas
class BaseSchema(BaseModel):
    """Base schema with common configuration"""
    model_config = ConfigDict(from_attributes=True)


class TimestampMixin(BaseModel):
    """Mixin for timestamp fields"""
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


# Job Schemas
class JobBase(BaseSchema):
    """Base job fields"""
    title: str = Field(..., min_length=1, max_length=200)
    # Allow shorter descriptions to prevent 422 on small inputs
    description: str = Field(..., min_length=1)
    location: str = Field(..., max_length=100)
    department: Optional[str] = Field(None, max_length=100)
    job_number: str = Field(..., max_length=50)
    status: JobStatus = JobStatus.DRAFT
    priority: PriorityLevel = PriorityLevel.MEDIUM
    
    # Job details
    salary_min: Optional[int] = Field(None, ge=0)
    salary_max: Optional[int] = Field(None, ge=0)
    employment_type: Optional[str] = Field("full-time", max_length=50)
    remote_allowed: bool = False
    experience_required: Optional[str] = Field(None, max_length=100)
    
    # Skills
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    tags: List[str] = []


class JobCreate(JobBase):
    """Schema for creating a job"""
    pass


class JobUpdate(BaseSchema):
    """Schema for updating a job"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=10)
    location: Optional[str] = Field(None, max_length=100)
    department: Optional[str] = Field(None, max_length=100)
    status: Optional[JobStatus] = None
    priority: Optional[PriorityLevel] = None
    salary_min: Optional[int] = Field(None, ge=0)
    salary_max: Optional[int] = Field(None, ge=0)
    employment_type: Optional[str] = Field(None, max_length=50)
    remote_allowed: Optional[bool] = None
    experience_required: Optional[str] = Field(None, max_length=100)
    required_skills: Optional[List[str]] = None
    preferred_skills: Optional[List[str]] = None
    tags: Optional[List[str]] = None


class JobRead(JobBase, TimestampMixin):
    """Schema for reading a job"""
    id: uuid.UUID
    external_id: Optional[str] = None


class JobListResponse(BaseSchema):
    """Schema for job list response"""
    jobs: List[JobRead]
    total: int
    page: int
    per_page: int


# Candidate Schemas
class CandidateBase(BaseSchema):
    """Base candidate fields"""
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr = Field(..., max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    
    # Professional info
    current_title: Optional[str] = Field(None, max_length=200)
    current_company: Optional[str] = Field(None, max_length=200)
    location: Optional[str] = Field(None, max_length=100)
    linkedin_url: Optional[str] = Field(None, max_length=500)
    portfolio_url: Optional[str] = Field(None, max_length=500)
    
    # Experience
    years_experience: Optional[int] = Field(None, ge=0, le=50)
    skills: List[str] = []
    
    # Additional contacts
    emails: List[str] = []
    phones: List[str] = []
    
    # Metadata
    source: Optional[str] = Field("manual", max_length=100)
    tags: List[str] = []
    notes: Optional[str] = None


class CandidateCreate(CandidateBase):
    """Schema for creating a candidate"""
    pass


class CandidateUpdate(BaseSchema):
    """Schema for updating a candidate"""
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    current_title: Optional[str] = Field(None, max_length=200)
    current_company: Optional[str] = Field(None, max_length=200)
    location: Optional[str] = Field(None, max_length=100)
    linkedin_url: Optional[str] = Field(None, max_length=500)
    portfolio_url: Optional[str] = Field(None, max_length=500)
    years_experience: Optional[int] = Field(None, ge=0, le=50)
    skills: Optional[List[str]] = None
    emails: Optional[List[str]] = None
    phones: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    notes: Optional[str] = None


class CandidateRead(CandidateBase, TimestampMixin):
    """Schema for reading a candidate"""
    id: uuid.UUID
    external_id: Optional[str] = None


class CandidateListResponse(BaseSchema):
    """Schema for candidate list response"""
    candidates: List[CandidateRead]
    total: int
    page: int
    per_page: int


# Application Schemas
class ApplicationBase(BaseSchema):
    """Base application fields"""
    job_id: uuid.UUID
    candidate_id: uuid.UUID
    status: ApplicationStatus = ApplicationStatus.APPLIED
    source: Optional[str] = Field("manual", max_length=100)
    cover_letter: Optional[str] = None
    application_answers: Optional[dict] = None
    notes: Optional[str] = None


class ApplicationCreate(ApplicationBase):
    """Schema for creating an application"""
    pass


class ApplicationUpdate(BaseSchema):
    """Schema for updating an application"""
    status: Optional[ApplicationStatus] = None
    source: Optional[str] = Field(None, max_length=100)
    cover_letter: Optional[str] = None
    application_answers: Optional[dict] = None
    notes: Optional[str] = None
    resume_score: Optional[float] = Field(None, ge=0, le=100)
    interview_score: Optional[float] = Field(None, ge=0, le=100)
    overall_score: Optional[float] = Field(None, ge=0, le=100)


class ApplicationRead(ApplicationBase, TimestampMixin):
    """Schema for reading an application"""
    id: uuid.UUID
    applied_at: datetime
    stage_changed_at: Optional[datetime] = None
    resume_score: Optional[float] = None
    interview_score: Optional[float] = None
    overall_score: Optional[float] = None
    external_id: Optional[str] = None


class ApplicationWithDetails(ApplicationRead):
    """Application with job and candidate details"""
    job: JobRead
    candidate: CandidateRead


class ApplicationListResponse(BaseSchema):
    """Schema for application list response"""
    applications: List[ApplicationWithDetails]
    total: int
    page: int
    per_page: int


# Interview Schemas
class InterviewBase(BaseSchema):
    """Base interview fields"""
    application_id: uuid.UUID
    title: str = Field(..., max_length=200)
    interview_type: str = Field(..., max_length=50)
    scheduled_at: datetime
    duration_minutes: int = Field(60, ge=15, le=480)
    location: Optional[str] = Field(None, max_length=200)
    interviewer_emails: List[str] = []
    meeting_link: Optional[str] = Field(None, max_length=500)


class InterviewCreate(InterviewBase):
    """Schema for creating an interview"""
    pass


class InterviewUpdate(BaseSchema):
    """Schema for updating an interview"""
    title: Optional[str] = Field(None, max_length=200)
    interview_type: Optional[str] = Field(None, max_length=50)
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(None, ge=15, le=480)
    location: Optional[str] = Field(None, max_length=200)
    interviewer_emails: Optional[List[str]] = None
    meeting_link: Optional[str] = Field(None, max_length=500)
    status: Optional[str] = Field(None, max_length=50)
    feedback: Optional[str] = None
    score: Optional[float] = Field(None, ge=0, le=100)


class InterviewRead(InterviewBase, TimestampMixin):
    """Schema for reading an interview"""
    id: uuid.UUID
    status: str
    feedback: Optional[str] = None
    score: Optional[float] = None
    calendar_event_id: Optional[str] = None


# Attachment Schemas
class AttachmentBase(BaseSchema):
    """Base attachment fields"""
    filename: str = Field(..., max_length=255)
    original_filename: str = Field(..., max_length=255)
    content_type: str = Field(..., max_length=100)
    entity_type: str = Field(..., max_length=50)
    entity_id: uuid.UUID


class AttachmentCreate(AttachmentBase):
    """Schema for creating an attachment"""
    file_path: str = Field(..., max_length=500)
    file_size: int = Field(..., ge=0)


class AttachmentUpdate(BaseSchema):
    """Schema for updating an attachment"""
    extracted_text: Optional[str] = None
    processing_status: Optional[str] = Field(None, max_length=50)


class AttachmentRead(AttachmentBase, TimestampMixin):
    """Schema for reading an attachment"""
    id: uuid.UUID
    file_path: str
    file_size: int
    extracted_text: Optional[str] = None
    processing_status: str


# Audit Log Schemas
class AuditLogRead(BaseSchema, TimestampMixin):
    """Schema for reading audit logs"""
    id: uuid.UUID
    entity_type: str
    entity_id: uuid.UUID
    action: str
    changes: Optional[dict] = None
    old_values: Optional[dict] = None
    new_values: Optional[dict] = None
    user_id: Optional[uuid.UUID] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


# Search and Filter Schemas
class JobFilters(BaseSchema):
    """Filters for job search"""
    status: Optional[List[JobStatus]] = None
    department: Optional[str] = None
    location: Optional[str] = None
    priority: Optional[List[PriorityLevel]] = None
    remote_allowed: Optional[bool] = None
    skills: Optional[List[str]] = None
    q: Optional[str] = None  # Full-text search


class CandidateFilters(BaseSchema):
    """Filters for candidate search"""
    location: Optional[str] = None
    skills: Optional[List[str]] = None
    years_experience_min: Optional[int] = Field(None, ge=0)
    years_experience_max: Optional[int] = Field(None, le=50)
    source: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    q: Optional[str] = None  # Full-text search


class ApplicationFilters(BaseSchema):
    """Filters for application search"""
    job_id: Optional[uuid.UUID] = None
    candidate_id: Optional[uuid.UUID] = None
    status: Optional[List[ApplicationStatus]] = None
    source: Optional[List[str]] = None
    applied_after: Optional[datetime] = None
    applied_before: Optional[datetime] = None
    score_min: Optional[float] = Field(None, ge=0, le=100)


# Bulk Operations
class BulkJobUpdate(BaseSchema):
    """Schema for bulk job updates"""
    job_ids: List[uuid.UUID] = Field(..., min_items=1)
    updates: JobUpdate


class BulkApplicationStatusUpdate(BaseSchema):
    """Schema for bulk application status updates"""
    application_ids: List[uuid.UUID] = Field(..., min_items=1)
    status: ApplicationStatus
    notes: Optional[str] = None


# Statistics and Analytics
class JobStats(BaseSchema):
    """Job statistics"""
    total_jobs: int
    active_jobs: int
    draft_jobs: int
    closed_jobs: int
    applications_per_job: float
    avg_time_to_fill: Optional[float] = None  # days


class CandidateStats(BaseSchema):
    """Candidate statistics"""
    total_candidates: int
    candidates_this_month: int
    top_skills: List[dict]  # {"skill": str, "count": int}
    sources: List[dict]  # {"source": str, "count": int}


class ApplicationStats(BaseSchema):
    """Application statistics"""
    total_applications: int
    applications_this_month: int
    conversion_rates: dict  # {"status": str, "rate": float}
    avg_process_time: Optional[float] = None  # days