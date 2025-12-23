import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyRequest {
  tokenCode: string;
  pumpId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client for service role operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the authorization header to identify the pump admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create user client to verify the caller
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!;
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get the current user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      console.error('User authentication failed:', userError?.message);
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { tokenCode, pumpId }: VerifyRequest = await req.json();
    
    console.log(`Token verification request: tokenCode=${tokenCode}, pumpId=${pumpId}, userId=${user.id}`);

    // Validate input
    if (!tokenCode || typeof tokenCode !== 'string') {
      console.error('Invalid token code format');
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid token code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!pumpId || typeof pumpId !== 'string') {
      console.error('Invalid pump ID format');
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid pump ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate token code format (CNG-XXXXXX)
    const tokenCodeRegex = /^CNG-[A-Z0-9]{6}$/;
    if (!tokenCodeRegex.test(tokenCode)) {
      console.error('Token code does not match expected format');
      await logScanAttempt(supabaseAdmin, null, pumpId, user.id, 'invalid_format', tokenCode);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid token format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user is a pump admin for this pump
    const { data: pumpAdmin, error: pumpAdminError } = await supabaseAdmin
      .from('pump_admins')
      .select('id')
      .eq('user_id', user.id)
      .eq('pump_id', pumpId)
      .maybeSingle();

    if (pumpAdminError || !pumpAdmin) {
      console.error('User is not admin for this pump:', pumpAdminError?.message);
      await logScanAttempt(supabaseAdmin, null, pumpId, user.id, 'unauthorized_pump', tokenCode);
      return new Response(
        JSON.stringify({ success: false, error: 'Not authorized for this pump' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find the token using atomic update to prevent race conditions
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('tokens')
      .select(`
        id,
        token_code,
        status,
        expiry_time,
        booking_id,
        bookings (
          id,
          pump_id,
          slot_date,
          slot_time,
          fuel_quantity,
          amount,
          user_id,
          profiles:user_id (
            full_name,
            vehicle_number,
            phone
          )
        )
      `)
      .eq('token_code', tokenCode)
      .maybeSingle();

    if (tokenError) {
      console.error('Database error finding token:', tokenError.message);
      return new Response(
        JSON.stringify({ success: false, error: 'Database error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!tokenData) {
      console.log('Token not found:', tokenCode);
      await logScanAttempt(supabaseAdmin, null, pumpId, user.id, 'not_found', tokenCode);
      return new Response(
        JSON.stringify({ success: false, error: 'Token not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if token belongs to this pump
    const booking = Array.isArray(tokenData.bookings) ? tokenData.bookings[0] : tokenData.bookings;
    if (!booking || booking.pump_id !== pumpId) {
      console.log('Token not valid for this pump');
      await logScanAttempt(supabaseAdmin, tokenData.id, pumpId, user.id, 'wrong_pump', tokenCode);
      return new Response(
        JSON.stringify({ success: false, error: 'Token not valid for this pump' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check token status
    if (tokenData.status === 'used') {
      console.log('Token already used:', tokenCode);
      await logScanAttempt(supabaseAdmin, tokenData.id, pumpId, user.id, 'already_used', tokenCode);
      return new Response(
        JSON.stringify({ success: false, error: 'Token already used' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (tokenData.status === 'expired') {
      console.log('Token expired:', tokenCode);
      await logScanAttempt(supabaseAdmin, tokenData.id, pumpId, user.id, 'expired', tokenCode);
      return new Response(
        JSON.stringify({ success: false, error: 'Token expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check expiry time
    const now = new Date();
    const expiryTime = new Date(tokenData.expiry_time);
    if (now > expiryTime) {
      console.log('Token past expiry time:', tokenCode);
      // Update token status to expired
      await supabaseAdmin
        .from('tokens')
        .update({ status: 'expired' })
        .eq('id', tokenData.id);
      
      await logScanAttempt(supabaseAdmin, tokenData.id, pumpId, user.id, 'expired', tokenCode);
      return new Response(
        JSON.stringify({ success: false, error: 'Token has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check time window (15 min before slot to expiry)
    const slotDateTime = new Date(`${booking.slot_date}T${booking.slot_time}`);
    const windowStart = new Date(slotDateTime.getTime() - 15 * 60 * 1000);
    
    if (now < windowStart) {
      console.log('Token scan too early:', tokenCode);
      await logScanAttempt(supabaseAdmin, tokenData.id, pumpId, user.id, 'too_early', tokenCode);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Token not yet valid. Please scan after ${windowStart.toLocaleTimeString()}` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Atomically mark token as used (prevents race conditions)
    const { data: updatedToken, error: updateError } = await supabaseAdmin
      .from('tokens')
      .update({ 
        status: 'used', 
        scan_time: now.toISOString() 
      })
      .eq('id', tokenData.id)
      .eq('status', 'valid') // Only update if still valid
      .select()
      .maybeSingle();

    if (updateError || !updatedToken) {
      console.error('Failed to update token (may have been used by another request):', updateError?.message);
      await logScanAttempt(supabaseAdmin, tokenData.id, pumpId, user.id, 'race_condition', tokenCode);
      return new Response(
        JSON.stringify({ success: false, error: 'Token already used or expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update booking status to completed
    await supabaseAdmin
      .from('bookings')
      .update({ booking_status: 'completed' })
      .eq('id', booking.id);

    // Log successful scan
    await logScanAttempt(supabaseAdmin, tokenData.id, pumpId, user.id, 'success', tokenCode);

    console.log('Token verified successfully:', tokenCode);

    // Return booking details
    const profile = Array.isArray(booking.profiles) ? booking.profiles[0] : booking.profiles;
    return new Response(
      JSON.stringify({
        success: true,
        booking: {
          id: booking.id,
          slotDate: booking.slot_date,
          slotTime: booking.slot_time,
          fuelQuantity: booking.fuel_quantity,
          amount: booking.amount,
          customerName: profile?.full_name || 'Unknown',
          vehicleNumber: profile?.vehicle_number || 'N/A',
          phone: profile?.phone || 'N/A'
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in verify-token function:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function logScanAttempt(
  supabase: SupabaseClient<any, any, any>,
  tokenId: string | null,
  pumpId: string,
  scannedBy: string,
  result: string,
  tokenCode: string
) {
  try {
    await supabase
      .from('token_scans')
      .insert({
        token_id: tokenId,
        pump_id: pumpId,
        scanned_by: scannedBy,
        result,
        token_code: tokenCode
      });
  } catch (error) {
    console.error('Failed to log scan attempt:', error);
  }
}
