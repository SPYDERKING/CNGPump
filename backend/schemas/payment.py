from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal
from uuid import UUID

class PaymentBase(BaseModel):
    booking_id: UUID
    amount: Decimal
    mode: Optional[str] = None
    status: str
    transaction_id: Optional[str] = None

class PaymentCreate(PaymentBase):
    pass

class PaymentUpdate(BaseModel):
    status: Optional[str] = None
    transaction_id: Optional[str] = None

class PaymentInDBBase(PaymentBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class Payment(PaymentInDBBase):
    pass