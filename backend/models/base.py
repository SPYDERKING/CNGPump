from sqlalchemy import Column, DateTime, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import declarative_mixin

Base = declarative_base()

@declarative_mixin
class TimestampMixin:
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

# Export Base for use in models
__all__ = ['Base', 'TimestampMixin']