#!/usr/bin/env python3
"""
O3 Job Matching System - Final Clean Implementation
Advanced AI recruitment platform powered by OpenAI o3-2025-04-16
No Claude/Anthropic dependencies - Pure O3 implementation
"""

import os
import sys
import asyncio
import logging
import json
from pathlib import Path
from typing import List, Optional, Dict, Any
from datetime import datetime

# FastAPI imports
from fastapi import FastAPI, Request, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import uuid

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("Warning: python-dotenv not installed. Using environment variables directly.")

# Add src directory to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

# Import O3 client - using simplified version
try:
    from src.o3_client_simplified import O3ClientSimplified, get_o3_client_simplified
    print("✅ O3 Client (Simplified) imported successfully")
except ImportError as e:
    print(f"❌ O3 Client not available: {e}")
    print("Please install dependencies: pip install openai")
    sys.exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="O3 Job Matching System",
    description="Advanced AI recruitment platform powered by OpenAI o3-2025-04-16 with HIGH reasoning effort",
    version="2.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files and templates
STATIC_DIR = Path(__file__).parent / "static"
TEMPLATES_DIR = Path(__file__).parent / "templates"

app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))

# Initialize O3 client - simplified version
try:
    o3_client = get_o3_client_simplified()
    if o3_client:
        logger.info("✅ O3 Client (Simplified) initialized successfully with HIGH reasoning mode")
    else:
        logger.warning("⚠️ O3 Client initialization failed - check OPENAI_API_KEY")
except Exception as e:
    logger.error(f"❌ O3 Client error: {e}")
    o3_client = None

# Global storage for sessions (in production, use Redis or database)
active_sessions: Dict[str, Dict[str, Any]] = {}

# ===============================
# ROUTES
# ===============================

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """O3 Job Matching main interface"""
    return templates.TemplateResponse("o3_job_matching.html", {"request": request})

@app.get("/health")
async def health_check():
    """System health check endpoint"""
    return JSONResponse({
        "status": "healthy",
        "service": "O3 Job Matching System",
        "version": "2.0.0",
        "timestamp": datetime.now().isoformat(),
        "model": "o3-2025-04-16",
        "reasoning_effort": "high",
        "o3_available": o3_client is not None,
        "features": [
            "HIGH Reasoning Mode",
            "Executive Dashboard Generation", 
            "Real-time Streaming Analysis",
            "Interactive Candidate Selection"
        ]
    })

@app.get("/api/o3/health")
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

@app.post("/api/upload-cvs")
async def upload_cvs(files: List[UploadFile] = File(...)):
    """Upload CV files for O3 processing"""
    try:
        temp_dir = Path(__file__).parent / "temp_uploads"
        temp_dir.mkdir(parents=True, exist_ok=True)
        
        saved_files = []
        file_ids = {}
        
        for upload in files:
            filename = upload.filename
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

@app.post("/api/o3/screening-stream")
async def o3_screening_stream(request: Request):
    """Stream O3 screening results with HIGH reasoning effort"""
    try:
        data = await request.json()
        job_title = data.get("job_title", "")
        job_description = data.get("job_description", "")
        cvs = data.get("cvs", [])
        reasoning_effort = data.get("reasoning_effort", "high")
        qualification_threshold = data.get("qualification_threshold", None)
        elimination_conditions = data.get("elimination_conditions", None)
        
        # Validate inputs
        if not job_description.strip():
            raise HTTPException(status_code=400, detail="Job description is required")
        if not cvs:
            raise HTTPException(status_code=400, detail="At least one CV is required")
        if not o3_client:
            raise HTTPException(status_code=503, detail="O3 service not available. Check OPENAI_API_KEY configuration.")
        
        # Convert uploaded files to CV data format for O3 processing
        cv_data = []
        for i, cv_file in enumerate(cvs):
            # Ensure we get the actual content, not the fallback text
            actual_content = cv_file.get("content", "")
            if not actual_content or actual_content.startswith("CV content for"):
                # Fallback: try to read the file directly if content is missing or placeholder
                logger.warning(f"No real content found for {cv_file.get('name')}, using placeholder")
                actual_content = f"Candidate name: {cv_file.get('name', f'Candidate_{i}')} - Content extraction needed"
            
            cv_data.append({
                "id": cv_file.get("id", f"cv_{i}"),
                "name": cv_file.get("name", f"Candidate_{i}"),
                "filename": cv_file.get("name", f"candidate_{i}.txt"),
                "content": actual_content
            })
            
            # Debug: Log the content preview being used
            logger.info(f"Using content for {cv_file.get('name')}: {actual_content[:100]}..." if len(actual_content) > 100 else f"Using content for {cv_file.get('name')}: {actual_content}")
        
        logger.info(f"Starting O3 screening stream for {len(cv_data)} candidates with HIGH reasoning")
        
        # Stream the screening process in parallel batches
        async def screening_stream():
            total = len(cv_data)
            batch_size = 20
            batches = [cv_data[i:i+batch_size] for i in range(0, total, batch_size)]
            sem = asyncio.Semaphore(10)
            
            # Initial event
            start_evt = {
                "event": "screening_started",
                "data": {"total_candidates": total,
                         "qualification_threshold": qualification_threshold,
                         "elimination_conditions": elimination_conditions,
                         "message": "IRIS HIGH reasoning analysis starting..."}
            }
            yield f"data: {json.dumps(start_evt)}\n\n"

            # Worker to screen one batch
            async def process_batch(idx, batch):
                async with sem:
                    # Notify batch start
                    msg = f"Processing batch {idx+1}/{len(batches)} (candidates {idx*batch_size+1}-{min((idx+1)*batch_size,total)})..."
                    evt1 = {"event": "batch_processing", "data": {"batch_idx": idx,
                            "message": msg,
                            "progress": (idx/len(batches))*100}}
                    # Perform screening with elimination conditions
                    result = await o3_client.batch_screening(batch, job_description, qualification_threshold, elimination_conditions)
                    out = result.get("candidates", [])
                    # Notify batch complete
                    evt2 = {"event": "batch_complete", "data": {"batch_idx": idx,
                            "batch_results": out,
                            "processed": min((idx+1)*batch_size,total),
                            "total": total,
                            "progress": ((idx+1)/len(batches))*100}}
                    return [evt1, evt2]

            # Launch tasks concurrently
            tasks = [asyncio.create_task(process_batch(i, b)) for i,b in enumerate(batches)]
            for task in asyncio.as_completed(tasks):
                try:
                    evts = await task
                    for e in evts:
                        yield f"data: {json.dumps(e)}\n\n"
                except Exception as e:
                    err = {"event": "error", "data": {"error": str(e),
                          "message": "Batch processing error"}}
                    yield f"data: {json.dumps(err)}\n\n"

            # Final completion event
            complete = {"event": "screening_complete", "data": {"message": "IRIS screening complete!"}}
            yield f"data: {json.dumps(complete)}\n\n"
        
        return StreamingResponse(
            screening_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "X-Accel-Buffering": "no"  # Disable nginx buffering
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"O3 screening stream setup error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to start screening: {str(e)}")

@app.post("/api/o3/deep-analysis")
async def o3_deep_analysis(request: Request):
    """Perform O3 deep analysis with HIGH reasoning effort"""
    try:
        data = await request.json()
        candidates = data.get("candidates", [])
        job_title = data.get("job_title", "")
        job_description = data.get("job_description", "")
        reasoning_effort = data.get("reasoning_effort", "high")
        
        # Validate inputs
        if not candidates:
            raise HTTPException(status_code=400, detail="No candidates provided for analysis")
        if not job_description.strip():
            raise HTTPException(status_code=400, detail="Job description is required")
        if not o3_client:
            raise HTTPException(status_code=503, detail="O3 service not available. Check OPENAI_API_KEY configuration.")
        
        logger.info(f"Starting O3 deep analysis for {len(candidates)} candidates with HIGH reasoning")
        
        # Perform deep analysis using O3
        # Call deep_analysis with job title to personalize the prompt
        analysis_result = await o3_client.deep_analysis(candidates, job_description, job_title)
        
        if "error" in analysis_result:
            logger.error(f"O3 deep analysis failed: {analysis_result['error']}")
            raise HTTPException(status_code=500, detail=analysis_result["error"])
        
        logger.info(f"O3 deep analysis completed successfully for {len(candidates)} candidates")
        
        return JSONResponse({
            "success": True,
            "dashboard": analysis_result["dashboard_content"],
            "html_content": analysis_result["html_content"],
            "analysis_metadata": analysis_result["analysis_metadata"],
            "executive_summary": analysis_result.get("executive_summary", {}),
            "candidates_analyzed": len(candidates),
            "timestamp": datetime.now().isoformat()
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"O3 deep analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Deep analysis failed: {str(e)}")

@app.get("/api/sessions")
async def list_active_sessions():
    """List all active analysis sessions"""
    try:
        sessions_info = []
        for session_id, session_data in active_sessions.items():
            sessions_info.append({
                "session_id": session_id,
                "created_at": session_data.get("created_at"),
                "status": session_data.get("status", "unknown"),
                "candidates_count": session_data.get("candidates_count", 0)
            })
        
        return JSONResponse({
            "active_sessions": sessions_info,
            "total_sessions": len(sessions_info),
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error listing sessions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ===============================
# ERROR HANDLERS
# ===============================

@app.exception_handler(404)
async def not_found_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=404,
        content={
            "error": "Resource not found", 
            "detail": str(exc.detail),
            "path": str(request.url.path),
            "timestamp": datetime.now().isoformat()
        }
    )

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error", 
            "detail": str(exc.detail),
            "timestamp": datetime.now().isoformat()
        }
    )

# ===============================
# APPLICATION LIFECYCLE
# ===============================

@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    logger.info("🚀 Starting O3 Job Matching System")
    logger.info(f"📁 Static files directory: {STATIC_DIR}")
    logger.info(f"📄 Templates directory: {TEMPLATES_DIR}")
    
    # Verify O3 client
    if o3_client:
        try:
            health = await o3_client.health_check()
            if health.get("status") == "healthy":
                logger.info("✅ O3 model is healthy and ready")
            else:
                logger.warning(f"⚠️ O3 model health check failed: {health}")
        except Exception as e:
            logger.warning(f"⚠️ Could not verify O3 model health: {e}")
    else:
        logger.warning("⚠️ O3 client not available - check OPENAI_API_KEY")
    
    logger.info("✅ O3 Job Matching System ready!")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("🛑 Shutting down O3 Job Matching System")
    # Cleanup active sessions
    active_sessions.clear()
    logger.info("✅ Cleanup completed")

# ===============================
# MAIN APPLICATION
# ===============================

def main():
    """Main application entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description="O3 Job Matching System - Clean Implementation")
    parser.add_argument("--host", default="0.0.0.0", help="Host to bind to")
    parser.add_argument("--port", default=8000, type=int, help="Port to bind to")
    parser.add_argument("--reload", action="store_true", help="Enable auto-reload for development")
    parser.add_argument("--debug", action="store_true", help="Enable debug mode")
    
    args = parser.parse_args()
    
    if args.debug:
        logging.getLogger().setLevel(logging.DEBUG)
        logger.debug("Debug mode enabled")
    
    # Display startup information
    print("🎯 O3 Job Matching System - Clean Implementation")
    print("=" * 65)
    print(f"🌐 Server: http://{args.host}:{args.port}")
    print(f"🧠 O3 Interface: http://{args.host}:{args.port}")
    print(f"📊 API Documentation: http://{args.host}:{args.port}/docs")
    print(f"🔍 Health Check: http://{args.host}:{args.port}/health")
    print(f"🤖 O3 Model Health: http://{args.host}:{args.port}/api/o3/health")
    print("=" * 65)
    print("✨ Features:")
    print("   • HIGH Reasoning Mode with o3-2025-04-16")
    print("   • Executive Dashboard Generation")
    print("   • Real-time Streaming Analysis")
    print("   • Interactive Candidate Selection")
    print("   • Clean Implementation (No Legacy Dependencies)")
    print("=" * 65)
    
    # Check configuration
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key == "your-openai-api-key-here":
        print("⚠️  WARNING: OPENAI_API_KEY not configured properly!")
        print("   Please set your OpenAI API key in the .env file")
        print("   Example: OPENAI_API_KEY=sk-proj-your-key-here")
        if api_key:
            print(f"   Current key: {api_key[:20]}...")
    else:
        print(f"✅ OpenAI API Key configured: {api_key[:20]}...")
    
    print("=" * 65)
    print("Press Ctrl+C to stop the server")
    print()
    
    try:
        uvicorn.run(
            "main:app",
            host=args.host,
            port=args.port,
            reload=args.reload,
            log_level="info" if not args.debug else "debug"
        )
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"\n❌ Server error: {e}")
        print("\nTroubleshooting:")
        print("  1. Install required dependencies:")
        print("     pip install fastapi uvicorn python-multipart jinja2 openai python-dotenv")
        print("  2. Check your .env file configuration")
        print("  3. Verify internet connectivity")

if __name__ == "__main__":
    main()