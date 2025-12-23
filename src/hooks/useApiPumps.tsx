import { useState, useEffect, useCallback } from 'react';
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

export const useApiPumps = () => {
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPumps = async () => {
    try {
      setLoading(true);
      // Fetch from our backend API instead of Supabase
      const response = await fetch(API_CONFIG.ENDPOINTS.PUMPS.BASE, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setPumps(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pumps');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPumps();
  }, []);

  const fetchNearbyPumps = useCallback(async (latitude: number, longitude: number, maxDistance?: number) => {
    try {
      // Don't change loading state here since this is used for nearby pumps
      // and shouldn't interfere with the main pumps loading state
      const distanceParam = maxDistance ? `&max_distance=${maxDistance}` : '';
      const response = await fetch(`${API_CONFIG.ENDPOINTS.PUMPS.NEARBY}?latitude=${latitude}&longitude=${longitude}${distanceParam}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      // Don't set error state here as it's handled by the caller
      throw err;
    }
  }, []);

  return { pumps, loading, error, refetch: fetchPumps, fetchNearbyPumps };};