from sqlalchemy import Column, String, Integer, Numeric, Date, Time, ForeignKey
from models.base import Base, TimestampMixin

class AIData(Base, TimestampMixin):
    __tablename__ = "ai_data"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    pump_id = Column(Integer, ForeignKey('pumps.id'), nullable=False)
    slot_date = Column(Date, nullable=False)
    slot_time = Column(Time, nullable=False)
    demand_count = Column(Integer, nullable=False, default=0)
    weather = Column(String(100))
    traffic = Column(String(100))
    day_of_week = Column(Integer)  # 0-6 for Monday-Sunday