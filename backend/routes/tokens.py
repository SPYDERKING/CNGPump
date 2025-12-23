from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from schemas.token import TokenCreate, Token, TokenUpdate, TokenScanCreate, TokenScan
from services.token_service import token_service
from services.booking_service import booking_service
from db import get_db
from uuid import UUID
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/{token_id}", response_model=Token)
def get_token(token_id: UUID, db: Session = Depends(get_db)):
    """Get a specific token by ID"""
    token = token_service.get_token_by_id(db, token_id)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Token not found"
        )
    return token

@router.get("/booking/{booking_id}", response_model=Token)
def get_token_by_booking(booking_id: UUID, db: Session = Depends(get_db)):
    """Get token for a specific booking"""
    token = token_service.get_token_by_booking_id(db, booking_id)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Token not found for this booking"
        )
    return token

@router.post("/generate/{booking_id}")
def generate_token_for_booking(booking_id: UUID, db: Session = Depends(get_db)):
    """Generate an e-token with QR code for a booking"""
    # Verify booking exists
    booking = booking_service.get_booking_by_id(db, booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Generate token
    token, qr_image = token_service.generate_e_token(db, booking_id)
    
    return {
        "token": token,
        "qr_code": qr_image
    }

@router.post("/validate/{token_code}")
def validate_token(token_code: str, db: Session = Depends(get_db)):
    """Validate a token by its code"""
    result = token_service.validate_token(db, token_code)
    return result

@router.post("/use/{token_id}")
def use_token(token_id: UUID, db: Session = Depends(get_db)):
    """Mark a token as used"""
    # Verify token exists
    token = token_service.get_token_by_id(db, token_id)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Token not found"
        )
    
    # Use token
    used_token = token_service.use_token(db, token_id)
    
    return {
        "message": "Token marked as used",
        "token": used_token
    }

@router.post("/scan")
def scan_token(scan_data: TokenScanCreate, db: Session = Depends(get_db)):
    """Record a token scan event"""
    # If token_id is provided, validate the token
    if scan_data.token_id:
        token = token_service.get_token_by_id(db, scan_data.token_id)
        if not token:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Token not found"
            )
    
    # Create scan record
    scan_record = token_service.create_token_scan_record(db, scan_data)
    
    return {
        "message": "Token scan recorded",
        "scan_record": scan_record
    }

@router.post("/scan-and-complete", response_model=dict)
def scan_token_and_complete_booking(token_code: str, db: Session = Depends(get_db)):
    """Scan a token by code and mark the associated booking as completed"""
    result = token_service.scan_token_and_complete_booking(db, token_code)
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["message"]
        )
    return result