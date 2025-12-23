import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db import Base, get_db
from main import app
from datetime import date, time

# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def create_test_user_and_pump():
    """Helper function to create a test user and pump"""
    # Create a user
    user_data = {
        "email": "booking_test@example.com",
        "password": "bookingpassword",
        "full_name": "Booking Test User"
    }
    user_response = client.post("/api/users/register", json=user_data)
    user_id = user_response.json()["id"]
    
    # Create a pump
    pump_data = {
        "name": "Booking Test Pump",
        "address": "Booking Test Address",
        "city": "Booking Test City"
    }
    pump_response = client.post("/api/pumps/", json=pump_data)
    pump_id = pump_response.json()["id"]
    
    return user_id, pump_id

def test_create_booking():
    """Test creating a new booking"""
    user_id, pump_id = create_test_user_and_pump()
    
    booking_data = {
        "user_id": user_id,
        "pump_id": pump_id,
        "slot_date": str(date.today()),
        "slot_time": "10:00",
        "fuel_quantity": 10.5,
        "amount": 500.0
    }
    
    response = client.post("/api/bookings/", json=booking_data)
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == user_id
    assert data["pump_id"] == pump_id
    assert data["booking_status"] == "active"

def test_get_user_bookings():
    """Test getting bookings for a user"""
    user_id, pump_id = create_test_user_and_pump()
    
    # Create a booking
    booking_data = {
        "user_id": user_id,
        "pump_id": pump_id,
        "slot_date": str(date.today()),
        "slot_time": "11:00",
        "fuel_quantity": 15.0,
        "amount": 700.0
    }
    client.post("/api/bookings/", json=booking_data)
    
    # Get user bookings
    response = client.get(f"/api/bookings/?user_id={user_id}")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1

def test_cancel_booking():
    """Test cancelling a booking"""
    user_id, pump_id = create_test_user_and_pump()
    
    # Create a booking
    booking_data = {
        "user_id": user_id,
        "pump_id": pump_id,
        "slot_date": str(date.today()),
        "slot_time": "12:00",
        "fuel_quantity": 12.0,
        "amount": 600.0
    }
    create_response = client.post("/api/bookings/", json=booking_data)
    booking_id = create_response.json()["id"]
    
    # Cancel the booking
    response = client.delete(f"/api/bookings/{booking_id}")
    assert response.status_code == 200
    
    # Verify booking is cancelled
    get_response = client.get(f"/api/bookings/{booking_id}")
    assert get_response.status_code == 200
    data = get_response.json()
    assert data["booking_status"] == "cancelled"

def test_get_available_slots():
    """Test getting available slots for a pump"""
    user_id, pump_id = create_test_user_and_pump()
    
    # Get available slots
    test_date = date.today()
    response = client.get(f"/api/bookings/{pump_id}/slots/{test_date}")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)