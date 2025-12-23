import { useState, useEffect } from 'react';
import { API_CONFIG } from '@/lib/apiConfig';

export interface Pump {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  total_capacity: number;
  remaining_capacity: number;
  walkin_lanes: number;
  booked_lanes: number;
  rating: number | null;
  is_open: boolean;
  created_at: string;
  updated_at: string;
}

export const usePumps = () => {
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPumps = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_CONFIG.ENDPOINTS.PUMPS.BASE);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Convert numeric strings to numbers if needed
      const formattedData = data.map((pump: any) => ({
        ...pump,
        id: pump.id.toString(),
        latitude: pump.latitude ? parseFloat(pump.latitude) : null,
        longitude: pump.longitude ? parseFloat(pump.longitude) : null,
        total_capacity: parseInt(pump.total_capacity),
        remaining_capacity: parseInt(pump.remaining_capacity),
        walkin_lanes: parseInt(pump.walkin_lanes),
        booked_lanes: parseInt(pump.booked_lanes),
        rating: pump.rating ? parseFloat(pump.rating) : null
      }));
      
      setPumps(formattedData || []);
    } catch (err) {
      console.error('Failed to fetch pumps:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch pumps');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPumps();
  }, []);

  return { pumps, loading, error, refetch: fetchPumps };
};
