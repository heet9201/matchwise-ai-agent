import logging
from typing import List, Dict
from .base_ai_service import BaseAIService

logger = logging.getLogger(__name__)

class AIService(BaseAIService):

    async def generate_job_description(
        self,
        job_title: str,
        years_experience: int,
        must_have_skills: List[str],
        company_name: str,
        employment_type: str,
        industry: str,
        location: str
    ) -> str:
        """Generate a job description using AI"""
        prompt = f"""Create a professional job description for the following position:
        Job Title: {job_title}
        Years of Experience Required: {years_experience}
        Must-have Skills: {', '.join(must_have_skills)}
        Company: {company_name}
        Employment Type: {employment_type}
        Industry: {industry}
        Location: {location}
        
        Format the job description professionally with sections for:
        - About the Company
        - Role Overview
        - Key Responsibilities
        - Required Qualifications
        - Benefits and Perks
        """
        
        return await self.get_completion(prompt, "job_description")

    async def analyze_resume(self, resume_text: str, job_description: str) -> dict:
        """Analyze a resume against a job description"""
        prompt = f"""Analyze this resume against the job description carefully and provide:
        1. A matching score out of 100
        2. List of technically relevant required skills that are missing from the resume
        3. Brief, specific remarks about strengths and areas for improvement

        Important Instructions for Analysis:
        - For Missing Skills:
          * Only include technical and role-specific skills missing from the resume
          * Format as a comma-separated list
          * If no relevant technical skills are missing, write 'none'
          * Never return an empty list
        
        - For Remarks:
          * Provide 2-3 brief, specific points
          * Format as short phrases separated by commas
          * Start with strengths, then areas for improvement
          * Use format like: "Strong in X, Experienced in Y, Lacks Z"
          * Be specific about technologies, domains, or skills
          * Keep each point under 6 words
        
        Job Description:
        {job_description}
        
        Resume:
        {resume_text}
        
        Format your response EXACTLY as follows:
        Score: [number between 0-100]
        Missing Skills: [skills separated by commas]
        Remarks: [brief points separated by commas]
        """

        result = await self.get_completion(prompt, "resume_analysis")
        return self.parse_structured_response(result, ["Score", "Missing Skills", "Remarks"])
