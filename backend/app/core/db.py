# backend/app/core/db.py - ADD ATS tables to initialization
import logging
from sqlmodel import Session, create_engine, SQLModel

from app.core.config import settings

logger = logging.getLogger(__name__)

engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))


def init_db(session: Session) -> None:
    """Initialize database tables"""
    # Import all models to ensure they are registered with SQLModel
    from app.models import User, Item  # noqa: F401
    from app.Models.ats_models import (  # noqa: F401
        Role, Permission, UserRole, RolePermission
    )
    
    # Create tables
    SQLModel.metadata.create_all(engine)
    logger.info("Database tables created")


def get_db():
    """Dependency to get database session"""
    with Session(engine) as session:
        yield session