from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from typing import List, Optional
import uvicorn
import os
import logging
from dotenv import load_dotenv
from app.models import JobDescription, ResumeAnalysis
from app.services.ai_service import AIService
from app.services.file_service import FileService
from app.services.email_service import EmailService
from app.schemas import JobDescriptionRequest, ResumeAnalysisResult, APIResponse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Recruitment AI Agent",
    description="API for processing job descriptions and analyzing resumes using AI",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
try:
    ai_service = AIService()
    file_service = FileService()
    email_service = EmailService()
except Exception as e:
    logger.error(f"Error initializing services: {str(e)}")
    raise

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=APIResponse(
            success=False,
            message="Validation error",
            error=str(exc)
        ).dict()
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

@app.post("/api/resumes/analyze", response_model=APIResponse)
async def analyze_resumes(
    job_description: str = Form(...),
    resumes: List[UploadFile] = File(...),
    minimum_score: float = Form(default=70.0),
    max_missing_skills: int = Form(default=3)
):
    """Analyze multiple resumes against a job description"""
    try:
        # Validate input
        if not job_description:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Job description is required"
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
                
                logger.info(f"Evaluating candidates with minimum score: {minimum_score}% and max missing skills: {max_missing_skills}")
                
                for result in results:
                    if "error" not in result:
                        # Simple evaluation based on minimum score and missing skills
                        is_acceptable = (
                            result["score"] >= minimum_score and  # Meets minimum score threshold
                            len(result.get("missing_skills", [])) <= max_missing_skills  # Doesn't exceed missing skills limit
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

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
