from pydantic import BaseModel
from typing import Optional
from datetime import date, time, datetime
from decimal import Decimal
from uuid import UUID


class BookingBase(BaseModel):
    user_id: UUID
    pump_id: UUID
    slot_date: date
    slot_time: time
    fuel_quantity: Decimal = 10.0
    amount: Decimal
    payment_status: str = "pending"
    booking_status: str = "active"
    confirmation_status: str = "pending"

class BookingCreate(BookingBase):
    pass

class BookingUpdate(BaseModel):
    payment_status: Optional[str] = None
    booking_status: Optional[str] = None
    confirmation_status: Optional[str] = None

class BookingInDBBase(BookingBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class Booking(BookingInDBBase):
    pass