import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db import Base, get_db
from main import app

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

def test_create_pump():
    """Test creating a new pump"""
    pump_data = {
        "name": "Test Pump",
        "address": "123 Test Street",
        "city": "Test City",
        "latitude": 28.613939,
        "longitude": 77.209021,
        "total_capacity": 1000,
        "remaining_capacity": 1000,
        "walkin_lanes": 2,
        "booked_lanes": 2,
        "rating": 4.5,
        "is_open": True
    }
    
    response = client.post("/api/pumps/", json=pump_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == pump_data["name"]
    assert data["city"] == pump_data["city"]
    assert "id" in data

def test_get_pumps():
    """Test getting all pumps"""
    response = client.get("/api/pumps/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_get_pump():
    """Test getting a specific pump"""
    # First create a pump
    pump_data = {
        "name": "Test Pump 2",
        "address": "456 Test Avenue",
        "city": "Test City 2"
    }
    
    create_response = client.post("/api/pumps/", json=pump_data)
    assert create_response.status_code == 200
    pump_id = create_response.json()["id"]
    
    # Then get the pump
    response = client.get(f"/api/pumps/{pump_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == pump_data["name"]

def test_update_pump():
    """Test updating a pump"""
    # First create a pump
    pump_data = {
        "name": "Original Pump Name",
        "address": "Original Address",
        "city": "Original City"
    }
    
    create_response = client.post("/api/pumps/", json=pump_data)
    assert create_response.status_code == 200
    pump_id = create_response.json()["id"]
    
    # Then update the pump
    update_data = {
        "name": "Updated Pump Name",
        "address": "Updated Address",
        "city": "Updated City"
    }
    
    response = client.put(f"/api/pumps/{pump_id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == update_data["name"]
    assert data["address"] == update_data["address"]

def test_delete_pump():
    """Test deleting a pump"""
    # First create a pump
    pump_data = {
        "name": "Pump to Delete",
        "address": "Deletion Address",
        "city": "Deletion City"
    }
    
    create_response = client.post("/api/pumps/", json=pump_data)
    assert create_response.status_code == 200
    pump_id = create_response.json()["id"]
    
    # Then delete the pump
    response = client.delete(f"/api/pumps/{pump_id}")
    assert response.status_code == 200
    
    # Verify pump is deleted
    get_response = client.get(f"/api/pumps/{pump_id}")
    assert get_response.status_code == 404