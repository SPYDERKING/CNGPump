try:
    from models.user import User, UserProfile, UserRoles
    print("User models imported successfully")
except Exception as e:
    print(f"Error importing user models: {e}")

try:
    from models.pump import Pump
    print("Pump model imported successfully")
except Exception as e:
    print(f"Error importing pump model: {e}")

try:
    from models.booking import Booking
    print("Booking model imported successfully")
except Exception as e:
    print(f"Error importing booking model: {e}")