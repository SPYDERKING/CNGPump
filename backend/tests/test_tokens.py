import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db import Base, get_db
from main import app
from datetime import date, time, datetime, timedelta

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

def create_test_booking():
    """Helper function to create a test booking"""
    # Create a user
    user_data = {
        "email": "token_test@example.com",
        "password": "tokenpassword",
        "full_name": "Token Test User"
    }
    user_response = client.post("/api/users/register", json=user_data)
    user_id = user_response.json()["id"]
    
    # Create a pump
    pump_data = {
        "name": "Token Test Pump",
        "address": "Token Test Address",
        "city": "Token Test City"
    }
    pump_response = client.post("/api/pumps/", json=pump_data)
    pump_id = pump_response.json()["id"]
    
    # Create a booking
    booking_data = {
        "user_id": user_id,
        "pump_id": pump_id,
        "slot_date": str(date.today()),
        "slot_time": "10:00",
        "fuel_quantity": 10.5,
        "amount": 500.0
    }
    booking_response = client.post("/api/bookings/", json=booking_data)
    booking_id = booking_response.json()["id"]
    
    return booking_id

def test_generate_token():
    """Test generating a token for a booking"""
    booking_id = create_test_booking()
    
    response = client.post(f"/api/tokens/generate/{booking_id}")
    assert response.status_code == 200
    data = response.json()
    assert "token" in data
    assert "qr_code" in data
    assert data["token"]["booking_id"] == booking_id

def test_validate_token():
    """Test validating a token"""
    booking_id = create_test_booking()
    
    # Generate a token first
    generate_response = client.post(f"/api/tokens/generate/{booking_id}")
    token_code = generate_response.json()["token"]["token_code"]
    
    # Validate the token
    response = client.post(f"/api/tokens/validate/{token_code}")
    assert response.status_code == 200
    data = response.json()
    assert data["valid"] == True
    assert "token" in data

def test_use_token():
    """Test marking a token as used"""
    booking_id = create_test_booking()
    
    # Generate a token first
    generate_response = client.post(f"/api/tokens/generate/{booking_id}")
    token_id = generate_response.json()["token"]["id"]
    
    # Use the token
    response = client.post(f"/api/tokens/use/{token_id}")
    assert response.status_code == 200
    data = response.json()
    assert "token" in data
    assert data["token"]["status"] == "used"

def test_get_token_by_booking():
    """Test getting a token by booking ID"""
    booking_id = create_test_booking()
    
    # Generate a token first
    generate_response = client.post(f"/api/tokens/generate/{booking_id}")
    token_id = generate_response.json()["token"]["id"]
    
    # Get token by booking ID
    response = client.get(f"/api/tokens/booking/{booking_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == token_id
    assert data["booking_id"] == booking_id