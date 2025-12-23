import sqlite3
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from passlib.context import CryptContext

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def create_admin_users():
    # Connect to the database
    conn = sqlite3.connect('test_supabase.db')
    cursor = conn.cursor()
    
    # Create admin users
    admin_users = [
        {
            'email': 'admin@cngqueue.com',
            'password': 'Admin123!',
            'full_name': 'Super Administrator',
            'phone': '+919876543210',
            'vehicle_number': None,
            'role': 'super_admin'
        },
        {
            'email': 'pumpadmin@cngqueue.com',
            'password': 'PumpAdmin123!',
            'full_name': 'Pump Administrator',
            'phone': '+919876543211',
            'vehicle_number': None,
            'role': 'pump_admin'
        }
    ]
    
    try:
        for user in admin_users:
            # Check if user already exists
            cursor.execute('SELECT id FROM users WHERE email = ?', (user['email'],))
            existing_user = cursor.fetchone()
            
            if existing_user:
                user_id = existing_user[0]
                print(f"User {user['email']} already exists with ID {user_id}")
            else:
                # Hash the password
                hashed_password = get_password_hash(user['password'])
                
                # Insert user into users table
                cursor.execute('''
                    INSERT INTO users (email, hashed_password, full_name, phone, vehicle_number, role, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
                ''', (
                    user['email'],
                    hashed_password,
                    user['full_name'],
                    user['phone'],
                    user['vehicle_number'],
                    user['role']
                ))
                
                # Get the user ID
                user_id = cursor.lastrowid
                print(f"Created user {user['email']} with ID {user_id}")
            
            # Insert user role into user_roles table
            cursor.execute('''
                INSERT OR IGNORE INTO user_roles (user_id, role)
                VALUES (?, ?)
            ''', (user_id, user['role']))
            
            print(f"Ensured {user['role']} role for user: {user['email']}")
        
        # Commit changes
        conn.commit()
        print("\nAdmin users created/updated successfully!")
        print("\nLogin credentials:")
        print("Super Admin - Email: admin@cngqueue.com, Password: Admin123!")
        print("Pump Admin - Email: pumpadmin@cngqueue.com, Password: PumpAdmin123!")
        
    except Exception as e:
        print(f"Error creating admin users: {e}")
        import traceback
        traceback.print_exc()
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    create_admin_users()