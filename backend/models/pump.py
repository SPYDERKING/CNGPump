from sqlalchemy import Column, String, Text, Integer, Numeric, Boolean, DateTime, func
from models.base import Base
from models.utils import uuid_column

class Pump(Base):
    __tablename__ = "pumps"
    
    id = uuid_column(primary_key=True)
    name = Column(String(255), nullable=False)
    address = Column(Text, nullable=False)
    city = Column(String(100), nullable=False)
    latitude = Column(Numeric(10, 8))
    longitude = Column(Numeric(11, 8))
    total_capacity = Column(Integer, nullable=False, default=1000)
    remaining_capacity = Column(Integer, nullable=False, default=1000)
    walkin_lanes = Column(Integer, nullable=False, default=2)
    booked_lanes = Column(Integer, nullable=False, default=2)
    rating = Column(Numeric(2, 1), default=4.0)
    is_open = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)