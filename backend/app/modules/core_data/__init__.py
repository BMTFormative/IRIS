# backend/app/modules/core_data/__init__.py
"""
Core Data module for ATS
Contains: Job, Candidate, Application, Interview, Attachment entities
"""

# Only import models and enums for now - no API or CRUD to avoid import issues
from .models import (
    Job, Candidate, Application, Interview, Attachment, 
    AuditLog, IntegrationMetadata,
    JobStatus, ApplicationStatus, PriorityLevel
)

__all__ = [
    # Models
    "Job", "Candidate", "Application", "Interview", "Attachment", 
    "AuditLog", "IntegrationMetadata",
    
    # Enums
    "JobStatus", "ApplicationStatus", "PriorityLevel"
]

# NOTE: API router will be imported separately when needed