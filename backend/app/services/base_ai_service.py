from groq import AsyncGroq
from typing import List, Optional, Dict
import os
import logging
import asyncio
from dotenv import dotenv_values

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
        # Note: API keys will be reloaded dynamically on each completion request
        self._api_keys = []
        self._current_key_index = 0
        self.client = None
        # Load keys initially to ensure at least one exists
        self._refresh_api_keys()

    def _refresh_api_keys(self) -> None:
        """
        Reload API keys from .env file dynamically.
        This allows changing API keys without rebuilding/redeploying the application.
        """
        # Get the .env file path relative to this file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        backend_dir = os.path.dirname(os.path.dirname(current_dir))
        env_path = os.path.join(backend_dir, '.env')
        
        keys = []
        
        # Try to load from .env file first (supports runtime updates)
        if os.path.exists(env_path):
            env_values = dotenv_values(env_path)
            i = 1
            while True:
                key = env_values.get(f'GROQ_API_KEY_{i}')
                if not key:
                    break
                keys.append(key)
                i += 1
            
            if keys:
                logger.info(f"🔄 Loaded {len(keys)} API keys from .env file (supports dynamic updates)")
        
        # Fallback to system environment variables if .env not found or empty
        if not keys:
            i = 1
            while True:
                key = os.getenv(f'GROQ_API_KEY_{i}')
                if not key:
                    break
                keys.append(key)
                i += 1
            
            if keys:
                logger.info(f"Loaded {len(keys)} API keys from environment variables")
        
        if not keys:
            raise ValueError("No API keys found in .env file or environment variables")
        
        # Update internal state
        old_count = len(self._api_keys)
        self._api_keys = keys
        
        # Reset key index if it's out of bounds
        if self._current_key_index >= len(self._api_keys):
            self._current_key_index = 0
        
        # Update client with current key
        if self._api_keys:
            self.client = AsyncGroq(api_key=self._get_current_key())
        
        # Log if keys changed
        if old_count != len(keys):
            logger.info(f"✓ API keys updated: {old_count} → {len(keys)} keys")

    def _load_api_keys(self) -> List[str]:
        """
        Load API keys from environment variables.
        Deprecated: Use _refresh_api_keys() instead for dynamic reloading.
        """
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
        self._current_key_index = (self._current_key_index + 1) % len(self._api_keys)
        return self._get_current_key()

    async def _try_model_completion(self, messages: List[dict], model: str, **kwargs) -> Optional[str]:
        """
        Try to get completion from a specific model, cycling through all API keys if needed.
        This prioritizes model quality over API key - will try all keys before giving up on a model.
        Implements retry with exponential backoff when all keys hit rate limits.
        """
        timeout = kwargs.pop('timeout', 10)  # 10 seconds timeout
        retry_delay = kwargs.pop('retry_delay', 2)  # 1 second initial retry delay
        max_retry_attempts = kwargs.pop('max_retry_attempts', 2)  # Number of full retry cycles
        
        # Store original key index to restore later
        original_key_index = self._current_key_index
        
        # Track rate limit errors across all keys
        rate_limited_count = 0
        
        # Try multiple cycles if all keys are rate limited
        for retry_cycle in range(max_retry_attempts):
            if retry_cycle > 0:
                # Exponential backoff: wait longer on each retry cycle
                wait_time = retry_delay * (2 ** retry_cycle)
                logger.info(f"⏳ All keys rate-limited for model '{model}'. Waiting {wait_time}s before retry cycle {retry_cycle + 1}/{max_retry_attempts}")
                await asyncio.sleep(wait_time)
                rate_limited_count = 0  # Reset counter for new cycle
            
            # Try each API key index for this model
            for key_attempt in range(len(self._api_keys)):
                # Calculate which key index to try
                key_index = (original_key_index + key_attempt) % len(self._api_keys)
                api_key = self._api_keys[key_index]
                
                try:
                    # Update client to use this specific key
                    self._current_key_index = key_index
                    self.client = AsyncGroq(api_key=api_key)
                    
                    logger.info(f"Trying model '{model}' with API key #{key_index + 1}/{len(self._api_keys)}")
                    
                    chat_completion = await asyncio.wait_for(
                        self.client.chat.completions.create(
                            model=model,
                            messages=messages,
                            **kwargs
                        ),
                        timeout=timeout
                    )
                        
                    logger.info(f"✓ Successfully got response from model '{model}' with API key #{key_index + 1}")
                    return chat_completion.choices[0].message.content
                    
                except asyncio.TimeoutError:
                    logger.warning(f"⏱ Timeout with API key #{key_index + 1} for model '{model}'")
                    await asyncio.sleep(retry_delay)
                    continue
                    
                except Exception as e:
                    error_str = str(e).lower()
                    
                    # Check for rate limit errors specifically
                    if any(err in error_str for err in ["rate limit", "429", "tokens per day", "tpd"]):
                        rate_limited_count += 1
                        logger.warning(f"⚠ API key #{key_index + 1} rate limited for model '{model}': {str(e)[:150]}")
                        
                        # If all keys are rate limited and we haven't maxed out retries, break to retry cycle
                        if rate_limited_count >= len(self._api_keys) and retry_cycle < max_retry_attempts - 1:
                            break
                        
                        await asyncio.sleep(retry_delay)
                        continue
                    
                    # Check for other API key related errors (quota, auth issues)
                    elif any(err in error_str for err in [
                        "quota exceeded",
                        "invalid api key",
                        "authorization",
                        "authenticate",
                        "forbidden",
                        "401",
                        "403"
                    ]):
                        logger.warning(f"⚠ API key #{key_index + 1} error for model '{model}': {str(e)[:150]}")
                        await asyncio.sleep(retry_delay)
                        continue
                    
                    # For model-specific errors (model not available, not found, etc.)
                    elif any(err in error_str for err in ["model", "not found", "does not exist", "not available"]):
                        logger.warning(f"✗ Model '{model}' error: {str(e)[:150]}. Will try next model.")
                        # Restore original key index before returning
                        self._current_key_index = original_key_index
                        self.client = AsyncGroq(api_key=self._api_keys[original_key_index])
                        return None
                    
                    # For other errors, log and try next key
                    else:
                        logger.error(f"✗ Unexpected error with API key #{key_index + 1} for model '{model}': {str(e)[:150]}")
                        await asyncio.sleep(retry_delay)
                        continue
            
            # If all keys were rate limited but we have more retry attempts, continue to next cycle
            if rate_limited_count >= len(self._api_keys) and retry_cycle < max_retry_attempts - 1:
                continue
            else:
                # Either not all keys rate limited, or we've exhausted retries
                break
        
        # All API keys exhausted for this model (even after retries)
        # Restore original key index for next model attempt
        self._current_key_index = original_key_index
        self.client = AsyncGroq(api_key=self._api_keys[original_key_index])
        
        if rate_limited_count >= len(self._api_keys):
            logger.warning(f"⚠ All {len(self._api_keys)} API keys rate-limited for model '{model}' after {max_retry_attempts} retry cycles")
        else:
            logger.warning(f"⚠ All {len(self._api_keys)} API keys exhausted for model '{model}'")
        
        return None

    async def get_completion(
        self, 
        prompt: str, 
        completion_type: str,
        custom_system_message: str = None,
        **kwargs
    ) -> str:
        """
        Get completion with model-first fallback mechanism.
        Prioritizes trying all API keys for each model before moving to the next model.
        This ensures we get the best quality response by prioritizing better models.
        
        Dynamically reloads API keys from .env file on each call, allowing runtime updates
        without rebuilding or redeploying the application.
        
        Args:
            prompt: The prompt to send to the model
            completion_type: Type of completion ('job_description', 'resume_analysis', or 'email')
            custom_system_message: Optional custom system message to override default
            **kwargs: Additional parameters to override defaults
        """
        # Refresh API keys from .env file before each completion
        # This allows changing keys without restart/redeploy
        try:
            self._refresh_api_keys()
        except Exception as e:
            logger.warning(f"Failed to refresh API keys, using existing: {str(e)}")
        
        params = self.DEFAULT_PARAMS.get(completion_type, {}).copy()
        params.update(kwargs)  # Override with any custom parameters

        system_message = custom_system_message or params.pop("system_message")
        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ]

        last_error = None
        for model_index, model in enumerate(self.MODELS, 1):
            try:
                logger.info(f"[Model {model_index}/{len(self.MODELS)}] Trying model: {model} for {completion_type}")
                result = await self._try_model_completion(messages, model, **params)
                if result:
                    logger.info(f"✓ Successfully completed {completion_type} using model: {model}")
                    return result
                else:
                    logger.warning(f"✗ Model {model} failed for {completion_type}, trying next model...")
            except Exception as e:
                last_error = e
                logger.error(f"✗ Exception with model {model}: {str(e)}")
                continue

        # If we get here, all models have been exhausted
        error_msg = f"All {len(self.MODELS)} models exhausted for {completion_type}."
        if last_error:
            error_msg += f" Last error: {str(last_error)}"
        logger.error(error_msg)
        raise Exception(error_msg)

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
