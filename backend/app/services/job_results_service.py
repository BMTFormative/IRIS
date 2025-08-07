import json
import os
from datetime import datetime
from typing import List, Dict, Any, Optional
import uuid
from pathlib import Path

class JobResultsStorage:
    """File-based storage for job matching results (similar to cv_storage.py)"""
    
    def __init__(self):
        self.base_dir = Path("data/job_results")
        self.sessions_dir = self.base_dir / "sessions"
        self.metadata_file = self.base_dir / "sessions_metadata.json"
        
        # Create directories
        self.base_dir.mkdir(exist_ok=True)
        self.sessions_dir.mkdir(exist_ok=True)
        
        # Initialize metadata file if it doesn't exist
        if not self.metadata_file.exists():
            self._init_metadata()
    
    def _init_metadata(self):
        """Initialize the metadata file"""
        metadata = {
            "total_sessions": 0,
            "sessions_by_status": {
                "completed": 0,
                "failed": 0
            },
            "last_cleanup": None,
            "session_registry": {}
        }
        with open(self.metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)
    
    def _load_metadata(self) -> Dict[str, Any]:
        """Load metadata from file"""
        try:
            with open(self.metadata_file, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            self._init_metadata()
            return self._load_metadata()
    
    def _save_metadata(self, metadata: Dict[str, Any]):
        """Save metadata to file"""
        with open(self.metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)
    
    def save_session_results(self, 
                           job_title: str,
                           job_description: str,
                           elimination_conditions: str,
                           qualification_threshold: float,
                           candidates_data: List[Dict[str, Any]],
                           user_id: Optional[str] = None) -> str:
        """Save complete job matching session results"""
        
        session_id = str(uuid.uuid4())
        timestamp = datetime.now()
        
        # Count qualified candidates
        qualified_count = sum(1 for c in candidates_data if c.get('is_qualified', False))
        
        # Create session data (NO CV FILES STORED - only extracted data)
        session_data = {
            "id": session_id,
            "job_title": job_title,
            "job_description": job_description,
            "elimination_conditions": elimination_conditions,
            "qualification_threshold": qualification_threshold,
            "created_at": timestamp.isoformat(),
            "total_candidates": len(candidates_data),
            "qualified_candidates": qualified_count,
            "status": "completed",
            "user_id": user_id,
            "candidates": []
        }
        
        # Process candidate data (extract key info only - NO CV CONTENT)
        for idx, candidate in enumerate(candidates_data):
            candidate_summary = {
                "id": str(uuid.uuid4()),
                "candidate_name": candidate.get('name'),
                "email": candidate.get('email'),
                "phone": candidate.get('phone'),
                "qualification_score": candidate.get('qualification_score'),
                "is_qualified": candidate.get('is_qualified', False),
                "rejection_reasons": candidate.get('rejection_reasons', []),
                "key_strengths": candidate.get('key_strengths', []),
                "experience_summary": candidate.get('experience_summary'),
                "skills_summary": candidate.get('skills_summary'),
                "education_summary": candidate.get('education_summary'),
                "interview_questions": candidate.get('interview_questions', []),
                "analysis_timestamp": timestamp.isoformat()
            }
            session_data["candidates"].append(candidate_summary)
        
        # Save session file
        session_file = self.sessions_dir / f"{session_id}.json"
        with open(session_file, 'w', encoding='utf-8') as f:
            json.dump(session_data, f, indent=2, ensure_ascii=False)
        
        # Update metadata
        metadata = self._load_metadata()
        metadata["total_sessions"] += 1
        metadata["sessions_by_status"]["completed"] += 1
        metadata["session_registry"][session_id] = {
            "job_title": job_title,
            "created_at": timestamp.isoformat(),
            "total_candidates": len(candidates_data),
            "qualified_candidates": qualified_count,
            "status": "completed",
            "file_path": str(session_file)
        }
        
        self._save_metadata(metadata)
        
        return session_id
    
    def get_all_sessions(self, user_id: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        """Get list of all saved sessions"""
        metadata = self._load_metadata()
        sessions = []
        
        # Get sessions from registry (most recent first)
        session_items = list(metadata["session_registry"].items())
        session_items.sort(key=lambda x: x[1]["created_at"], reverse=True)
        
        for session_id, session_info in session_items[:limit]:
            # If user filtering is needed and implemented
            sessions.append({
                "id": session_id,
                "job_title": session_info["job_title"],
                "created_at": session_info["created_at"],
                "total_candidates": session_info["total_candidates"],
                "qualified_candidates": session_info["qualified_candidates"],
                "status": session_info["status"]
            })
        
        return sessions
    
    def get_session_details(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get detailed results for a specific session"""
        session_file = self.sessions_dir / f"{session_id}.json"
        
        if not session_file.exists():
            return None
        
        try:
            with open(session_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            return None
    
    def delete_session(self, session_id: str) -> bool:
        """Delete a saved session"""
        try:
            # Delete session file
            session_file = self.sessions_dir / f"{session_id}.json"
            if session_file.exists():
                session_file.unlink()
            
            # Update metadata
            metadata = self._load_metadata()
            if session_id in metadata["session_registry"]:
                del metadata["session_registry"][session_id]
                metadata["total_sessions"] -= 1
                metadata["sessions_by_status"]["completed"] -= 1
            
            self._save_metadata(metadata)
            return True
            
        except Exception:
            return False

# Singleton instance
job_results_storage = JobResultsStorage()