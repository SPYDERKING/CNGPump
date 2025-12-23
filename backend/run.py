#!/usr/bin/env python3
"""
Script to run the Smart CNG Pump Appointment System backend.

This script provides a convenient way to start the application with different options.
"""

import argparse
import subprocess
import sys
import os

def run_development():
    """Run the application in development mode with auto-reload"""
    print("Starting Smart CNG Pump Appointment System in development mode...")
    subprocess.run(["uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"])

def run_production():
    """Run the application in production mode"""
    print("Starting Smart CNG Pump Appointment System in production mode...")
    subprocess.run(["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"])

def init_database():
    """Initialize the database tables"""
    print("Initializing database...")
    subprocess.run(["python", "init_db.py"])

def run_tests():
    """Run the test suite"""
    print("Running tests...")
    subprocess.run(["pytest", "tests", "-v"])

def run_workers():
    """Start Celery workers"""
    print("Starting Celery workers...")
    subprocess.run(["celery", "-A", "celery_app", "worker", "--loglevel=info"])

def run_beat():
    """Start Celery beat scheduler"""
    print("Starting Celery beat scheduler...")
    subprocess.run(["celery", "-A", "celery_app", "beat", "--loglevel=info"])

def main():
    parser = argparse.ArgumentParser(description="Smart CNG Pump Appointment System Runner")
    parser.add_argument(
        "command",
        choices=["dev", "prod", "init-db", "test", "workers", "beat"],
        help="Command to run"
    )
    
    args = parser.parse_args()
    
    # Change to backend directory if not already there
    if not os.path.exists("main.py"):
        if os.path.exists("backend/main.py"):
            os.chdir("backend")
        else:
            print("Error: Could not find main.py. Are you in the correct directory?")
            sys.exit(1)
    
    if args.command == "dev":
        run_development()
    elif args.command == "prod":
        run_production()
    elif args.command == "init-db":
        init_database()
    elif args.command == "test":
        run_tests()
    elif args.command == "workers":
        run_workers()
    elif args.command == "beat":
        run_beat()

if __name__ == "__main__":
    main()