import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface AdminPump {
  pump_id: string;
  pump_name: string;
}

export const useAdminAuth = () => {
  const { user } = useAuth();
  const [adminPumps, setAdminPumps] = useState<AdminPump[]>([]);
  const [loading, setLoading] = useState(true);

  // Get roles directly from the authenticated user
  const isSuperAdmin = user?.role === 'super_admin';
  const isPumpAdmin = user?.role === 'pump_admin';
  const isAdmin = isSuperAdmin || isPumpAdmin;

  useEffect(() => {
    if (!user) {
      setAdminPumps([]);
      setLoading(false);
      return;
    }

    const fetchAdminPumps = async () => {
      setLoading(true);
      try {
        // For now, we'll set empty pumps since we're not implementing pump management in this phase
        // In a real implementation, you would fetch pumps based on the user's role
        setAdminPumps([]);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminPumps();
  }, [user]);

  return {
    roles: [user?.role || ''],
    adminPumps,
    isSuperAdmin,
    isPumpAdmin,
    isAdmin,
    loading,
  };
};