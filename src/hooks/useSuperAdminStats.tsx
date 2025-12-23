import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, format, subMonths } from 'date-fns';

export interface SystemStats {
  totalBookings: number;
  totalRevenue: number;
  totalUsers: number;
  totalPumps: number;
  activePumps: number;
  todayBookings: number;
  todayRevenue: number;
  monthlyData: { month: string; bookings: number; revenue: number }[];
  pumpPerformance: { name: string; bookings: number; revenue: number }[];
}

export const useSuperAdminStats = () => {
  const [stats, setStats] = useState<SystemStats>({
    totalBookings: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalPumps: 0,
    activePumps: 0,
    todayBookings: 0,
    todayRevenue: 0,
    monthlyData: [],
    pumpPerformance: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch all bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*, pumps(name)');

      if (bookingsError) throw bookingsError;

      // Fetch pumps
      const { data: pumps, error: pumpsError } = await supabase
        .from('pumps')
        .select('*');

      if (pumpsError) throw pumpsError;

      // Fetch user count from profiles
      const { count: userCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) throw usersError;

      // Calculate stats
      const totalBookings = bookings?.length || 0;
      const totalRevenue = bookings?.reduce((sum, b) => sum + (b.amount || 0), 0) || 0;
      const todayBookings = bookings?.filter(b => b.slot_date === today).length || 0;
      const todayRevenue = bookings?.filter(b => b.slot_date === today).reduce((sum, b) => sum + (b.amount || 0), 0) || 0;
      const activePumps = pumps?.filter(p => p.is_open).length || 0;

      // Monthly data (last 6 months)
      const monthlyMap = new Map<string, { bookings: number; revenue: number }>();
      for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const month = format(date, 'MMM yyyy');
        monthlyMap.set(month, { bookings: 0, revenue: 0 });
      }

      bookings?.forEach(booking => {
        const month = format(new Date(booking.slot_date), 'MMM yyyy');
        const existing = monthlyMap.get(month);
        if (existing) {
          monthlyMap.set(month, {
            bookings: existing.bookings + 1,
            revenue: existing.revenue + (booking.amount || 0),
          });
        }
      });

      const monthlyData = Array.from(monthlyMap.entries()).map(([month, data]) => ({
        month,
        ...data,
      }));

      // Pump performance
      const pumpMap = new Map<string, { name: string; bookings: number; revenue: number }>();
      pumps?.forEach(pump => {
        pumpMap.set(pump.id, { name: pump.name, bookings: 0, revenue: 0 });
      });

      bookings?.forEach(booking => {
        const existing = pumpMap.get(booking.pump_id);
        if (existing) {
          pumpMap.set(booking.pump_id, {
            ...existing,
            bookings: existing.bookings + 1,
            revenue: existing.revenue + (booking.amount || 0),
          });
        }
      });

      const pumpPerformance = Array.from(pumpMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      setStats({
        totalBookings,
        totalRevenue,
        totalUsers: userCount || 0,
        totalPumps: pumps?.length || 0,
        activePumps,
        todayBookings,
        todayRevenue,
        monthlyData,
        pumpPerformance,
      });
    } catch (error) {
      console.error('Error fetching super admin stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
};