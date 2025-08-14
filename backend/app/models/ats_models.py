"""
ATS (Applicant Tracking System) Models
======================================

This module contains all models related to the ATS functionality including:
- Role-based access control (RBAC)
- Permission management
- User role assignments
- ATS-specific data structures

Models are organized into:
1. Enums - Constants and choices
2. Database Models - SQLModel table definitions
3. API Models - Pydantic models for API requests/responses
4. Utility Models - Helper models and collections
"""

import uuid
from enum import Enum
from typing import Optional, List, Dict, Any
from datetime import datetime

from pydantic import EmailStr, field_validator
from sqlmodel import SQLModel, Field, Relationship, Column, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy import UniqueConstraint, Index


# ===== ENUMS AND CONSTANTS =====

class RoleType(str, Enum):
    """Standard role types in the ATS system"""
    JOB_CANDIDATE = "job_candidate"
    EMPLOYER = "employer"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"


class PermissionCategory(str, Enum):
    """Categories for organizing permissions"""
    JOBS = "jobs"
    CANDIDATES = "candidates"
    APPLICATIONS = "applications"
    USERS = "users"
    SYSTEM = "system"
    ANALYTICS = "analytics"


class Permission(str, Enum):
    """Comprehensive permission system for ATS features"""
    
    # Job Management Permissions
    VIEW_JOBS = "view_jobs"
    CREATE_JOBS = "create_jobs"
    EDIT_JOBS = "edit_jobs"
    DELETE_JOBS = "delete_jobs"
    PUBLISH_JOBS = "publish_jobs"
    ARCHIVE_JOBS = "archive_jobs"
    
    # Candidate Management Permissions
    VIEW_CANDIDATES = "view_candidates"
    CREATE_CANDIDATES = "create_candidates"
    EDIT_CANDIDATES = "edit_candidates"
    DELETE_CANDIDATES = "delete_candidates"
    VIEW_CANDIDATE_DETAILS = "view_candidate_details"
    EXPORT_CANDIDATES = "export_candidates"
    
    # Application Management Permissions
    VIEW_APPLICATIONS = "view_applications"
    CREATE_APPLICATIONS = "create_applications"
    EDIT_APPLICATIONS = "edit_applications"
    DELETE_APPLICATIONS = "delete_applications"
    PROCESS_APPLICATIONS = "process_applications"
    SCHEDULE_INTERVIEWS = "schedule_interviews"
    
    # User Management Permissions
    MANAGE_USERS = "manage_users"
    ASSIGN_ROLES = "assign_roles"
    VIEW_USER_ACTIVITY = "view_user_activity"
    MANAGE_TEAMS = "manage_teams"
    
    # System Administration Permissions
    SYSTEM_ADMIN = "system_admin"
    MANAGE_ROLES = "manage_roles"
    MANAGE_PERMISSIONS = "manage_permissions"
    SYSTEM_SETTINGS = "system_settings"
    BACKUP_DATA = "backup_data"
    
    # Analytics and Reporting Permissions
    VIEW_ANALYTICS = "view_analytics"
    VIEW_REPORTS = "view_reports"
    EXPORT_REPORTS = "export_reports"
    CREATE_DASHBOARDS = "create_dashboards"


class ApplicationStatus(str, Enum):
    """Application workflow statuses"""
    SUBMITTED = "submitted"
    SCREENING = "screening"
    PHONE_INTERVIEW = "phone_interview"
    TECHNICAL_INTERVIEW = "technical_interview"
    FINAL_INTERVIEW = "final_interview"
    OFFER_EXTENDED = "offer_extended"
    OFFER_ACCEPTED = "offer_accepted"
    OFFER_DECLINED = "offer_declined"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


# ===== DATABASE MODELS =====

class Role(SQLModel, table=True):
    """Role model for RBAC system"""
    __tablename__ = "ats_roles"
    __table_args__ = (
        UniqueConstraint("name", name="unique_role_name"),
        Index("idx_role_active", "is_active"),
    )
    
    # Primary Key
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    
    # Core Fields
    name: str = Field(max_length=100, index=True)
    display_name: str = Field(max_length=150)
    description: Optional[str] = Field(default=None, max_length=500)
    
    # Role Properties
    is_active: bool = Field(default=True, index=True)
    is_system_role: bool = Field(default=False)  # Cannot be deleted if True
    priority: int = Field(default=0)  # Higher number = higher priority
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default=None)
    created_by: Optional[uuid.UUID] = Field(default=None, foreign_key="user.id")
    
    # Relationships
    user_roles: List["UserRoleAssignment"] = Relationship(back_populates="role")
    role_permissions: List["RolePermissionAssignment"] = Relationship(back_populates="role")
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if not v or len(v.strip()) < 2:
            raise ValueError('Role name must be at least 2 characters')
        return v.lower().replace(' ', '_')


class PermissionModel(SQLModel, table=True):
    """Permission model for fine-grained access control"""
    __tablename__ = "ats_permissions"
    __table_args__ = (
        UniqueConstraint("code", name="unique_permission_code"),
        Index("idx_permission_category", "category"),
        Index("idx_permission_active", "is_active"),
    )
    
    # Primary Key
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    
    # Core Fields
    code: str = Field(max_length=100, index=True)  # e.g., "view_jobs"
    name: str = Field(max_length=150)  # e.g., "View Jobs"
    description: Optional[str] = Field(default=None, max_length=500)
    
    # Permission Properties
    category: str = Field(max_length=50)  # From PermissionCategory enum
    is_active: bool = Field(default=True, index=True)
    is_system_permission: bool = Field(default=False)  # Cannot be deleted if True
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default=None)
    
    # Relationships
    role_permissions: List["RolePermissionAssignment"] = Relationship(back_populates="permission")
    
    @field_validator('code')
    @classmethod
    def validate_code(cls, v):
        if not v or len(v.strip()) < 2:
            raise ValueError('Permission code must be at least 2 characters')
        return v.lower().replace(' ', '_')


class UserRoleAssignment(SQLModel, table=True):
    """Many-to-many relationship between Users and Roles"""
    __tablename__ = "ats_user_roles"
    __table_args__ = (
        UniqueConstraint("user_id", "role_id", name="unique_user_role"),
        Index("idx_user_role_active", "is_active"),
        Index("idx_user_role_user", "user_id"),
        Index("idx_user_role_role", "role_id"),
    )
    
    # Primary Key
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    
    # Foreign Keys
    user_id: uuid.UUID = Field(foreign_key="user.id", nullable=False)
    role_id: uuid.UUID = Field(foreign_key="ats_roles.id", nullable=False)
    
    # Assignment Properties
    is_active: bool = Field(default=True, index=True)
    is_primary_role: bool = Field(default=False)  # User's main role
    
    # Metadata
    assigned_at: datetime = Field(default_factory=datetime.utcnow)
    # Who assigned the role (user id), no FK constraint to avoid join ambiguity
    assigned_by: Optional[uuid.UUID] = Field(default=None)
    expires_at: Optional[datetime] = Field(default=None)  # Optional role expiration
    
    # Relationships
    # Link to Role entity
    role: Role = Relationship(back_populates="user_roles")
    # Link to User entity (back-populates user.user_roles)
    user: "User" = Relationship(back_populates="user_roles")


class RolePermissionAssignment(SQLModel, table=True):
    """Many-to-many relationship between Roles and Permissions"""
    __tablename__ = "ats_role_permissions"
    __table_args__ = (
        UniqueConstraint("role_id", "permission_id", name="unique_role_permission"),
        Index("idx_role_permission_active", "is_active"),
        Index("idx_role_permission_role", "role_id"),
        Index("idx_role_permission_permission", "permission_id"),
    )
    
    # Primary Key
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    
    # Foreign Keys
    role_id: uuid.UUID = Field(foreign_key="ats_roles.id", nullable=False)
    permission_id: uuid.UUID = Field(foreign_key="ats_permissions.id", nullable=False)
    
    # Assignment Properties
    is_active: bool = Field(default=True, index=True)
    
    # Metadata
    assigned_at: datetime = Field(default_factory=datetime.utcnow)
    assigned_by: Optional[uuid.UUID] = Field(default=None, foreign_key="user.id")
    
    # Relationships
    role: Role = Relationship(back_populates="role_permissions")
    permission: PermissionModel = Relationship(back_populates="role_permissions")


# ===== API MODELS =====

class RoleBase(SQLModel):
    """Base model for Role operations"""
    name: str = Field(min_length=2, max_length=100)
    display_name: str = Field(min_length=2, max_length=150)
    description: Optional[str] = Field(default=None, max_length=500)
    is_active: bool = Field(default=True)
    priority: int = Field(default=0, ge=0)


class RoleCreate(RoleBase):
    """Model for creating new roles"""
    permission_ids: List[uuid.UUID] = Field(default_factory=list)


class RoleUpdate(SQLModel):
    """Model for updating existing roles"""
    name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    display_name: Optional[str] = Field(default=None, min_length=2, max_length=150)
    description: Optional[str] = Field(default=None, max_length=500)
    is_active: Optional[bool] = Field(default=None)
    priority: Optional[int] = Field(default=None, ge=0)
    permission_ids: Optional[List[uuid.UUID]] = Field(default=None)


class PermissionBase(SQLModel):
    """Base model for Permission operations"""
    code: str = Field(min_length=2, max_length=100)
    name: str = Field(min_length=2, max_length=150)
    description: Optional[str] = Field(default=None, max_length=500)
    category: str = Field(max_length=50)
    is_active: bool = Field(default=True)


class PermissionCreate(PermissionBase):
    """Model for creating new permissions"""
    pass


class PermissionUpdate(SQLModel):
    """Model for updating existing permissions"""
    code: Optional[str] = Field(default=None, min_length=2, max_length=100)
    name: Optional[str] = Field(default=None, min_length=2, max_length=150)
    description: Optional[str] = Field(default=None, max_length=500)
    category: Optional[str] = Field(default=None, max_length=50)
    is_active: Optional[bool] = Field(default=None)


class UserRoleAssignmentCreate(SQLModel):
    """Model for assigning roles to users"""
    user_id: uuid.UUID
    role_ids: List[uuid.UUID]
    set_primary_role: Optional[uuid.UUID] = Field(default=None)  # Which role to set as primary


# ===== PUBLIC API MODELS =====

class PermissionPublic(PermissionBase):
    """Public permission model for API responses"""
    id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime]
    is_system_permission: bool


class RolePublic(RoleBase):
    """Public role model for API responses"""
    id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime]
    is_system_role: bool
    permissions: List[PermissionPublic] = Field(default_factory=list)
    user_count: Optional[int] = Field(default=0)


class UserRolePublic(SQLModel):
    """Public user role assignment model"""
    id: uuid.UUID
    user_id: uuid.UUID
    role_id: uuid.UUID
    is_active: bool
    is_primary_role: bool
    assigned_at: datetime
    expires_at: Optional[datetime]
    role: RolePublic


class UserWithRoles(SQLModel):
    """User model extended with role information"""
    id: uuid.UUID
    email: str
    full_name: Optional[str]
    is_active: bool
    is_superuser: bool
    roles: List[RolePublic] = Field(default_factory=list)
    permissions: List[str] = Field(default_factory=list)
    primary_role: Optional[str] = Field(default=None)
    access_level: Optional[str] = Field(default=None)


# ===== COLLECTION MODELS =====

class RolesPublic(SQLModel):
    """Collection of roles for API responses"""
    data: List[RolePublic]
    count: int
    total_count: Optional[int] = Field(default=None)


class PermissionsPublic(SQLModel):
    """Collection of permissions for API responses"""
    data: List[PermissionPublic]
    count: int
    total_count: Optional[int] = Field(default=None)


class UserRolesPublic(SQLModel):
    """Collection of user role assignments"""
    data: List[UserRolePublic]
    count: int
    total_count: Optional[int] = Field(default=None)


class UsersWithRolesPublic(SQLModel):
    """Collection of users with their roles"""
    data: List[UserWithRoles]
    count: int
    total_count: Optional[int] = Field(default=None)


# ===== UTILITY MODELS =====

class PermissionCheck(SQLModel):
    """Model for permission checking results"""
    has_permission: bool
    permission_code: str
    user_id: uuid.UUID
    checked_at: datetime = Field(default_factory=datetime.utcnow)


class RoleHierarchy(SQLModel):
    """Model for role hierarchy information"""
    role_name: str
    level: int
    can_manage: List[str] = Field(default_factory=list)


class AccessMatrix(SQLModel):
    """Model for user access matrix"""
    user_id: uuid.UUID
    roles: List[str]
    permissions: List[str]
    access_level: str
    features: Dict[str, bool] = Field(default_factory=dict)


# ===== DEFAULT CONFIGURATIONS =====

DEFAULT_ROLE_PERMISSIONS: Dict[RoleType, List[Permission]] = {
    RoleType.JOB_CANDIDATE: [
        Permission.VIEW_JOBS,
        Permission.CREATE_APPLICATIONS,
        Permission.VIEW_APPLICATIONS,
        Permission.EDIT_APPLICATIONS,
    ],
    
    RoleType.EMPLOYER: [
        Permission.VIEW_JOBS,
        Permission.CREATE_JOBS,
        Permission.EDIT_JOBS,
        Permission.DELETE_JOBS,
        Permission.PUBLISH_JOBS,
        Permission.ARCHIVE_JOBS,
        Permission.VIEW_CANDIDATES,
        Permission.VIEW_CANDIDATE_DETAILS,
        Permission.VIEW_APPLICATIONS,
        Permission.PROCESS_APPLICATIONS,
        Permission.SCHEDULE_INTERVIEWS,
        Permission.VIEW_ANALYTICS,
    ],
    
    RoleType.ADMIN: [
        # All Employer permissions plus:
        Permission.VIEW_JOBS,
        Permission.CREATE_JOBS,
        Permission.EDIT_JOBS,
        Permission.DELETE_JOBS,
        Permission.PUBLISH_JOBS,
        Permission.ARCHIVE_JOBS,
        Permission.VIEW_CANDIDATES,
        Permission.CREATE_CANDIDATES,
        Permission.EDIT_CANDIDATES,
        Permission.DELETE_CANDIDATES,
        Permission.VIEW_CANDIDATE_DETAILS,
        Permission.EXPORT_CANDIDATES,
        Permission.VIEW_APPLICATIONS,
        Permission.CREATE_APPLICATIONS,
        Permission.EDIT_APPLICATIONS,
        Permission.DELETE_APPLICATIONS,
        Permission.PROCESS_APPLICATIONS,
        Permission.SCHEDULE_INTERVIEWS,
        Permission.MANAGE_USERS,
        Permission.ASSIGN_ROLES,
        Permission.VIEW_USER_ACTIVITY,
        Permission.MANAGE_TEAMS,
        Permission.VIEW_ANALYTICS,
        Permission.VIEW_REPORTS,
        Permission.EXPORT_REPORTS,
        Permission.CREATE_DASHBOARDS,
    ],
    
    RoleType.SUPER_ADMIN: [
        # All permissions
        *list(Permission)
    ],
}


PERMISSION_CATEGORIES: Dict[Permission, PermissionCategory] = {
    # Jobs
    Permission.VIEW_JOBS: PermissionCategory.JOBS,
    Permission.CREATE_JOBS: PermissionCategory.JOBS,
    Permission.EDIT_JOBS: PermissionCategory.JOBS,
    Permission.DELETE_JOBS: PermissionCategory.JOBS,
    Permission.PUBLISH_JOBS: PermissionCategory.JOBS,
    Permission.ARCHIVE_JOBS: PermissionCategory.JOBS,
    
    # Candidates
    Permission.VIEW_CANDIDATES: PermissionCategory.CANDIDATES,
    Permission.CREATE_CANDIDATES: PermissionCategory.CANDIDATES,
    Permission.EDIT_CANDIDATES: PermissionCategory.CANDIDATES,
    Permission.DELETE_CANDIDATES: PermissionCategory.CANDIDATES,
    Permission.VIEW_CANDIDATE_DETAILS: PermissionCategory.CANDIDATES,
    Permission.EXPORT_CANDIDATES: PermissionCategory.CANDIDATES,
    
    # Applications
    Permission.VIEW_APPLICATIONS: PermissionCategory.APPLICATIONS,
    Permission.CREATE_APPLICATIONS: PermissionCategory.APPLICATIONS,
    Permission.EDIT_APPLICATIONS: PermissionCategory.APPLICATIONS,
    Permission.DELETE_APPLICATIONS: PermissionCategory.APPLICATIONS,
    Permission.PROCESS_APPLICATIONS: PermissionCategory.APPLICATIONS,
    Permission.SCHEDULE_INTERVIEWS: PermissionCategory.APPLICATIONS,
    
    # Users
    Permission.MANAGE_USERS: PermissionCategory.USERS,
    Permission.ASSIGN_ROLES: PermissionCategory.USERS,
    Permission.VIEW_USER_ACTIVITY: PermissionCategory.USERS,
    Permission.MANAGE_TEAMS: PermissionCategory.USERS,
    
    # System
    Permission.SYSTEM_ADMIN: PermissionCategory.SYSTEM,
    Permission.MANAGE_ROLES: PermissionCategory.SYSTEM,
    Permission.MANAGE_PERMISSIONS: PermissionCategory.SYSTEM,
    Permission.SYSTEM_SETTINGS: PermissionCategory.SYSTEM,
    Permission.BACKUP_DATA: PermissionCategory.SYSTEM,
    
    # Analytics
    Permission.VIEW_ANALYTICS: PermissionCategory.ANALYTICS,
    Permission.VIEW_REPORTS: PermissionCategory.ANALYTICS,
    Permission.EXPORT_REPORTS: PermissionCategory.ANALYTICS,
    Permission.CREATE_DASHBOARDS: PermissionCategory.ANALYTICS,
}


# ===== HELPER FUNCTIONS =====

def get_permission_by_category(category: PermissionCategory) -> List[Permission]:
    """Get all permissions for a specific category"""
    return [perm for perm, cat in PERMISSION_CATEGORIES.items() if cat == category]


def get_role_hierarchy() -> Dict[str, int]:
    """Get role hierarchy for permission inheritance"""
    return {
        RoleType.JOB_CANDIDATE.value: 1,
        RoleType.EMPLOYER.value: 2,
        RoleType.ADMIN.value: 3,
        RoleType.SUPER_ADMIN.value: 4,
    }


def get_default_role_for_user_type(user_type: str = "candidate") -> RoleType:
    """Get default role based on user type"""
    mapping = {
        "candidate": RoleType.JOB_CANDIDATE,
        "employer": RoleType.EMPLOYER,
        "admin": RoleType.ADMIN,
        "super_admin": RoleType.SUPER_ADMIN,
    }
    return mapping.get(user_type, RoleType.JOB_CANDIDATE)


# ===== VALIDATION FUNCTIONS =====

def validate_role_permissions(role_type: RoleType, permissions: List[Permission]) -> bool:
    """Validate that permissions are appropriate for role type"""
    default_permissions = DEFAULT_ROLE_PERMISSIONS.get(role_type, [])
    
    # Super admin can have any permissions
    if role_type == RoleType.SUPER_ADMIN:
        return True
    
    # Check if all permissions are within allowed scope
    return all(perm in default_permissions for perm in permissions)


def can_role_assign_permission(assigner_role: RoleType, permission: Permission) -> bool:
    """Check if a role can assign a specific permission"""
    assigner_permissions = DEFAULT_ROLE_PERMISSIONS.get(assigner_role, [])
    return permission in assigner_permissions
    
# ===== LEGACY ALIASES FOR BACKWARD COMPATIBILITY =====
# Enum of permission codes/types
PermissionType = Permission
# SQLModel table classes aliased to legacy names
Permission = PermissionModel
UserRoleType = RoleType
UserRole = UserRoleAssignment
RolePermission = RolePermissionAssignment