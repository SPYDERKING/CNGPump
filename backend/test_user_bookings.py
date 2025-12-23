import requests

# Test the user bookings endpoint
user_id = 1  # Assuming this is the user ID you're logged in as
url = f"http://localhost:8001/api/bookings/?user_id={user_id}"

print(f"Testing URL: {url}")

try:
    response = requests.get(url)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        bookings = response.json()
        print(f"Number of bookings found: {len(bookings)}")
        for i, booking in enumerate(bookings):
            print(f"Booking {i+1}: ID={booking['id']}, Pump ID={booking['pump_id']}, Date={booking['slot_date']}, Time={booking['slot_time']}")
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Exception occurred: {e}")