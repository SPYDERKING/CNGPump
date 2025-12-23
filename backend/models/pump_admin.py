from sqlalchemy import Column, ForeignKey, Integer
from models.base import Base, TimestampMixin
from models.utils import uuid_column

class PumpAdmin(Base, TimestampMixin):
    __tablename__ = "pump_admins"
    
    id = uuid_column(primary_key=True)
    user_id = uuid_column()
    pump_id = uuid_column()