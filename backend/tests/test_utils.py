import pytest
from utils.qr_generator import generate_qr_code, generate_token_code
from utils.security import get_password_hash, verify_password, create_access_token

def test_generate_qr_code():
    """Test QR code generation"""
    data = "test_data"
    qr_image, qr_data = generate_qr_code(data)
    
    assert isinstance(qr_image, str)
    assert qr_data == data
    # Check that the QR code is a valid base64 string
    assert qr_image.startswith("iVBORw0KGgo") or len(qr_image) > 100

def test_generate_token_code():
    """Test token code generation"""
    token_code = generate_token_code()
    
    assert isinstance(token_code, str)
    assert token_code.startswith("CNG-")
    assert len(token_code) == 10  # CNG- + 6 characters

def test_password_hashing():
    """Test password hashing and verification"""
    password = "test_password"
    hashed_password = get_password_hash(password)
    
    assert isinstance(hashed_password, str)
    assert verify_password(password, hashed_password) == True
    assert verify_password("wrong_password", hashed_password) == False

def test_create_access_token():
    """Test JWT access token creation"""
    data = {"sub": "test@example.com", "user_id": "123"}
    token = create_access_token(data)
    
    assert isinstance(token, str)
    assert len(token) > 50  # JWT tokens are typically long strings

def test_create_access_token_with_expiry():
    """Test JWT access token creation with custom expiry"""
    from datetime import timedelta
    
    data = {"sub": "test@example.com", "user_id": "123"}
    expires_delta = timedelta(minutes=15)
    token = create_access_token(data, expires_delta)
    
    assert isinstance(token, str)
    assert len(token) > 50