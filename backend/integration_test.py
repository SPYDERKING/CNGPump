#!/usr/bin/env python3
"""
Integration Test Script

This script tests the integration between the backend API and a simulated frontend.
It verifies that all major API endpoints work correctly.
"""

import requests
import json
import time
from datetime import datetime, date, timedelta

# Configuration
BASE_URL = "http://localhost:8000"
HEADERS = {"Content-Type": "application/json"}

# Test data
test_user = {
    "email": "integration_test@example.com",
    "password": "testpassword123",
    "full_name": "Integration Test User",
    "phone": "+1234567890",
    "vehicle_number": "TEST001"
}

test_pump = {
    "name": "Integration Test Pump",
    "address": "123 Test Street",
    "city": "Test City",
    "total_capacity": 1000,
    "remaining_capacity": 1000
}

class IntegrationTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.headers = HEADERS.copy()
        self.access_token = None
        self.user_id = None
        self.pump_id = None
        self.booking_id = None
        self.token_id = None
    
    def log_step(self, step, description):
        """Log a test step"""
        print(f"[{step}] {description}")
    
    def test_health_check(self):
        """Test the health check endpoint"""
        self.log_step("1", "Testing health check endpoint")
        try:
            response = requests.get(f"{self.base_url}/health")
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy":
                    print("  ✓ Health check passed")
                    return True
                else:
                    print(f"  ✗ Health check failed: {data}")
                    return False
            else:
                print(f"  ✗ Health check failed with status {response.status_code}")
                return False
        except Exception as e:
            print(f"  ✗ Health check failed with exception: {e}")
            return False
    
    def test_user_registration(self):
        """Test user registration"""
        self.log_step("2", "Testing user registration")
        try:
            response = requests.post(
                f"{self.base_url}/api/users/register",
                headers=self.headers,
                data=json.dumps(test_user)
            )
            if response.status_code == 200:
                data = response.json()
                self.user_id = data.get("id")
                print(f"  ✓ User registered successfully: {self.user_id}")
                return True
            else:
                print(f"  ✗ User registration failed with status {response.status_code}")
                print(f"    Response: {response.text}")
                return False
        except Exception as e:
            print(f"  ✗ User registration failed with exception: {e}")
            return False
    
    def test_user_login(self):
        """Test user login"""
        self.log_step("3", "Testing user login")
        try:
            login_data = {
                "email": test_user["email"],
                "password": test_user["password"]
            }
            response = requests.post(
                f"{self.base_url}/api/users/login",
                headers=self.headers,
                data=json.dumps(login_data)
            )
            if response.status_code == 200:
                data = response.json()
                self.access_token = data.get("access_token")
                self.headers["Authorization"] = f"Bearer {self.access_token}"
                print("  ✓ User login successful")
                return True
            else:
                print(f"  ✗ User login failed with status {response.status_code}")
                print(f"    Response: {response.text}")
                return False
        except Exception as e:
            print(f"  ✗ User login failed with exception: {e}")
            return False
    
    def test_pump_creation(self):
        """Test pump creation"""
        self.log_step("4", "Testing pump creation")
        try:
            response = requests.post(
                f"{self.base_url}/api/pumps/",
                headers=self.headers,
                data=json.dumps(test_pump)
            )
            if response.status_code == 200:
                data = response.json()
                self.pump_id = data.get("id")
                print(f"  ✓ Pump created successfully: {self.pump_id}")
                return True
            else:
                print(f"  ✗ Pump creation failed with status {response.status_code}")
                print(f"    Response: {response.text}")
                return False
        except Exception as e:
            print(f"  ✗ Pump creation failed with exception: {e}")
            return False
    
    def test_get_pumps(self):
        """Test getting pumps"""
        self.log_step("5", "Testing get pumps")
        try:
            response = requests.get(
                f"{self.base_url}/api/pumps/",
                headers=self.headers
            )
            if response.status_code == 200:
                data = response.json()
                print(f"  ✓ Retrieved {len(data)} pumps")
                return True
            else:
                print(f"  ✗ Get pumps failed with status {response.status_code}")
                print(f"    Response: {response.text}")
                return False
        except Exception as e:
            print(f"  ✗ Get pumps failed with exception: {e}")
            return False
    
    def test_create_booking(self):
        """Test creating a booking"""
        self.log_step("6", "Testing booking creation")
        try:
            tomorrow = date.today() + timedelta(days=1)
            booking_data = {
                "user_id": self.user_id,
                "pump_id": self.pump_id,
                "slot_date": str(tomorrow),
                "slot_time": "14:30",
                "fuel_quantity": 10.5,
                "amount": 525.0
            }
            response = requests.post(
                f"{self.base_url}/api/bookings/",
                headers=self.headers,
                data=json.dumps(booking_data)
            )
            if response.status_code == 200:
                data = response.json()
                self.booking_id = data.get("id")
                print(f"  ✓ Booking created successfully: {self.booking_id}")
                return True
            else:
                print(f"  ✗ Booking creation failed with status {response.status_code}")
                print(f"    Response: {response.text}")
                return False
        except Exception as e:
            print(f"  ✗ Booking creation failed with exception: {e}")
            return False
    
    def test_get_available_slots(self):
        """Test getting available slots"""
        self.log_step("7", "Testing get available slots")
        try:
            tomorrow = date.today() + timedelta(days=1)
            response = requests.get(
                f"{self.base_url}/api/bookings/{self.pump_id}/slots/{tomorrow}",
                headers=self.headers
            )
            if response.status_code == 200:
                data = response.json()
                print(f"  ✓ Retrieved {len(data)} available slots")
                return True
            else:
                print(f"  ✗ Get available slots failed with status {response.status_code}")
                print(f"    Response: {response.text}")
                return False
        except Exception as e:
            print(f"  ✗ Get available slots failed with exception: {e}")
            return False
    
    def test_generate_token(self):
        """Test generating an e-token"""
        self.log_step("8", "Testing e-token generation")
        try:
            response = requests.post(
                f"{self.base_url}/api/tokens/generate/{self.booking_id}",
                headers=self.headers
            )
            if response.status_code == 200:
                data = response.json()
                self.token_id = data.get("token", {}).get("id")
                token_code = data.get("token", {}).get("token_code")
                print(f"  ✓ Token generated successfully: {token_code}")
                return True
            else:
                print(f"  ✗ Token generation failed with status {response.status_code}")
                print(f"    Response: {response.text}")
                return False
        except Exception as e:
            print(f"  ✗ Token generation failed with exception: {e}")
            return False
    
    def test_validate_token(self):
        """Test validating a token"""
        self.log_step("9", "Testing token validation")
        try:
            # First generate a token to validate
            generate_response = requests.post(
                f"{self.base_url}/api/tokens/generate/{self.booking_id}",
                headers=self.headers
            )
            if generate_response.status_code != 200:
                print("  ✗ Could not generate token for validation")
                return False
            
            token_code = generate_response.json().get("token", {}).get("token_code")
            
            # Now validate the token
            response = requests.post(
                f"{self.base_url}/api/tokens/validate/{token_code}",
                headers=self.headers
            )
            if response.status_code == 200:
                data = response.json()
                if data.get("valid"):
                    print("  ✓ Token validation successful")
                    return True
                else:
                    print(f"  ✗ Token validation failed: {data.get('message')}")
                    return False
            else:
                print(f"  ✗ Token validation failed with status {response.status_code}")
                print(f"    Response: {response.text}")
                return False
        except Exception as e:
            print(f"  ✗ Token validation failed with exception: {e}")
            return False
    
    def test_ai_prediction(self):
        """Test AI demand prediction"""
        self.log_step("10", "Testing AI demand prediction")
        try:
            tomorrow = date.today() + timedelta(days=1)
            response = requests.get(
                f"{self.base_url}/api/ai/predict/demand/{self.pump_id}",
                params={
                    "slot_date": str(tomorrow),
                    "slot_time": "14:30"
                },
                headers=self.headers
            )
            if response.status_code == 200:
                data = response.json()
                predicted_demand = data.get("predicted_demand")
                print(f"  ✓ AI prediction successful: {predicted_demand} expected bookings")
                return True
            else:
                print(f"  ✗ AI prediction failed with status {response.status_code}")
                print(f"    Response: {response.text}")
                return False
        except Exception as e:
            print(f"  ✗ AI prediction failed with exception: {e}")
            return False
    
    def run_all_tests(self):
        """Run all integration tests"""
        print("🚀 Starting Integration Tests")
        print("=" * 50)
        
        tests = [
            self.test_health_check,
            self.test_user_registration,
            self.test_user_login,
            self.test_pump_creation,
            self.test_get_pumps,
            self.test_create_booking,
            self.test_get_available_slots,
            self.test_generate_token,
            self.test_validate_token,
            self.test_ai_prediction
        ]
        
        passed = 0
        failed = 0
        
        for test in tests:
            try:
                if test():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"  ✗ Test failed with unhandled exception: {e}")
                failed += 1
            # Small delay between tests
            time.sleep(0.1)
        
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {passed} passed, {failed} failed")
        print("=" * 50)
        
        if failed == 0:
            print("🎉 All integration tests passed!")
            return True
        else:
            print("❌ Some tests failed. Please check the output above.")
            return False

if __name__ == "__main__":
    tester = IntegrationTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)