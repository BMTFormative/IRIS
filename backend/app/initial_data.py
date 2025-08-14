# backend/app/initial_data.py - ADD ATS initialization
import logging

from sqlmodel import Session

from app.core.db import engine, init_db
from app.models import User, UserCreate
from app.Models.ats_models import Role, Permission, RolePermission, UserRole, DEFAULT_ROLE_PERMISSIONS, PermissionType
from app.core.config import settings
from app.crud import create_user

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init_db_and_ats() -> None:
    """Initialize database with ATS roles and permissions"""
    with Session(engine) as session:
        # Initialize the original database
        init_db(session)
        
        # Initialize ATS system
        init_ats_system(session)


def init_ats_system(db: Session) -> None:
    """Initialize ATS roles, permissions, and default assignments"""
    logger.info("Initializing ATS system...")
    
    # Import RoleManager here to avoid circular imports
    from app.core.permissions import RoleManager
    
    role_manager = RoleManager(db)
    
    # Create default roles and permissions
    role_manager.create_default_roles_and_permissions()
    
    # Create initial superuser if not exists
    try:
        first_email = settings.FIRST_SUPERUSER
        first_pass = settings.FIRST_SUPERUSER_PASSWORD
    except Exception:
        first_email = None
    if first_email:
        existing = db.query(User).filter(User.email == first_email).first()
        if not existing:
            # Create superuser record
            print(f"Creating first superuser: {first_email}")
            user_create = UserCreate(
                email=first_email,
                password=first_pass,
                full_name="Superuser",
                is_superuser=True,
            )
            user = create_user(session=db, user_create=user_create)
            print(f"Created superuser: {user.email}")

    # Assign super_admin role to first superuser if exists
    assign_default_roles(db)
    
    logger.info("ATS system initialized successfully")


def assign_default_roles(db: Session) -> None:
    """Assign default roles to existing users"""
    # Get the first superuser
    first_superuser = db.query(User).filter(User.email == settings.FIRST_SUPERUSER).first()
    
    if first_superuser:
        # Get super admin role
        super_admin_role = db.query(Role).filter(Role.name == "super_admin").first()
        
        if super_admin_role:
            # Check if assignment already exists
            existing_assignment = db.query(UserRole).filter(
                UserRole.user_id == first_superuser.id,
                UserRole.role_id == super_admin_role.id,
                UserRole.is_active == True
            ).first()
            
            if not existing_assignment:
                user_role = UserRole(
                    user_id=first_superuser.id,
                    role_id=super_admin_role.id
                )
                db.add(user_role)
                db.commit()
                logger.info(f"Assigned super_admin role to {first_superuser.email}")


def create_ats_test_data(db: Session) -> None:
    """Create test data for ATS system (development only)"""
    if settings.ENVIRONMENT != "development":
        return
    
    logger.info("Creating ATS test data...")
    
    # Import RoleManager here
    from app.core.permissions import RoleManager
    
    # Create test users with different roles
    test_users = [
        {
            "email": "candidate@example.com",
            "password": "testpassword123",
            "full_name": "Test Candidate",
            "role": "job_candidate"
        },
        {
            "email": "employer@example.com", 
            "password": "testpassword123",
            "full_name": "Test Employer",
            "role": "employer"
        },
        {
            "email": "admin@example.com",
            "password": "testpassword123", 
            "full_name": "Test Admin",
            "role": "admin"
        }
    ]
    
    role_manager = RoleManager(db)
    
    for user_data in test_users:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data["email"]).first()
        
        if not existing_user:
            # Create user
            user_create = UserCreate(
                email=user_data["email"],
                password=user_data["password"],
                full_name=user_data["full_name"]
            )
            user = create_user(session=db, user_create=user_create)
            
            # Assign role
            role = role_manager.get_role_by_name(user_data["role"])
            if role:
                role_manager.assign_role_to_user(user.id, role.id)
                logger.info(f"Created test user {user.email} with role {user_data['role']}")


def reset_ats_system(db: Session) -> None:
    """Reset ATS system (WARNING: Deletes all ATS data)"""
    logger.warning("Resetting ATS system - this will delete all ATS data!")
    
    # Delete in reverse order of dependencies
    db.query(UserRole).delete()
    db.query(RolePermission).delete()
    db.query(Role).delete()
    db.query(Permission).delete()
    
    db.commit()
    logger.info("ATS system reset completed")


if __name__ == "__main__":
    logger.info("Creating initial data")
    init_db_and_ats()
    
    # Create test data in development
    with Session(engine) as session:
        create_ats_test_data(session)
    
    logger.info("Initial data created")








