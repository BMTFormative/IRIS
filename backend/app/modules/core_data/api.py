# backend/app/modules/core_data/api.py
"""
API endpoints for Core Data module - Fixed imports for FastAPI template
"""
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, Request
from sqlmodel import Session
import uuid

# Fix the imports to match your FastAPI template
from app.api.deps import get_current_active_superuser, get_current_user, get_db  # Changed from get_session to get_db
from app.models import User

from .schemas import (
    # Job schemas
    JobCreate, JobUpdate, JobRead, JobListResponse, JobFilters, JobStats,
    # Candidate schemas  
    CandidateCreate, CandidateUpdate, CandidateRead, CandidateListResponse, CandidateFilters, CandidateStats,
    # Application schemas
    ApplicationCreate, ApplicationUpdate, ApplicationRead, ApplicationWithDetails, 
    ApplicationListResponse, ApplicationFilters, ApplicationStats,
    # Interview schemas
    InterviewCreate, InterviewUpdate, InterviewRead,
    # Attachment schemas
    AttachmentRead,
    # Audit schemas
    AuditLogRead,
    # Bulk operations
    BulkJobUpdate, BulkApplicationStatusUpdate
)
from .crud import (
    job_crud, candidate_crud, application_crud, interview_crud, 
    attachment_crud, audit_log_crud
)
from .models import JobStatus, ApplicationStatus

router = APIRouter()


# Utility functions
def create_audit_log(
    db: Session,
    entity_type: str,
    entity_id: uuid.UUID,
    action: str,
    old_values: dict = None,
    new_values: dict = None,
    user: User = None,
    request: Request = None
):
    """Create audit log entry"""
    return audit_log_crud.create_audit_log(
        db=db,
        entity_type=entity_type,
        entity_id=entity_id,
        action=action,
        old_values=old_values,
        new_values=new_values,
        user_id=user.id if user else None,
        ip_address=request.client.host if request else None,
        user_agent=request.headers.get("user-agent") if request else None
    )


# Job Endpoints
@router.get("/jobs", response_model=JobListResponse)
def get_jobs(
    *,
    db: Session = Depends(get_db),  # Changed from get_session to get_db
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    # Filters
    status: Optional[List[JobStatus]] = Query(None),
    department: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    q: Optional[str] = Query(None)
) -> JobListResponse:
    """Get jobs with optional filters"""
    filters = JobFilters(
        status=status,
        department=department,
        location=location,
        q=q
    )
    
    jobs, total = job_crud.search(db=db, filters=filters, skip=skip, limit=limit)
    
    return JobListResponse(
        jobs=jobs,
        total=total,
        page=skip // limit + 1,
        per_page=limit
    )


@router.get("/jobs/published", response_model=List[JobRead])
def get_published_jobs(
    *,
    db: Session = Depends(get_db),  # Changed from get_session to get_db
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
) -> List[JobRead]:
    """Get published jobs for public job board"""
    return job_crud.get_published_jobs(db=db, skip=skip, limit=limit)


@router.get("/jobs/{job_id}", response_model=JobRead)
def get_job(
    *,
    db: Session = Depends(get_db),  # Changed from get_session to get_db
    current_user: User = Depends(get_current_user),
    job_id: uuid.UUID
) -> JobRead:
    """Get job by ID"""
    job = job_crud.get(db=db, id=job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    return job


@router.post("/jobs", response_model=JobRead)
def create_job(
    *,
    db: Session = Depends(get_db),  # Changed from get_session to get_db
    current_user: User = Depends(get_current_user),
    job_in: JobCreate,
    request: Request
) -> JobRead:
    """Create new job"""
    # Check if job number already exists
    existing_job = job_crud.get_by_job_number(db=db, job_number=job_in.job_number)
    if existing_job:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job number already exists"
        )
    
    job = job_crud.create(db=db, obj_in=job_in)
    
    # Create audit log
    create_audit_log(
        db=db,
        entity_type="job",
        entity_id=job.id,
        action="create",
        new_values=job_in.model_dump(),
        user=current_user,
        request=request
    )
    
    return job


# Additional endpoints would follow the same pattern...
# For brevity, I'm just showing the key endpoints with fixed imports