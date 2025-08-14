# backend/app/api/routes/ats/permissions.py
import uuid
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import func, select
from app.api.deps import SessionDep

 # db dependency via SessionDep from app.api.deps
from app.core.permissions import require_admin
from app.Models.ats_models import (
    Permission, PermissionCreate, PermissionUpdate, 
    PermissionPublic, PermissionsPublic, PermissionType
)
from app.models import Message, User

router = APIRouter()


@router.get("/", response_model=PermissionsPublic)
def read_permissions(
    db: SessionDep,
    skip: int = 0,
    limit: int = Query(default=100, le=100),
    current_user: User = Depends(require_admin()),
) -> Any:
    """
    Retrieve permissions (Admin only)
    """
    count_statement = select(func.count()).select_from(Permission).where(Permission.is_active == True)
    count = db.exec(count_statement).one()

    statement = (
        select(Permission)
        .where(Permission.is_active == True)
        .offset(skip)
        .limit(limit)
    )
    permissions = db.exec(statement).all()
    return PermissionsPublic(data=permissions, count=count)


@router.post("/", response_model=PermissionPublic)
def create_permission(
    *,
    db: SessionDep,
    permission_in: PermissionCreate,
    current_user: User = Depends(require_admin()),
) -> Any:
    """
    Create new permission (Admin only)
    """
    # Check if permission already exists
    existing_permission = db.exec(
        select(Permission).where(
            Permission.code == permission_in.code,
            Permission.is_active == True
        )
    ).first()
    
    if existing_permission:
        raise HTTPException(
            status_code=400,
            detail="Permission with this type already exists"
        )

    permission = Permission.model_validate(permission_in)
    db.add(permission)
    db.commit()
    db.refresh(permission)
    return permission


@router.get("/types", response_model=List[str])
def get_permission_types(
    current_user: User = Depends(require_admin())
) -> Any:
    """
    Get all available permission types (Admin only)
    """
    return [perm_type.value for perm_type in PermissionType]


@router.get("/{id}", response_model=PermissionPublic)
def read_permission(
    *,
    db: SessionDep,
    id: uuid.UUID,
    current_user: User = Depends(require_admin()),
) -> Any:
    """
    Get permission by ID (Admin only)
    """
    permission = db.get(Permission, id)
    if not permission or not permission.is_active:
        raise HTTPException(status_code=404, detail="Permission not found")
    return permission


@router.put("/{id}", response_model=PermissionPublic)
def update_permission(
    *,
    db: SessionDep,
    id: uuid.UUID,
    permission_in: PermissionUpdate,
    current_user: User = Depends(require_admin()),
) -> Any:
    """
    Update permission (Admin only)
    """
    permission = db.get(Permission, id)
    if not permission or not permission.is_active:
        raise HTTPException(status_code=404, detail="Permission not found")

    permission_data = permission_in.model_dump(exclude_unset=True)
    permission.sqlmodel_update(permission_data)
    db.add(permission)
    db.commit()
    db.refresh(permission)
    return permission


@router.delete("/{id}")
def delete_permission(
    *,
    db: SessionDep,
    id: uuid.UUID,
    current_user: User = Depends(require_admin()),
) -> Message:
    """
    Delete permission (Admin only) - Soft delete
    """
    permission = db.get(Permission, id)
    if not permission or not permission.is_active:
        raise HTTPException(status_code=404, detail="Permission not found")

    permission.is_active = False
    db.add(permission)
    db.commit()
    return Message(message="Permission deleted successfully")