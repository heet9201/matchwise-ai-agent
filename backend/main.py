from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.exceptions import RequestValidationError
from typing import List, Optional, AsyncGenerator, Dict
from pydantic import BaseModel, Field, validator
import uvicorn
import os
import logging
import datetime
import json
import asyncio
import httpx
from dotenv import load_dotenv, dotenv_values
from app.models import JobDescription, ResumeAnalysis
from app.services.ai_service import AIService
from app.services.file_service import FileService
from app.services.email_service import EmailService
from app.schemas import JobDescriptionRequest, ResumeAnalysisResult, APIResponse

# Configure logging with more detailed format
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Load and validate environment variables
load_dotenv()
required_env_vars = ['GROQ_API_KEY_1']
missing_vars = [var for var in required_env_vars if not os.getenv(var)]
if missing_vars:
    raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")

app = FastAPI(
    title="MatchWise API",
    description="Smart matching API for both recruiters and candidates - AI-powered resume analysis and job matching",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_tags=[
        {"name": "Health", "description": "Health check endpoints"},
        {"name": "Job Description", "description": "Job description generation and processing"},
        {"name": "Resume Analysis", "description": "Resume analysis and scoring endpoints"}
    ]
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom exception classes
class ServiceInitializationError(Exception):
    pass

class FileProcessingError(Exception):
    pass

class AIServiceError(Exception):
    pass

# Initialize services with better error handling
try:
    ai_service = AIService()
    file_service = FileService()
    email_service = EmailService()
    logger.info("All services initialized successfully")
except Exception as e:
    logger.error(f"Error initializing services: {str(e)}")
    raise ServiceInitializationError(f"Failed to initialize services: {str(e)}")

# Background task control
keep_alive_task = None
shutdown_event = asyncio.Event()

def get_env_value(key: str, default: str = None) -> str:
    """
    Get environment variable value by reloading .env file.
    This ensures we always get the latest value from .env.
    """
    # Get the .env file path
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    if os.path.exists(env_path):
        # Reload .env values
        env_values = dotenv_values(env_path)
        return env_values.get(key, default)
    return os.getenv(key, default)

async def keep_alive_ping():
    """
    Background task that periodically pings both backend and frontend URLs to keep them alive.
    Dynamically reads the frequency and URLs from .env file each cycle.
    """
    logger.info("🔄 Keep-alive background task started")
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        while not shutdown_event.is_set():
            try:
                # Dynamically load configuration from .env (fresh read each time)
                keep_alive_enabled = get_env_value('KEEP_ALIVE_ENABLED', 'false').lower() == 'true'
                
                if not keep_alive_enabled:
                    logger.debug("Keep-alive is disabled in .env, waiting 60s before checking again")
                    await asyncio.sleep(60)
                    continue
                
                # Get frequency in minutes and convert to seconds
                frequency_minutes = int(get_env_value('KEEP_ALIVE_FREQUENCY_MINUTES', '5'))
                frequency_seconds = frequency_minutes * 60
                
                # Get backend and frontend URLs
                backend_url = get_env_value('KEEP_ALIVE_BACKEND_URL', 'http://localhost:8000')
                frontend_url = get_env_value('KEEP_ALIVE_FRONTEND_URL', 'http://localhost:3000')
                
                logger.info(f"⏰ Keep-alive: Pinging backend and frontend (frequency: {frequency_minutes} minutes)")
                
                # Ping backend
                try:
                    backend_response = await client.get(f"{backend_url}/health")
                    if backend_response.status_code == 200:
                        logger.info(f"✓ Backend ping successful: {backend_url} (status: {backend_response.status_code})")
                    else:
                        logger.warning(f"⚠ Backend ping returned status: {backend_response.status_code}")
                except httpx.TimeoutException:
                    logger.warning(f"⏱ Backend ping timeout: {backend_url}")
                except httpx.ConnectError:
                    logger.warning(f"⚠ Backend ping connection error: {backend_url}")
                except Exception as e:
                    logger.error(f"❌ Backend ping error: {str(e)}")
                
                # Ping frontend
                try:
                    frontend_response = await client.get(frontend_url)
                    if frontend_response.status_code == 200:
                        logger.info(f"✓ Frontend ping successful: {frontend_url} (status: {frontend_response.status_code})")
                    else:
                        logger.warning(f"⚠ Frontend ping returned status: {frontend_response.status_code}")
                except httpx.TimeoutException:
                    logger.warning(f"⏱ Frontend ping timeout: {frontend_url}")
                except httpx.ConnectError:
                    logger.warning(f"⚠ Frontend ping connection error: {frontend_url}")
                except Exception as e:
                    logger.error(f"❌ Frontend ping error: {str(e)}")
                
            except ValueError as e:
                logger.error(f"❌ Invalid KEEP_ALIVE_FREQUENCY_MINUTES value: {e}")
                frequency_seconds = 300  # Fallback to 5 minutes
            except Exception as e:
                logger.error(f"❌ Keep-alive ping error: {str(e)}")
            
            # Wait for the configured frequency or until shutdown
            try:
                await asyncio.wait_for(shutdown_event.wait(), timeout=frequency_seconds)
                break  # If shutdown_event is set, exit the loop
            except asyncio.TimeoutError:
                continue  # Timeout means it's time for the next ping

    logger.info("🛑 Keep-alive background task stopped")

@app.on_event("startup")
async def startup_event():
    """Start background tasks on application startup"""
    global keep_alive_task
    
    # Check if keep-alive is enabled
    keep_alive_enabled = get_env_value('KEEP_ALIVE_ENABLED', 'false').lower() == 'true'
    
    if keep_alive_enabled:
        frequency_minutes = get_env_value('KEEP_ALIVE_FREQUENCY_MINUTES', '5')
        backend_url = get_env_value('KEEP_ALIVE_BACKEND_URL', 'http://localhost:8000')
        frontend_url = get_env_value('KEEP_ALIVE_FRONTEND_URL', 'http://localhost:3000')
        logger.info(f"🚀 Starting keep-alive task (frequency: {frequency_minutes} minutes)")
        logger.info(f"   Backend URL: {backend_url}")
        logger.info(f"   Frontend URL: {frontend_url}")
        keep_alive_task = asyncio.create_task(keep_alive_ping())
    else:
        logger.info("ℹ️ Keep-alive is disabled. Set KEEP_ALIVE_ENABLED=true in .env to enable")

@app.on_event("shutdown")
async def shutdown_event_handler():
    """Clean up background tasks on application shutdown"""
    global keep_alive_task
    
    logger.info("🛑 Shutting down application...")
    
    # Signal the keep-alive task to stop
    shutdown_event.set()
    
    # Wait for the task to finish
    if keep_alive_task:
        try:
            await asyncio.wait_for(keep_alive_task, timeout=5.0)
            logger.info("✓ Keep-alive task stopped gracefully")
        except asyncio.TimeoutError:
            logger.warning("⚠ Keep-alive task did not stop in time, cancelling")
            keep_alive_task.cancel()

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    errors = []
    for error in exc.errors():
        error_loc = " -> ".join(str(x) for x in error["loc"])
        errors.append(f"{error_loc}: {error['msg']}")
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=APIResponse(
            success=False,
            message="Validation error",
            error="\n".join(errors)
        ).dict()
    )

@app.exception_handler(ServiceInitializationError)
async def service_init_exception_handler(request, exc):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=APIResponse(
            success=False,
            message="Service initialization failed",
            error=str(exc)
        ).dict()
    )

@app.exception_handler(FileProcessingError)
async def file_processing_exception_handler(request, exc):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content=APIResponse(
            success=False,
            message="File processing failed",
            error=str(exc)
        ).dict()
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=APIResponse(
            success=False,
            message="Internal server error",
            error="An unexpected error occurred"
        ).dict()
    )

@app.get("/", response_model=APIResponse)
async def root():
    """Root endpoint providing API information"""
    return APIResponse(
        success=True,
        message="Welcome to MatchWise API",
        data={
            "name": "MatchWise",
            "version": "1.0.0",
            "description": "Smart matching for both recruiters and candidates - AI-powered resume analysis and job matching",
            "endpoints": {
                "docs": "/docs",
                "redoc": "/redoc",
                "health": "/health",
                "api_root": "/api"
            }
        }
    )

@app.get("/health", response_model=APIResponse)
async def health_check():
    """Health check endpoint for monitoring and status verification"""
    try:
        # Check if all services are initialized
        services_status = {
            "ai_service": bool(ai_service),
            "file_service": bool(file_service),
            "email_service": bool(email_service)
        }
        
        all_services_healthy = all(services_status.values())
        
        return APIResponse(
            success=all_services_healthy,
            message="Service health status",
            data={
                "status": "healthy" if all_services_healthy else "degraded",
                "services": services_status,
                "timestamp": datetime.datetime.utcnow().isoformat(),
                "environment": os.getenv("ENV", "development")
            }
        )
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return APIResponse(
            success=False,
            message="Health check failed",
            error=str(e),
            data={
                "status": "unhealthy",
                "timestamp": datetime.datetime.utcnow().isoformat()
            }
        )

@app.post("/api/job-description/generate", response_model=APIResponse)
async def generate_job_description(
    job_title: str = Form(...),
    years_experience: int = Form(...),
    must_have_skills: str = Form(...),
    company_name: str = Form(...),
    employment_type: str = Form(...),
    industry: str = Form(...),
    location: str = Form(...)
):
    """Generate a job description using AI based on provided parameters"""
    try:
        # Validate input
        if not job_title or not must_have_skills or not company_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Required fields cannot be empty"
            )
        
        if years_experience < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Years of experience cannot be negative"
            )

        jd = await ai_service.generate_job_description(
            job_title,
            years_experience,
            must_have_skills.split(','),
            company_name,
            employment_type,
            industry,
            location
        )
        
        return APIResponse(
            success=True,
            message="Job description generated successfully",
            data={"job_description": jd}
        )
    except Exception as e:
        logger.error(f"Error generating job description: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.post("/api/job-description/file", response_model=APIResponse)
async def upload_job_description_file(file: UploadFile = File(...)):
    """Upload and process a job description file (PDF or DOCX)"""
    try:
        # Validate file type
        if not file.filename.lower().endswith(('.pdf', '.doc', '.docx')):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File must be PDF or DOC/DOCX format"
            )

        content = await file_service.process_file(file)
        
        return APIResponse(
            success=True,
            message="File processed successfully",
            data={"job_description": content}
        )
    except Exception as e:
        logger.error(f"Error processing file: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

class ResumeAnalysisInput(BaseModel):
    minimum_score: float = Field(70.0, ge=0, le=100, description="Minimum score required for acceptance")
    max_missing_skills: int = Field(3, ge=0, le=10, description="Maximum number of missing skills allowed")

async def process_resumes_stream(
    job_description: str,
    resumes: List[UploadFile],
    minimum_score: float,
    max_missing_skills: int
) -> AsyncGenerator[str, None]:
    """Generator function to stream resume analysis progress"""
    total_files = len(resumes)
    results = []
    
    try:
        for index, resume in enumerate(resumes):
            # Send progress update - allocate 90% for file processing
            current_progress = int((index / total_files) * 90)
            progress = {
                "type": "progress",
                "current": index + 1,
                "total": total_files,
                "filename": resume.filename,
                "status": "processing",
                "percentage": current_progress
            }
            # Ensure proper JSON serialization without extra newlines in strings
            json_data = json.dumps(progress, ensure_ascii=False)
            yield f"data: {json_data}\n\n"
            await asyncio.sleep(0.1)  # Small delay for UI update
            
            try:
                # Process the resume
                resume_text = await file_service.process_file(resume)
                
                # Send text extraction complete
                progress["status"] = "analyzing"
                progress["percentage"] = int(((index + 0.5) / total_files) * 90)
                json_data = json.dumps(progress, ensure_ascii=False)
                yield f"data: {json_data}\n\n"
                await asyncio.sleep(0.1)
                
                # Analyze resume
                analysis = await ai_service.analyze_resume(resume_text, job_description)
                
                result = {
                    "filename": resume.filename,
                    **analysis
                }
                results.append(result)
                
                # Send analysis complete status (not fully complete yet - email pending)
                progress["status"] = "analyzed"
                progress["percentage"] = int(((index + 1) / total_files) * 90)
                progress["result"] = result
                json_data = json.dumps(progress, ensure_ascii=False)
                yield f"data: {json_data}\n\n"
                
            except Exception as e:
                logger.error(f"Error processing resume {resume.filename}: {str(e)}")
                error_result = {
                    "filename": resume.filename,
                    "error": str(e),
                    "score": 0,
                    "missing_skills": [],
                    "remarks": "Error processing resume"
                }
                results.append(error_result)
                
                progress["status"] = "error"
                progress["error"] = str(e)
                progress["result"] = error_result
                json_data = json.dumps(progress, ensure_ascii=False)
                yield f"data: {json_data}\n\n"
        
        # Generate emails after all resumes are processed
        successful_results = [r for r in results if "error" not in r]
        if successful_results:
            successful_results.sort(key=lambda x: x["score"], reverse=True)
            
            # Calculate email generation progress allocation
            total_results = len(results)
            email_progress_start = 90
            email_progress_range = 10  # 90% to 100%
            
            for email_index, result in enumerate(results):
                if "error" not in result:
                    # Send email generation started for this resume
                    email_gen_progress = {
                        "type": "progress",
                        "filename": result["filename"],
                        "status": "generating_email",
                        "percentage": email_progress_start + int((email_index / total_results) * email_progress_range)
                    }
                    json_data = json.dumps(email_gen_progress, ensure_ascii=False)
                    yield f"data: {json_data}\n\n"
                    
                    is_acceptable = (
                        result["score"] >= minimum_score and
                        len(result.get("missing_skills", [])) <= max_missing_skills
                    )
                    
                    try:
                        best_score = max(r["score"] for r in successful_results if "error" not in r)
                        candidates_with_best_score = [
                            r for r in successful_results 
                            if "error" not in r and r["score"] == best_score
                        ]
                        min_missing_skills = min(
                            len(r.get("missing_skills", [])) 
                            for r in candidates_with_best_score
                        )
                        
                        result["is_best_match"] = (
                            is_acceptable and 
                            result["score"] == best_score and
                            len(result.get("missing_skills", [])) == min_missing_skills
                        )

                        if is_acceptable:
                            result["email"] = await email_service.generate_acceptance_email(
                                result["filename"],
                                job_description
                            )
                            result["email_type"] = "acceptance"
                        else:
                            result["email"] = await email_service.generate_rejection_email(
                                result["filename"]
                            )
                            result["email_type"] = "rejection"
                        
                        # Send email generation complete for this resume
                        email_complete_progress = {
                            "type": "progress",
                            "filename": result["filename"],
                            "status": "complete",
                            "percentage": email_progress_start + int(((email_index + 1) / total_results) * email_progress_range),
                            "result": result
                        }
                        json_data = json.dumps(email_complete_progress, ensure_ascii=False)
                        yield f"data: {json_data}\n\n"
                            
                    except Exception as email_error:
                        logger.error(f"Failed to generate email for {result['filename']}: {str(email_error)}")
                        result["email_error"] = str(email_error)
                        
                        # Send email generation error for this resume
                        email_error_progress = {
                            "type": "progress",
                            "filename": result["filename"],
                            "status": "complete",  # Still mark as complete even with email error
                            "percentage": email_progress_start + int(((email_index + 1) / total_results) * email_progress_range),
                            "result": result
                        }
                        json_data = json.dumps(email_error_progress, ensure_ascii=False)
                        yield f"data: {json_data}\n\n"
        
        # Send final results - 100% complete
        final_data = {
            "type": "complete",
            "results": results,
            "percentage": 100
        }
        json_data = json.dumps(final_data, ensure_ascii=False)
        yield f"data: {json_data}\n\n"
        
    except Exception as e:
        logger.error(f"Error in resume processing stream: {str(e)}", exc_info=True)
        error_data = {
            "type": "error",
            "error": str(e)
        }
        json_data = json.dumps(error_data, ensure_ascii=False)
        yield f"data: {json_data}\n\n"

@app.post("/api/resumes/analyze-stream", tags=["Resume Analysis"])
async def analyze_resumes_stream(
    job_description: str = Form(...),
    resumes: List[UploadFile] = File(...),
    minimum_score: float = Form(default=70.0),
    max_missing_skills: int = Form(default=3)
):
    """
    Stream resume analysis progress in real-time.
    Returns Server-Sent Events (SSE) with progress updates.
    """
    try:
        # Input validation
        if not job_description or len(job_description.strip()) < 50:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Job description is required and must be at least 50 characters long"
            )

        if not resumes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No resumes provided"
            )

        if len(resumes) > 10:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum 10 resumes allowed"
            )

        return StreamingResponse(
            process_resumes_stream(job_description, resumes, minimum_score, max_missing_skills),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error starting resume analysis stream: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.post("/api/resumes/analyze", response_model=APIResponse, tags=["Resume Analysis"])
async def analyze_resumes(
    job_description: str = Form(...),
    resumes: List[UploadFile] = File(...),
    params: ResumeAnalysisInput = Depends()
):
    """
    Analyze multiple resumes against a job description.
    
    Args:
        job_description: The job description to match against
        resumes: List of resume files (PDF/DOC/DOCX)
        params: Analysis parameters including minimum score and max missing skills
    
    Returns:
        Analysis results for each resume including scores and recommendations
    """
    try:
        # Input validation with detailed error messages
        if not job_description or len(job_description.strip()) < 50:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Job description is required and must be at least 50 characters long"
            )

        if not resumes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No resumes provided"
            )

        if len(resumes) > 10:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum 10 resumes allowed"
            )

        # Validate file sizes and types
        MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
        for resume in resumes:
            if not resume.filename.lower().endswith(('.pdf', '.doc', '.docx')):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid file format for {resume.filename}. Must be PDF or DOC/DOCX"
                )
            
            # Read the first chunk to get file size
            content = await resume.read(MAX_FILE_SIZE + 1)
            await resume.seek(0)  # Reset file position
            
            if len(content) > MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"File {resume.filename} exceeds maximum size of 10MB"
                )

        # Validate file types
        for resume in resumes:
            if not resume.filename.lower().endswith(('.pdf', '.doc', '.docx')):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid file format for {resume.filename}. Must be PDF or DOC/DOCX"
                )

        results = []
        for resume in resumes:
            try:
                resume_text = await file_service.process_file(resume)
                analysis = await ai_service.analyze_resume(
                    resume_text,
                    job_description
                )
                results.append({
                    "filename": resume.filename,
                    **analysis
                })
            except Exception as e:
                logger.error(f"Error processing resume {resume.filename}: {str(e)}")
                results.append({
                    "filename": resume.filename,
                    "error": str(e)
                })

        if not results:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to process any resumes"
            )

        # Generate emails for candidates
        try:
            successful_results = [r for r in results if "error" not in r]
            if successful_results:
                # Sort candidates by score
                successful_results.sort(key=lambda x: x["score"], reverse=True)
                
                logger.info(f"Evaluating candidates with minimum score: {params.minimum_score}% and max missing skills: {params.max_missing_skills}")
                
                for result in results:
                    if "error" not in result:
                        # Simple evaluation based on minimum score and missing skills
                        is_acceptable = (
                            result["score"] >= params.minimum_score and  # Meets minimum score threshold
                            len(result.get("missing_skills", [])) <= params.max_missing_skills  # Doesn't exceed missing skills limit
                        )
                        
                        try:
                            # Find the best score and minimum missing skills among acceptable candidates
                            best_score = max(r["score"] for r in successful_results if "error" not in r)
                            candidates_with_best_score = [
                                r for r in successful_results 
                                if "error" not in r and r["score"] == best_score
                            ]
                            min_missing_skills = min(
                                len(r.get("missing_skills", [])) 
                                for r in candidates_with_best_score
                            )
                            
                            # Mark as best match if:
                            # 1. Candidate is acceptable AND
                            # 2. Has the highest score AND
                            # 3. Has the minimum number of missing skills among highest scorers
                            result["is_best_match"] = (
                                is_acceptable and 
                                result["score"] == best_score and
                                len(result.get("missing_skills", [])) == min_missing_skills
                            )

                            if is_acceptable:
                                result["email"] = await email_service.generate_acceptance_email(
                                    result["filename"],
                                    job_description
                                )
                                result["email_type"] = "acceptance"
                                logger.info(f"Generated acceptance email for {result['filename']} with score {result['score']}")
                            else:
                                result["email"] = await email_service.generate_rejection_email(
                                    result["filename"]
                                )
                                result["email_type"] = "rejection"
                                logger.info(f"Generated rejection email for {result['filename']} with score {result['score']}")
                                
                            # Validate email was generated
                            if not result.get("email"):
                                raise ValueError("Email service returned empty response")
                                
                        except Exception as email_error:
                            logger.error(f"Failed to generate email for {result['filename']}: {str(email_error)}")
                            result["email_error"] = str(email_error)
                
        except Exception as e:
            logger.error(f"Error in email generation process: {str(e)}")
            # Add error information to the response
            for result in results:
                if "error" not in result and "email" not in result:
                    result["email_error"] = "Failed to process email generation"

        logger.info(f"Processed {len(results)} resumes with analysis results")
        return APIResponse(
            success=True,
            message="Resumes analyzed successfully",
            data={"results": results}
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error analyzing resumes: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# ==================== CANDIDATE MODE ENDPOINTS ====================

async def process_jobs_stream(
    resume_text: str,
    job_descriptions: List[Dict[str, str]],
    minimum_score: float,
    max_missing_skills: int
) -> AsyncGenerator[str, None]:
    """Generator function to stream job analysis progress for candidate mode"""
    total_jobs = len(job_descriptions)
    results = []
    
    try:
        for index, job_info in enumerate(job_descriptions):
            job_source = job_info.get('source', 'unknown')
            job_text = job_info.get('text', '')
            company_name = job_info.get('company_name', 'Company')
            
            # Send progress update - allocate 90% for job processing
            current_progress = int((index / total_jobs) * 90)
            progress = {
                "type": "progress",
                "current": index + 1,
                "total": total_jobs,
                "job_source": job_source,
                "company_name": company_name,
                "status": "analyzing",
                "percentage": current_progress
            }
            json_data = json.dumps(progress, ensure_ascii=False)
            yield f"data: {json_data}\n\n"
            await asyncio.sleep(0.1)
            
            try:
                # Analyze job against resume
                analysis = await ai_service.analyze_job_for_resume(
                    job_text, 
                    resume_text,
                    company_name
                )
                
                result = {
                    "job_source": job_source,
                    "company_name": company_name,
                    **analysis
                }
                results.append(result)
                
                # Send analysis complete status
                progress["status"] = "analyzed"
                progress["percentage"] = int(((index + 1) / total_jobs) * 90)
                progress["result"] = result
                json_data = json.dumps(progress, ensure_ascii=False)
                yield f"data: {json_data}\n\n"
                
            except Exception as e:
                logger.error(f"Error analyzing job {job_source}: {str(e)}")
                error_result = {
                    "job_source": job_source,
                    "company_name": company_name,
                    "error": str(e),
                    "score": 0,
                    "missing_skills": [],
                    "remarks": "Error analyzing job"
                }
                results.append(error_result)
                
                progress["status"] = "error"
                progress["error"] = str(e)
                progress["result"] = error_result
                json_data = json.dumps(progress, ensure_ascii=False)
                yield f"data: {json_data}\n\n"
        
        # Generate application emails after all jobs are analyzed
        successful_results = [r for r in results if "error" not in r]
        if successful_results:
            successful_results.sort(key=lambda x: x["score"], reverse=True)
            
            # Calculate email generation progress allocation
            total_results = len(results)
            email_progress_start = 90
            email_progress_range = 10  # 90% to 100%
            
            for email_index, result in enumerate(results):
                if "error" not in result:
                    # Send email generation started for this job
                    email_gen_progress = {
                        "type": "progress",
                        "job_source": result["job_source"],
                        "company_name": result["company_name"],
                        "status": "generating_email",
                        "percentage": email_progress_start + int((email_index / total_results) * email_progress_range)
                    }
                    json_data = json.dumps(email_gen_progress, ensure_ascii=False)
                    yield f"data: {json_data}\n\n"
                    
                    is_good_match = (
                        result["score"] >= minimum_score and
                        len(result.get("missing_skills", [])) <= max_missing_skills
                    )
                    
                    try:
                        best_score = max(r["score"] for r in successful_results if "error" not in r)
                        jobs_with_best_score = [
                            r for r in successful_results 
                            if "error" not in r and r["score"] == best_score
                        ]
                        min_missing_skills_count = min(
                            len(r.get("missing_skills", [])) 
                            for r in jobs_with_best_score
                        )
                        
                        result["is_best_match"] = (
                            is_good_match and 
                            result["score"] == best_score and
                            len(result.get("missing_skills", [])) == min_missing_skills_count
                        )

                        if is_good_match:
                            # Generate application email for good matches
                            job_text = next(
                                (j['text'] for j in job_descriptions if j['source'] == result['job_source']),
                                ""
                            )
                            result["email"] = await email_service.generate_application_email(
                                result["company_name"],
                                job_text,
                                resume_text
                            )
                            result["email_type"] = "application"
                        else:
                            # For poor matches, indicate no application needed
                            result["email"] = "This position may not be the best fit based on the analysis. Consider focusing on roles with higher match scores."
                            result["email_type"] = "no_application"
                        
                        # Send email generation complete for this job
                        email_complete_progress = {
                            "type": "progress",
                            "job_source": result["job_source"],
                            "company_name": result["company_name"],
                            "status": "complete",
                            "percentage": email_progress_start + int(((email_index + 1) / total_results) * email_progress_range),
                            "result": result
                        }
                        json_data = json.dumps(email_complete_progress, ensure_ascii=False)
                        yield f"data: {json_data}\n\n"
                            
                    except Exception as email_error:
                        logger.error(f"Failed to generate email for {result['job_source']}: {str(email_error)}")
                        result["email_error"] = str(email_error)
                        
                        # Send email generation error for this job
                        email_error_progress = {
                            "type": "progress",
                            "job_source": result["job_source"],
                            "company_name": result["company_name"],
                            "status": "complete",
                            "percentage": email_progress_start + int(((email_index + 1) / total_results) * email_progress_range),
                            "result": result
                        }
                        json_data = json.dumps(email_error_progress, ensure_ascii=False)
                        yield f"data: {json_data}\n\n"
        
        # Send final results - 100% complete
        final_data = {
            "type": "complete",
            "results": results,
            "percentage": 100
        }
        json_data = json.dumps(final_data, ensure_ascii=False)
        yield f"data: {json_data}\n\n"
        
    except Exception as e:
        logger.error(f"Error in job processing stream: {str(e)}", exc_info=True)
        error_data = {
            "type": "error",
            "error": str(e)
        }
        json_data = json.dumps(error_data, ensure_ascii=False)
        yield f"data: {json_data}\n\n"

@app.post("/api/jobs/analyze-stream", tags=["Job Analysis"])
async def analyze_jobs_stream(
    resume: UploadFile = File(...),
    job_texts: Optional[List[str]] = Form(default=None),
    job_files: Optional[List[UploadFile]] = File(default=None),
    job_urls: Optional[List[str]] = Form(default=None),
    company_names: Optional[List[str]] = Form(default=None),
    minimum_score: float = Form(default=70.0),
    max_missing_skills: int = Form(default=3)
):
    """
    Analyze multiple job descriptions against a candidate's resume.
    Returns Server-Sent Events (SSE) with progress updates.
    """
    try:
        # Input validation
        if not resume:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Resume is required"
            )

        # Process the resume
        try:
            resume_text = await file_service.process_file(resume)
            if not resume_text or len(resume_text.strip()) < 100:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Resume content is too short or empty"
                )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to process resume: {str(e)}"
            )

        # Collect all job descriptions
        job_descriptions = []
        
        # Process text-based job descriptions
        if job_texts:
            for idx, job_text in enumerate(job_texts):
                if job_text and len(job_text.strip()) >= 50:
                    company = company_names[idx] if company_names and idx < len(company_names) else f"Company {idx + 1}"
                    job_descriptions.append({
                        "source": f"text_job_{idx + 1}",
                        "text": job_text,
                        "company_name": company
                    })
        
        # Process file-based job descriptions
        if job_files:
            for idx, job_file in enumerate(job_files):
                try:
                    job_text = await file_service.process_file(job_file)
                    if job_text and len(job_text.strip()) >= 50:
                        company = company_names[idx + len(job_texts or [])] if company_names and (idx + len(job_texts or [])) < len(company_names) else job_file.filename
                        job_descriptions.append({
                            "source": job_file.filename,
                            "text": job_text,
                            "company_name": company
                        })
                except Exception as e:
                    logger.error(f"Failed to process job file {job_file.filename}: {str(e)}")
        
        # Process URL-based job descriptions (basic implementation)
        if job_urls:
            for idx, url in enumerate(job_urls):
                # For now, we'll add placeholder - full implementation would require web scraping
                logger.warning(f"URL-based job descriptions not fully implemented yet: {url}")
                # job_descriptions.append({
                #     "source": url,
                #     "text": "URL processing to be implemented",
                #     "company_name": f"Company from URL {idx + 1}"
                # })

        if not job_descriptions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid job descriptions provided"
            )

        if len(job_descriptions) > 10:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum 10 job descriptions allowed"
            )

        return StreamingResponse(
            process_jobs_stream(resume_text, job_descriptions, minimum_score, max_missing_skills),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error starting job analysis stream: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

