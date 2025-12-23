from sqlalchemy.orm import Session
from models.booking import Booking
from models.pump import Pump
from schemas.booking import BookingCreate, BookingUpdate
from uuid import UUID
from typing import List, Optional
from datetime import date, time, datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class BookingService:
    def get_booking_by_id(self, db: Session, booking_id: UUID) -> Booking:
        # Convert UUID to string for SQLite compatibility
        booking_id_str = str(booking_id)
        return db.query(Booking).filter(Booking.id == booking_id_str).first()
    
    def get_bookings_by_user(self, db: Session, user_id: UUID) -> List[Booking]:
        # Convert UUID to string for SQLite compatibility
        user_id_str = str(user_id)
        return db.query(Booking).filter(Booking.user_id == user_id_str).all()
    
    def get_bookings_by_pump(self, db: Session, pump_id: UUID) -> List[Booking]:
        return db.query(Booking).filter(Booking.pump_id == pump_id).all()
    
    def get_bookings_by_date(self, db: Session, pump_id: UUID, slot_date: date) -> List[Booking]:
        return db.query(Booking).filter(
            Booking.pump_id == pump_id,
            Booking.slot_date == slot_date
        ).all()
    
    def create_booking(self, db: Session, booking: BookingCreate) -> Booking:
        # Convert UUID objects to strings for SQLite compatibility
        booking_dict = booking.dict()
        if 'user_id' in booking_dict and hasattr(booking_dict['user_id'], 'hex'):
            booking_dict['user_id'] = str(booking_dict['user_id'])
        if 'pump_id' in booking_dict and hasattr(booking_dict['pump_id'], 'hex'):
            booking_dict['pump_id'] = str(booking_dict['pump_id'])
        
        db_booking = Booking(**booking_dict)
        db.add(db_booking)
        db.commit()
        db.refresh(db_booking)
        logger.info(f"Created new booking for user {booking.user_id} at pump {booking.pump_id}")
        return db_booking
    
    def update_booking(self, db: Session, booking_id: UUID, booking_update: BookingUpdate) -> Booking:
        db_booking = self.get_booking_by_id(db, booking_id)
        if not db_booking:
            return None
            
        update_data = booking_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_booking, key, value)
            
        db_booking.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_booking)
        logger.info(f"Updated booking with id: {booking_id}")
        return db_booking
    
    def cancel_booking(self, db: Session, booking_id: UUID) -> Booking:
        return self.update_booking(db, booking_id, BookingUpdate(booking_status="cancelled"))
    
    def confirm_booking(self, db: Session, booking_id: UUID) -> Booking:
        return self.update_booking(db, booking_id, BookingUpdate(booking_status="confirmed"))
    
    def complete_booking(self, db: Session, booking_id: UUID) -> Booking:
        return self.update_booking(db, booking_id, BookingUpdate(booking_status="completed"))
    
    def delete_booking(self, db: Session, booking_id: UUID) -> bool:
        """Delete a booking from the database"""
        db_booking = self.get_booking_by_id(db, booking_id)
        if not db_booking:
            return False
        
        db.delete(db_booking)
        db.commit()
        logger.info(f"Deleted booking with id: {booking_id}")
        return True
    
    def get_available_slots(self, db: Session, pump_id: UUID, slot_date: date) -> List[time]:
        """
        Get available time slots for a pump on a specific date.
        This is a simplified implementation - in production, you'd want more sophisticated slot management.
        """
        # Get existing bookings for the pump on the specified date
        existing_bookings = self.get_bookings_by_date(db, pump_id, slot_date)
        
        # For demonstration, we'll create 24 hourly slots from 6 AM to 6 PM
        all_slots = [time(hour=h) for h in range(6, 18)]
        
        # Filter out booked slots
        booked_times = {booking.slot_time for booking in existing_bookings}
        available_slots = [slot for slot in all_slots if slot not in booked_times]
        
        return available_slots
    
    def is_slot_available(self, db: Session, pump_id: UUID, slot_date: date, slot_time: time) -> bool:
        """Check if a specific time slot is available"""
        existing_booking = db.query(Booking).filter(
            Booking.pump_id == pump_id,
            Booking.slot_date == slot_date,
            Booking.slot_time == slot_time
        ).first()
        
        return existing_booking is None

booking_service = BookingService()