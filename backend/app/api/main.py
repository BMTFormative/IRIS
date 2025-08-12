from fastapi import APIRouter

from app.api.routes import items, login, private, users, utils, job_matching
from app.core.config import settings
from app.modules.core_data.api import router as core_data_router

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)
api_router.include_router(items.router)
api_router.include_router(job_matching.router)
api_router.include_router(
    core_data_router, 
    prefix="/core-data", 
    tags=["core-data"]
)

if settings.ENVIRONMENT == "local":
    api_router.include_router(private.router)
