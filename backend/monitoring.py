#!/usr/bin/env python3
"""
System monitoring script for the Smart CNG Pump Appointment System.

This script checks the health of various system components and sends alerts
if any issues are detected.
"""

import requests
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import os
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/smart-pump/monitoring.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Configuration
HEALTH_CHECK_URL = os.getenv('HEALTH_CHECK_URL', 'http://localhost:8000/health')
ADMIN_EMAIL = os.getenv('ADMIN_EMAIL', 'admin@smartpump.example.com')
SMTP_SERVER = os.getenv('SMTP_SERVER', 'localhost')
SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
SMTP_USER = os.getenv('SMTP_USER', '')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', '')

def check_api_health():
    """Check if the API is responding correctly"""
    try:
        response = requests.get(HEALTH_CHECK_URL, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'healthy':
                logger.info("API health check: PASSED")
                return True
            else:
                logger.error(f"API health check: FAILED - Unexpected status: {data}")
                return False
        else:
            logger.error(f"API health check: FAILED - Status code: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        logger.error(f"API health check: FAILED - Connection error: {e}")
        return False

def check_database_connection():
    """Check database connectivity"""
    # In a real implementation, you would connect to the database
    # and run a simple query to verify connectivity
    try:
        # This is a placeholder - implement actual database check
        logger.info("Database connection check: SKIPPED (not implemented)")
        return True
    except Exception as e:
        logger.error(f"Database connection check: FAILED - {e}")
        return False

def check_redis_connection():
    """Check Redis connectivity"""
    # In a real implementation, you would connect to Redis
    # and run a simple command to verify connectivity
    try:
        # This is a placeholder - implement actual Redis check
        logger.info("Redis connection check: SKIPPED (not implemented)")
        return True
    except Exception as e:
        logger.error(f"Redis connection check: FAILED - {e}")
        return False

def send_alert(subject, message):
    """Send an alert email to administrators"""
    if not SMTP_USER or not SMTP_PASSWORD:
        logger.warning("SMTP credentials not configured - skipping alert email")
        return
    
    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_USER
        msg['To'] = ADMIN_EMAIL
        msg['Subject'] = subject
        
        body = f"{message}\n\nTime: {datetime.now()}\nSystem: Smart CNG Pump Appointment System"
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        text = msg.as_string()
        server.sendmail(SMTP_USER, ADMIN_EMAIL, text)
        server.quit()
        
        logger.info(f"Alert sent: {subject}")
    except Exception as e:
        logger.error(f"Failed to send alert: {e}")

def main():
    """Main monitoring function"""
    logger.info("Starting system health check")
    
    # Perform checks
    api_healthy = check_api_health()
    db_connected = check_database_connection()
    redis_connected = check_redis_connection()
    
    # Overall system health
    system_healthy = api_healthy and db_connected and redis_connected
    
    if system_healthy:
        logger.info("All systems operational")
        return 0
    else:
        logger.error("System health issues detected")
        
        # Send alerts for specific failures
        if not api_healthy:
            send_alert(
                "API Service Down",
                "The Smart CNG Pump Appointment System API is not responding correctly."
            )
        
        if not db_connected:
            send_alert(
                "Database Connection Failed",
                "The system cannot connect to the database."
            )
        
        if not redis_connected:
            send_alert(
                "Redis Connection Failed",
                "The system cannot connect to Redis."
            )
        
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)