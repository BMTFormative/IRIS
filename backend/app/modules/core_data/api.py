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

import json
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
    
    jobs_raw, total = job_crud.search(db=db, filters=filters, skip=skip, limit=limit)
    # Parse JSON string fields into lists
    jobs_list = []
    for job in jobs_raw:
        data = job.model_dump()  # from_attributes=True allows attribute access
        data['required_skills'] = json.loads(data.get('required_skills') or '[]')
        data['preferred_skills'] = json.loads(data.get('preferred_skills') or '[]')
        data['tags'] = json.loads(data.get('tags') or '[]')
        jobs_list.append(data)
    return JobListResponse(
        jobs=jobs_list,
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
    jobs_raw = job_crud.get_published_jobs(db=db, skip=skip, limit=limit)
    # Parse JSON string fields into lists
    parsed = []
    for job in jobs_raw:
        data = job.model_dump()
        data['required_skills'] = json.loads(data.get('required_skills') or '[]')
        data['preferred_skills'] = json.loads(data.get('preferred_skills') or '[]')
        data['tags'] = json.loads(data.get('tags') or '[]')
        parsed.append(data)
    return parsed


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
    data = job.model_dump()
    data['required_skills'] = json.loads(data.get('required_skills') or '[]')
    data['preferred_skills'] = json.loads(data.get('preferred_skills') or '[]')
    data['tags'] = json.loads(data.get('tags') or '[]')
    return data


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
    
    # Serialize list fields to JSON strings for storage
    job_data = job_in.model_dump()
    import json
    job_data['required_skills'] = json.dumps(job_data.get('required_skills', []))
    job_data['preferred_skills'] = json.dumps(job_data.get('preferred_skills', []))
    job_data['tags'] = json.dumps(job_data.get('tags', []))
    job = job_crud.create(db=db, obj_in=job_data)
    
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

@router.put("/jobs/{job_id}", response_model=JobRead)
def update_job(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    job_id: uuid.UUID,
    job_in: JobUpdate,
    request: Request
) -> JobRead:
    """Update existing job"""
    job = job_crud.get(db=db, id=job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    # Serialize list fields if provided
    update_data = job_in.model_dump(exclude_unset=True)
    import json
    if 'required_skills' in update_data:
        update_data['required_skills'] = json.dumps(update_data.get('required_skills', []))
    if 'preferred_skills' in update_data:
        update_data['preferred_skills'] = json.dumps(update_data.get('preferred_skills', []))
    if 'tags' in update_data:
        update_data['tags'] = json.dumps(update_data.get('tags', []))
    updated = job_crud.update(db=db, db_obj=job, obj_in=update_data)
    create_audit_log(
        db=db,
        entity_type="job",
        entity_id=updated.id,
        action="update",
        old_values={},
        new_values=update_data,
        user=current_user,
        request=request,
    )
    return updated

@router.delete("/jobs/{job_id}")
def delete_job(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    job_id: uuid.UUID,
    request: Request
) -> None:
    """Delete a job"""
    job = job_crud.remove(db=db, id=job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    create_audit_log(
        db=db,
        entity_type="job",
        entity_id=job_id,
        action="delete",
        user=current_user,
        request=request,
    )
    return None


## Candidate Endpoints
@router.get("/candidates", response_model=CandidateListResponse)
def get_candidates(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    location: Optional[str] = Query(None),
    skills: Optional[List[str]] = Query(None),
    source: Optional[List[str]] = Query(None),
    q: Optional[str] = Query(None)
) -> CandidateListResponse:
    """Get candidates with optional filters"""
    filters = CandidateFilters(
        location=location,
        skills=skills,
        source=source,
        q=q,
    )
    cands_raw, total = candidate_crud.search(db=db, filters=filters, skip=skip, limit=limit)
    # Parse JSON string fields into lists
    cands_list = []
    for cand in cands_raw:
        data = cand.model_dump()
        data['skills'] = json.loads(data.get('skills') or '[]')
        data['emails'] = json.loads(data.get('emails') or '[]')
        data['phones'] = json.loads(data.get('phones') or '[]')
        data['tags'] = json.loads(data.get('tags') or '[]')
        cands_list.append(data)
    return CandidateListResponse(
        candidates=cands_list,
        total=total,
        page=skip // limit + 1,
        per_page=limit,
    )

@router.get("/candidates/{candidate_id}", response_model=CandidateRead)
def get_candidate(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    candidate_id: uuid.UUID
) -> CandidateRead:
    """Get candidate by ID"""
    candidate = candidate_crud.get(db=db, id=candidate_id)
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")
    data = candidate.model_dump()
    data['skills'] = json.loads(data.get('skills') or '[]')
    data['emails'] = json.loads(data.get('emails') or '[]')
    data['phones'] = json.loads(data.get('phones') or '[]')
    data['tags'] = json.loads(data.get('tags') or '[]')
    return data

@router.post("/candidates", response_model=CandidateRead)
def create_candidate(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    cand_in: CandidateCreate,
    request: Request
) -> CandidateRead:
    """Create new candidate"""
    existing = candidate_crud.get_by_email(db=db, email=cand_in.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Candidate email already exists")
    # Serialize list fields to JSON strings
    cand_data = cand_in.model_dump()
    import json
    cand_data['skills'] = json.dumps(cand_data.get('skills', []))
    cand_data['emails'] = json.dumps(cand_data.get('emails', []))
    cand_data['phones'] = json.dumps(cand_data.get('phones', []))
    cand_data['tags'] = json.dumps(cand_data.get('tags', []))
    candidate = candidate_crud.create(db=db, obj_in=cand_data)
    create_audit_log(
        db=db,
        entity_type="candidate",
        entity_id=candidate.id,
        action="create",
        new_values=cand_in.model_dump(),
        user=current_user,
        request=request,
    )
    return candidate

@router.put("/candidates/{candidate_id}", response_model=CandidateRead)
def update_candidate(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    candidate_id: uuid.UUID,
    cand_in: CandidateUpdate,
    request: Request
) -> CandidateRead:
    """Update existing candidate"""
    candidate = candidate_crud.get(db=db, id=candidate_id)
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")
    # Serialize list fields if provided
    update_data = cand_in.model_dump(exclude_unset=True)
    import json
    if 'skills' in update_data:
        update_data['skills'] = json.dumps(update_data.get('skills', []))
    if 'emails' in update_data:
        update_data['emails'] = json.dumps(update_data.get('emails', []))
    if 'phones' in update_data:
        update_data['phones'] = json.dumps(update_data.get('phones', []))
    if 'tags' in update_data:
        update_data['tags'] = json.dumps(update_data.get('tags', []))
    updated = candidate_crud.update(db=db, db_obj=candidate, obj_in=update_data)
    create_audit_log(
        db=db,
        entity_type="candidate",
        entity_id=updated.id,
        action="update",
        old_values={},
        new_values=cand_in.model_dump(exclude_unset=True),
        user=current_user,
        request=request,
    )
    return updated

@router.delete("/candidates/{candidate_id}")
def delete_candidate(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    candidate_id: uuid.UUID,
    request: Request
) -> None:
    """Delete a candidate"""
    candidate = candidate_crud.remove(db=db, id=candidate_id)
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")
    create_audit_log(
        db=db,
        entity_type="candidate",
        entity_id=candidate_id,
        action="delete",
        user=current_user,
        request=request,
    )
    return None
    
# Additional endpoints would follow the same pattern...
# For brevity, I'm just showing the key endpoints with fixed imports