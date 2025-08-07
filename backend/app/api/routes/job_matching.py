# backend/app/api/routes/job_matching.py
import uuid
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime

from fastapi import APIRouter, File, UploadFile, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import json

from app.core.o3_client_simplified import get_o3_client_simplified
from app.services.job_results_service import job_results_storage
from app.Models.job_results_storage import SavedSessionSummary,SessionDetailsResponse,SaveSessionRequest
# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/job-matching", tags=["job-matching"])

# Initialize O3 client
try:
    o3_client = get_o3_client_simplified()
    if o3_client:
        logger.info("✅ O3 Client (Simplified) initialized successfully with HIGH reasoning mode")
    else:
        logger.warning("⚠️ O3 Client initialization failed - check OPENAI_API_KEY")
except Exception as e:
    logger.error(f"❌ O3 Client error: {e}")
    o3_client = None

# Pydantic models
class JobPositionRequest(BaseModel):
    job_title: str
    job_description: str
    mandatory_conditions: Optional[str] = None
    qualification_threshold: float = 85.0

class CVAnalysisRequest(BaseModel):
    job_title: str
    job_description: str
    cvs: List[Dict[str, Any]]
    qualification_threshold: float = 85.0
    elimination_conditions: Optional[str] = None

@router.get("/health")
async def health_check():
    """Job matching system health check"""
    try:
        if not o3_client:
            return JSONResponse({
                "status": "unavailable",
                "model": "o3-2025-04-16",
                "error": "O3 client not initialized. Please check OPENAI_API_KEY in .env file",
                "troubleshooting": [
                    "Ensure OPENAI_API_KEY is set in .env file",
                    "Verify API key has access to o3-2025-04-16 model",
                    "Check internet connectivity"
                ]
            })
        
        health_status = await o3_client.health_check()
        return JSONResponse(health_status)
        
    except Exception as e:
        logger.error(f"O3 health check error: {str(e)}")
        return JSONResponse({
            "status": "error",
            "model": "o3-2025-04-16",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        })

@router.post("/upload-cvs")
async def upload_cvs(files: List[UploadFile] = File(...)):
    """Upload CV files for O3 processing"""
    try:
        temp_dir = Path(__file__).parent.parent.parent.parent / "temp_uploads"
        temp_dir.mkdir(parents=True, exist_ok=True)
        
        saved_files = []
        file_ids = {}
        
        for upload in files:
            filename = upload.filename or f"file_{uuid.uuid4().hex}"
            unique_name = f"{uuid.uuid4().hex}_{filename}"
            dest_path = temp_dir / unique_name
            
            content = await upload.read()
            with open(dest_path, "wb") as f:
                f.write(content)
            
            # Extract text content for processing and track parse status
            parse_ok = True
            text_content = ''
            logger.info(f"Processing file: {filename}")
            try:
                if filename.lower().endswith('.txt'):
                    with open(dest_path, 'r', encoding='utf-8', errors='ignore') as f:
                        text_content = f.read()
                    logger.info(f"Extracted {len(text_content)} chars from TXT file: {filename}")
                elif filename.lower().endswith('.pdf'):
                    try:
                        from PyPDF2 import PdfReader
                        reader = PdfReader(dest_path)
                        pages = [page.extract_text() or '' for page in reader.pages]
                        text_content = '\n'.join(pages)
                        logger.info(f"Extracted {len(text_content)} chars from PDF file: {filename}")
                    except Exception as parse_error:
                        parse_ok = False
                        logger.warning(f"Failed to parse PDF {filename}: {parse_error}")
                        text_content = ''
                elif filename.lower().endswith('.docx'):
                    try:
                        from docx import Document
                        doc = Document(dest_path)
                        paragraphs = [p.text for p in doc.paragraphs]
                        text_content = '\n'.join(paragraphs)
                        logger.info(f"Extracted {len(text_content)} chars from DOCX file: {filename}")
                    except Exception as parse_error:
                        parse_ok = False
                        logger.warning(f"Failed to parse DOCX {filename}: {parse_error}")
                        text_content = ''
                else:
                    parse_ok = False
                    logger.warning(f"Unsupported file format: {filename}")
                    text_content = ''
            except Exception as parse_error:
                parse_ok = False
                logger.warning(f"Failed to parse {filename}: {parse_error}")
                text_content = ''
            
            file_id = f"file_{uuid.uuid4().hex}"
            file_ids[filename] = file_id
            
            # Include parse status
            status = 'uploaded' if parse_ok else 'failed'
            saved_files.append({
                "name": filename,
                "path": str(dest_path),
                "size": len(content),
                "id": file_id,
                "content": text_content,
                "type": filename.split('.')[-1].lower() if '.' in filename else 'unknown',
                "status": status
            })
        
        logger.info(f"Successfully uploaded {len(saved_files)} CV files for O3 processing")
        
        return JSONResponse({
            "success": True,
            "uploaded_files": len(saved_files),
            "files": saved_files,
            "file_ids": file_ids,
            "message": f"Uploaded {len(saved_files)} CV files successfully"
        })
        
    except Exception as e:
        logger.error(f"CV upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

@router.post("/analyze")
async def analyze_candidates(request: CVAnalysisRequest):
    """Stream O3 screening results with HIGH reasoning effort"""
    try:
        job_title = request.job_title
        job_description = request.job_description
        cvs = request.cvs
        reasoning_effort = "high"
        qualification_threshold = request.qualification_threshold
        elimination_conditions = request.elimination_conditions
        
        # Validate inputs
        if not job_description.strip():
            raise HTTPException(status_code=400, detail="Job description is required")
        if not cvs:
            raise HTTPException(status_code=400, detail="At least one CV is required")
        if not o3_client:
            raise HTTPException(status_code=503, detail="O3 service not available. Check OPENAI_API_KEY configuration.")
        
        logger.info(f"🚀 Starting O3 batch screening for {len(cvs)} candidates")
        logger.info(f"📊 Qualification threshold: {qualification_threshold}%")
        logger.info(f"🎯 Job title: {job_title}")
        logger.info(f"⚡ Reasoning effort: {reasoning_effort}")
        
        # Call O3 for batch screening
        screening_result = await o3_client.batch_screening(
            cvs=cvs,
            job_description=job_description,
            qualification_threshold=qualification_threshold,
            elimination_conditions=elimination_conditions
        )
        
        logger.info(f"✅ O3 screening completed successfully")
        logger.info(f"📈 Results: {screening_result.get('summary', {}).get('qualified_count', 0)} qualified candidates")
        
        return JSONResponse({
            "success": True,
            "analysis": screening_result,
            "metadata": {
                "job_title": job_title,
                "total_candidates": len(cvs),
                "qualification_threshold": qualification_threshold,
                "reasoning_effort": reasoning_effort,
                "timestamp": datetime.now().isoformat()
            }
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ O3 screening analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.get("/api/o3/health")
async def o3_health_check():
    """Check O3 model availability and performance"""
    try:
        if not o3_client:
            return JSONResponse({
                "status": "unavailable",
                "model": "o3-2025-04-16",
                "error": "O3 client not initialized. Please check OPENAI_API_KEY in .env file",
                "troubleshooting": [
                    "Ensure OPENAI_API_KEY is set in .env file",
                    "Verify API key has access to o3-2025-04-16 model", 
                    "Check internet connectivity"
                ]
            })
        
        health_status = await o3_client.health_check()
        return JSONResponse(health_status)
        
    except Exception as e:
        logger.error(f"O3 health check error: {str(e)}")
        return JSONResponse({
            "status": "error",
            "model": "o3-2025-04-16",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        })
@router.post("/save-results")
async def save_matching_results(request: SaveSessionRequest):
    """Save job matching results for future reference (NO CV FILES STORED)"""
    try:
        session_id = job_results_storage.save_session_results(
            job_title=request.job_title,
            job_description=request.job_description,
            elimination_conditions=request.elimination_conditions,
            qualification_threshold=request.qualification_threshold,
            candidates_data=request.candidates,
            user_id=None  # Add user_id if you have authentication
        )
        
        logger.info(f"Successfully saved job matching session: {session_id}")
        
        return JSONResponse({
            "success": True,
            "session_id": session_id,
            "message": "Results saved successfully"
        })
        
    except Exception as e:
        logger.error(f"Error saving results: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save results: {str(e)}")

@router.get("/saved-sessions")
async def get_saved_sessions(limit: int = 50):
    """Get list of saved job matching sessions"""
    try:
        sessions = job_results_storage.get_all_sessions(
            user_id=None,  # Add user filtering if needed
            limit=limit
        )
        
        return JSONResponse({
            "success": True,
            "sessions": sessions
        })
        
    except Exception as e:
        logger.error(f"Error fetching saved sessions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch sessions: {str(e)}")

@router.get("/session/{session_id}")
async def get_session_details(session_id: str):
    """Get detailed results for a specific session"""
    try:
        details = job_results_storage.get_session_details(session_id)
        
        if not details:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return JSONResponse({
            "success": True,
            "data": details
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching session details: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch session: {str(e)}")

@router.delete("/session/{session_id}")
async def delete_saved_session(session_id: str):
    """Delete a saved job matching session"""
    try:
        success = job_results_storage.delete_session(session_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Session not found or could not be deleted")
        
        return JSONResponse({
            "success": True,
            "message": "Session deleted successfully"
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting session: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete session: {str(e)}")