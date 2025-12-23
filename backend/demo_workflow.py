#!/usr/bin/env python3
"""
Complete Workflow Demonstration

This script demonstrates the complete workflow of the Smart CNG Pump Appointment System,
from user registration to token validation.
"""

import asyncio
import uuid
from datetime import datetime, date, timedelta
from ai_models.demand_predictor import DemandPredictor
from utils.qr_generator import generate_qr_code, generate_token_code
from utils.security import get_password_hash, create_access_token

# Mock database storage
mock_db = {
    "users": {},
    "pumps": {},
    "bookings": {},
    "tokens": {}
}

def print_step(step_number, description):
    """Print a formatted step in the workflow"""
    print(f"\n--- Step {step_number}: {description} ---")

def register_user(email, password, full_name, phone=None, vehicle_number=None):
    """Register a new user"""
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "email": email,
        "hashed_password": get_password_hash(password),
        "full_name": full_name,
        "phone": phone,
        "vehicle_number": vehicle_number,
        "created_at": datetime.now()
    }
    mock_db["users"][user_id] = user
    print(f"✓ Registered user: {full_name} ({email})")
    return user

def create_pump(name, address, city, total_capacity=1000):
    """Create a pump station"""
    pump_id = str(uuid.uuid4())
    pump = {
        "id": pump_id,
        "name": name,
        "address": address,
        "city": city,
        "total_capacity": total_capacity,
        "remaining_capacity": total_capacity,
        "created_at": datetime.now()
    }
    mock_db["pumps"][pump_id] = pump
    print(f"✓ Created pump: {name} in {city}")
    return pump

def create_booking(user_id, pump_id, slot_date, slot_time, fuel_quantity=10.0):
    """Create a booking"""
    booking_id = str(uuid.uuid4())
    amount = fuel_quantity * 50  # Assuming ₹50 per unit
    
    booking = {
        "id": booking_id,
        "user_id": user_id,
        "pump_id": pump_id,
        "slot_date": slot_date,
        "slot_time": slot_time,
        "fuel_quantity": fuel_quantity,
        "amount": amount,
        "payment_status": "pending",
        "booking_status": "active",
        "created_at": datetime.now()
    }
    mock_db["bookings"][booking_id] = booking
    print(f"✓ Created booking for {slot_date} at {slot_time}")
    return booking

def generate_e_token(booking_id):
    """Generate an e-token with QR code"""
    token_code = generate_token_code()
    qr_data = f"CNG_TOKEN:{token_code}:{booking_id}"
    qr_image, _ = generate_qr_code(qr_data)
    
    token = {
        "id": str(uuid.uuid4()),
        "booking_id": booking_id,
        "token_code": token_code,
        "qr_data": qr_data,
        "qr_image": qr_image[:50] + "...",  # Truncate for display
        "expiry_time": datetime.now() + timedelta(minutes=20),
        "status": "valid",
        "created_at": datetime.now()
    }
    mock_db["tokens"][token["id"]] = token
    print(f"✓ Generated e-token: {token_code}")
    return token

def validate_token(token_code):
    """Validate a token"""
    for token in mock_db["tokens"].values():
        if token["token_code"] == token_code:
            if token["status"] == "valid":
                if token["expiry_time"] > datetime.now():
                    print(f"✓ Token {token_code} is valid")
                    return True
                else:
                    token["status"] = "expired"
                    print(f"✗ Token {token_code} has expired")
                    return False
            else:
                print(f"✗ Token {token_code} is {token['status']}")
                return False
    print(f"✗ Token {token_code} not found")
    return False

def predict_demand(pump_id, slot_date, slot_time):
    """Predict demand using AI model"""
    predictor = DemandPredictor()
    # In a real scenario, we would train the model with actual data
    # For demo, we'll simulate a prediction
    demand = 5.0 + (int(slot_time.split(':')[0]) - 6) * 0.5  # Simple simulation
    demand = max(0, demand)
    print(f"✓ Predicted demand for {slot_time}: {demand:.1f} bookings")
    return demand

async def main():
    """Demonstrate the complete workflow"""
    print("🚀 Smart CNG Pump Appointment System - Complete Workflow Demo")
    print("=" * 60)
    
    # Step 1: User Registration
    print_step(1, "User Registration")
    user = register_user(
        email="john.doe@example.com",
        password="securepassword123",
        full_name="John Doe",
        phone="+919876543210",
        vehicle_number="DL01AB1234"
    )
    
    # Step 2: Pump Creation
    print_step(2, "Pump Station Setup")
    pump = create_pump(
        name="Green Energy CNG Station",
        address="Sector 15, Noida",
        city="Noida",
        total_capacity=1000
    )
    
    # Step 3: Booking Creation
    print_step(3, "Booking Creation")
    tomorrow = date.today() + timedelta(days=1)
    booking = create_booking(
        user_id=user["id"],
        pump_id=pump["id"],
        slot_date=str(tomorrow),
        slot_time="14:30",
        fuel_quantity=15.0
    )
    
    # Step 4: AI Demand Prediction
    print_step(4, "AI Demand Prediction")
    predicted_demand = predict_demand(
        pump_id=pump["id"],
        slot_date=str(tomorrow),
        slot_time="14:30"
    )
    
    # Step 5: Payment Processing (simulated)
    print_step(5, "Payment Processing")
    booking["payment_status"] = "success"
    print("✓ Payment processed successfully (simulated)")
    
    # Step 6: E-Token Generation
    print_step(6, "E-Token Generation")
    token = generate_e_token(booking["id"])
    print(f"  QR Code Data: {token['qr_image']}")
    
    # Step 7: Token Validation
    print_step(7, "Token Validation")
    is_valid = validate_token(token["token_code"])
    
    # Step 8: Token Usage (simulated)
    print_step(8, "Token Usage")
    if is_valid:
        token_entry = None
        for t in mock_db["tokens"].values():
            if t["token_code"] == token["token_code"]:
                token_entry = t
                break
        
        if token_entry:
            token_entry["status"] = "used"
            token_entry["used_at"] = datetime.now()
            print("✓ Token marked as used")
    
    # Summary
    print("\n" + "=" * 60)
    print("✅ Workflow Completed Successfully!")
    print("=" * 60)
    print(f"User: {user['full_name']}")
    print(f"Pump: {pump['name']}")
    print(f"Booking: {booking['slot_date']} at {booking['slot_time']}")
    print(f"Fuel: {booking['fuel_quantity']} units")
    print(f"Amount: ₹{booking['amount']}")
    print(f"Token: {token['token_code']}")
    print(f"Status: {token['status']}")
    
    print("\n📊 System Insights:")
    print(f"  • Predicted demand: {predicted_demand:.1f} bookings")
    print(f"  • Fuel capacity: {pump['remaining_capacity']}/{pump['total_capacity']} kg")
    print(f"  • Booking status: {booking['booking_status']}")
    print(f"  • Payment status: {booking['payment_status']}")

if __name__ == "__main__":
    asyncio.run(main())