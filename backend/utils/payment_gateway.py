import razorpay
import os
from dotenv import load_dotenv

load_dotenv()

class PaymentService:
    def __init__(self):
        self.razorpay_key_id = os.getenv("RAZORPAY_KEY_ID")
        self.razorpay_secret = os.getenv("RAZORPAY_SECRET")
        
        if self.razorpay_key_id and self.razorpay_secret:
            self.client = razorpay.Client(auth=(self.razorpay_key_id, self.razorpay_secret))
        else:
            self.client = None
    
    def create_payment_order(self, amount: int, currency: str = "INR") -> dict:
        """
        Create a payment order using Razorpay.
        
        Args:
            amount (int): Amount in smallest currency unit (e.g., paise for INR)
            currency (str): Currency code (default: INR)
            
        Returns:
            dict: Payment order details
        """
        if not self.client:
            raise Exception("Razorpay credentials not configured")
            
        try:
            order_data = {
                "amount": amount,
                "currency": currency,
                "payment_capture": 1  # Auto capture
            }
            
            order = self.client.order.create(order_data)
            return order
        except Exception as e:
            raise Exception(f"Failed to create payment order: {str(e)}")
    
    def verify_payment_signature(self, razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str) -> bool:
        """
        Verify payment signature from Razorpay.
        
        Args:
            razorpay_order_id (str): Order ID from Razorpay
            razorpay_payment_id (str): Payment ID from Razorpay
            razorpay_signature (str): Signature from Razorpay
            
        Returns:
            bool: True if signature is valid, False otherwise
        """
        if not self.client:
            return False
            
        try:
            params = {
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            }
            
            self.client.utility.verify_payment_signature(params)
            return True
        except Exception:
            return False

# Global instance
payment_service = PaymentService()