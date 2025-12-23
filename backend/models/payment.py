from sqlalchemy import Column, String, Numeric, ForeignKey, Integer
from models.base import Base, TimestampMixin
from models.utils import uuid_column

class Payment(Base, TimestampMixin):
    __tablename__ = "payments"
    
    id = uuid_column(primary_key=True)
    booking_id = uuid_column()
    amount = Column(Numeric(10, 2), nullable=False)
    mode = Column(String(50))  # UPI, card, wallet
    status = Column(String(20), nullable=False)  # success, failed
    transaction_id = Column(String(255))  # External payment gateway transaction ID