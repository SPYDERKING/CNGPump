from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer
from models.base import Base, TimestampMixin
from models.utils import uuid_column

class Token(Base, TimestampMixin):
    __tablename__ = "tokens"
    
    id = uuid_column(primary_key=True)
    booking_id = uuid_column()
    token_code = Column(String(20), unique=True, nullable=False)
    qr_data = Column(Text, nullable=False)
    expiry_time = Column(DateTime, nullable=False)
    scan_time = Column(DateTime)
    status = Column(String(20), nullable=False, default='valid')  # valid, used, expired

class TokenScan(Base, TimestampMixin):
    __tablename__ = "token_scans"
    
    id = uuid_column(primary_key=True)
    token_id = uuid_column()
    pump_id = uuid_column()
    scanned_by = uuid_column()
    scan_time = Column(DateTime, default=None)
    result = Column(Text, nullable=False)
    token_code = Column(String(20))