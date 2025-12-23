from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from schemas.booking import BookingCreate, Booking, BookingUpdate
from services.booking_service import booking_service
from services.pump_service import pump_service
from db import get_db
from uuid import UUID
from datetime import date, time
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/", response_model=list[Booking])
def get_user_bookings(
    user_id: UUID,
    db: Session = Depends(get_db)
):
    """Get all bookings for a specific user"""
    bookings = booking_service.get_bookings_by_user(db, user_id)
    return bookings

@router.get("/pump/{pump_id}", response_model=list[Booking])
def get_pump_bookings(
    pump_id: UUID,
    db: Session = Depends(get_db)
):
    """Get all bookings for a specific pump"""
    bookings = booking_service.get_bookings_by_pump(db, pump_id)
    return bookings

@router.get("/{booking_id}", response_model=Booking)
def get_booking(
    booking_id: UUID,
    db: Session = Depends(get_db)
):
    """Get a specific booking by ID"""
    booking = booking_service.get_booking_by_id(db, booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    return booking

@router.post("/", response_model=Booking)
def create_booking(
    booking: BookingCreate,
    db: Session = Depends(get_db)
):
    """Create a new booking and automatically generate e-coupon"""
    # Verify pump exists
    pump = pump_service.get_pump_by_id(db, booking.pump_id)
    if not pump:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pump not found"
        )
    
    # Check if slot is available
    if not booking_service.is_slot_available(db, booking.pump_id, booking.slot_date, booking.slot_time):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Selected time slot is not available"
        )
    
    # Create booking
    new_booking = booking_service.create_booking(db, booking)
    
    # Automatically generate e-coupon for the booking
    from services.token_service import token_service
    token, qr_image = token_service.generate_e_token(db, new_booking.id)
    
    logger.info(f"Booking created with e-coupon: {new_booking.id}")
    return new_booking

@router.put("/{booking_id}", response_model=Booking)
def update_booking(
    booking_id: UUID,
    booking_update: BookingUpdate,
    db: Session = Depends(get_db)
):
    """Update a booking"""
    updated_booking = booking_service.update_booking(db, booking_id, booking_update)
    if not updated_booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    logger.info(f"Booking updated: {booking_id}")
    return updated_booking

@router.delete("/{booking_id}")
def delete_booking(
    booking_id: UUID,
    db: Session = Depends(get_db)
):
    """Delete a booking"""
    deleted = booking_service.delete_booking(db, booking_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    logger.info(f"Booking deleted: {booking_id}")
    return {"message": "Booking deleted successfully"}

@router.get("/{pump_id}/slots/{slot_date}", response_model=list[str])
def get_available_slots(
    pump_id: UUID,
    slot_date: date,
    db: Session = Depends(get_db)
):
    """Get available time slots for a pump on a specific date"""
    # Verify pump exists
    pump = pump_service.get_pump_by_id(db, pump_id)
    if not pump:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pump not found"
        )
    
    # Get available slots
    available_slots = booking_service.get_available_slots(db, pump_id, slot_date)
    
    # Convert time objects to strings for JSON serialization
    slot_strings = [slot.strftime("%H:%M") for slot in available_slots]
    
    return slot_strings

@router.post("/{booking_id}/confirm")
def confirm_booking(
    booking_id: UUID,
    db: Session = Depends(get_db)
):
    """Confirm a booking"""
    confirmed_booking = booking_service.confirm_booking(db, booking_id)
    if not confirmed_booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    logger.info(f"Booking confirmed: {booking_id}")
    return {"message": "Booking confirmed successfully", "booking": confirmed_booking}

@router.post("/{booking_id}/complete")
def complete_booking(
    booking_id: UUID,
    db: Session = Depends(get_db)
):
    """Mark a booking as completed"""
    completed_booking = booking_service.complete_booking(db, booking_id)
    if not completed_booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    logger.info(f"Booking completed: {booking_id}")
    return {"message": "Booking completed successfully", "booking": completed_booking}