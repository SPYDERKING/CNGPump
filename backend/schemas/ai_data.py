from pydantic import BaseModel
from typing import Optional
from datetime import date, time, datetime
from decimal import Decimal
from uuid import UUID

class AIDataBase(BaseModel):
    pump_id: UUID
    slot_date: date
    slot_time: time
    demand_count: int = 0
    weather: Optional[str] = None
    traffic: Optional[str] = None
    day_of_week: Optional[int] = None

class AIDataCreate(AIDataBase):
    pass

class AIDataUpdate(BaseModel):
    demand_count: Optional[int] = None
    weather: Optional[str] = None
    traffic: Optional[str] = None
    day_of_week: Optional[int] = None

class AIDataInDBBase(AIDataBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class AIData(AIDataInDBBase):
    pass