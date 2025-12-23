import sqlite3
import os

# Check if database file exists
db_path = "./smart_pump.db"
if os.path.exists(db_path):
    print("Database file exists")
else:
    print("Database file does not exist")

# Connect to database and check tables
try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get list of tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    
    print("Tables in database:")
    for table in tables:
        print(f"  - {table[0]}")
        
    conn.close()
except Exception as e:
    print(f"Error connecting to database: {e}")