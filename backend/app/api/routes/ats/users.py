# backend/app/api/routes/ats/users.py
import uuid
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import func, select
from app.api.deps import SessionDep

 # db dependency via SessionDep from app.api.deps
from app.core.permissions import (
    require_admin,
    get_permission_checker,
    get_role_manager,
    PermissionChecker,
    RoleManager
)
from app.Models.ats_models import (
    UserRoleAssignmentCreate as UserRoleAssign,
    UserRolePublic,
    UserRolesPublic,
    Role
)
from app.models import (
    User, UserPublicWithRoles, UsersPublic, Message
)

router = APIRouter()


@router.post("/{user_id}/roles", response_model=Message)
def assign_roles_to_user(
    *,
    db: SessionDep,
    user_id: uuid.UUID,
    role_assignment: UserRoleAssign,
    role_manager: RoleManager = Depends(get_role_manager),
    current_user: User = Depends(require_admin()),
) -> Any:
    """
    Assign roles to user (Admin only)
    """
    # Verify user exists
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Assign roles
    for role_id in role_assignment.role_ids:
        role = db.get(Role, role_id)
        if not role or not role.is_active:
            raise HTTPException(status_code=404, detail=f"Role {role_id} not found")
        
        role_manager.assign_role_to_user(
            user_id=user_id,
            role_id=role_id,
            assigned_by=current_user.id
        )

    return Message(message="Roles assigned successfully")


@router.delete("/{user_id}/roles/{role_id}")
def remove_role_from_user(
    *,
    db: SessionDep,
    user_id: uuid.UUID,
    role_id: uuid.UUID,
    role_manager: RoleManager = Depends(get_role_manager),
    current_user: User = Depends(require_admin()),
) -> Message:
    """
    Remove role from user (Admin only)
    """
    # Verify user exists
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Remove role
    success = role_manager.remove_role_from_user(user_id, role_id)
    if not success:
        raise HTTPException(status_code=404, detail="User role assignment not found")

    return Message(message="Role removed successfully")


@router.get("/{user_id}/roles", response_model=UserRolesPublic)
def get_user_roles(
    *,
    db: SessionDep,
    user_id: uuid.UUID,
    permission_checker: PermissionChecker = Depends(get_permission_checker),
    current_user: User = Depends(require_admin()),
) -> Any:
    """
    Get user roles (Admin only)
    """
    # Verify user exists
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get user roles
    roles = permission_checker.get_user_roles(user_id)
    
    user_roles = []
    for role in roles:
        user_role_data = {
            "id": uuid.uuid4(),  # This would come from the UserRole table
            "user_id": user_id,
            "role_id": role.id,
            "assigned_at": role.created_at,  # Approximate
            "is_active": role.is_active,
            "role": role.model_dump()
        }
        user_roles.append(UserRolePublic(**user_role_data))

    return UserRolesPublic(data=user_roles, count=len(user_roles))


@router.get("/{user_id}/permissions")
def get_user_permissions(
    *,
    db: SessionDep,
    user_id: uuid.UUID,
    permission_checker: PermissionChecker = Depends(get_permission_checker),
    current_user: User = Depends(require_admin()),
) -> Any:
    """
    Get user permissions (Admin only)
    """
    # Verify user exists
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get user permissions
    permissions = permission_checker.get_user_permissions(user_id)
    
    return {
        "user_id": user_id,
        "permissions": [perm.value for perm in permissions],
        "count": len(permissions)
    }


@router.get("/with-roles", response_model=UsersPublic)
def get_users_with_roles(
    db: SessionDep,
    skip: int = 0,
    limit: int = Query(default=100, le=100),
    current_user: User = Depends(require_admin()),
) -> Any:
    """
    Get all users with their roles (Admin only)
    """
    count_statement = select(func.count()).select_from(User).where(User.is_active == True)
    count = db.exec(count_statement).one()

    statement = select(User).where(User.is_active == True).offset(skip).limit(limit)
    users = db.exec(statement).all()

    # Add role information to each user
    permission_checker = PermissionChecker(db)
    users_with_roles = []
    
    for user in users:
        roles = permission_checker.get_user_roles(user.id)
        permissions = permission_checker.get_user_permissions(user.id)
        primary_role = permission_checker.get_user_primary_role(user.id)
        
        user_dict = user.model_dump()
        user_dict["roles"] = [role.model_dump() for role in roles]
        user_dict["permissions"] = [perm.value for perm in permissions]
        user_dict["primary_role"] = primary_role
        
        users_with_roles.append(user_dict)

    return UsersPublic(data=users_with_roles, count=count)