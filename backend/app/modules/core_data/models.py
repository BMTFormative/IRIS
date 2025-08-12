# backend/app/modules/core_data/models.py
"""
Core ATS entities using the same pattern as User and Item models
"""
from datetime import datetime
from enum import Enum
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
import uuid


class JobStatus(str, Enum):
    """Job posting status"""
    DRAFT = "draft"
    PUBLISHED = "published"
    CLOSED = "closed"
    ARCHIVED = "archived"


class ApplicationStatus(str, Enum):
    """Application pipeline status"""
    APPLIED = "applied"
    SCREENING = "screening"
    INTERVIEW = "interview"
    OFFER = "offer"
    HIRED = "hired"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class PriorityLevel(str, Enum):
    """Priority levels for jobs and tasks"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


# Job Entity
class Job(SQLModel, table=True):
    """Job posting entity"""
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str = Field(max_length=200, index=True)
    description: str
    location: str = Field(max_length=100)
    department: str | None = Field(default=None, max_length=100)
    job_number: str = Field(unique=True, index=True, max_length=50)
    status: JobStatus = Field(default=JobStatus.DRAFT, index=True)
    priority: PriorityLevel = Field(default=PriorityLevel.MEDIUM)
    
    # Job details
    salary_min: int | None = None
    salary_max: int | None = None
    employment_type: str = Field(default="full-time", max_length=50)
    remote_allowed: bool = Field(default=False)
    experience_required: str | None = Field(default=None, max_length=100)
    
    # Simple string fields for now (can upgrade to arrays later)
    required_skills: str | None = None  # JSON string
    preferred_skills: str | None = None  # JSON string
    tags: str | None = None  # JSON string
    
    # Metadata
    external_id: str | None = Field(default=None, max_length=100)
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: datetime | None = None
    
    # Relationships
    applications: List["Application"] = Relationship(back_populates="job")


# Candidate Entity  
class Candidate(SQLModel, table=True):
    """Candidate profile entity"""
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    first_name: str = Field(max_length=100, index=True)
    last_name: str = Field(max_length=100, index=True)
    email: str = Field(unique=True, index=True, max_length=255)
    phone: str | None = Field(default=None, max_length=20)
    
    # Professional info
    current_title: str | None = Field(default=None, max_length=200)
    current_company: str | None = Field(default=None, max_length=200)
    location: str | None = Field(default=None, max_length=100)
    linkedin_url: str | None = Field(default=None, max_length=500)
    portfolio_url: str | None = Field(default=None, max_length=500)
    
    # Experience and skills
    years_experience: int | None = None
    skills: str | None = None  # JSON string
    
    # Contact preferences  
    emails: str | None = None  # JSON string
    phones: str | None = None  # JSON string
    
    # Metadata
    source: str = Field(default="manual", max_length=100)
    tags: str | None = None  # JSON string
    notes: str | None = None
    external_id: str | None = Field(default=None, max_length=100)
    
    # Search optimization
    search_vector: str | None = None
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: datetime | None = None
    
    # Relationships
    applications: List["Application"] = Relationship(back_populates="candidate")


# Application Entity
class Application(SQLModel, table=True):
    """Job application entity"""
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    job_id: uuid.UUID = Field(foreign_key="job.id", index=True)
    candidate_id: uuid.UUID = Field(foreign_key="candidate.id", index=True)
    
    status: ApplicationStatus = Field(default=ApplicationStatus.APPLIED, index=True)
    source: str = Field(default="manual", max_length=100)
    
    # Application timeline
    applied_at: datetime = Field(default_factory=datetime.utcnow)
    stage_changed_at: datetime | None = None
    
    # Scoring and evaluation
    resume_score: float | None = None
    interview_score: float | None = None
    overall_score: float | None = None
    
    # Application data
    cover_letter: str | None = None
    application_answers: str | None = None  # JSON string
    
    # Metadata
    external_id: str | None = Field(default=None, max_length=100)
    notes: str | None = None
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: datetime | None = None
    
    # Relationships
    job: Job = Relationship(back_populates="applications")
    candidate: Candidate = Relationship(back_populates="applications")


# Interview Entity
class Interview(SQLModel, table=True):
    """Interview scheduling entity"""
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    application_id: uuid.UUID = Field(foreign_key="application.id", index=True)
    
    # Interview details
    title: str = Field(max_length=200)
    interview_type: str = Field(max_length=50)
    scheduled_at: datetime
    duration_minutes: int = Field(default=60)
    location: str | None = Field(default=None, max_length=200)
    
    # Participants
    interviewer_emails: str | None = None  # JSON string
    
    # Status and results
    status: str = Field(default="scheduled", max_length=50)
    feedback: str | None = None
    score: float | None = None
    
    # Calendar integration
    calendar_event_id: str | None = Field(default=None, max_length=200)
    meeting_link: str | None = Field(default=None, max_length=500)
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: datetime | None = None


# Attachment Entity
class Attachment(SQLModel, table=True):
    """File attachment entity"""
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    filename: str = Field(max_length=255)
    original_filename: str = Field(max_length=255)
    file_path: str = Field(max_length=500)
    content_type: str = Field(max_length=100)
    file_size: int
    
    # Link to entities
    entity_type: str = Field(max_length=50)  # "candidate", "application", "job"
    entity_id: uuid.UUID = Field(index=True)
    
    # File processing
    extracted_text: str | None = None
    processing_status: str = Field(default="pending", max_length=50)
    
    # Optional foreign keys
    candidate_id: uuid.UUID | None = Field(default=None, foreign_key="candidate.id")
    application_id: uuid.UUID | None = Field(default=None, foreign_key="application.id")
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: datetime | None = None


# Audit Log Entity
class AuditLog(SQLModel, table=True):
    """Audit trail for all entity changes"""
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    entity_type: str = Field(max_length=50, index=True)
    entity_id: uuid.UUID = Field(index=True)
    action: str = Field(max_length=50)  # "create", "update", "delete"
    
    # Change tracking as JSON strings
    changes: str | None = None
    old_values: str | None = None
    new_values: str | None = None
    
    # Audit metadata
    user_id: uuid.UUID | None = Field(default=None, foreign_key="user.id")
    ip_address: str | None = Field(default=None, max_length=45)
    user_agent: str | None = Field(default=None, max_length=500)
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: datetime | None = None


# Integration Metadata Entity
class IntegrationMetadata(SQLModel, table=True):
    """Metadata for external system integrations"""
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    
    # Entity reference
    entity_type: str = Field(max_length=50, index=True)
    entity_id: uuid.UUID = Field(index=True)
    
    # Integration details
    integration_name: str = Field(max_length=100, index=True)  # "greenhouse", "lever", "workday"
    external_id: str = Field(max_length=200, index=True)
    external_url: str | None = Field(default=None, max_length=500)
    
    # Sync information
    last_synced_at: datetime | None = None
    sync_status: str = Field(default="pending", max_length=50)
    sync_error: str | None = None
    
    # Data mapping as JSON strings
    field_mappings: str | None = None
    extra_data: str | None = None  # Renamed from 'metadata' to avoid conflict
    
    # Audit fields
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: datetime | None = None