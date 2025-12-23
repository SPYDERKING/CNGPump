import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BookingWithToken {
  id: string;
  slot_date: string;
  slot_time: string;
  fuel_quantity: number;
  amount: number;
  booking_status: string;
  confirmation_status: string;
  payment_status: string;
  user_id: string;
  pump_id: string;
  created_at: string;
  token?: {
    id: string;
    token_code: string;
    status: string;
    expiry_time: string;
    scan_time: string | null;
  };
  profile?: {
    full_name: string | null;
    phone: string | null;
    vehicle_number: string | null;
  };
}

interface DashboardStats {
  todayBookings: number;
  tokensScanned: number;
  capacityUsed: number;
  totalCapacity: number;
  pendingTokens: number;
  revenue: number;
}

interface HourlyData {
  hour: string;
  bookings: number;
  scanned: number;
}

export const useAdminDashboard = (pumpId: string | null) => {
  const [bookings, setBookings] = useState<BookingWithToken[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    todayBookings: 0,
    tokensScanned: 0,
    capacityUsed: 0,
    totalCapacity: 1000,
    pendingTokens: 0,
    revenue: 0,
  });
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  const fetchDashboardData = useCallback(async () => {
    if (!pumpId) return;

    try {
      setLoading(true);

      // Fetch today's bookings with tokens and profiles
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          tokens(id, token_code, status, expiry_time, scan_time),
          profiles:user_id(full_name, phone, vehicle_number)
        `)
        .eq('pump_id', pumpId)
        .eq('slot_date', today)
        .order('slot_time', { ascending: true });

      if (bookingsError) throw bookingsError;

      const formattedBookings: BookingWithToken[] = (bookingsData || []).map(b => ({
        ...b,
        token: Array.isArray(b.tokens) ? b.tokens[0] : b.tokens,
        profile: b.profiles as any,
      }));

      setBookings(formattedBookings);

      // Calculate stats
      const scannedTokens = formattedBookings.filter(b => b.token?.status === 'used').length;
      const pendingTokens = formattedBookings.filter(b => b.token?.status === 'valid').length;
      const totalFuel = formattedBookings.reduce((sum, b) => sum + b.fuel_quantity, 0);
      const totalRevenue = formattedBookings.reduce((sum, b) => sum + Number(b.amount), 0);

      // Fetch pump capacity
      const { data: pumpData } = await supabase
        .from('pumps')
        .select('total_capacity, remaining_capacity')
        .eq('id', pumpId)
        .single();

      setStats({
        todayBookings: formattedBookings.length,
        tokensScanned: scannedTokens,
        capacityUsed: totalFuel,
        totalCapacity: pumpData?.total_capacity || 1000,
        pendingTokens,
        revenue: totalRevenue,
      });

      // Calculate hourly distribution
      const hourlyMap: Record<string, { bookings: number; scanned: number }> = {};
      for (let i = 6; i <= 22; i++) {
        const hour = `${i.toString().padStart(2, '0')}:00`;
        hourlyMap[hour] = { bookings: 0, scanned: 0 };
      }

      formattedBookings.forEach(b => {
        const hour = b.slot_time.substring(0, 5).replace(/:\d{2}$/, ':00');
        if (hourlyMap[hour]) {
          hourlyMap[hour].bookings++;
          if (b.token?.status === 'used') {
            hourlyMap[hour].scanned++;
          }
        }
      });

      setHourlyData(
        Object.entries(hourlyMap).map(([hour, data]) => ({
          hour,
          ...data,
        }))
      );

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, [pumpId, today]);

  // Real-time subscription
  useEffect(() => {
    if (!pumpId) return;

    fetchDashboardData();

    const channel = supabase
      .channel(`pump-${pumpId}-bookings`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `pump_id=eq.${pumpId}`,
        },
        () => {
          fetchDashboardData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tokens',
        },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pumpId, fetchDashboardData]);

  const verifyToken = async (tokenCode: string): Promise<BookingWithToken | null> => {
    if (!pumpId) return null;

    try {
      // Use secure edge function for token verification
      const { data, error } = await supabase.functions.invoke('verify-token', {
        body: { tokenCode, pumpId }
      });

      if (error) {
        console.error('Edge function error:', error);
        toast.error('Failed to verify token');
        return null;
      }

      if (!data.success) {
        toast.error(data.error || 'Token verification failed');
        return null;
      }

      toast.success('Token verified successfully!');
      fetchDashboardData();

      // Return the booking data from the edge function response
      const bookingData = data.booking;
      return {
        id: bookingData.id,
        slot_date: bookingData.slotDate,
        slot_time: bookingData.slotTime,
        fuel_quantity: bookingData.fuelQuantity,
        amount: bookingData.amount,
        booking_status: 'completed',
        confirmation_status: 'coming',
        payment_status: 'success',
        user_id: '',
        pump_id: pumpId,
        created_at: new Date().toISOString(),
        token: { id: '', token_code: tokenCode, status: 'used', expiry_time: '', scan_time: new Date().toISOString() },
        profile: {
          full_name: bookingData.customerName,
          phone: bookingData.phone,
          vehicle_number: bookingData.vehicleNumber
        }
      };
    } catch (error) {
      console.error('Error verifying token:', error);
      toast.error('Failed to verify token');
      return null;
    }
  };

  const updateSlots = async (walkinLanes: number, bookedLanes: number) => {
    if (!pumpId) return;

    try {
      const { error } = await supabase
        .from('pumps')
        .update({ walkin_lanes: walkinLanes, booked_lanes: bookedLanes })
        .eq('id', pumpId);

      if (error) throw error;
      toast.success('Slots updated successfully');
    } catch (error) {
      console.error('Error updating slots:', error);
      toast.error('Failed to update slots');
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          booking_status: 'cancelled',
          confirmation_status: 'not_coming'
        })
        .eq('id', bookingId);

      if (error) throw error;

      // Expire the token
      await supabase
        .from('tokens')
        .update({ status: 'expired' })
        .eq('booking_id', bookingId);

      toast.success('Booking cancelled successfully');
      fetchDashboardData();
      return { error: null };
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
      return { error };
    }
  };

  return {
    bookings,
    stats,
    hourlyData,
    loading,
    verifyToken,
    updateSlots,
    cancelBooking,
    refetch: fetchDashboardData,
  };
};
