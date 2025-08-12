# backend/app/modules/core_data/tests/test_api.py
"""
Tests for Core Data API endpoints
"""
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool
import uuid

from app.main import app
from app.api.deps import get_session
from app.modules.core_data.models import Job, Candidate, Application, JobStatus, ApplicationStatus


# Test database setup
@pytest.fixture(name="session")
def session_fixture():
    """Create test database session"""
    engine = create_engine(
        "sqlite://", 
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    """Create test client with database session"""
    def get_session_override():
        return session
    
    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


# Sample data fixtures
@pytest.fixture
def sample_job_data():
    """Sample job data for testing"""
    return {
        "title": "Senior Python Developer",
        "description": "Looking for an experienced Python developer to join our team.",
        "location": "San Francisco, CA",
        "department": "Engineering",
        "job_number": "ENG-2025-001",
        "status": "published",
        "priority": "high",
        "salary_min": 120000,
        "salary_max": 180000,
        "employment_type": "full-time",
        "remote_allowed": True,
        "experience_required": "5+ years",
        "required_skills": ["Python", "FastAPI", "PostgreSQL"],
        "preferred_skills": ["React", "Docker", "AWS"],
        "tags": ["engineering", "senior", "remote"]
    }


@pytest.fixture
def sample_candidate_data():
    """Sample candidate data for testing"""
    return {
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@example.com",
        "phone": "+1-555-123-4567",
        "current_title": "Python Developer",
        "current_company": "Tech Corp",
        "location": "San Francisco, CA",
        "linkedin_url": "https://linkedin.com/in/johndoe",
        "years_experience": 5,
        "skills": ["Python", "Django", "PostgreSQL", "React"],
        "source": "linkedin",
        "tags": ["python", "experienced"]
    }


# Job API Tests
class TestJobAPI:
    """Test Job API endpoints"""
    
    def test_create_job(self, client: TestClient, sample_job_data):
        """Test creating a job"""
        response = client.post("/api/v1/core-data/jobs", json=sample_job_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["title"] == sample_job_data["title"]
        assert data["job_number"] == sample_job_data["job_number"]
        assert data["status"] == sample_job_data["status"]
        assert "id" in data
        assert "created_at" in data
    
    def test_get_jobs(self, client: TestClient, sample_job_data):
        """Test getting jobs list"""
        # Create a job first
        client.post("/api/v1/core-data/jobs", json=sample_job_data)
        
        # Get jobs list
        response = client.get("/api/v1/core-data/jobs")
        assert response.status_code == 200
        
        data = response.json()
        assert "jobs" in data
        assert "total" in data
        assert "page" in data
        assert "per_page" in data
        assert len(data["jobs"]) >= 1
    
    def test_get_job_by_id(self, client: TestClient, sample_job_data):
        """Test getting a specific job"""
        # Create a job first
        create_response = client.post("/api/v1/core-data/jobs", json=sample_job_data)
        job_id = create_response.json()["id"]
        
        # Get the job
        response = client.get(f"/api/v1/core-data/jobs/{job_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == job_id
        assert data["title"] == sample_job_data["title"]
    
    def test_update_job(self, client: TestClient, sample_job_data):
        """Test updating a job"""
        # Create a job first
        create_response = client.post("/api/v1/core-data/jobs", json=sample_job_data)
        job_id = create_response.json()["id"]
        
        # Update the job
        update_data = {"title": "Updated Python Developer", "priority": "medium"}
        response = client.put(f"/api/v1/core-data/jobs/{job_id}", json=update_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["title"] == "Updated Python Developer"
        assert data["priority"] == "medium"
    
    def test_delete_job(self, client: TestClient, sample_job_data):
        """Test deleting a job"""
        # Create a job first
        create_response = client.post("/api/v1/core-data/jobs", json=sample_job_data)
        job_id = create_response.json()["id"]
        
        # Delete the job
        response = client.delete(f"/api/v1/core-data/jobs/{job_id}")
        assert response.status_code == 200
        
        # Try to get the deleted job
        get_response = client.get(f"/api/v1/core-data/jobs/{job_id}")
        assert get_response.status_code == 404
    
    def test_get_published_jobs(self, client: TestClient, sample_job_data):
        """Test getting published jobs for public job board"""
        # Create a published job
        client.post("/api/v1/core-data/jobs", json=sample_job_data)
        
        # Get published jobs
        response = client.get("/api/v1/core-data/jobs/published")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert all(job["status"] == "published" for job in data)


# Candidate API Tests
class TestCandidateAPI:
    """Test Candidate API endpoints"""
    
    def test_create_candidate(self, client: TestClient, sample_candidate_data):
        """Test creating a candidate"""
        response = client.post("/api/v1/core-data/candidates", json=sample_candidate_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["first_name"] == sample_candidate_data["first_name"]
        assert data["last_name"] == sample_candidate_data["last_name"]
        assert data["email"] == sample_candidate_data["email"]
        assert "id" in data
        assert "created_at" in data
    
    def test_get_candidates(self, client: TestClient, sample_candidate_data):
        """Test getting candidates list"""
        # Create a candidate first
        client.post("/api/v1/core-data/candidates", json=sample_candidate_data)
        
        # Get candidates list
        response = client.get("/api/v1/core-data/candidates")
        assert response.status_code == 200
        
        data = response.json()
        assert "candidates" in data
        assert "total" in data
        assert len(data["candidates"]) >= 1
    
    def test_duplicate_candidate_email(self, client: TestClient, sample_candidate_data):
        """Test that duplicate candidate emails are prevented"""
        # Create a candidate
        client.post("/api/v1/core-data/candidates", json=sample_candidate_data)
        
        # Try to create another candidate with the same email
        response = client.post("/api/v1/core-data/candidates", json=sample_candidate_data)
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]


# Application API Tests
class TestApplicationAPI:
    """Test Application API endpoints"""
    
    @pytest.fixture
    def job_and_candidate(self, client: TestClient, sample_job_data, sample_candidate_data):
        """Create a job and candidate for application tests"""
        # Create job
        job_response = client.post("/api/v1/core-data/jobs", json=sample_job_data)
        job_id = job_response.json()["id"]
        
        # Create candidate
        candidate_response = client.post("/api/v1/core-data/candidates", json=sample_candidate_data)
        candidate_id = candidate_response.json()["id"]
        
        return job_id, candidate_id
    
    def test_create_application(self, client: TestClient, job_and_candidate):
        """Test creating an application"""
        job_id, candidate_id = job_and_candidate
        
        application_data = {
            "job_id": job_id,
            "candidate_id": candidate_id,
            "status": "applied",
            "source": "website",
            "cover_letter": "I am very interested in this position..."
        }
        
        response = client.post("/api/v1/core-data/applications", json=application_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["job_id"] == job_id
        assert data["candidate_id"] == candidate_id
        assert data["status"] == "applied"
        assert "id" in data
    
    def test_get_applications(self, client: TestClient, job_and_candidate):
        """Test getting applications list"""
        job_id, candidate_id = job_and_candidate
        
        # Create an application first
        application_data = {
            "job_id": job_id,
            "candidate_id": candidate_id,
            "status": "applied"
        }
        client.post("/api/v1/core-data/applications", json=application_data)
        
        # Get applications list
        response = client.get("/api/v1/core-data/applications")
        assert response.status_code == 200
        
        data = response.json()
        assert "applications" in data
        assert "total" in data
        assert len(data["applications"]) >= 1
    
    def test_update_application_status(self, client: TestClient, job_and_candidate):
        """Test updating application status"""
        job_id, candidate_id = job_and_candidate
        
        # Create an application first
        application_data = {
            "job_id": job_id,
            "candidate_id": candidate_id,
            "status": "applied"
        }
        create_response = client.post("/api/v1/core-data/applications", json=application_data)
        application_id = create_response.json()["id"]
        
        # Update status
        response = client.put(
            f"/api/v1/core-data/applications/{application_id}/status",
            params={"status": "screening", "notes": "Initial screening passed"}
        )
        assert response.status_code == 200


# Integration Tests
class TestIntegration:
    """Test integration between different entities"""
    
    def test_full_application_flow(self, client: TestClient, sample_job_data, sample_candidate_data):
        """Test complete application flow"""
        # 1. Create a job
        job_response = client.post("/api/v1/core-data/jobs", json=sample_job_data)
        assert job_response.status_code == 200
        job_id = job_response.json()["id"]
        
        # 2. Create a candidate
        candidate_response = client.post("/api/v1/core-data/candidates", json=sample_candidate_data)
        assert candidate_response.status_code == 200
        candidate_id = candidate_response.json()["id"]
        
        # 3. Create an application
        application_data = {
            "job_id": job_id,
            "candidate_id": candidate_id,
            "status": "applied",
            "source": "website"
        }
        app_response = client.post("/api/v1/core-data/applications", json=application_data)
        assert app_response.status_code == 200
        application_id = app_response.json()["id"]
        
        # 4. Get application with details
        details_response = client.get(f"/api/v1/core-data/applications/{application_id}")
        assert details_response.status_code == 200
        
        app_details = details_response.json()
        assert app_details["job"]["title"] == sample_job_data["title"]
        assert app_details["candidate"]["email"] == sample_candidate_data["email"]
        
        # 5. Update application status
        status_response = client.put(
            f"/api/v1/core-data/applications/{application_id}/status",
            params={"status": "interview", "notes": "Moving to interview stage"}
        )
        assert status_response.status_code == 200


# Run tests with:
# pytest app/modules/core_data/tests/test_api.py -v