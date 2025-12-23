from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class ReminderBase(BaseModel):
    booking_id: UUID
    reminder_time: datetime
    confirmation_status: Optional[str] = None

class ReminderCreate(ReminderBase):
    pass

class ReminderUpdate(BaseModel):
    confirmation_status: Optional[str] = None

class ReminderInDBBase(ReminderBase):
    id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True

class Reminder(ReminderInDBBase):
    pass