# backend/app/modules/core_data/crud.py
"""
CRUD operations for Core Data entities
"""
from datetime import datetime
from typing import Optional, List, Any, Dict
from sqlmodel import Session, select, func, or_, and_
from sqlalchemy.orm import selectinload
import uuid

from .models import (
    Job, Candidate, Application, Interview, Attachment, 
    AuditLog, IntegrationMetadata, JobStatus, ApplicationStatus
)
from .schemas import (
    JobCreate, JobUpdate, JobFilters,
    CandidateCreate, CandidateUpdate, CandidateFilters,
    ApplicationCreate, ApplicationUpdate, ApplicationFilters,
    InterviewCreate, InterviewUpdate,
    AttachmentCreate, AttachmentUpdate
)


class BaseCRUD:
    """Base CRUD class with common operations"""
    
    def __init__(self, model):
        self.model = model
    
    def get(self, db: Session, id: uuid.UUID) -> Optional[Any]:
        """Get entity by ID"""
        return db.get(self.model, id)
    
    def get_multi(
        self, 
        db: Session, 
        *, 
        skip: int = 0, 
        limit: int = 100,
        include_deleted: bool = False
    ) -> List[Any]:
        """Get multiple entities with pagination"""
        query = select(self.model)
        if not include_deleted:
            query = query.where(self.model.deleted_at.is_(None))
        
        query = query.offset(skip).limit(limit)
        return db.exec(query).all()
    
    def create(self, db: Session, *, obj_in: Any) -> Any:
        """Create new entity"""
        if isinstance(obj_in, dict):
            db_obj = self.model(**obj_in)
        else:
            db_obj = self.model.model_validate(obj_in.model_dump())
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update(
        self, 
        db: Session, 
        *, 
        db_obj: Any, 
        obj_in: Any
    ) -> Any:
        """Update existing entity"""
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        db_obj.updated_at = datetime.utcnow()
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def remove(self, db: Session, *, id: uuid.UUID, soft_delete: bool = True) -> Any:
        """Remove entity (soft delete by default)"""
        obj = db.get(self.model, id)
        if obj:
            if soft_delete:
                obj.deleted_at = datetime.utcnow()
                db.add(obj)
            else:
                db.delete(obj)
            db.commit()
        return obj
    
    def count(self, db: Session, include_deleted: bool = False) -> int:
        """Count entities"""
        query = select(func.count(self.model.id))
        if not include_deleted:
            query = query.where(self.model.deleted_at.is_(None))
        return db.exec(query).one()


class JobCRUD(BaseCRUD):
    """CRUD operations for Job entity"""
    
    def __init__(self):
        super().__init__(Job)
    
    def get_by_job_number(self, db: Session, *, job_number: str) -> Optional[Job]:
        """Get job by job number"""
        return db.exec(
            select(Job).where(
                Job.job_number == job_number,
                Job.deleted_at.is_(None)
            )
        ).first()
    
    def get_with_applications(self, db: Session, *, id: uuid.UUID) -> Optional[Job]:
        """Get job with applications"""
        return db.exec(
            select(Job)
            .options(selectinload(Job.applications))
            .where(Job.id == id, Job.deleted_at.is_(None))
        ).first()
    
    def search(
        self, 
        db: Session, 
        *, 
        filters: JobFilters,
        skip: int = 0,
        limit: int = 100
    ) -> tuple[List[Job], int]:
        """Search jobs with filters"""
        query = select(Job).where(Job.deleted_at.is_(None))
        
        # Apply filters
        if filters.status:
            query = query.where(Job.status.in_(filters.status))
        
        if filters.department:
            query = query.where(Job.department.ilike(f"%{filters.department}%"))
        
        if filters.location:
            query = query.where(Job.location.ilike(f"%{filters.location}%"))
        
        if filters.priority:
            query = query.where(Job.priority.in_(filters.priority))
        
        if filters.remote_allowed is not None:
            query = query.where(Job.remote_allowed == filters.remote_allowed)
        
        if filters.skills:
            # PostgreSQL array overlap
            for skill in filters.skills:
                query = query.where(Job.required_skills.any(skill))
        
        if filters.q:
            # Full-text search
            search_term = f"%{filters.q}%"
            query = query.where(
                or_(
                    Job.title.ilike(search_term),
                    Job.description.ilike(search_term),
                    Job.location.ilike(search_term)
                )
            )
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total = db.exec(count_query).one()
        
        # Apply pagination and order
        query = query.order_by(Job.created_at.desc()).offset(skip).limit(limit)
        jobs = db.exec(query).all()
        
        return jobs, total
    
    def get_published_jobs(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[Job]:
        """Get published jobs for public job board"""
        return db.exec(
            select(Job)
            .where(
                Job.status == JobStatus.PUBLISHED,
                Job.deleted_at.is_(None)
            )
            .order_by(Job.created_at.desc())
            .offset(skip)
            .limit(limit)
        ).all()


class CandidateCRUD(BaseCRUD):
    """CRUD operations for Candidate entity"""
    
    def __init__(self):
        super().__init__(Candidate)
    
    def get_by_email(self, db: Session, *, email: str) -> Optional[Candidate]:
        """Get candidate by email"""
        return db.exec(
            select(Candidate).where(
                Candidate.email == email,
                Candidate.deleted_at.is_(None)
            )
        ).first()
    
    def get_with_applications(self, db: Session, *, id: uuid.UUID) -> Optional[Candidate]:
        """Get candidate with applications"""
        return db.exec(
            select(Candidate)
            .options(selectinload(Candidate.applications))
            .where(Candidate.id == id, Candidate.deleted_at.is_(None))
        ).first()
    
    def search(
        self, 
        db: Session, 
        *, 
        filters: CandidateFilters,
        skip: int = 0,
        limit: int = 100
    ) -> tuple[List[Candidate], int]:
        """Search candidates with filters"""
        query = select(Candidate).where(Candidate.deleted_at.is_(None))
        
        # Apply filters
        if filters.location:
            query = query.where(Candidate.location.ilike(f"%{filters.location}%"))
        
        if filters.skills:
            for skill in filters.skills:
                query = query.where(Candidate.skills.any(skill))
        
        if filters.years_experience_min is not None:
            query = query.where(Candidate.years_experience >= filters.years_experience_min)
        
        if filters.years_experience_max is not None:
            query = query.where(Candidate.years_experience <= filters.years_experience_max)
        
        if filters.source:
            query = query.where(Candidate.source.in_(filters.source))
        
        if filters.tags:
            for tag in filters.tags:
                query = query.where(Candidate.tags.any(tag))
        
        if filters.q:
            # Full-text search
            search_term = f"%{filters.q}%"
            query = query.where(
                or_(
                    Candidate.first_name.ilike(search_term),
                    Candidate.last_name.ilike(search_term),
                    Candidate.email.ilike(search_term),
                    Candidate.current_title.ilike(search_term),
                    Candidate.current_company.ilike(search_term)
                )
            )
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total = db.exec(count_query).one()
        
        # Apply pagination and order
        query = query.order_by(Candidate.created_at.desc()).offset(skip).limit(limit)
        candidates = db.exec(query).all()
        
        return candidates, total
    
    def find_duplicates(self, db: Session, *, email: str, phone: str = None) -> List[Candidate]:
        """Find potential duplicate candidates"""
        conditions = [Candidate.email == email]
        
        if phone:
            conditions.append(
                or_(
                    Candidate.phone == phone,
                    Candidate.phones.any(phone)
                )
            )
        
        return db.exec(
            select(Candidate).where(
                or_(*conditions),
                Candidate.deleted_at.is_(None)
            )
        ).all()


class ApplicationCRUD(BaseCRUD):
    """CRUD operations for Application entity"""
    
    def __init__(self):
        super().__init__(Application)
    
    def get_with_details(self, db: Session, *, id: uuid.UUID) -> Optional[Application]:
        """Get application with job and candidate details"""
        return db.exec(
            select(Application)
            .options(
                selectinload(Application.job),
                selectinload(Application.candidate),
                selectinload(Application.attachments),
                selectinload(Application.interviews)
            )
            .where(Application.id == id, Application.deleted_at.is_(None))
        ).first()
    
    def get_by_job_and_candidate(
        self, 
        db: Session, 
        *, 
        job_id: uuid.UUID, 
        candidate_id: uuid.UUID
    ) -> Optional[Application]:
        """Get application by job and candidate"""
        return db.exec(
            select(Application).where(
                Application.job_id == job_id,
                Application.candidate_id == candidate_id,
                Application.deleted_at.is_(None)
            )
        ).first()
    
    def search(
        self, 
        db: Session, 
        *, 
        filters: ApplicationFilters,
        skip: int = 0,
        limit: int = 100
    ) -> tuple[List[Application], int]:
        """Search applications with filters"""
        query = select(Application).where(Application.deleted_at.is_(None))
        
        # Apply filters
        if filters.job_id:
            query = query.where(Application.job_id == filters.job_id)
        
        if filters.candidate_id:
            query = query.where(Application.candidate_id == filters.candidate_id)
        
        if filters.status:
            query = query.where(Application.status.in_(filters.status))
        
        if filters.source:
            query = query.where(Application.source.in_(filters.source))
        
        if filters.applied_after:
            query = query.where(Application.applied_at >= filters.applied_after)
        
        if filters.applied_before:
            query = query.where(Application.applied_at <= filters.applied_before)
        
        if filters.score_min is not None:
            query = query.where(Application.overall_score >= filters.score_min)
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total = db.exec(count_query).one()
        
        # Apply pagination and order, load relationships
        query = (
            query
            .options(
                selectinload(Application.job),
                selectinload(Application.candidate)
            )
            .order_by(Application.applied_at.desc())
            .offset(skip)
            .limit(limit)
        )
        applications = db.exec(query).all()
        
        return applications, total
    
    def update_status(
        self, 
        db: Session, 
        *, 
        application_id: uuid.UUID, 
        status: ApplicationStatus,
        notes: str = None
    ) -> Optional[Application]:
        """Update application status"""
        application = db.get(Application, application_id)
        if application:
            application.status = status
            application.stage_changed_at = datetime.utcnow()
            application.updated_at = datetime.utcnow()
            if notes:
                application.notes = notes
            
            db.add(application)
            db.commit()
            db.refresh(application)
        
        return application
    
    def bulk_update_status(
        self, 
        db: Session, 
        *, 
        application_ids: List[uuid.UUID], 
        status: ApplicationStatus,
        notes: str = None
    ) -> int:
        """Bulk update application status"""
        applications = db.exec(
            select(Application).where(
                Application.id.in_(application_ids),
                Application.deleted_at.is_(None)
            )
        ).all()
        
        updated_count = 0
        for application in applications:
            application.status = status
            application.stage_changed_at = datetime.utcnow()
            application.updated_at = datetime.utcnow()
            if notes:
                application.notes = notes
            db.add(application)
            updated_count += 1
        
        db.commit()
        return updated_count


class InterviewCRUD(BaseCRUD):
    """CRUD operations for Interview entity"""
    
    def __init__(self):
        super().__init__(Interview)
    
    def get_by_application(self, db: Session, *, application_id: uuid.UUID) -> List[Interview]:
        """Get interviews for an application"""
        return db.exec(
            select(Interview).where(
                Interview.application_id == application_id,
                Interview.deleted_at.is_(None)
            ).order_by(Interview.scheduled_at)
        ).all()
    
    def get_upcoming_interviews(
        self, 
        db: Session, 
        *, 
        start_date: datetime = None,
        days_ahead: int = 7
    ) -> List[Interview]:
        """Get upcoming interviews"""
        if not start_date:
            start_date = datetime.utcnow()
        
        end_date = start_date.replace(
            day=start_date.day + days_ahead
        )
        
        return db.exec(
            select(Interview).where(
                Interview.scheduled_at >= start_date,
                Interview.scheduled_at <= end_date,
                Interview.status == "scheduled",
                Interview.deleted_at.is_(None)
            ).order_by(Interview.scheduled_at)
        ).all()


class AttachmentCRUD(BaseCRUD):
    """CRUD operations for Attachment entity"""
    
    def __init__(self):
        super().__init__(Attachment)
    
    def get_by_entity(
        self, 
        db: Session, 
        *, 
        entity_type: str, 
        entity_id: uuid.UUID
    ) -> List[Attachment]:
        """Get attachments for an entity"""
        return db.exec(
            select(Attachment).where(
                Attachment.entity_type == entity_type,
                Attachment.entity_id == entity_id,
                Attachment.deleted_at.is_(None)
            ).order_by(Attachment.created_at)
        ).all()
    
    def update_processing_status(
        self, 
        db: Session, 
        *, 
        attachment_id: uuid.UUID, 
        status: str,
        extracted_text: str = None
    ) -> Optional[Attachment]:
        """Update attachment processing status"""
        attachment = db.get(Attachment, attachment_id)
        if attachment:
            attachment.processing_status = status
            if extracted_text:
                attachment.extracted_text = extracted_text
            attachment.updated_at = datetime.utcnow()
            
            db.add(attachment)
            db.commit()
            db.refresh(attachment)
        
        return attachment


class AuditLogCRUD(BaseCRUD):
    """CRUD operations for AuditLog entity"""
    
    def __init__(self):
        super().__init__(AuditLog)
    
    def create_audit_log(
        self, 
        db: Session, 
        *, 
        entity_type: str,
        entity_id: uuid.UUID,
        action: str,
        changes: dict = None,
        old_values: dict = None,
        new_values: dict = None,
        user_id: uuid.UUID = None,
        ip_address: str = None,
        user_agent: str = None
    ) -> AuditLog:
        """Create audit log entry"""
        audit_log = AuditLog(
            entity_type=entity_type,
            entity_id=entity_id,
            action=action,
            changes=changes,
            old_values=old_values,
            new_values=new_values,
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        db.add(audit_log)
        db.commit()
        db.refresh(audit_log)
        return audit_log
    
    def get_entity_history(
        self, 
        db: Session, 
        *, 
        entity_type: str, 
        entity_id: uuid.UUID,
        limit: int = 50
    ) -> List[AuditLog]:
        """Get audit history for an entity"""
        return db.exec(
            select(AuditLog).where(
                AuditLog.entity_type == entity_type,
                AuditLog.entity_id == entity_id
            )
            .order_by(AuditLog.created_at.desc())
            .limit(limit)
        ).all()


# Initialize CRUD instances
job_crud = JobCRUD()
candidate_crud = CandidateCRUD()
application_crud = ApplicationCRUD()
interview_crud = InterviewCRUD()
attachment_crud = AttachmentCRUD()
audit_log_crud = AuditLogCRUD()