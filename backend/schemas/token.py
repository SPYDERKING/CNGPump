from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class TokenBase(BaseModel):
    booking_id: UUID
    token_code: str
    qr_data: str
    expiry_time: datetime
    scan_time: Optional[datetime] = None
    status: str = "valid"

class TokenCreate(TokenBase):
    pass

class TokenUpdate(BaseModel):
    scan_time: Optional[datetime] = None
    status: Optional[str] = None

class TokenInDBBase(TokenBase):
    id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(TokenInDBBase):
    pass

class TokenScanBase(BaseModel):
    token_id: Optional[UUID] = None
    pump_id: Optional[UUID] = None
    scanned_by: UUID
    scan_time: Optional[datetime] = None
    result: str
    token_code: Optional[str] = None

class TokenScanCreate(TokenScanBase):
    pass

class TokenScanInDBBase(TokenScanBase):
    id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True

class TokenScan(TokenScanInDBBase):
    pass