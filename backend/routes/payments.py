from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from schemas.payment import PaymentCreate, Payment, PaymentUpdate
from services.payment_service import payment_service
from services.booking_service import booking_service
from db import get_db
from uuid import UUID
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/{payment_id}", response_model=Payment)
def get_payment(payment_id: UUID, db: Session = Depends(get_db)):
    """Get a specific payment by ID"""
    payment = payment_service.get_payment_by_id(db, payment_id)
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    return payment

@router.get("/booking/{booking_id}", response_model=list[Payment])
def get_payments_by_booking(booking_id: UUID, db: Session = Depends(get_db)):
    """Get all payments for a specific booking"""
    payments = payment_service.get_payments_by_booking_id(db, booking_id)
    return payments

@router.post("/", response_model=Payment)
def create_payment(payment: PaymentCreate, db: Session = Depends(get_db)):
    """Create a new payment record"""
    # Verify booking exists
    booking = booking_service.get_booking_by_id(db, payment.booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Create payment
    new_payment = payment_service.create_payment(db, payment)
    logger.info(f"Payment created: {new_payment.id}")
    return new_payment

@router.put("/{payment_id}", response_model=Payment)
def update_payment(
    payment_id: UUID,
    payment_update: PaymentUpdate,
    db: Session = Depends(get_db)
):
    """Update a payment record"""
    updated_payment = payment_service.update_payment(db, payment_id, payment_update)
    if not updated_payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    logger.info(f"Payment updated: {payment_id}")
    return updated_payment

@router.post("/order")
def create_payment_order(amount: int, currency: str = "INR"):
    """Create a payment order with the payment gateway"""
    try:
        order = payment_service.create_payment_order(amount, currency)
        return {
            "message": "Payment order created successfully",
            "order": order
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/verify")
def verify_payment_signature(
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str
):
    """Verify payment signature from Razorpay"""
    from utils.payment_gateway import payment_service as pg_service
    
    is_valid = pg_service.verify_payment_signature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    )
    
    return {
        "valid": is_valid,
        "message": "Payment signature verified" if is_valid else "Invalid payment signature"
    }