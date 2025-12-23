import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db import Base, get_db
from main import app
from schemas.user import UserCreate

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

def test_register_user():
    """Test user registration endpoint"""
    user_data = {
        "email": "test@example.com",
        "password": "testpassword",
        "full_name": "Test User",
        "phone": "+1234567890",
        "vehicle_number": "TEST123"
    }
    
    response = client.post("/api/users/register", json=user_data)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == user_data["email"]
    assert "id" in data
    assert "hashed_password" not in data  # Should not be exposed

def test_register_duplicate_user():
    """Test registering a user with existing email"""
    user_data = {
        "email": "test2@example.com",
        "password": "testpassword",
        "full_name": "Test User 2"
    }
    
    # Register user first time
    response1 = client.post("/api/users/register", json=user_data)
    assert response1.status_code == 200
    
    # Try to register the same user again
    response2 = client.post("/api/users/register", json=user_data)
    assert response2.status_code == 400
    assert "already exists" in response2.json()["detail"]

def test_login_user():
    """Test user login endpoint"""
    # First register a user
    user_data = {
        "email": "login_test@example.com",
        "password": "loginpassword",
        "full_name": "Login Test User"
    }
    
    client.post("/api/users/register", json=user_data)
    
    # Then try to login
    login_data = {
        "email": "login_test@example.com",
        "password": "loginpassword"
    }
    
    response = client.post("/api/users/login", json=login_data)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_invalid_credentials():
    """Test login with invalid credentials"""
    login_data = {
        "email": "nonexistent@example.com",
        "password": "wrongpassword"
    }
    
    response = client.post("/api/users/login", json=login_data)
    assert response.status_code == 401