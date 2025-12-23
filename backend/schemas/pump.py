from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal
from uuid import UUID

class PumpBase(BaseModel):
    name: str
    address: str
    city: str
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    total_capacity: int = 1000
    remaining_capacity: int = 1000
    walkin_lanes: int = 2
    booked_lanes: int = 2
    rating: Optional[Decimal] = 4.0
    is_open: bool = True

class PumpCreate(PumpBase):
    pass

class PumpUpdate(PumpBase):
    pass

class PumpInDBBase(PumpBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class Pump(PumpInDBBase):
    pass

class PumpWithDistance(Pump):
    distance: Optional[float] = None
class PumpAdminBase(BaseModel):
    user_id: UUID
    pump_id: UUID

class PumpAdminCreate(PumpAdminBase):
    pass

class PumpAdmin(PumpAdminBase):
    id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True