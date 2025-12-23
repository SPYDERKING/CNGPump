from sqlalchemy import create_engine
from db import engine
from models.user import User, UserProfile, UserRoles
from models.pump import Pump
from models.booking import Booking
from models.token import Token, TokenScan
from models.payment import Payment
from models.reminder import Reminder
from models.ai_data import AIData
from models.pump_admin import PumpAdmin
from models.base import Base
import sys

def init_database():
    """Initialize the database by creating all tables"""
    print("Creating database tables...")
    print(f"Database URL: {engine.url}")
    
    # Print all tables that should be created
    print("Tables to be created:")
    for table_name in Base.metadata.tables:
        print(f"  - {table_name}")
    
    print(f"Number of tables: {len(Base.metadata.tables)}")
    
    # Create all tables
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully!")
    except Exception as e:
        print(f"Error creating tables: {e}")
        sys.exit(1)

if __name__ == "__main__":
    init_database()