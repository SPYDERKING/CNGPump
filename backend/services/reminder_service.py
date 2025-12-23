from sqlalchemy.orm import Session
from models.reminder import Reminder
from schemas.reminder import ReminderCreate, ReminderUpdate
from utils.sms_service import sms_service
from uuid import UUID
from typing import List, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class ReminderService:
    def get_reminder_by_id(self, db: Session, reminder_id: UUID) -> Reminder:
        return db.query(Reminder).filter(Reminder.id == reminder_id).first()
    
    def get_reminders_by_booking_id(self, db: Session, booking_id: UUID) -> List[Reminder]:
        return db.query(Reminder).filter(Reminder.booking_id == booking_id).all()
    
    def create_reminder(self, db: Session, reminder: ReminderCreate) -> Reminder:
        db_reminder = Reminder(**reminder.dict())
        db.add(db_reminder)
        db.commit()
        db.refresh(db_reminder)
        logger.info(f"Created new reminder for booking {reminder.booking_id}")
        return db_reminder
    
    def update_reminder(self, db: Session, reminder_id: UUID, reminder_update: ReminderUpdate) -> Reminder:
        db_reminder = self.get_reminder_by_id(db, reminder_id)
        if not db_reminder:
            return None
            
        update_data = reminder_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_reminder, key, value)
            
        db.commit()
        db.refresh(db_reminder)
        logger.info(f"Updated reminder with id: {reminder_id}")
        return db_reminder
    
    def send_reminder_notification(self, db: Session, reminder_id: UUID) -> bool:
        """
        Send a reminder notification for a specific reminder.
        In a real implementation, this would integrate with a job scheduler.
        
        Args:
            db (Session): Database session
            reminder_id (UUID): Reminder ID
            
        Returns:
            bool: True if notification sent successfully, False otherwise
        """
        reminder = self.get_reminder_by_id(db, reminder_id)
        if not reminder:
            return False
            
        # In a real implementation, you would:
        # 1. Get the booking details
        # 2. Get the user details
        # 3. Send notifications via SMS, email, push notification, etc.
        
        # For now, we'll just log that a reminder should be sent
        logger.info(f"Sending reminder notification for booking {reminder.booking_id}")
        
        # Example of sending SMS (would need actual user phone number in real implementation)
        # sms_service.send_sms("+1234567890", f"Reminder: Your CNG booking is scheduled for {reminder.reminder_time}")
        
        return True
    
    def schedule_booking_reminders(self, db: Session, booking_id: UUID, slot_time: datetime) -> List[Reminder]:
        """
        Schedule standard reminders for a booking.
        
        Args:
            db (Session): Database session
            booking_id (UUID): Booking ID
            slot_time (datetime): Booking slot time
            
        Returns:
            List[Reminder]: Created reminder objects
        """
        reminders = []
        
        # Schedule confirmation reminder (1 hour before slot)
        confirmation_reminder = ReminderCreate(
            booking_id=booking_id,
            reminder_time=slot_time - timedelta(hours=1),
            confirmation_status="pending"
        )
        reminders.append(self.create_reminder(db, confirmation_reminder))
        
        # Schedule final reminder (30 minutes before slot)
        final_reminder = ReminderCreate(
            booking_id=booking_id,
            reminder_time=slot_time - timedelta(minutes=30),
            confirmation_status="pending"
        )
        reminders.append(self.create_reminder(db, final_reminder))
        
        logger.info(f"Scheduled {len(reminders)} reminders for booking {booking_id}")
        return reminders

reminder_service = ReminderService()