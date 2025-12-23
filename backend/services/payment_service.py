from sqlalchemy.orm import Session
from models.payment import Payment
from schemas.payment import PaymentCreate, PaymentUpdate
from utils.payment_gateway import payment_service as pg_service
from uuid import UUID
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

class PaymentService:
    def get_payment_by_id(self, db: Session, payment_id: UUID) -> Payment:
        return db.query(Payment).filter(Payment.id == payment_id).first()
    
    def get_payments_by_booking_id(self, db: Session, booking_id: UUID) -> List[Payment]:
        return db.query(Payment).filter(Payment.booking_id == booking_id).all()
    
    def create_payment(self, db: Session, payment: PaymentCreate) -> Payment:
        db_payment = Payment(**payment.dict())
        db.add(db_payment)
        db.commit()
        db.refresh(db_payment)
        logger.info(f"Created new payment for booking {payment.booking_id}")
        return db_payment
    
    def update_payment(self, db: Session, payment_id: UUID, payment_update: PaymentUpdate) -> Payment:
        db_payment = self.get_payment_by_id(db, payment_id)
        if not db_payment:
            return None
            
        update_data = payment_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_payment, key, value)
            
        db.commit()
        db.refresh(db_payment)
        logger.info(f"Updated payment with id: {payment_id}")
        return db_payment
    
    def create_payment_order(self, amount: int, currency: str = "INR") -> dict:
        """
        Create a payment order using the payment gateway.
        
        Args:
            amount (int): Amount in smallest currency unit
            currency (str): Currency code
            
        Returns:
            dict: Payment order details
        """
        try:
            return pg_service.create_payment_order(amount, currency)
        except Exception as e:
            logger.error(f"Failed to create payment order: {str(e)}")
            raise

payment_service = PaymentService()