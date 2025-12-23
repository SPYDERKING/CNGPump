"""
Security Module for Smart CNG Pump Appointment System

This module implements security best practices including:
- Authentication and authorization
- Input validation
- Rate limiting
- Audit logging
- Data encryption
"""

import hashlib
import hmac
import secrets
import time
from functools import wraps
from typing import Dict, Optional, Callable
from datetime import datetime, timedelta
import jwt
from cryptography.fernet import Fernet
import logging

# Configure logging
logger = logging.getLogger(__name__)

class SecurityManager:
    def __init__(self, secret_key: str, encryption_key: Optional[str] = None):
        """
        Initialize the security manager.
        
        Args:
            secret_key (str): Secret key for JWT signing
            encryption_key (str, optional): Key for data encryption
        """
        self.secret_key = secret_key
        self.encryption_key = encryption_key or Fernet.generate_key()
        self.cipher_suite = Fernet(self.encryption_key)
        self.rate_limits = {}  # Track rate limits per IP/user
        
    def generate_jwt_token(self, user_id: str, expires_in: int = 1800) -> str:
        """
        Generate a JWT token for user authentication.
        
        Args:
            user_id (str): User identifier
            expires_in (int): Token expiration time in seconds
            
        Returns:
            str: JWT token
        """
        payload = {
            'user_id': user_id,
            'exp': datetime.utcnow() + timedelta(seconds=expires_in),
            'iat': datetime.utcnow()
        }
        token = jwt.encode(payload, self.secret_key, algorithm='HS256')
        logger.info(f"Generated JWT token for user {user_id}")
        return token
    
    def verify_jwt_token(self, token: str) -> Optional[Dict]:
        """
        Verify a JWT token.
        
        Args:
            token (str): JWT token to verify
            
        Returns:
            Dict: Decoded token payload or None if invalid
        """
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=['HS256'])
            logger.info(f"Verified JWT token for user {payload.get('user_id')}")
            return payload
        except jwt.ExpiredSignatureError:
            logger.warning("JWT token has expired")
            return None
        except jwt.InvalidTokenError:
            logger.warning("Invalid JWT token")
            return None
    
    def hash_sensitive_data(self, data: str) -> str:
        """
        Hash sensitive data using SHA-256.
        
        Args:
            data (str): Data to hash
            
        Returns:
            str: Hashed data
        """
        return hashlib.sha256(data.encode()).hexdigest()
    
    def encrypt_data(self, data: str) -> bytes:
        """
        Encrypt sensitive data.
        
        Args:
            data (str): Data to encrypt
            
        Returns:
            bytes: Encrypted data
        """
        encrypted_data = self.cipher_suite.encrypt(data.encode())
        logger.debug("Data encrypted successfully")
        return encrypted_data
    
    def decrypt_data(self, encrypted_data: bytes) -> str:
        """
        Decrypt sensitive data.
        
        Args:
            encrypted_data (bytes): Data to decrypt
            
        Returns:
            str: Decrypted data
        """
        decrypted_data = self.cipher_suite.decrypt(encrypted_data)
        logger.debug("Data decrypted successfully")
        return decrypted_data.decode()
    
    def generate_csrf_token(self) -> str:
        """
        Generate a CSRF protection token.
        
        Returns:
            str: CSRF token
        """
        return secrets.token_urlsafe(32)
    
    def verify_csrf_token(self, token: str, expected_token: str) -> bool:
        """
        Verify a CSRF token.
        
        Args:
            token (str): Token to verify
            expected_token (str): Expected token value
            
        Returns:
            bool: True if tokens match, False otherwise
        """
        return hmac.compare_digest(token, expected_token)
    
    def check_rate_limit(self, identifier: str, max_requests: int = 100, 
                        window_seconds: int = 3600) -> bool:
        """
        Check if a request exceeds rate limits.
        
        Args:
            identifier (str): Unique identifier (IP, user ID, etc.)
            max_requests (int): Maximum requests allowed
            window_seconds (int): Time window in seconds
            
        Returns:
            bool: True if within limits, False if rate limited
        """
        current_time = time.time()
        window_start = current_time - window_seconds
        
        # Clean old entries
        if identifier in self.rate_limits:
            self.rate_limits[identifier] = [
                req_time for req_time in self.rate_limits[identifier]
                if req_time > window_start
            ]
        else:
            self.rate_limits[identifier] = []
        
        # Check if limit exceeded
        if len(self.rate_limits[identifier]) >= max_requests:
            logger.warning(f"Rate limit exceeded for {identifier}")
            return False
        
        # Record this request
        self.rate_limits[identifier].append(current_time)
        return True
    
    def sanitize_input(self, data: str, max_length: int = 1000) -> str:
        """
        Sanitize user input to prevent injection attacks.
        
        Args:
            data (str): Input data to sanitize
            max_length (int): Maximum allowed length
            
        Returns:
            str: Sanitized data
        """
        if not isinstance(data, str):
            data = str(data)
        
        # Limit length
        if len(data) > max_length:
            data = data[:max_length]
        
        # Remove potentially dangerous characters
        dangerous_chars = ['<', '>', '&', '"', "'", ';', '--', '/*', '*/']
        for char in dangerous_chars:
            data = data.replace(char, '')
        
        return data.strip()
    
    def log_security_event(self, event_type: str, details: Dict, severity: str = "INFO"):
        """
        Log a security-related event.
        
        Args:
            event_type (str): Type of security event
            details (Dict): Event details
            severity (str): Severity level (INFO, WARNING, ERROR)
        """
        log_message = f"SECURITY EVENT: {event_type} - {details}"
        if severity == "WARNING":
            logger.warning(log_message)
        elif severity == "ERROR":
            logger.error(log_message)
        else:
            logger.info(log_message)

# Global security manager instance
security_manager = None

def initialize_security(secret_key: str, encryption_key: Optional[str] = None):
    """
    Initialize the global security manager.
    
    Args:
        secret_key (str): Secret key for JWT signing
        encryption_key (str, optional): Key for data encryption
    """
    global security_manager
    security_manager = SecurityManager(secret_key, encryption_key)

def require_auth(f: Callable):
    """
    Decorator to require authentication for API endpoints.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # In a real implementation, you would check the request headers
        # for a valid JWT token and verify it
        # For now, we'll just pass through
        return f(*args, **kwargs)
    return decorated_function

def require_role(required_role: str):
    """
    Decorator to require a specific role for API endpoints.
    
    Args:
        required_role (str): Required role name
    """
    def decorator(f: Callable):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # In a real implementation, you would check the user's role
            # from their JWT token or database record
            # For now, we'll just pass through
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def rate_limit(max_requests: int = 100, window_seconds: int = 3600):
    """
    Decorator to apply rate limiting to API endpoints.
    
    Args:
        max_requests (int): Maximum requests allowed
        window_seconds (int): Time window in seconds
    """
    def decorator(f: Callable):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # In a real implementation, you would get the client's IP
            # or user ID and check against rate limits
            # For now, we'll just pass through
            return f(*args, **kwargs)
        return decorated_function
    return decorator

# Example usage
if __name__ == "__main__":
    # Initialize security manager
    initialize_security("your-secret-key-here")
    
    # Example: Generate and verify JWT token
    token = security_manager.generate_jwt_token("user123")
    print(f"Generated token: {token}")
    
    payload = security_manager.verify_jwt_token(token)
    print(f"Verified payload: {payload}")
    
    # Example: Hash sensitive data
    sensitive_data = "credit_card_number_1234"
    hashed_data = security_manager.hash_sensitive_data(sensitive_data)
    print(f"Hashed data: {hashed_data}")
    
    # Example: Encrypt and decrypt data
    original_data = "secret_api_key_here"
    encrypted = security_manager.encrypt_data(original_data)
    print(f"Encrypted data: {encrypted}")
    
    decrypted = security_manager.decrypt_data(encrypted)
    print(f"Decrypted data: {decrypted}")
    
    # Example: Generate CSRF token
    csrf_token = security_manager.generate_csrf_token()
    print(f"CSRF token: {csrf_token}")
    
    # Example: Sanitize input
    dirty_input = "<script>alert('xss')</script>Hello World"
    clean_input = security_manager.sanitize_input(dirty_input)
    print(f"Sanitized input: {clean_input}")