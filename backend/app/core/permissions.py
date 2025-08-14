import uuid
from typing import List, Optional, Dict, Any
from functools import wraps

from sqlmodel import Session, select

from app.core.db import get_db
from app.models import User
from app.Models.ats_models import (
    UserRole, Role, Permission, RolePermission, 
    PermissionType, UserRoleType,
    DEFAULT_ROLE_PERMISSIONS
)

# Import FastAPI dependencies only when needed
try:
    from fastapi import Depends, HTTPException, status
    # Use get_current_user from API deps
    from app.api.deps import get_current_user
    FASTAPI_AVAILABLE = True
except ImportError:
    FASTAPI_AVAILABLE = False
    # Create dummy classes for when FastAPI is not available
    class Depends:
        def __init__(self, dependency):
            self.dependency = dependency
    
    class HTTPException(Exception):
        def __init__(self, status_code, detail):
            self.status_code = status_code
            self.detail = detail
    
    class status:
        HTTP_403_FORBIDDEN = 403


class PermissionChecker:
    """Centralized permission checking system for ATS"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_user_roles(self, user_id: uuid.UUID) -> List[Role]:
        """Get all active roles for a user"""
        statement = (
            select(Role)
            .join(UserRole, UserRole.role_id == Role.id)
            .where(
                UserRole.user_id == user_id,
                UserRole.is_active == True,
                Role.is_active == True
            )
        )
        return list(self.db.exec(statement).all())
    
    def get_user_permissions(self, user_id: uuid.UUID) -> List[PermissionType]:
        """Get all permissions for a user through their roles"""
        statement = (
            select(Permission.code)
            .join(RolePermission, RolePermission.permission_id == Permission.id)
            .join(Role, Role.id == RolePermission.role_id)
            .join(UserRole, UserRole.role_id == Role.id)
            .where(
                UserRole.user_id == user_id,
                UserRole.is_active == True,
                Role.is_active == True,
                RolePermission.is_active == True,
                Permission.is_active == True
            )
        )
        results = self.db.exec(statement).all()
        return list(set(results))  # Remove duplicates
    
    def user_has_permission(self, user_id: uuid.UUID, permission: PermissionType) -> bool:
        """Check if user has a specific permission"""
        user_permissions = self.get_user_permissions(user_id)
        return permission in user_permissions
    
    def user_has_any_permission(self, user_id: uuid.UUID, permissions: List[PermissionType]) -> bool:
        """Check if user has any of the specified permissions"""
        user_permissions = self.get_user_permissions(user_id)
        return any(perm in user_permissions for perm in permissions)
    
    def user_has_all_permissions(self, user_id: uuid.UUID, permissions: List[PermissionType]) -> bool:
        """Check if user has all of the specified permissions"""
        user_permissions = self.get_user_permissions(user_id)
        return all(perm in user_permissions for perm in permissions)
    
    def get_user_primary_role(self, user_id: uuid.UUID) -> Optional[str]:
        """Get the user's primary role (first active role)"""
        roles = self.get_user_roles(user_id)
        if roles:
            return roles[0].name
        return None


class RoleManager:
    """Manages role assignments and operations"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def assign_role_to_user(
        self, 
        user_id: uuid.UUID, 
        role_id: uuid.UUID, 
        assigned_by: Optional[uuid.UUID] = None
    ) -> UserRole:
        """Assign a role to a user"""
        # Check if assignment already exists
        existing = self.db.exec(
            select(UserRole).where(
                UserRole.user_id == user_id,
                UserRole.role_id == role_id,
                UserRole.is_active == True
            )
        ).first()
        
        if existing:
            return existing
        
        # Create new assignment
        user_role = UserRole(
            user_id=user_id,
            role_id=role_id,
            assigned_by=assigned_by
        )
        self.db.add(user_role)
        self.db.commit()
        self.db.refresh(user_role)
        return user_role
    
    def remove_role_from_user(self, user_id: uuid.UUID, role_id: uuid.UUID) -> bool:
        """Remove a role from a user (soft delete)"""
        user_role = self.db.exec(
            select(UserRole).where(
                UserRole.user_id == user_id,
                UserRole.role_id == role_id,
                UserRole.is_active == True
            )
        ).first()
        
        if user_role:
            user_role.is_active = False
            self.db.add(user_role)
            self.db.commit()
            return True
        return False
    
    def get_role_by_name(self, role_name: str) -> Optional[Role]:
        """Get role by name"""
        return self.db.exec(
            select(Role).where(Role.name == role_name, Role.is_active == True)
        ).first()
    
    def create_default_roles_and_permissions(self):
        """Create default ATS permissions and roles if they don't exist"""
        from app.Models.ats_models import PERMISSION_CATEGORIES, PermissionCategory
        print("Initializing default ATS permissions...")
        # Seed permissions table
        for perm_type in PermissionType:
            # lookup by code (perm_type.value)
            existing_perm = self.db.exec(
                select(Permission).where(Permission.code == perm_type.value)
            ).first()
            if not existing_perm:
                # determine category for this permission
                category = PERMISSION_CATEGORIES.get(perm_type, PermissionCategory.SYSTEM).value
                permission = Permission(
                    code=perm_type.value,
                    name=perm_type.value.replace("_", " ").title(),
                    description=f"Permission to {perm_type.value.replace('_', ' ')}",
                    category=category,
                    is_system_permission=True,
                )
                self.db.add(permission)
                print(f"Created permission: {permission.name} [{permission.code}]")
        self.db.commit()

        print("Initializing default ATS roles...")
        # Seed roles and assign default permissions
        for role_enum, perms in DEFAULT_ROLE_PERMISSIONS.items():
            existing_role = self.db.exec(
                select(Role).where(Role.name == role_enum.value)
            ).first()
            if not existing_role:
                display = role_enum.value.replace("_", " ").title()
                role = Role(
                    name=role_enum.value,
                    display_name=display,
                    description=f"Default {display} role",
                    is_system_role=True,
                )
                self.db.add(role)
                self.db.commit()
                self.db.refresh(role)
                print(f"Created role: {role.name}")
                # assign each default permission
                for perm_type in perms:
                    perm_obj = self.db.exec(
                        select(Permission).where(Permission.code == perm_type.value)
                    ).first()
                    if perm_obj:
                        existing_rp = self.db.exec(
                            select(RolePermission).where(
                                RolePermission.role_id == role.id,
                                RolePermission.permission_id == perm_obj.id
                            )
                        ).first()
                        if not existing_rp:
                            rp = RolePermission(
                                role_id=role.id,
                                permission_id=perm_obj.id,
                                is_active=True,
                            )
                            self.db.add(rp)
                            print(f"  - Assigned permission {perm_obj.code} to role {role.name}")
                self.db.commit()
        print("Default ATS system initialization complete")


# Dependency functions for FastAPI
def get_permission_checker(db: Session = Depends(get_db)) -> PermissionChecker:
    """Get permission checker instance"""
    return PermissionChecker(db)


def get_role_manager(db: Session = Depends(get_db)) -> RoleManager:
    """Get role manager instance"""
    return RoleManager(db)


# Permission checking decorators (only available when FastAPI is imported)
if FASTAPI_AVAILABLE:
    def require_permission(permission: PermissionType):
        """Decorator to require specific permission"""
        def permission_dependency(
            current_user: User = Depends(get_current_user),
            permission_checker: PermissionChecker = Depends(get_permission_checker)
        ):
            if not permission_checker.user_has_permission(current_user.id, permission):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Insufficient permissions. Required: {permission.value}"
                )
            return current_user
        
        return permission_dependency


    def require_any_permission(permissions: List[PermissionType]):
        """Decorator to require any of the specified permissions"""
        def permission_dependency(
            current_user: User = Depends(get_current_user),
            permission_checker: PermissionChecker = Depends(get_permission_checker)
        ):
            if not permission_checker.user_has_any_permission(current_user.id, permissions):
                perm_names = [p.value for p in permissions]
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Insufficient permissions. Required any of: {', '.join(perm_names)}"
                )
            return current_user
        
        return permission_dependency


    def require_all_permissions(permissions: List[PermissionType]):
        """Decorator to require all of the specified permissions"""
        def permission_dependency(
            current_user: User = Depends(get_current_user),
            permission_checker: PermissionChecker = Depends(get_permission_checker)
        ):
            if not permission_checker.user_has_all_permissions(current_user.id, permissions):
                perm_names = [p.value for p in permissions]
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Insufficient permissions. Required all of: {', '.join(perm_names)}"
                )
            return current_user
        
        return permission_dependency


    def require_role(role_name: str):
        """Decorator to require specific role"""
        def role_dependency(
            current_user: User = Depends(get_current_user),
            permission_checker: PermissionChecker = Depends(get_permission_checker)
        ):
            user_roles = permission_checker.get_user_roles(current_user.id)
            role_names = [role.name for role in user_roles]
            
            if role_name not in role_names:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Insufficient role. Required: {role_name}"
                )
            return current_user
        
        return role_dependency


    # Common permission combinations
    def require_admin():
        """Require admin or super admin role"""
        return require_any_permission([
            PermissionType.MANAGE_USERS,
            PermissionType.SYSTEM_ADMIN
        ])


    def require_employer_or_admin():
        """Require employer, admin, or super admin permissions"""
        return require_any_permission([
            PermissionType.CREATE_JOBS,
            PermissionType.MANAGE_USERS,
            PermissionType.SYSTEM_ADMIN
        ])


    def require_candidate_or_higher():
        """Require at least candidate permissions (basically any authenticated user)"""
        return require_any_permission([
            PermissionType.VIEW_JOBS,
            PermissionType.CREATE_JOBS,
            PermissionType.MANAGE_USERS,
            PermissionType.SYSTEM_ADMIN
        ])
else:
    # Dummy functions when FastAPI is not available
    def require_permission(permission):
        def decorator(func):
            return func
        return decorator
    
    def require_any_permission(permissions):
        def decorator(func):
            return func
        return decorator
    
    def require_all_permissions(permissions):
        def decorator(func):
            return func
        return decorator
    
    def require_role(role_name):
        def decorator(func):
            return func
        return decorator
    
    def require_admin():
        def decorator(func):
            return func
        return decorator
    
    def require_employer_or_admin():
        def decorator(func):
            return func
        return decorator
    
    def require_candidate_or_higher():
        def decorator(func):
            return func
        return decorator


# Utility functions
def get_user_context(user: User, db: Session) -> Dict[str, Any]:
    """Get complete user context with roles and permissions"""
    permission_checker = PermissionChecker(db)
    
    roles = permission_checker.get_user_roles(user.id)
    permissions = permission_checker.get_user_permissions(user.id)
    primary_role = permission_checker.get_user_primary_role(user.id)
    
    return {
        "user_id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "is_active": user.is_active,
        "is_superuser": user.is_superuser,
        "roles": [{"id": role.id, "name": role.name} for role in roles],
        "permissions": [perm.value for perm in permissions],
        "primary_role": primary_role
    }


def check_user_access(user_id: uuid.UUID, resource: str, action: str, db: Session) -> bool:
    """Check if user has access to perform action on resource"""
    permission_checker = PermissionChecker(db)
    
    # Map resource/action combinations to permissions
    access_map = {
        ("jobs", "view"): [PermissionType.VIEW_JOBS],
        ("jobs", "create"): [PermissionType.CREATE_JOBS],
        ("jobs", "edit"): [PermissionType.EDIT_JOBS],
        ("jobs", "delete"): [PermissionType.DELETE_JOBS],
        ("candidates", "view"): [PermissionType.VIEW_CANDIDATES],
        ("candidates", "create"): [PermissionType.CREATE_CANDIDATES],
        ("candidates", "edit"): [PermissionType.EDIT_CANDIDATES],
        ("candidates", "delete"): [PermissionType.DELETE_CANDIDATES],
        ("applications", "view"): [PermissionType.VIEW_APPLICATIONS],
        ("applications", "create"): [PermissionType.CREATE_APPLICATIONS],
        ("applications", "edit"): [PermissionType.EDIT_APPLICATIONS],
        ("applications", "delete"): [PermissionType.DELETE_APPLICATIONS],
        ("users", "manage"): [PermissionType.MANAGE_USERS],
        ("system", "admin"): [PermissionType.SYSTEM_ADMIN],
        ("analytics", "view"): [PermissionType.VIEW_ANALYTICS],
    }
    
    required_permissions = access_map.get((resource, action), [])
    if not required_permissions:
        return False
    
    return permission_checker.user_has_any_permission(user_id, required_permissions)


def initialize_ats_system(db: Session) -> None:
    """Initialize the ATS system with default roles and permissions"""
    role_manager = RoleManager(db)
    role_manager.create_default_roles_and_permissions()
    
    print("ATS system initialization completed!")


def get_role_hierarchy() -> Dict[str, int]:
    """Get role hierarchy levels for permission checks"""
    return {
        UserRoleType.JOB_CANDIDATE.value: 1,
        UserRoleType.EMPLOYER.value: 2,
        UserRoleType.ADMIN.value: 3,
        UserRoleType.SUPER_ADMIN.value: 4
    }


def can_user_manage_role(user_id: uuid.UUID, target_role: str, db: Session) -> bool:
    """Check if user can manage (assign/remove) a specific role"""
    permission_checker = PermissionChecker(db)
    user_permissions = permission_checker.get_user_permissions(user_id)
    
    # Super admin can manage all roles
    if PermissionType.SYSTEM_ADMIN in user_permissions:
        return True
    
    # Regular admin can manage roles below their level
    if PermissionType.MANAGE_USERS in user_permissions:
        hierarchy = get_role_hierarchy()
        user_roles = permission_checker.get_user_roles(user_id)
        
        # Get user's highest role level
        user_max_level = 0
        for role in user_roles:
            level = hierarchy.get(role.name, 0)
            user_max_level = max(user_max_level, level)
        
        # Target role level
        target_level = hierarchy.get(target_role, 0)
        
        # Can manage roles of lower level
        return user_max_level > target_level
    
    return False


def validate_permission_assignment(
    user_id: uuid.UUID, 
    role_id: uuid.UUID, 
    db: Session
) -> bool:
    """Validate if user can assign a specific role"""
    role = db.get(Role, role_id)
    if not role:
        return False
    
    return can_user_manage_role(user_id, role.name, db)