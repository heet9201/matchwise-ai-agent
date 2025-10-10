#!/usr/bin/env python3
"""
Keep-Alive Script for Render.com and Free Hosting Platforms

This standalone script prevents your deployed application from shutting down
due to inactivity on free hosting platforms like Render.com, Heroku, Railway, etc.

PURPOSE:
--------
Free hosting platforms typically shut down your application after 15-30 minutes
of inactivity to save resources. This script periodically pings your backend and
frontend URLs to keep them alive 24/7.

USAGE:
------
1. Run as a standalone script:
   python keep_alive.py

2. Run in background (Linux/Mac):
   nohup python keep_alive.py &

3. Run as a service (recommended for production):
   - Use systemd (Linux)
   - Use pm2 (Node.js process manager)
   - Deploy as a separate service on Render/Railway

CONFIGURATION:
-------------
All settings are loaded from the .env file in the same directory:

- KEEP_ALIVE_ENABLED: Set to 'true' to enable pinging (default: 'false')
- KEEP_ALIVE_FREQUENCY_MINUTES: How often to ping in minutes (default: 5)
- KEEP_ALIVE_BACKEND_URL: Your backend URL (default: http://localhost:8000)
- KEEP_ALIVE_FRONTEND_URL: Your frontend URL (default: http://localhost:3000)

EXAMPLE .env:
------------
KEEP_ALIVE_ENABLED=true
KEEP_ALIVE_FREQUENCY_MINUTES=5
KEEP_ALIVE_BACKEND_URL=https://your-app.onrender.com
KEEP_ALIVE_FRONTEND_URL=https://your-frontend.onrender.com

RENDER.COM SPECIFIC:
-------------------
For Render.com free tier:
1. Deploy this script as a separate "Background Worker" service
2. Set the Start Command: python keep_alive.py
3. Configure environment variables in Render dashboard
4. The worker will keep both your backend and frontend alive

DEPLOYMENT OPTIONS:
------------------
Option 1: Run as part of main application (already integrated in main.py)
Option 2: Deploy as separate background worker on Render
Option 3: Run on your local machine if always online
Option 4: Deploy on a different platform with better uptime (AWS Lambda, etc.)

LOGGING:
--------
The script logs all ping attempts with timestamps:
- ✓ Successful pings
- ⚠ Warning for non-200 responses
- ❌ Errors for connection failures
- ⏱ Timeout notifications

AUTHOR: Recruitment AI Agent Team
LICENSE: MIT
"""

import os
import time
import logging
import sys
from datetime import datetime
from typing import Optional
import requests
from dotenv import load_dotenv, dotenv_values

# Configure logging with timestamps and detailed format
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('keep_alive.log', mode='a')
    ]
)
logger = logging.getLogger(__name__)


def get_env_value(key: str, default: Optional[str] = None) -> Optional[str]:
    """
    Get environment variable value by reloading .env file.
    This ensures we always get the latest value from .env without restarting.
    
    Args:
        key: Environment variable name
        default: Default value if not found
        
    Returns:
        Environment variable value or default
    """
    # Get the .env file path (same directory as this script)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    env_path = os.path.join(script_dir, '.env')
    
    if os.path.exists(env_path):
        # Reload .env values fresh each time
        env_values = dotenv_values(env_path)
        return env_values.get(key, default)
    
    # Fallback to system environment variables
    return os.getenv(key, default)


def ping_url(url: str, name: str, timeout: int = 10) -> bool:
    """
    Ping a URL and return success status.
    
    Args:
        url: URL to ping
        name: Name for logging (e.g., "Backend", "Frontend")
        timeout: Request timeout in seconds
        
    Returns:
        True if ping successful, False otherwise
    """
    try:
        logger.info(f"🔄 Pinging {name}: {url}")
        response = requests.get(url, timeout=timeout)
        
        if response.status_code == 200:
            logger.info(f"✓ {name} ping successful (status: {response.status_code})")
            return True
        else:
            logger.warning(f"⚠ {name} ping returned status: {response.status_code}")
            return False
            
    except requests.exceptions.Timeout:
        logger.warning(f"⏱ {name} ping timeout after {timeout}s")
        return False
        
    except requests.exceptions.ConnectionError:
        logger.warning(f"⚠ {name} ping connection error: {url}")
        return False
        
    except Exception as e:
        logger.error(f"❌ {name} ping error: {str(e)}")
        return False


def run_keep_alive():
    """
    Main keep-alive loop that pings backend and frontend URLs.
    Runs continuously until interrupted (Ctrl+C).
    """
    logger.info("=" * 80)
    logger.info("🚀 Keep-Alive Script Started")
    logger.info("=" * 80)
    logger.info("Purpose: Prevent Render.com and free hosting platforms from sleeping")
    logger.info("Press Ctrl+C to stop")
    logger.info("=" * 80)
    
    # Load initial configuration
    load_dotenv()
    
    ping_count = 0
    
    try:
        while True:
            ping_count += 1
            logger.info(f"\n{'=' * 80}")
            logger.info(f"Ping Cycle #{ping_count} - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            logger.info(f"{'=' * 80}")
            
            # Reload configuration from .env (allows runtime changes)
            keep_alive_enabled = get_env_value('KEEP_ALIVE_ENABLED', 'false').lower() == 'true'
            
            if not keep_alive_enabled:
                logger.warning("⚠ Keep-alive is disabled in .env file")
                logger.info("Set KEEP_ALIVE_ENABLED=true in .env to enable pinging")
                logger.info("Waiting 60 seconds before checking again...")
                time.sleep(60)
                continue
            
            # Get configuration
            try:
                frequency_minutes = int(get_env_value('KEEP_ALIVE_FREQUENCY_MINUTES', '5'))
            except (ValueError, TypeError):
                logger.error("❌ Invalid KEEP_ALIVE_FREQUENCY_MINUTES value, using default: 5")
                frequency_minutes = 5
            
            backend_url = get_env_value('KEEP_ALIVE_BACKEND_URL', 'http://localhost:8000')
            frontend_url = get_env_value('KEEP_ALIVE_FRONTEND_URL', 'http://localhost:3000')
            
            logger.info(f"Configuration:")
            logger.info(f"  - Frequency: {frequency_minutes} minutes")
            logger.info(f"  - Backend URL: {backend_url}")
            logger.info(f"  - Frontend URL: {frontend_url}")
            logger.info("")
            
            # Ping backend (use /health endpoint for better reliability)
            backend_success = ping_url(f"{backend_url}/health", "Backend")
            
            # Small delay between requests
            time.sleep(2)
            
            # Ping frontend
            frontend_success = ping_url(frontend_url, "Frontend")
            
            # Summary
            logger.info("")
            logger.info(f"📊 Ping Summary:")
            logger.info(f"  - Backend: {'✓ Success' if backend_success else '❌ Failed'}")
            logger.info(f"  - Frontend: {'✓ Success' if frontend_success else '❌ Failed'}")
            logger.info(f"  - Next ping in {frequency_minutes} minutes")
            logger.info(f"{'=' * 80}\n")
            
            # Wait for the configured frequency
            frequency_seconds = frequency_minutes * 60
            time.sleep(frequency_seconds)
            
    except KeyboardInterrupt:
        logger.info("\n" + "=" * 80)
        logger.info("🛑 Keep-Alive Script Stopped by User")
        logger.info(f"Total ping cycles completed: {ping_count}")
        logger.info("=" * 80)
        sys.exit(0)
        
    except Exception as e:
        logger.error(f"\n❌ Unexpected error in keep-alive loop: {str(e)}")
        logger.error("Script will exit. Please restart.")
        sys.exit(1)


def validate_configuration():
    """
    Validate that the configuration is properly set up.
    Prints warnings if configuration is missing or invalid.
    """
    logger.info("🔍 Validating configuration...")
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    env_path = os.path.join(script_dir, '.env')
    
    if not os.path.exists(env_path):
        logger.warning("⚠ .env file not found!")
        logger.warning(f"Expected location: {env_path}")
        logger.warning("Using default values or system environment variables")
        return False
    
    # Check required variables
    load_dotenv()
    
    enabled = get_env_value('KEEP_ALIVE_ENABLED')
    if not enabled or enabled.lower() != 'true':
        logger.warning("⚠ KEEP_ALIVE_ENABLED is not set to 'true'")
        logger.warning("The script will run but won't perform pings")
        return False
    
    backend_url = get_env_value('KEEP_ALIVE_BACKEND_URL')
    frontend_url = get_env_value('KEEP_ALIVE_FRONTEND_URL')
    
    if not backend_url:
        logger.warning("⚠ KEEP_ALIVE_BACKEND_URL not set, using default: http://localhost:8000")
    
    if not frontend_url:
        logger.warning("⚠ KEEP_ALIVE_FRONTEND_URL not set, using default: http://localhost:3000")
    
    logger.info("✓ Configuration validated")
    return True


if __name__ == "__main__":
    """
    Entry point for the keep-alive script.
    Run this file directly to start the keep-alive service.
    """
    print("\n" + "=" * 80)
    print("  KEEP-ALIVE SCRIPT FOR RENDER.COM & FREE HOSTING PLATFORMS")
    print("=" * 80)
    print("  This script prevents your application from shutting down")
    print("  by periodically pinging your backend and frontend URLs.")
    print("=" * 80 + "\n")
    
    # Validate configuration before starting
    validate_configuration()
    
    # Start the keep-alive service
    run_keep_alive()
