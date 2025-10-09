from groq import AsyncGroq
from typing import List, Optional, Dict
import os
import logging
import asyncio
from datetime import datetime

logger = logging.getLogger(__name__)

class BaseAIService:
    # List of models to try in order of preference
    MODELS = [
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
        "openai/gpt-oss-120b",
        "openai/gpt-oss-20b",
        "meta-llama/llama-guard-4-12b"
    ]

    # Default parameters for different types of completions
    DEFAULT_PARAMS = {
        "job_description": {
            "temperature": 0.7,
            "max_tokens": 1000,
            "system_message": "You are a professional HR content writer."
        },
        "resume_analysis": {
            "temperature": 0.5,
            "max_tokens": 500,
            "system_message": "You are an AI recruitment expert."
        },
        "email": {
            "temperature": 0.7,
            "max_tokens": 400,
            "system_message": "You are a professional HR manager crafting personalized emails."
        }
    }

    def __init__(self):
        groq_api_key = os.getenv("GROQ_API_KEY")
        if not groq_api_key:
            raise ValueError("GROQ_API_KEY environment variable is not set")
        self.client = AsyncGroq(api_key=groq_api_key)

    async def _try_model_completion(self, messages: List[dict], model: str, **kwargs) -> Optional[str]:
        """Try to get completion from a specific model with timeout handling"""
        try:
            # Minimal timeout settings
            timeout = kwargs.pop('timeout', 10)  # 10 seconds timeout
            retry_delay = kwargs.pop('retry_delay', 1)  # 1 second retry delay
            max_retries = kwargs.pop('max_retries', 1)  # Only 1 retry per model

            try:
                # Quick check if model is responsive
                chat_completion = await asyncio.wait_for(
                    self.client.chat.completions.create(
                        model=model,
                        messages=messages,
                        **kwargs
                    ),
                    timeout=timeout
                )
                return chat_completion.choices[0].message.content
            except (asyncio.TimeoutError, Exception) as e:
                # Immediately log and return None to try next model
                logger.warning(f"Model {model} not responsive, switching to next model. Error: {str(e)}")
                return None

        except Exception as e:
            logger.warning(f"Failed to get completion from model {model}: {str(e)}")
            return None

    async def get_completion(
        self, 
        prompt: str, 
        completion_type: str,
        custom_system_message: str = None,
        **kwargs
    ) -> str:
        """
        Get completion with fallback mechanism and predefined parameters based on type
        Args:
            prompt: The prompt to send to the model
            completion_type: Type of completion ('job_description', 'resume_analysis', or 'email')
            custom_system_message: Optional custom system message to override default
            **kwargs: Additional parameters to override defaults
        """
        params = self.DEFAULT_PARAMS.get(completion_type, {}).copy()
        params.update(kwargs)  # Override with any custom parameters

        system_message = custom_system_message or params.pop("system_message")
        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ]

        last_error = None
        for model in self.MODELS:
            try:
                logger.info(f"Trying model {model} for {completion_type}")
                result = await self._try_model_completion(messages, model, **params)
                if result:
                    logger.info(f"Successfully used model {model} for {completion_type}")
                    return result
            except Exception as e:
                last_error = e
                continue

        raise Exception(f"All models failed for {completion_type}. Last error: {str(last_error)}")

    def parse_structured_response(self, result: str, keys: List[str]) -> Dict:
        """Parse structured response with given keys and handle various formats"""
        lines = result.split('\n')
        parsed = {}
        
        for key in keys:
            matching_lines = [line for line in lines if line.strip().startswith(f"{key}:")]
            if matching_lines:
                value = matching_lines[0].split(':', 1)[1].strip()
                
                if key == "Score":
                    try:
                        # Handle scores with % symbol and potential decimals
                        score = float(value.replace('%', '').strip())
                        parsed["score"] = min(100, max(0, score))  # Ensure score is between 0-100
                    except ValueError:
                        logger.warning(f"Invalid score format: {value}, defaulting to 0")
                        parsed["score"] = 0
                        
                elif key == "Missing Skills":
                    # Handle different list formats
                    if value.strip().lower() in ['[]', 'none', 'n/a', '-', '', 'no missing skills']:
                        missing_skills = []
                    else:
                        # Split by common separators and clean up
                        separators = [',', ';', '\n', '•', '-']
                        for sep in separators:
                            if sep in value:
                                missing_skills = [
                                    skill.strip()
                                    for skill in value.split(sep)
                                    if skill.strip() and 
                                    skill.strip().lower() not in ['none', 'n/a'] and
                                    len(skill.strip()) > 1  # Avoid single-character entries
                                ]
                                break
                        else:
                            missing_skills = [value.strip()] if value.strip() else []
                    
                    parsed["missing_skills"] = missing_skills
                    
                else:
                    parsed[key.lower()] = value.strip()

        # Ensure all required keys have values
        if "score" not in parsed:
            parsed["score"] = 0
        if "missing_skills" not in parsed:
            parsed["missing_skills"] = []  # Empty list if no relevant skills are missing
        if "remarks" not in parsed:
            parsed["remarks"] = "Unable to determine specific skill gaps from the provided information."

        return parsed
