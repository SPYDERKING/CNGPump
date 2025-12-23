"""
Frontend Integration Example

This file demonstrates how to integrate the backend API with a frontend application.
It shows example API calls that a frontend might make.
"""

import requests
import json
from datetime import datetime, date

# Base URL for the backend API
BASE_URL = "http://localhost:8000"

class SmartPumpAPI:
    def __init__(self):
        self.base_url = BASE_URL
        self.access_token = None
    
    def register_user(self, email, password, full_name, phone=None, vehicle_number=None):
        """Register a new user"""
        url = f"{self.base_url}/api/users/register"
        payload = {
            "email": email,
            "password": password,
            "full_name": full_name,
            "phone": phone,
            "vehicle_number": vehicle_number
        }
        
        response = requests.post(url, json=payload)
        return response.json() if response.status_code == 200 else None
    
    def login_user(self, email, password):
        """Login user and get access token"""
        url = f"{self.base_url}/api/users/login"
        payload = {
            "email": email,
            "password": password
        }
        
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            data = response.json()
            self.access_token = data["access_token"]
            return data
        return None
    
    def get_pumps(self):
        """Get all available pumps"""
        url = f"{self.base_url}/api/pumps/"
        headers = {}
        if self.access_token:
            headers["Authorization"] = f"Bearer {self.access_token}"
        
        response = requests.get(url, headers=headers)
        return response.json() if response.status_code == 200 else None
    
    def get_available_slots(self, pump_id, slot_date):
        """Get available time slots for a pump on a specific date"""
        url = f"{self.base_url}/api/bookings/{pump_id}/slots/{slot_date}"
        headers = {}
        if self.access_token:
            headers["Authorization"] = f"Bearer {self.access_token}"
        
        response = requests.get(url, headers=headers)
        return response.json() if response.status_code == 200 else None
    
    def create_booking(self, user_id, pump_id, slot_date, slot_time, fuel_quantity, amount):
        """Create a new booking"""
        url = f"{self.base_url}/api/bookings/"
        headers = {}
        if self.access_token:
            headers["Authorization"] = f"Bearer {self.access_token}"
        
        payload = {
            "user_id": user_id,
            "pump_id": pump_id,
            "slot_date": slot_date,
            "slot_time": slot_time,
            "fuel_quantity": fuel_quantity,
            "amount": amount
        }
        
        response = requests.post(url, json=payload, headers=headers)
        return response.json() if response.status_code == 200 else None
    
    def generate_token(self, booking_id):
        """Generate an e-token for a booking"""
        url = f"{self.base_url}/api/tokens/generate/{booking_id}"
        headers = {}
        if self.access_token:
            headers["Authorization"] = f"Bearer {self.access_token}"
        
        response = requests.post(url, headers=headers)
        return response.json() if response.status_code == 200 else None
    
    def validate_token(self, token_code):
        """Validate a token"""
        url = f"{self.base_url}/api/tokens/validate/{token_code}"
        headers = {}
        if self.access_token:
            headers["Authorization"] = f"Bearer {self.access_token}"
        
        response = requests.post(url, headers=headers)
        return response.json() if response.status_code == 200 else None
    
    def predict_demand(self, pump_id, slot_date, slot_time, weather="clear", traffic="low"):
        """Predict demand for a specific time slot"""
        url = f"{self.base_url}/api/ai/predict/demand/{pump_id}"
        headers = {}
        if self.access_token:
            headers["Authorization"] = f"Bearer {self.access_token}"
        
        params = {
            "slot_date": slot_date,
            "slot_time": slot_time,
            "weather": weather,
            "traffic": traffic
        }
        
        response = requests.get(url, params=params, headers=headers)
        return response.json() if response.status_code == 200 else None

# Example usage
def main():
    api = SmartPumpAPI()
    
    # Register a new user
    print("Registering user...")
    user = api.register_user(
        email="customer@example.com",
        password="securepassword",
        full_name="John Doe",
        phone="+1234567890",
        vehicle_number="DL12AB1234"
    )
    if user:
        print(f"User registered: {user['email']}")
        user_id = user["id"]
    else:
        print("Failed to register user")
        return
    
    # Login user
    print("\nLogging in user...")
    login_result = api.login_user("customer@example.com", "securepassword")
    if login_result:
        print("User logged in successfully")
    else:
        print("Failed to login user")
        return
    
    # Get available pumps
    print("\nGetting available pumps...")
    pumps = api.get_pumps()
    if pumps:
        print(f"Found {len(pumps)} pumps")
        for pump in pumps[:3]:  # Show first 3 pumps
            print(f"  - {pump['name']} in {pump['city']}")
        pump_id = pumps[0]["id"] if pumps else None
    else:
        print("Failed to get pumps")
        return
    
    # Get available slots for tomorrow
    tomorrow = date.today().replace(day=date.today().day + 1)
    print(f"\nGetting available slots for {tomorrow}...")
    slots = api.get_available_slots(pump_id, str(tomorrow))
    if slots:
        print(f"Available slots: {slots[:5]}")  # Show first 5 slots
        selected_slot = slots[0] if slots else None
    else:
        print("Failed to get available slots")
        return
    
    # Create a booking
    print("\nCreating booking...")
    booking = api.create_booking(
        user_id=user_id,
        pump_id=pump_id,
        slot_date=str(tomorrow),
        slot_time=selected_slot,
        fuel_quantity=10.0,
        amount=500.0
    )
    if booking:
        print(f"Booking created: {booking['id']}")
        booking_id = booking["id"]
    else:
        print("Failed to create booking")
        return
    
    # Generate e-token
    print("\nGenerating e-token...")
    token_result = api.generate_token(booking_id)
    if token_result:
        print(f"Token generated: {token_result['token']['token_code']}")
        token_code = token_result["token"]["token_code"]
        qr_code = token_result["qr_code"]
        print(f"QR Code available (first 50 chars): {qr_code[:50]}...")
    else:
        print("Failed to generate token")
        return
    
    # Validate token
    print("\nValidating token...")
    validation_result = api.validate_token(token_code)
    if validation_result and validation_result["valid"]:
        print("Token is valid")
    else:
        print("Token validation failed")
    
    # Predict demand
    print("\nPredicting demand...")
    demand_prediction = api.predict_demand(
        pump_id=pump_id,
        slot_date=str(tomorrow),
        slot_time=selected_slot,
        weather="clear",
        traffic="low"
    )
    if demand_prediction:
        print(f"Predicted demand: {demand_prediction['predicted_demand']}")
    else:
        print("Failed to predict demand")

if __name__ == "__main__":
    main()