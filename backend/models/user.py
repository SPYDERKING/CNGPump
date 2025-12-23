from sqlalchemy import Column, String, Text, Enum as SQLEnum, Integer
from models.base import Base, TimestampMixin
from models.utils import uuid_column
from enum import Enum

class UserRole(str, Enum):
    SUPER_ADMIN = "super_admin"
    PUMP_ADMIN = "pump_admin"
    USER = "user"

class User(Base, TimestampMixin):
    __tablename__ = "users"
    
    id = uuid_column(primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    phone = Column(String(20))
    vehicle_number = Column(String(50))
    role = Column(SQLEnum(UserRole), default=UserRole.USER)

class UserProfile(Base, TimestampMixin):
    __tablename__ = "user_profiles"
    
    id = uuid_column(primary_key=True)
    user_id = uuid_column()
    full_name = Column(String(255))
    phone = Column(String(20))
    vehicle_number = Column(String(50))

class UserRoles(Base, TimestampMixin):
    __tablename__ = "user_roles"
    
    id = uuid_column(primary_key=True)
    user_id = uuid_column()
    role = Column(String(20), nullable=False)  # Using String for SQLite compatibility