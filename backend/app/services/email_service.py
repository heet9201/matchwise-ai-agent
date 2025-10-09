import os
import logging
from typing import Optional
from .base_ai_service import BaseAIService

logger = logging.getLogger(__name__)

class EmailService(BaseAIService):
    def __init__(self):
        super().__init__()

    async def _generate_email(self, prompt: str, max_tokens: int = 400) -> str:
        """Internal method to handle email generation with error handling"""
        try:
            email_content = await self.get_completion(prompt, "email", max_tokens=max_tokens)
            
            # Validate email content
            if not email_content or len(email_content.strip()) < 50:  # Basic validation
                raise ValueError("Generated email content is too short or empty")

            return email_content

        except Exception as e:
            logger.error(f"Error generating email: {str(e)}")
            raise ValueError(f"Failed to generate email: {str(e)}")

    def _clean_candidate_name(self, filename: str) -> str:
        """Extract clean candidate name from filename"""
        # Remove file extension
        name = os.path.splitext(filename)[0]
        # Replace underscores/hyphens with spaces
        name = name.replace('_', ' ').replace('-', ' ')
        # Capitalize each word
        name = ' '.join(word.capitalize() for word in name.split())
        return name

    async def generate_acceptance_email(self, filename: str, job_description: str) -> str:
        """Generate a personalized interview call email"""
        candidate_name = self._clean_candidate_name(filename)
        
        prompt = f"""Generate a professional and warm interview invitation email for:
        Candidate Name: {candidate_name}
        Position Details: {job_description}
        
        Requirements for the email:
        1. Start with a personalized greeting using the candidate's name
        2. Express genuine enthusiasm about their strong application
        3. Highlight that their skills and experience align well with our requirements
        4. Formally invite them for an interview
        5. Request their availability for the next week
        6. Mention that the interview will be conducted virtually
        7. Include a brief next steps section
        8. End with a professional and warm closing
        
        The tone should be:
        - Professional yet warm
        - Enthusiastic but not overly casual
        - Clear and concise
        - Encouraging and welcoming
        
        Format the email properly with appropriate spacing and structure.
        """

        return await self._generate_email(prompt, 500)

    async def generate_rejection_email(self, filename: str) -> str:
        """Generate a polite rejection email"""
        candidate_name = self._clean_candidate_name(filename)
        
        prompt = f"""Generate a professional and considerate rejection email for:
        Candidate Name: {candidate_name}
        
        Requirements for the email:
        1. Start with a personalized greeting using the candidate's name
        2. Thank them sincerely for their time and interest
        3. Deliver the rejection news clearly but gently
        4. Include a positive comment about their application
        5. Mention keeping their profile for future opportunities
        6. Wish them success in their job search
        7. End with a professional closing
        
        The tone should be:
        - Professional and respectful
        - Genuine and empathetic
        - Clear but gentle
        - Encouraging for the future
        
        Keep the email concise but not abrupt.
        Format the email properly with appropriate spacing and structure.
        """

        return await self._generate_email(prompt, 400)
