import json
import logging
from sqlalchemy.orm import Session
from models.audit import AuditLog
from uuid import UUID

logger = logging.getLogger(__name__)

class AuditLogger:
    def __init__(self, db: Session):
        self.db = db
    
    def log_action(self, user_id: UUID, action: str, table_name: str, 
                   record_id: UUID = None, old_values: dict = None, 
                   new_values: dict = None, ip_address: str = None, 
                   user_agent: str = None):
        """
        Log an action to the audit log.
        
        Args:
            user_id (UUID): ID of the user performing the action
            action (str): Type of action (CREATE, UPDATE, DELETE, etc.)
            table_name (str): Name of the table affected
            record_id (UUID): ID of the record affected
            old_values (dict): Previous values of the record (for UPDATE)
            new_values (dict): New values of the record (for CREATE/UPDATE)
            ip_address (str): IP address of the user
            user_agent (str): User agent string
        """
        try:
            audit_log = AuditLog(
                user_id=user_id,
                action=action,
                table_name=table_name,
                record_id=record_id,
                old_values=json.dumps(old_values) if old_values else None,
                new_values=json.dumps(new_values) if new_values else None,
                ip_address=ip_address,
                user_agent=user_agent
            )
            
            self.db.add(audit_log)
            self.db.commit()
            
            logger.info(f"Audit log created: {action} on {table_name}")
            
        except Exception as e:
            logger.error(f"Failed to create audit log: {str(e)}")
            self.db.rollback()

# Global instance
def get_audit_logger(db: Session):
    return AuditLogger(db)