from sqlalchemy import Column, String, DateTime, ForeignKey, Integer
from models.base import Base, TimestampMixin
from models.utils import uuid_column

class Reminder(Base, TimestampMixin):
    __tablename__ = "reminders"
    
    id = uuid_column(primary_key=True)
    booking_id = uuid_column()
    reminder_time = Column(DateTime, nullable=False)
    confirmation_status = Column(String(20))  # coming, not_coming, no_reply