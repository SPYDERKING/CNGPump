import os
from twilio.rest import Client
from dotenv import load_dotenv

load_dotenv()

class SMSService:
    def __init__(self):
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.twilio_phone_number = os.getenv("TWILIO_PHONE_NUMBER")
        
        if self.account_sid and self.auth_token:
            self.client = Client(self.account_sid, self.auth_token)
        else:
            self.client = None
    
    def send_sms(self, to_phone: str, message: str) -> bool:
        """
        Send an SMS message to the specified phone number.
        
        Args:
            to_phone (str): The recipient's phone number
            message (str): The message to send
            
        Returns:
            bool: True if successful, False otherwise
        """
        if not self.client:
            print("Twilio credentials not configured. SMS not sent.")
            return False
            
        try:
            message = self.client.messages.create(
                body=message,
                from_=self.twilio_phone_number,
                to=to_phone
            )
            print(f"SMS sent successfully to {to_phone}. SID: {message.sid}")
            return True
        except Exception as e:
            print(f"Failed to send SMS to {to_phone}: {str(e)}")
            return False

# Global instance
sms_service = SMSService()