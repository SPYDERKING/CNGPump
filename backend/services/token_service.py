from sqlalchemy.orm import Session
from models.token import Token, TokenScan
from schemas.token import TokenCreate, TokenUpdate, TokenScanCreate
from utils.qr_generator import generate_qr_code, generate_token_code
from uuid import UUID
from typing import List, Optional, Tuple
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class TokenService:
    def get_token_by_id(self, db: Session, token_id: UUID) -> Token:
        return db.query(Token).filter(Token.id == token_id).first()
    
    def get_token_by_booking_id(self, db: Session, booking_id: UUID) -> Token:
        # Convert UUID to string for SQLite compatibility
        booking_id_str = str(booking_id)
        return db.query(Token).filter(Token.booking_id == booking_id_str).first()
    
    def get_token_by_code(self, db: Session, token_code: str) -> Token:
        return db.query(Token).filter(Token.token_code == token_code).first()
    
    def create_token(self, db: Session, token: TokenCreate) -> Token:
        # Convert UUID objects to strings for SQLite compatibility
        token_dict = token.dict()
        if 'booking_id' in token_dict and hasattr(token_dict['booking_id'], 'hex'):
            token_dict['booking_id'] = str(token_dict['booking_id'])
        
        db_token = Token(**token_dict)
        db.add(db_token)
        db.commit()
        db.refresh(db_token)
        logger.info(f"Created new token for booking {token.booking_id}")
        return db_token
    
    def update_token(self, db: Session, token_id: UUID, token_update: TokenUpdate) -> Token:
        db_token = self.get_token_by_id(db, token_id)
        if not db_token:
            return None
            
        update_data = token_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_token, key, value)
            
        db.commit()
        db.refresh(db_token)
        logger.info(f"Updated token with id: {token_id}")
        return db_token
    
    def generate_e_token(self, db: Session, booking_id: UUID, expiry_minutes: int = 20) -> Tuple[Token, str]:
        """
        Generate an e-token with QR code for a booking.
        
        Args:
            db (Session): Database session
            booking_id (UUID): Booking ID
            expiry_minutes (int): Expiry time in minutes
            
        Returns:
            Tuple[Token, str]: Token object and QR code as base64 string
        """
        # Generate unique token code
        token_code = generate_token_code(db)
        
        # Generate QR code
        qr_data = f"CNG_TOKEN:{token_code}:{booking_id}"
        qr_image, _ = generate_qr_code(qr_data)
        
        # Calculate expiry time
        expiry_time = datetime.utcnow() + timedelta(minutes=expiry_minutes)
        
        # Create token record
        token_create = TokenCreate(
            booking_id=booking_id,
            token_code=token_code,
            qr_data=f"data:image/png;base64,{qr_image}",
            expiry_time=expiry_time
        )
        
        token = self.create_token(db, token_create)
        return token, qr_image
    
    def validate_token(self, db: Session, token_code: str) -> dict:
        """
        Validate a token and return its status.
        
        Args:
            db (Session): Database session
            token_code (str): Token code to validate
            
        Returns:
            dict: Validation result with status and message
        """
        token = self.get_token_by_code(db, token_code)
        
        if not token:
            return {"valid": False, "message": "Invalid token"}
        
        if token.status == "used":
            return {"valid": False, "message": "Token already used"}
        
        if token.status == "expired" or token.expiry_time < datetime.utcnow():
            # Update token status to expired
            self.update_token(db, token.id, TokenUpdate(status="expired"))
            return {"valid": False, "message": "Token expired"}
        
        return {"valid": True, "token": token}
    
    def use_token(self, db: Session, token_id: UUID) -> Token:
        """
        Mark a token as used.
        
        Args:
            db (Session): Database session
            token_id (UUID): Token ID
            
        Returns:
            Token: Updated token
        """
        return self.update_token(db, token_id, TokenUpdate(
            scan_time=datetime.utcnow(),
            status="used"
        ))
    
    def scan_token_and_complete_booking(self, db: Session, token_code: str):
        """
        Scan a token and mark the associated booking as completed.
        
        Args:
            db (Session): Database session
            token_code (str): Token code to scan
            
        Returns:
            dict: Result of the operation
        """
        from services.booking_service import booking_service
        
        # Get token by code
        token = self.get_token_by_code(db, token_code)
        if not token:
            return {"success": False, "message": "Invalid token"}
        
        # Check if token is already used
        if token.status == "used":
            return {"success": False, "message": "Token already used"}
        
        # Check if token is expired
        if token.expiry_time < datetime.utcnow():
            return {"success": False, "message": "Token expired"}
        
        # Get the associated booking
        booking = booking_service.get_booking_by_id(db, token.booking_id)
        if not booking:
            return {"success": False, "message": "Booking not found"}
        
        # Check if booking is in 'coming' status
        if booking.confirmation_status != "coming":
            return {"success": False, "message": "Booking not confirmed as coming"}
        
        # Mark token as used
        self.use_token(db, token.id)
        
        # Mark booking as completed
        updated_booking = booking_service.complete_booking(db, booking.id)
        
        # Create scan record
        from schemas.token import TokenScanCreate
        scan_record = TokenScanCreate(
            token_id=token.id,
            scan_time=datetime.utcnow(),
            scan_type="completion",
            location="pump_entry"
        )
        self.create_token_scan_record(db, scan_record)
        
        return {"success": True, "message": "Booking completed successfully", "booking": updated_booking}
    
    def create_token_scan_record(self, db: Session, scan: TokenScanCreate) -> TokenScan:
        """
        Create a record of a token scan for audit purposes.
        
        Args:
            db (Session): Database session
            scan (TokenScanCreate): Scan data
            
        Returns:
            TokenScan: Created scan record
        """
        db_scan = TokenScan(**scan.dict())
        db.add(db_scan)
        db.commit()
        db.refresh(db_scan)
        logger.info(f"Created token scan record for token {scan.token_id}")
        return db_scan

token_service = TokenService()