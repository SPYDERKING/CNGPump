// Script to create admin users in Supabase
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://jvjryvpxsechizwlmnwu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'your_supabase_service_role_key'; // This needs to be replaced

// Create Supabase client with service role key (admin privileges)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Admin users to create
const adminUsers = [
  {
    email: 'pumpadmin@gmail.com',
    password: 'admin@pump',
    role: 'pump_admin'
  },
  {
    email: 'pumpsuperadmin@gmail.com',
    password: 'pump@superadmin',
    role: 'super_admin'
  }
];

async function createAdminUsers() {
  console.log('Creating admin users in Supabase...');
  
  for (const user of adminUsers) {
    try {
      // Create the user
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true
      });
      
      if (error) {
        console.error(`Error creating user ${user.email}:`, error.message);
        continue;
      }
      
      console.log(`Successfully created user ${user.email}`);
      
      // Assign role to the user
      const userId = data.user.id;
      
      // Insert user role into user_roles table
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([
          {
            user_id: userId,
            role: user.role
          }
        ]);
      
      if (roleError) {
        console.error(`Error assigning role to ${user.email}:`, roleError.message);
      } else {
        console.log(`Successfully assigned ${user.role} role to ${user.email}`);
      }
      
    } catch (err) {
      console.error(`Unexpected error creating user ${user.email}:`, err.message);
    }
  }
  
  console.log('Finished creating admin users');
}

// Run the function
createAdminUsers().catch(console.error);