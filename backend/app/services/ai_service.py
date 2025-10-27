import logging
import re
from typing import List, Dict, Optional
from .base_ai_service import BaseAIService

logger = logging.getLogger(__name__)

class AIService(BaseAIService):

    @staticmethod
    def parse_job_description_fields(job_description: str) -> Dict[str, any]:
        """
        Parse structured fields from formatted job description text.
        Extracts: title, company, location, salary, experience, description, requirements, skills
        """
        parsed = {
            'title': None,
            'company': None,
            'location': None,
            'salary': None,
            'experience': None,
            'description': None,
            'requirements': None,
            'skills': []
        }
        
        try:
            # Extract Job Title
            title_match = re.search(r'Job Title:\s*(.+?)(?:\n|$)', job_description, re.IGNORECASE)
            if title_match:
                parsed['title'] = title_match.group(1).strip()
            
            # Extract Company
            company_match = re.search(r'Company:\s*(.+?)(?:\n|$)', job_description, re.IGNORECASE)
            if company_match:
                parsed['company'] = company_match.group(1).strip()
            
            # Extract Location
            location_match = re.search(r'Location:\s*(.+?)(?:\n|$)', job_description, re.IGNORECASE)
            if location_match:
                location = location_match.group(1).strip()
                if location and location.lower() != 'not specified':
                    parsed['location'] = location
            
            # Extract Salary
            salary_match = re.search(r'Salary:\s*(.+?)(?:\n|$)', job_description, re.IGNORECASE)
            if salary_match:
                salary = salary_match.group(1).strip()
                if salary and salary.lower() != 'not specified':
                    parsed['salary'] = salary
            
            # Extract Experience
            exp_match = re.search(r'Experience:\s*(.+?)(?:\n|$)', job_description, re.IGNORECASE)
            if exp_match:
                parsed['experience'] = exp_match.group(1).strip()
            
            # Extract Description section
            desc_match = re.search(r'Description:\s*(.+?)(?=\n\n|\nRequirements:|\nRequired Skills:|$)', 
                                  job_description, re.IGNORECASE | re.DOTALL)
            if desc_match:
                parsed['description'] = desc_match.group(1).strip()
            
            # Extract Requirements section
            req_match = re.search(r'Requirements:\s*(.+?)(?=\n\n|\nRequired Skills:|$)', 
                                 job_description, re.IGNORECASE | re.DOTALL)
            if req_match:
                parsed['requirements'] = req_match.group(1).strip()
            
            # Extract Skills
            skills_match = re.search(r'Required Skills:\s*(.+?)(?:\n\n|$)', 
                                    job_description, re.IGNORECASE | re.DOTALL)
            if skills_match:
                skills_text = skills_match.group(1).strip()
                # Split by comma and clean up
                parsed['skills'] = [s.strip() for s in skills_text.split(',') if s.strip()]
            
            logger.info(f"Parsed job description fields: title='{parsed['title']}', company='{parsed['company']}', skills={len(parsed['skills'])}")
            
        except Exception as e:
            logger.warning(f"Error parsing job description fields: {str(e)}")
        
        return parsed

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
        
        # Parse structured fields from job description for enhanced context
        parsed_jd = self.parse_job_description_fields(job_description)
        
        # Build enhanced context for AI
        context_parts = []
        if parsed_jd['title']:
            context_parts.append(f"Position: {parsed_jd['title']}")
        if parsed_jd['company']:
            context_parts.append(f"Company: {parsed_jd['company']}")
        if parsed_jd['experience']:
            context_parts.append(f"Experience Level: {parsed_jd['experience']}")
        if parsed_jd['skills']:
            context_parts.append(f"Key Skills Required: {', '.join(parsed_jd['skills'][:10])}")  # Limit to first 10
        
        context_summary = " | ".join(context_parts) if context_parts else ""
        
        prompt = f"""Analyze this resume against the job description carefully and provide:
        1. A matching score out of 100
        2. List of technically relevant required skills that are missing from the resume
        3. Brief, specific remarks about strengths and areas for improvement

        {f'Context Summary: {context_summary}' if context_summary else ''}

        Important Instructions for Analysis:
        - For Missing Skills:
          * Only include technical and role-specific skills missing from the resume
          * Focus on skills explicitly mentioned in the job requirements
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

    async def analyze_job_for_resume(self, job_description: str, resume_text: str, company_name: str = "the company") -> dict:
        """Analyze a job description against a resume (candidate perspective)"""
        
        # Parse structured fields from job description for enhanced context
        parsed_jd = self.parse_job_description_fields(job_description)
        
        # Use parsed company name if available
        if parsed_jd['company']:
            company_name = parsed_jd['company']
        
        # Build enhanced context
        context_parts = []
        if parsed_jd['title']:
            context_parts.append(f"Role: {parsed_jd['title']}")
        if parsed_jd['experience']:
            context_parts.append(f"Experience Required: {parsed_jd['experience']}")
        if parsed_jd['location']:
            context_parts.append(f"Location: {parsed_jd['location']}")
        if parsed_jd['skills']:
            context_parts.append(f"Required Skills: {', '.join(parsed_jd['skills'][:8])}")
        
        context_summary = " | ".join(context_parts) if context_parts else ""
        
        prompt = f"""Analyze this job description against the candidate's resume and provide:
        1. A matching score out of 100 indicating how well the candidate fits this role
        2. List of required skills from the job that the candidate is missing
        3. Brief, specific remarks about the candidate's strengths for this role and areas to improve

        {f'Job Summary: {context_summary}' if context_summary else ''}

        Important Instructions for Analysis:
        - For Matching Score:
          * Evaluate based on skills match, experience level, and qualifications
          * Consider both technical and soft skills
          * Consider experience level match (entry/mid/senior)
          * Higher score means better fit for the role
        
        - For Missing Skills:
          * Only include skills explicitly mentioned in the job description that are absent from the resume
          * Format as a comma-separated list
          * If no skills are missing, write 'none'
          * Never return an empty list
        
        - For Remarks:
          * Provide 2-3 brief, specific points
          * Format as short phrases separated by commas
          * Highlight candidate's relevant strengths first
          * Mention transferable skills if applicable
          * Keep each point under 8 words
        
        Job Description from {company_name}:
        {job_description}
        
        Candidate's Resume:
        {resume_text}
        
        Format your response EXACTLY as follows:
        Score: [number between 0-100]
        Missing Skills: [skills separated by commas]
        Remarks: [brief points separated by commas]
        """

        result = await self.get_completion(prompt, "resume_analysis")
        return self.parse_structured_response(result, ["Score", "Missing Skills", "Remarks"])
