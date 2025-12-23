from models.pump import Pump
from db import engine, Base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# Create database session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

# Create sample pumps
sample_pumps = [
    Pump(
        name="Green Valley CNG Station",
        address="123 Main Street",
        city="New York",
        latitude=40.7128,
        longitude=-74.0060,
        total_capacity=1000,
        remaining_capacity=850,
        walkin_lanes=2,
        booked_lanes=2,
        rating=4.5,
        is_open=True
    ),
    Pump(
        name="Downtown CNG Hub",
        address="456 Broadway Ave",
        city="New York",
        latitude=40.7589,
        longitude=-73.9851,
        total_capacity=1200,
        remaining_capacity=600,
        walkin_lanes=3,
        booked_lanes=3,
        rating=4.2,
        is_open=True
    ),
    Pump(
        name="Westside Fuel Center",
        address="789 Park Boulevard",
        city="New York",
        latitude=40.7831,
        longitude=-73.9712,
        total_capacity=800,
        remaining_capacity=200,
        walkin_lanes=1,
        booked_lanes=2,
        rating=4.0,
        is_open=True
    )
]

# Add pumps to database
for pump in sample_pumps:
    # Check if pump already exists
    existing_pump = db.query(Pump).filter(Pump.name == pump.name).first()
    if not existing_pump:
        db.add(pump)

db.commit()
print("Sample pumps added to database successfully!")
db.close()