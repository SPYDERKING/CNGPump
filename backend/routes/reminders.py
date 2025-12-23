from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from schemas.reminder import ReminderCreate, Reminder, ReminderUpdate
from services.reminder_service import reminder_service
from services.booking_service import booking_service
from db import get_db
from uuid import UUID
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/{reminder_id}", response_model=Reminder)
def get_reminder(reminder_id: UUID, db: Session = Depends(get_db)):
    """Get a specific reminder by ID"""
    reminder = reminder_service.get_reminder_by_id(db, reminder_id)
    if not reminder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found"
        )
    return reminder

@router.get("/booking/{booking_id}", response_model=list[Reminder])
def get_reminders_by_booking(booking_id: UUID, db: Session = Depends(get_db)):
    """Get all reminders for a specific booking"""
    reminders = reminder_service.get_reminders_by_booking_id(db, booking_id)
    return reminders

@router.post("/", response_model=Reminder)
def create_reminder(reminder: ReminderCreate, db: Session = Depends(get_db)):
    """Create a new reminder"""
    # Verify booking exists
    booking = booking_service.get_booking_by_id(db, reminder.booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Create reminder
    new_reminder = reminder_service.create_reminder(db, reminder)
    logger.info(f"Reminder created: {new_reminder.id}")
    return new_reminder

@router.put("/{reminder_id}", response_model=Reminder)
def update_reminder(
    reminder_id: UUID,
    reminder_update: ReminderUpdate,
    db: Session = Depends(get_db)
):
    """Update a reminder"""
    updated_reminder = reminder_service.update_reminder(db, reminder_id, reminder_update)
    if not updated_reminder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found"
        )
    logger.info(f"Reminder updated: {reminder_id}")
    return updated_reminder

@router.post("/{reminder_id}/send")
def send_reminder(reminder_id: UUID, db: Session = Depends(get_db)):
    """Send a reminder notification"""
    success = reminder_service.send_reminder_notification(db, reminder_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found or failed to send"
        )
    
    return {
        "message": "Reminder notification sent successfully"
    }

@router.post("/schedule/{booking_id}")
def schedule_booking_reminders(booking_id: UUID, db: Session = Depends(get_db)):
    """Schedule standard reminders for a booking"""
    # Verify booking exists
    booking = booking_service.get_booking_by_id(db, booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Schedule reminders
    reminders = reminder_service.schedule_booking_reminders(
        db, 
        booking_id, 
        booking.slot_time
    )
    
    return {
        "message": f"Scheduled {len(reminders)} reminders for booking",
        "reminders": reminders
    }