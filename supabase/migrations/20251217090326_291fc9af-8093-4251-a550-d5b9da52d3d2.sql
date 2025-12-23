-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'pump_admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Create pump_admins table to link users to pumps they manage
CREATE TABLE public.pump_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pump_id uuid REFERENCES public.pumps(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, pump_id)
);

-- Enable RLS on pump_admins
ALTER TABLE public.pump_admins ENABLE ROW LEVEL SECURITY;

-- RLS policies for pump_admins
CREATE POLICY "Pump admins can view their assignments"
ON public.pump_admins
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage pump_admins"
ON public.pump_admins
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Allow pump admins to view bookings for their pumps
CREATE POLICY "Pump admins can view bookings for their pumps"
ON public.bookings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pump_admins
    WHERE pump_admins.user_id = auth.uid()
    AND pump_admins.pump_id = bookings.pump_id
  )
);

-- Allow pump admins to update bookings for their pumps
CREATE POLICY "Pump admins can update bookings for their pumps"
ON public.bookings
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pump_admins
    WHERE pump_admins.user_id = auth.uid()
    AND pump_admins.pump_id = bookings.pump_id
  )
);

-- Allow pump admins to view tokens for their pumps
CREATE POLICY "Pump admins can view tokens for their pumps"
ON public.tokens
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.pump_admins pa ON pa.pump_id = b.pump_id
    WHERE b.id = tokens.booking_id
    AND pa.user_id = auth.uid()
  )
);

-- Allow pump admins to update tokens for their pumps
CREATE POLICY "Pump admins can update tokens"
ON public.tokens
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.pump_admins pa ON pa.pump_id = b.pump_id
    WHERE b.id = tokens.booking_id
    AND pa.user_id = auth.uid()
  )
);

-- Allow pump admins to update their managed pumps
CREATE POLICY "Pump admins can update their pumps"
ON public.pumps
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pump_admins
    WHERE pump_admins.user_id = auth.uid()
    AND pump_admins.pump_id = pumps.id
  )
);

-- Enable realtime for bookings and tokens
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tokens;