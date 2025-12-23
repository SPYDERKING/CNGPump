-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  vehicle_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pumps table
CREATE TABLE public.pumps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  total_capacity INTEGER NOT NULL DEFAULT 1000,
  remaining_capacity INTEGER NOT NULL DEFAULT 1000,
  walkin_lanes INTEGER NOT NULL DEFAULT 2,
  booked_lanes INTEGER NOT NULL DEFAULT 2,
  rating DECIMAL(2, 1) DEFAULT 4.0,
  is_open BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pump_id UUID NOT NULL REFERENCES public.pumps(id) ON DELETE CASCADE,
  slot_date DATE NOT NULL,
  slot_time TIME NOT NULL,
  fuel_quantity DECIMAL(5, 2) NOT NULL DEFAULT 10,
  amount DECIMAL(10, 2) NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'success', 'failed')),
  booking_status TEXT NOT NULL DEFAULT 'active' CHECK (booking_status IN ('active', 'confirmed', 'completed', 'cancelled', 'expired')),
  confirmation_status TEXT DEFAULT 'pending' CHECK (confirmation_status IN ('pending', 'coming', 'not_coming')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tokens table
CREATE TABLE public.tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  token_code TEXT NOT NULL UNIQUE,
  qr_data TEXT NOT NULL,
  expiry_time TIMESTAMP WITH TIME ZONE NOT NULL,
  scan_time TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'used', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pumps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Pumps RLS policies (public read, admin write)
CREATE POLICY "Anyone can view pumps" ON public.pumps
  FOR SELECT USING (true);

-- Bookings RLS policies
CREATE POLICY "Users can view their own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = user_id);

-- Tokens RLS policies
CREATE POLICY "Users can view tokens for their bookings" ON public.tokens
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bookings 
      WHERE bookings.id = tokens.booking_id 
      AND bookings.user_id = auth.uid()
    )
  );

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pumps_updated_at
  BEFORE UPDATE ON public.pumps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Generate unique token code function
CREATE OR REPLACE FUNCTION public.generate_token_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := 'CNG-';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Insert sample pumps data
INSERT INTO public.pumps (name, address, city, total_capacity, remaining_capacity, rating, is_open) VALUES
('Green Energy CNG Station', 'Sector 15', 'Noida', 1000, 720, 4.5, true),
('FastFuel CNG Pump', 'Ring Road', 'Delhi', 800, 180, 4.2, true),
('EcoGas Station', 'Mayur Vihar Phase 3', 'Delhi', 1200, 950, 4.8, true),
('CityGas Express', 'Ashok Nagar', 'Delhi', 600, 20, 3.9, true),
('Metro CNG Point', 'Connaught Place', 'Delhi', 900, 450, 4.3, false),
('Highway Fuel Station', 'NH-24', 'Ghaziabad', 1500, 1350, 4.6, true);