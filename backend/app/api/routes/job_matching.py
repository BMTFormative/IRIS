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

from app.core.o3_client import get_o3_client

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/job-matching", tags=["job-matching"])

# Initialize O3 client
o3_client = get_o3_client()

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
    if not o3_client:
        return JSONResponse({
            "status": "error",
            "service": "Job Matching System",
            "error": "O3 client not initialized - check OPENAI_API_KEY"
        })
    
    o3_health = await o3_client.health_check()
    return JSONResponse({
        "status": "healthy" if o3_health.get("status") == "healthy" else "error",
        "service": "Job Matching System", 
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "o3_status": o3_health
    })

@router.post("/upload-cvs")
async def upload_cvs(files: List[UploadFile] = File(...)):
    """Upload CV files for analysis"""
    try:
        # Create temp directory for uploads
        temp_dir = Path("temp_uploads")
        temp_dir.mkdir(parents=True, exist_ok=True)
        
        saved_files = []
        file_ids = {}
        
        for upload in files:
            filename = upload.filename or f"file_{uuid.uuid4().hex}"
            unique_name = f"{uuid.uuid4().hex}_{filename}"
            dest_path = temp_dir / unique_name
            
            # Save file
            content = await upload.read()
            with open(dest_path, "wb") as f:
                f.write(content)
            
            # Extract text content
            text_content = await extract_text_content(dest_path, filename)
            
            file_id = f"file_{uuid.uuid4().hex}"
            file_ids[filename] = file_id
            
            saved_files.append({
                "id": file_id,
                "name": filename,
                "path": str(dest_path),
                "size": len(content),
                "content": text_content,
                "type": filename.split('.')[-1].lower() if '.' in filename else 'unknown',
                "status": 'uploaded' if text_content else 'failed'
            })
        
        logger.info(f"Successfully uploaded {len(saved_files)} CV files")
        
        return JSONResponse({
            "success": True,
            "uploaded_files": len(saved_files),
            "files": saved_files,
            "message": f"Uploaded {len(saved_files)} CV files successfully"
        })
        
    except Exception as e:
        logger.error(f"CV upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

@router.post("/analyze")
async def analyze_candidates(request: CVAnalysisRequest):
    """Analyze candidates using O3 AI"""
    try:
        if not o3_client:
            raise HTTPException(
                status_code=503, 
                detail="O3 service not available. Check OPENAI_API_KEY configuration."
            )
        
        if not request.job_description.strip():
            raise HTTPException(status_code=400, detail="Job description is required")
        
        if not request.cvs:
            raise HTTPException(status_code=400, detail="At least one CV is required")
        
        logger.info(f"Starting O3 analysis for {len(request.cvs)} candidates")
        
        # Call O3 for batch screening
        result = await o3_client.batch_screening(
            cvs=request.cvs,
            job_description=request.job_description,
            qualification_threshold=request.qualification_threshold,
            elimination_conditions=request.elimination_conditions
        )
        
        logger.info(f"O3 analysis completed successfully")
        
        return JSONResponse({
            "success": True,
            "analysis": result,
            "timestamp": datetime.now().isoformat()
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

async def extract_text_content(file_path: Path, filename: str) -> str:
    """Extract text content from uploaded files"""
    try:
        if filename.lower().endswith('.txt'):
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                return f.read()
        
        elif filename.lower().endswith('.pdf'):
            try:
                # Try to import and use PyPDF2
                from PyPDF2 import PdfReader
                reader = PdfReader(file_path)
                pages = [page.extract_text() or '' for page in reader.pages]
                return '\n'.join(pages)
            except ImportError:
                logger.warning("PyPDF2 not available, cannot parse PDF files")
                return f"PDF file: {filename} (text extraction not available)"
            except Exception as e:
                logger.warning(f"Failed to parse PDF {filename}: {e}")
                return f"PDF file: {filename} (failed to extract text)"
        
        elif filename.lower().endswith('.docx'):
            try:
                # Try to import and use python-docx
                from docx import Document
                doc = Document(file_path)
                paragraphs = [p.text for p in doc.paragraphs]
                return '\n'.join(paragraphs)
            except ImportError:
                logger.warning("python-docx not available, cannot parse DOCX files")
                return f"DOCX file: {filename} (text extraction not available)"
            except Exception as e:
                logger.warning(f"Failed to parse DOCX {filename}: {e}")
                return f"DOCX file: {filename} (failed to extract text)"
        
        else:
            logger.warning(f"Unsupported file format: {filename}")
            return f"Unsupported file: {filename}"
            
    except Exception as e:
        logger.error(f"Error extracting text from {filename}: {e}")
        return f"Error reading file: {filename}"