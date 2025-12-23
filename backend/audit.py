"""
Audit Logging System for Smart CNG Pump Appointment System

This module provides comprehensive audit logging capabilities including:
- User activity tracking
- Data access logging
- Security event monitoring
- Compliance reporting
"""

import json
import logging
from datetime import datetime
from enum import Enum
from typing import Dict, Any, Optional
import uuid

# Configure audit logging
audit_logger = logging.getLogger('audit')
audit_logger.setLevel(logging.INFO)

# Create file handler for audit logs
handler = logging.FileHandler('audit.log')
handler.setLevel(logging.INFO)

# Create formatter
formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
handler.setFormatter(formatter)

# Add handler to audit logger
audit_logger.addHandler(handler)

class AuditEventType(Enum):
    """Enumeration of audit event types"""
    USER_LOGIN = "USER_LOGIN"
    USER_LOGOUT = "USER_LOGOUT"
    USER_REGISTER = "USER_REGISTER"
    USER_UPDATE = "USER_UPDATE"
    USER_DELETE = "USER_DELETE"
    BOOKING_CREATE = "BOOKING_CREATE"
    BOOKING_UPDATE = "BOOKING_UPDATE"
    BOOKING_CANCEL = "BOOKING_CANCEL"
    TOKEN_GENERATE = "TOKEN_GENERATE"
    TOKEN_VALIDATE = "TOKEN_VALIDATE"
    TOKEN_USE = "TOKEN_USE"
    PAYMENT_PROCESS = "PAYMENT_PROCESS"
    PUMP_CREATE = "PUMP_CREATE"
    PUMP_UPDATE = "PUMP_UPDATE"
    PUMP_DELETE = "PUMP_DELETE"
    DATA_ACCESS = "DATA_ACCESS"
    SECURITY_VIOLATION = "SECURITY_VIOLATION"
    SYSTEM_ERROR = "SYSTEM_ERROR"

class AuditLogger:
    """Audit logging system for tracking system events"""
    
    def __init__(self):
        """Initialize the audit logger"""
        self.logger = audit_logger
    
    def log_event(self, 
                  event_type: AuditEventType,
                  user_id: Optional[str] = None,
                  ip_address: Optional[str] = None,
                  user_agent: Optional[str] = None,
                  resource_id: Optional[str] = None,
                  details: Optional[Dict[Any, Any]] = None,
                  severity: str = "INFO"):
        """
        Log an audit event.
        
        Args:
            event_type (AuditEventType): Type of event
            user_id (str, optional): ID of user performing the action
            ip_address (str, optional): IP address of the request
            user_agent (str, optional): User agent string
            resource_id (str, optional): ID of resource being accessed
            details (Dict, optional): Additional event details
            severity (str): Severity level (INFO, WARNING, ERROR)
        """
        event_data = {
            "event_id": str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": event_type.value,
            "user_id": user_id,
            "ip_address": ip_address,
            "user_agent": user_agent,
            "resource_id": resource_id,
            "details": details or {}
        }
        
        log_message = json.dumps(event_data)
        
        if severity == "ERROR":
            self.logger.error(log_message)
        elif severity == "WARNING":
            self.logger.warning(log_message)
        else:
            self.logger.info(log_message)
    
    def log_user_login(self, user_id: str, ip_address: str, success: bool, 
                      failure_reason: Optional[str] = None):
        """
        Log a user login attempt.
        
        Args:
            user_id (str): ID of user attempting to login
            ip_address (str): IP address of the request
            success (bool): Whether login was successful
            failure_reason (str, optional): Reason for login failure
        """
        details = {"success": success}
        if failure_reason:
            details["failure_reason"] = failure_reason
            
        self.log_event(
            event_type=AuditEventType.USER_LOGIN,
            user_id=user_id,
            ip_address=ip_address,
            details=details,
            severity="WARNING" if not success else "INFO"
        )
    
    def log_user_registration(self, user_id: str, ip_address: str, 
                            email: str, phone: Optional[str] = None):
        """
        Log a user registration.
        
        Args:
            user_id (str): ID of newly registered user
            ip_address (str): IP address of the request
            email (str): User's email address
            phone (str, optional): User's phone number
        """
        details = {
            "email": email,
            "phone": phone
        }
        
        self.log_event(
            event_type=AuditEventType.USER_REGISTER,
            user_id=user_id,
            ip_address=ip_address,
            details=details
        )
    
    def log_booking_activity(self, event_type: AuditEventType, booking_id: str,
                           user_id: str, pump_id: str, ip_address: str,
                           details: Optional[Dict] = None):
        """
        Log booking-related activities.
        
        Args:
            event_type (AuditEventType): Type of booking event
            booking_id (str): ID of booking
            user_id (str): ID of user performing the action
            pump_id (str): ID of pump
            ip_address (str): IP address of the request
            details (Dict, optional): Additional details
        """
        event_details = {
            "booking_id": booking_id,
            "pump_id": pump_id
        }
        
        if details:
            event_details.update(details)
        
        self.log_event(
            event_type=event_type,
            user_id=user_id,
            ip_address=ip_address,
            resource_id=booking_id,
            details=event_details
        )
    
    def log_token_activity(self, event_type: AuditEventType, token_id: str,
                          booking_id: str, user_id: str, ip_address: str,
                          details: Optional[Dict] = None):
        """
        Log token-related activities.
        
        Args:
            event_type (AuditEventType): Type of token event
            token_id (str): ID of token
            booking_id (str): ID of associated booking
            user_id (str): ID of user performing the action
            ip_address (str): IP address of the request
            details (Dict, optional): Additional details
        """
        event_details = {
            "token_id": token_id,
            "booking_id": booking_id
        }
        
        if details:
            event_details.update(details)
        
        self.log_event(
            event_type=event_type,
            user_id=user_id,
            ip_address=ip_address,
            resource_id=token_id,
            details=event_details
        )
    
    def log_security_violation(self, violation_type: str, user_id: Optional[str],
                              ip_address: str, description: str,
                              details: Optional[Dict] = None):
        """
        Log a security violation.
        
        Args:
            violation_type (str): Type of security violation
            user_id (str, optional): ID of user involved
            ip_address (str): IP address of the request
            description (str): Description of the violation
            details (Dict, optional): Additional details
        """
        event_details = {
            "violation_type": violation_type,
            "description": description
        }
        
        if details:
            event_details.update(details)
        
        self.log_event(
            event_type=AuditEventType.SECURITY_VIOLATION,
            user_id=user_id,
            ip_address=ip_address,
            details=event_details,
            severity="ERROR"
        )
    
    def log_system_error(self, error_type: str, description: str,
                        user_id: Optional[str] = None, ip_address: Optional[str] = None,
                        details: Optional[Dict] = None):
        """
        Log a system error.
        
        Args:
            error_type (str): Type of error
            description (str): Description of the error
            user_id (str, optional): ID of user involved
            ip_address (str, optional): IP address of the request
            details (Dict, optional): Additional details
        """
        event_details = {
            "error_type": error_type,
            "description": description
        }
        
        if details:
            event_details.update(details)
        
        self.log_event(
            event_type=AuditEventType.SYSTEM_ERROR,
            user_id=user_id,
            ip_address=ip_address,
            details=event_details,
            severity="ERROR"
        )

# Global audit logger instance
audit_logger_instance = AuditLogger()

# Convenience functions
def log_user_login(user_id: str, ip_address: str, success: bool, 
                  failure_reason: Optional[str] = None):
    """Log a user login attempt"""
    audit_logger_instance.log_user_login(user_id, ip_address, success, failure_reason)

def log_user_registration(user_id: str, ip_address: str, email: str, 
                         phone: Optional[str] = None):
    """Log a user registration"""
    audit_logger_instance.log_user_registration(user_id, ip_address, email, phone)

def log_booking_create(booking_id: str, user_id: str, pump_id: str, 
                      ip_address: str, details: Optional[Dict] = None):
    """Log booking creation"""
    audit_logger_instance.log_booking_activity(
        AuditEventType.BOOKING_CREATE, booking_id, user_id, pump_id, ip_address, details
    )

def log_booking_update(booking_id: str, user_id: str, pump_id: str, 
                      ip_address: str, details: Optional[Dict] = None):
    """Log booking update"""
    audit_logger_instance.log_booking_activity(
        AuditEventType.BOOKING_UPDATE, booking_id, user_id, pump_id, ip_address, details
    )

def log_booking_cancel(booking_id: str, user_id: str, pump_id: str, 
                      ip_address: str, details: Optional[Dict] = None):
    """Log booking cancellation"""
    audit_logger_instance.log_booking_activity(
        AuditEventType.BOOKING_CANCEL, booking_id, user_id, pump_id, ip_address, details
    )

def log_token_generate(token_id: str, booking_id: str, user_id: str, 
                      ip_address: str, details: Optional[Dict] = None):
    """Log token generation"""
    audit_logger_instance.log_token_activity(
        AuditEventType.TOKEN_GENERATE, token_id, booking_id, user_id, ip_address, details
    )

def log_token_validate(token_id: str, booking_id: str, user_id: str, 
                      ip_address: str, details: Optional[Dict] = None):
    """Log token validation"""
    audit_logger_instance.log_token_activity(
        AuditEventType.TOKEN_VALIDATE, token_id, booking_id, user_id, ip_address, details
    )

def log_token_use(token_id: str, booking_id: str, user_id: str, 
                 ip_address: str, details: Optional[Dict] = None):
    """Log token usage"""
    audit_logger_instance.log_token_activity(
        AuditEventType.TOKEN_USE, token_id, booking_id, user_id, ip_address, details
    )

def log_security_violation(violation_type: str, user_id: Optional[str],
                          ip_address: str, description: str,
                          details: Optional[Dict] = None):
    """Log a security violation"""
    audit_logger_instance.log_security_violation(
        violation_type, user_id, ip_address, description, details
    )

def log_system_error(error_type: str, description: str,
                    user_id: Optional[str] = None, ip_address: Optional[str] = None,
                    details: Optional[Dict] = None):
    """Log a system error"""
    audit_logger_instance.log_system_error(
        error_type, description, user_id, ip_address, details
    )

# Example usage
if __name__ == "__main__":
    # Example: Log user login
    log_user_login(
        user_id="user123",
        ip_address="192.168.1.100",
        success=True
    )
    
    # Example: Log booking creation
    log_booking_create(
        booking_id="booking456",
        user_id="user123",
        pump_id="pump789",
        ip_address="192.168.1.100",
        details={
            "slot_date": "2023-12-25",
            "slot_time": "14:30",
            "fuel_quantity": 10.5
        }
    )
    
    # Example: Log token generation
    log_token_generate(
        token_id="tokenabc",
        booking_id="booking456",
        user_id="user123",
        ip_address="192.168.1.100",
        details={
            "token_code": "CNG-ABC123"
        }
    )
    
    # Example: Log security violation
    log_security_violation(
        violation_type="INVALID_TOKEN",
        user_id="user123",
        ip_address="192.168.1.100",
        description="Attempted to use expired token",
        details={
            "token_code": "CNG-XYZ789"
        }
    )
    
    print("Audit events logged successfully. Check audit.log for details.")