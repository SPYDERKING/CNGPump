from models.user import User, UserProfile, UserRoles
from models.pump import Pump
from models.booking import Booking
from models.token import Token, TokenScan
from models.payment import Payment
from models.reminder import Reminder
from models.ai_data import AIData
from models.pump_admin import PumpAdmin
from models.base import Base

print("Base instance:", Base)
print("Number of tables in metadata:", len(Base.metadata.tables))
print("Tables:")
for table_name in Base.metadata.tables:
    print(f"  - {table_name}")