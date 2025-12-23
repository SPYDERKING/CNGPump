import { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import { API_CONFIG } from '@/lib/apiConfig';

export interface Booking {
  id: string;
  user_id: string;
  pump_id: string;
  slot_date: string;
  slot_time: string;
  fuel_quantity: number;
  amount: number;
  payment_status: string;
  booking_status: string;
  confirmation_status: string | null;
  created_at: string;
  updated_at: string;
  pump?: {
    name: string;
    address: string;
    city: string;
  };
  token?: Token;
}

export interface Token {
  id: string;
  booking_id: string;
  token_code: string;
  qr_data: string;
  expiry_time: string;
  scan_time: string | null;
  status: string;
  created_at: string;
}

export interface CreateBookingInput {
  pump_id: number;
  slot_date: string;
  slot_time: string;
  fuel_quantity: number;
  amount: number;
}

export const useApiBookings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateTokenCode = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = 'CNG-';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const createBooking = async (userId: string, input: CreateBookingInput) => {
    try {
      setLoading(true);
      setError(null);

      // Create booking through our backend API
      const response = await fetch(API_CONFIG.ENDPOINTS.BOOKINGS.BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          pump_id: input.pump_id,
          slot_date: input.slot_date,
          slot_time: input.slot_time,
          fuel_quantity: input.fuel_quantity,
          amount: input.amount,
          payment_status: 'pending',
          booking_status: 'confirmed'
        }),
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            if (Array.isArray(errorData.detail)) {
              errorMessage = errorData.detail.map((err: any) => err.msg || JSON.stringify(err)).join(', ');
            } else {
              errorMessage = errorData.detail;
            }
          }
        } catch (parseError) {
          // If we can't parse the error, use the status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const booking = await response.json();

      // The backend automatically generates the token, so we just need to fetch it
      // Fetch the token for this booking
      const tokenResponse = await fetch(`${API_CONFIG.ENDPOINTS.TOKENS.BASE}/booking/${booking.id}`);
      if (tokenResponse.ok) {
        const token = await tokenResponse.json();
        return { error: null, data: { booking, token } };
      }

      return { error: null, data: { booking, token: null } };
    } catch (err) {
      let errorMessage = 'Failed to create booking';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else {
        errorMessage = JSON.stringify(err);
      }
      setError(errorMessage);
      return { error: new Error(errorMessage), data: null };
    } finally {
      setLoading(false);
    }
  };

  const getUserBookings = async (userId: string) => {
    console.log('getUserBookings called with userId:', userId);
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_CONFIG.ENDPOINTS.BOOKINGS.BASE}?user_id=${userId}&t=${new Date().getTime()}`);
      console.log('Bookings API response:', response.status);
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          console.log('Error data from API:', errorData);
          if (errorData.detail) {
            if (Array.isArray(errorData.detail)) {
              errorMessage = errorData.detail.map((err: any) => err.msg || JSON.stringify(err)).join(', ');
            } else {
              errorMessage = errorData.detail;
            }
          }
        } catch (parseError) {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const bookings = await response.json();
      console.log('Raw bookings data:', bookings);
      
      // Fetch pump details and token data for each booking
      const bookingsWithDetails = await Promise.all(
        bookings.map(async (booking: any) => {
          console.log('Fetching details for booking:', booking.id, 'pump_id:', booking.pump_id);
          
          // Fetch pump details
          let pumpData = null;
          try {
            const pumpResponse = await fetch(`${API_CONFIG.ENDPOINTS.PUMPS.BASE}/${booking.pump_id}`);
            console.log('Pump API response for booking', booking.id, ':', pumpResponse.status);
            if (pumpResponse.ok) {
              pumpData = await pumpResponse.json();
              console.log('Pump data for booking', booking.id, ':', pumpData);
            } else {
              console.warn('Failed to fetch pump details for booking', booking.id, 'Status:', pumpResponse.status);
            }
          } catch (pumpError) {
            console.warn(`Failed to fetch pump details for booking ${booking.id}:`, pumpError);
          }
          
          // Fetch token data
          let tokenData = null;
          try {
            const tokenResponse = await fetch(`${API_CONFIG.ENDPOINTS.TOKENS.BASE}/booking/${booking.id}`);
            console.log('Token API response for booking', booking.id, ':', tokenResponse.status);
            if (tokenResponse.ok) {
              tokenData = await tokenResponse.json();
              console.log('Token data for booking', booking.id, ':', tokenData);
            } else {
              console.warn('No token found for booking', booking.id, 'Status:', tokenResponse.status);
            }
          } catch (tokenError) {
            console.warn(`Failed to fetch token for booking ${booking.id}:`, tokenError);
          }
          
          return { ...booking, pump: pumpData, token: tokenData };
        })
      );
      
      console.log('Final bookings data with details:', bookingsWithDetails);
      return { error: null, data: bookingsWithDetails };
    } catch (err) {
      console.error('Error in getUserBookings:', err);
      let errorMessage = 'Failed to fetch bookings';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else {
        errorMessage = JSON.stringify(err);
      }
      setError(errorMessage);
      return { error: new Error(errorMessage), data: null };
    } finally {
      setLoading(false);
    }
  };

  const updateBooking = async (bookingId: string, updateData: any) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_CONFIG.ENDPOINTS.BOOKINGS.BASE}/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            if (Array.isArray(errorData.detail)) {
              errorMessage = errorData.detail.map((err: any) => err.msg || JSON.stringify(err)).join(', ');
            } else {
              errorMessage = errorData.detail;
            }
          }
        } catch (parseError) {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const updatedBooking = await response.json();
      return { error: null, data: updatedBooking };
    } catch (err) {
      let errorMessage = 'Failed to update booking';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else {
        errorMessage = JSON.stringify(err);
      }
      setError(errorMessage);
      return { error: new Error(errorMessage), data: null };
    } finally {
      setLoading(false);
    }
  };

  const updateConfirmationStatus = async (bookingId: string, status: string) => {
    try {
      console.log(`Updating booking ${bookingId} confirmation status to ${status}`);
      const result = await updateBooking(bookingId, { confirmation_status: status });
      console.log(`Update result:`, result);
      return result;
    } catch (error) {
      console.error(`Error updating booking ${bookingId} confirmation status:`, error);
      throw error;
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    return updateBooking(bookingId, { booking_status: status });
  };

  const deleteBooking = async (bookingId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_CONFIG.ENDPOINTS.BOOKINGS.BASE}/${bookingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            if (Array.isArray(errorData.detail)) {
              errorMessage = errorData.detail.map((err: any) => err.msg || JSON.stringify(err)).join(', ');
            } else {
              errorMessage = errorData.detail;
            }
          }
        } catch (parseError) {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return { error: null };
    } catch (err) {
      let errorMessage = 'Failed to delete booking';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else {
        errorMessage = JSON.stringify(err);
      }
      setError(errorMessage);
      return { error: new Error(errorMessage) };
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    return updateBookingStatus(bookingId, 'cancelled');
  };

  const completeBooking = async (bookingId: string) => {
    return updateBookingStatus(bookingId, 'completed');
  };

  return {
    createBooking,
    getUserBookings,
    updateBooking,
    updateConfirmationStatus,
    updateBookingStatus,
    deleteBooking,
    cancelBooking,
    completeBooking,
    loading,
    error
  };
};