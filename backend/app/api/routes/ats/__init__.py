# backend/app/api/routes/ats/__init__.py
from fastapi import APIRouter

from .roles import router as roles_router
from .permissions import router as permissions_router
from .users import router as users_router

router = APIRouter()
router.include_router(roles_router, prefix="/roles", tags=["ATS Roles"])
router.include_router(permissions_router, prefix="/permissions", tags=["ATS Permissions"])
router.include_router(users_router, prefix="/users", tags=["ATS Users"])








