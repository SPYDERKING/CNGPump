import sqlite3

def inspect_database():
    # Connect to the database
    conn = sqlite3.connect('smart_pump.db')
    cursor = conn.cursor()
    
    # Get all table names
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    
    print("Database Tables:")
    for table in tables:
        print(f"- {table[0]}")
        
    # Get schema for each table
    print("\nTable Schemas:")
    for table in tables:
        print(f"\n{table[0]}:")
        cursor.execute(f"PRAGMA table_info({table[0]});")
        columns = cursor.fetchall()
        for column in columns:
            print(f"  {column[1]} ({column[2]}) {'PRIMARY KEY' if column[5] == 1 else ''}")
    
    conn.close()

if __name__ == "__main__":
    inspect_database()