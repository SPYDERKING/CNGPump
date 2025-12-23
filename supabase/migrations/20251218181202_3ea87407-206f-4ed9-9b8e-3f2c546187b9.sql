-- Add DELETE policy to profiles table for GDPR compliance
CREATE POLICY "Users can delete their own profile" ON public.profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Add CHECK constraint for fuel quantity validation
ALTER TABLE public.bookings
ADD CONSTRAINT fuel_quantity_valid 
CHECK (fuel_quantity > 0 AND fuel_quantity <= 50);

-- Add CHECK constraint for amount validation (must be positive)
ALTER TABLE public.bookings
ADD CONSTRAINT amount_valid
CHECK (amount > 0);

-- Create token_scans table for audit logging
CREATE TABLE public.token_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id UUID REFERENCES tokens(id) ON DELETE SET NULL,
  pump_id UUID REFERENCES pumps(id) ON DELETE SET NULL,
  scanned_by UUID NOT NULL,
  scan_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  result TEXT NOT NULL,
  token_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on token_scans
ALTER TABLE public.token_scans ENABLE ROW LEVEL SECURITY;

-- Pump admins can view their scan history
CREATE POLICY "Pump admins can view their scans" ON public.token_scans
  FOR SELECT USING (
    scanned_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM pump_admins 
      WHERE pump_admins.user_id = auth.uid() 
      AND pump_admins.pump_id = token_scans.pump_id
    )
  );

-- Pump admins can insert scan records
CREATE POLICY "Pump admins can insert scans" ON public.token_scans
  FOR INSERT WITH CHECK (
    auth.uid() = scanned_by AND
    EXISTS (
      SELECT 1 FROM pump_admins 
      WHERE pump_admins.user_id = auth.uid()
    )
  );