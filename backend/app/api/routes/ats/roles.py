# backend/app/api/routes/ats/roles.py
import uuid
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import func, select
from app.api.deps import SessionDep
from app.core.permissions import (
    require_admin, 
    PermissionChecker,
    RoleManager,
    get_permission_checker,
    get_role_manager
)
from app.Models.ats_models import (
    Role, RoleCreate, RoleUpdate, RolePublic, RolesPublic,
    Permission, RolePermission
)
from app.models import Message, User
# get_current_user imported via permissions and dependents; not needed here

router = APIRouter()


@router.get("/", response_model=RolesPublic)
def read_roles(
    db: SessionDep,
    skip: int = 0,
    limit: int = Query(default=100, le=100),
    current_user: User = Depends(require_admin()),
) -> Any:
    """
    Retrieve roles (Admin only)
    """
    count_statement = select(func.count()).select_from(Role).where(Role.is_active == True)
    count = db.exec(count_statement).one()

    statement = (
        select(Role)
        .where(Role.is_active == True)
        .offset(skip)
        .limit(limit)
    )
    roles = db.exec(statement).all()

    # Load permissions for each role
    roles_with_permissions = []
    for role in roles:
        role_dict = role.model_dump()
        
        # Get permissions for this role
        perm_statement = (
            select(Permission)
            .join(RolePermission)
            .where(
                RolePermission.role_id == role.id,
                RolePermission.is_active == True,
                Permission.is_active == True
            )
        )
        permissions = db.exec(perm_statement).all()
        role_dict["permissions"] = [perm.model_dump() for perm in permissions]
        
        roles_with_permissions.append(RolePublic(**role_dict))

    return RolesPublic(data=roles_with_permissions, count=count)


@router.post("/", response_model=RolePublic)
def create_role(
    *,
    db: SessionDep,
    role_in: RoleCreate,
    current_user: User = Depends(require_admin()),
) -> Any:
    """
    Create new role (Admin only)
    """
    # Check if role name already exists
    existing_role = db.exec(
        select(Role).where(Role.name == role_in.name, Role.is_active == True)
    ).first()
    
    if existing_role:
        raise HTTPException(
            status_code=400,
            detail="Role with this name already exists"
        )

    # Create role
    role_dict = role_in.model_dump(exclude={"permission_ids"})
    role = Role(**role_dict)
    db.add(role)
    db.commit()
    db.refresh(role)

    # Assign permissions if provided
    if role_in.permission_ids:
        for perm_id in role_in.permission_ids:
            permission = db.get(Permission, perm_id)
            if permission:
                role_perm = RolePermission(
                    role_id=role.id,
                    permission_id=perm_id
                )
                db.add(role_perm)
        db.commit()

    # Return role with permissions
    perm_statement = (
        select(Permission)
        .join(RolePermission)
        .where(
            RolePermission.role_id == role.id,
            RolePermission.is_active == True,
            Permission.is_active == True
        )
    )
    permissions = db.exec(perm_statement).all()
    
    role_dict = role.model_dump()
    role_dict["permissions"] = [perm.model_dump() for perm in permissions]
    
    return RolePublic(**role_dict)


@router.get("/{id}", response_model=RolePublic)
def read_role(
    *,
    db: SessionDep,
    id: uuid.UUID,
    current_user: User = Depends(require_admin()),
) -> Any:
    """
    Get role by ID (Admin only)
    """
    role = db.get(Role, id)
    if not role or not role.is_active:
        raise HTTPException(status_code=404, detail="Role not found")

    # Get permissions for this role
    perm_statement = (
        select(Permission)
        .join(RolePermission)
        .where(
            RolePermission.role_id == role.id,
            RolePermission.is_active == True,
            Permission.is_active == True
        )
    )
    permissions = db.exec(perm_statement).all()
    
    role_dict = role.model_dump()
    role_dict["permissions"] = [perm.model_dump() for perm in permissions]
    
    return RolePublic(**role_dict)


@router.put("/{id}", response_model=RolePublic)
def update_role(
    *,
    db: SessionDep,
    id: uuid.UUID,
    role_in: RoleUpdate,
    current_user: User = Depends(require_admin()),
) -> Any:
    """
    Update role (Admin only)
    """
    role = db.get(Role, id)
    if not role or not role.is_active:
        raise HTTPException(status_code=404, detail="Role not found")

    role_data = role_in.model_dump(exclude_unset=True, exclude={"permission_ids"})
    role.sqlmodel_update(role_data)
    db.add(role)

    # Update permissions if provided
    if role_in.permission_ids is not None:
        # Deactivate existing permissions
        existing_perms = db.exec(
            select(RolePermission).where(
                RolePermission.role_id == role.id,
                RolePermission.is_active == True
            )
        ).all()
        
        for perm in existing_perms:
            perm.is_active = False
            db.add(perm)

        # Add new permissions
        for perm_id in role_in.permission_ids:
            permission = db.get(Permission, perm_id)
            if permission:
                role_perm = RolePermission(
                    role_id=role.id,
                    permission_id=perm_id
                )
                db.add(role_perm)

    db.commit()
    db.refresh(role)

    # Return role with permissions
    perm_statement = (
        select(Permission)
        .join(RolePermission)
        .where(
            RolePermission.role_id == role.id,
            RolePermission.is_active == True,
            Permission.is_active == True
        )
    )
    permissions = db.exec(perm_statement).all()
    
    role_dict = role.model_dump()
    role_dict["permissions"] = [perm.model_dump() for perm in permissions]
    
    return RolePublic(**role_dict)


@router.delete("/{id}")
def delete_role(
    *,
    db: SessionDep,
    id: uuid.UUID,
    current_user: User = Depends(require_admin()),
) -> Message:
    """
    Delete role (Admin only) - Soft delete
    """
    role = db.get(Role, id)
    if not role or not role.is_active:
        raise HTTPException(status_code=404, detail="Role not found")

    role.is_active = False
    db.add(role)
    db.commit()
    return Message(message="Role deleted successfully")