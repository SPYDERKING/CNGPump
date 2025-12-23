import os
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
import uuid

def uuid_column(primary_key=False, default=None):
    """
    Create a UUID column that works with both PostgreSQL and SQLite.
    
    Args:
        primary_key (bool): Whether this column is a primary key
        default: Default value for the column
        
    Returns:
        Column: SQLAlchemy column definition
    """
    database_url = os.getenv("DATABASE_URL", "")
    
    if database_url.startswith("sqlite"):
        # For SQLite, use String type
        if primary_key:
            return Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()) if default is None else default)
        else:
            return Column(String(36), default=lambda: str(uuid.uuid4()) if default is None else default)
    else:
        # For PostgreSQL, use native UUID type
        if primary_key:
            return Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4 if default is None else default)
        else:
            return Column(UUID(as_uuid=True), default=uuid.uuid4 if default is None else default)