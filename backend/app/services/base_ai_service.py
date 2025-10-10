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
        # Initialize API key management
        self._api_keys = self._load_api_keys()
        self._current_key_index = 0
        self._failed_keys = {}
        self.client = AsyncGroq(api_key=self._get_current_key())

    def _load_api_keys(self) -> List[str]:
        """Load API keys from environment variables"""
        keys = []
        i = 1
        while True:
            key = os.getenv(f'GROQ_API_KEY_{i}')
            if not key:
                break
            keys.append(key)
            i += 1
        if not keys:
            raise ValueError("No API keys found in environment variables")
        return keys

    def _get_current_key(self) -> str:
        """Get the current API key"""
        return self._api_keys[self._current_key_index]

    def _next_key(self) -> Optional[str]:
        """Rotate to the next available API key"""
        original_index = self._current_key_index
        while True:
            self._current_key_index = (self._current_key_index + 1) % len(self._api_keys)
            current_key = self._get_current_key()
            
            # Check if the key is not failed or if its failure timeout has expired
            if current_key not in self._failed_keys or \
               (datetime.now() - self._failed_keys[current_key]).total_seconds() > 3600:
                if current_key in self._failed_keys:
                    del self._failed_keys[current_key]
                return current_key
            
            # If we've tried all keys, reset and return None
            if self._current_key_index == original_index:
                return None

    def _mark_key_failed(self, key: str):
        """Mark an API key as failed"""
        self._failed_keys[key] = datetime.now()

    async def _try_model_completion(self, messages: List[dict], model: str, **kwargs) -> Optional[str]:
        """Try to get completion from a specific model with timeout handling and API key rotation"""
        timeout = kwargs.pop('timeout', 10)  # 10 seconds timeout
        retry_delay = kwargs.pop('retry_delay', 1)  # 1 second retry delay
        max_retries = kwargs.pop('max_retries', 3)  # Increased retries for API key rotation
        
        for attempt in range(max_retries):
            try:
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
                error_str = str(e).lower()
                current_key = self._get_current_key()
                
                # Check for API key related errors
                if any(err in error_str for err in [
                    "quota exceeded",
                    "invalid api key",
                    "rate limit",
                    "authorization",
                    "authenticate"
                ]):
                    logger.warning(f"API key error: {str(e)}")
                    self._mark_key_failed(current_key)
                    next_key = self._next_key()
                    
                    if next_key:
                        logger.info("Switching to next API key")
                        self.client = AsyncGroq(api_key=next_key)
                        await asyncio.sleep(retry_delay)
                        continue
                    else:
                        logger.error("No more API keys available")
                        raise Exception("All API keys exhausted or invalid")
                
                # For model-specific errors, try next model
                if "model" in error_str:
                    logger.warning(f"Model {model} not responsive, will try next model. Error: {str(e)}")
                    return None
                
                # For other errors, retry with same key if attempts remain
                if attempt < max_retries - 1:
                    await asyncio.sleep(retry_delay * (attempt + 1))  # Exponential backoff
                    continue
                
                logger.error(f"Failed to get completion after {max_retries} attempts: {str(e)}")
                return None
                
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
