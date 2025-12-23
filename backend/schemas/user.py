from pydantic import BaseModel, EmailStr, model_validator
from typing import Optional
from enum import Enum
from datetime import datetime
from uuid import UUID

class UserRole(str, Enum):
    SUPER_ADMIN = "super_admin"
    PUMP_ADMIN = "pump_admin"
    USER = "user"

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    phone: Optional[str] = None
    vehicle_number: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    pass

class UserInDBBase(UserBase):
    id: UUID
    role: UserRole
    
    class Config:
        from_attributes = True

class User(UserInDBBase):
    pass

class UserInDB(UserInDBBase):
    hashed_password: str

class UserProfile(BaseModel):
    id: UUID
    user_id: UUID
    full_name: Optional[str] = None
    phone: Optional[str] = None
    vehicle_number: Optional[str] = None
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserLogin(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    password: str
    
    @model_validator(mode='after')
    def check_email_or_phone(self):
        if not self.email and not self.phone:
            raise ValueError('Either email or phone must be provided')
        return self