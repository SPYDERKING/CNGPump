from sqlalchemy import Column, String, Text, Integer, Numeric, Date, Time, ForeignKey, CheckConstraint
from models.base import Base, TimestampMixin
from models.utils import uuid_column

class Booking(Base, TimestampMixin):
    __tablename__ = "bookings"
    
    id = uuid_column(primary_key=True)
    user_id = uuid_column()
    pump_id = uuid_column()
    slot_date = Column(Date, nullable=False)
    slot_time = Column(Time, nullable=False)
    fuel_quantity = Column(Numeric(5, 2), nullable=False, default=10.0)
    amount = Column(Numeric(10, 2), nullable=False)
    payment_status = Column(String(20), nullable=False, default='pending')  # pending, success, failed
    booking_status = Column(String(20), nullable=False, default='active')   # active, confirmed, completed, cancelled, expired
    confirmation_status = Column(String(20), default='pending')             # pending, coming, not_coming
    
    __table_args__ = (
        CheckConstraint('fuel_quantity > 0 AND fuel_quantity <= 50', name='fuel_quantity_valid'),
        CheckConstraint('amount > 0', name='amount_valid'),
    )