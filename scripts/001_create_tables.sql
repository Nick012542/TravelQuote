-- Users/Profiles table for role management
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'salesperson' CHECK (role IN ('owner', 'salesperson')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Destinations (Himachal, Kashmir, Uttarakhand, etc.)
CREATE TABLE IF NOT EXISTS public.destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view destinations" ON public.destinations FOR SELECT USING (true);
CREATE POLICY "Only owners can insert destinations" ON public.destinations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
);
CREATE POLICY "Only owners can update destinations" ON public.destinations FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
);
CREATE POLICY "Only owners can delete destinations" ON public.destinations FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
);

-- Places within destinations (Manali, Shimla, etc.)
CREATE TABLE IF NOT EXISTS public.places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id UUID NOT NULL REFERENCES public.destinations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view places" ON public.places FOR SELECT USING (true);
CREATE POLICY "Only owners can insert places" ON public.places FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
);
CREATE POLICY "Only owners can update places" ON public.places FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
);
CREATE POLICY "Only owners can delete places" ON public.places FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
);

-- Hotels
CREATE TABLE IF NOT EXISTS public.hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('3-star', '4-star', '5-star')),
  price_per_night DECIMAL(10,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view hotels" ON public.hotels FOR SELECT USING (true);
CREATE POLICY "Only owners can insert hotels" ON public.hotels FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
);
CREATE POLICY "Only owners can update hotels" ON public.hotels FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
);
CREATE POLICY "Only owners can delete hotels" ON public.hotels FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
);

-- Train pricing
CREATE TABLE IF NOT EXISTS public.train_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_city TEXT NOT NULL,
  to_city TEXT NOT NULL,
  class TEXT NOT NULL CHECK (class IN ('sleeper', '3ac', '2ac', '1ac')),
  price_per_person DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(from_city, to_city, class)
);

ALTER TABLE public.train_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view train prices" ON public.train_prices FOR SELECT USING (true);
CREATE POLICY "Only owners can insert train prices" ON public.train_prices FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
);
CREATE POLICY "Only owners can update train prices" ON public.train_prices FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
);
CREATE POLICY "Only owners can delete train prices" ON public.train_prices FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
);

-- Transport (Bus/Car) pricing
CREATE TABLE IF NOT EXISTS public.transport_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id UUID NOT NULL REFERENCES public.destinations(id) ON DELETE CASCADE,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('bus', 'car', 'tempo_traveller')),
  vehicle_name TEXT,
  capacity INTEGER NOT NULL,
  price_per_day DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.transport_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view transport prices" ON public.transport_prices FOR SELECT USING (true);
CREATE POLICY "Only owners can insert transport prices" ON public.transport_prices FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
);
CREATE POLICY "Only owners can update transport prices" ON public.transport_prices FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
);
CREATE POLICY "Only owners can delete transport prices" ON public.transport_prices FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
);

-- Quotes/Bookings
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salesperson_id UUID NOT NULL REFERENCES public.profiles(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  destination_id UUID NOT NULL REFERENCES public.destinations(id),
  num_people INTEGER NOT NULL,
  total_days INTEGER NOT NULL,
  train_class TEXT,
  train_cost DECIMAL(10,2) DEFAULT 0,
  transport_type TEXT,
  transport_cost DECIMAL(10,2) DEFAULT 0,
  hotel_cost DECIMAL(10,2) DEFAULT 0,
  total_cost DECIMAL(10,2) NOT NULL,
  per_person_cost DECIMAL(10,2) NOT NULL,
  itinerary_data JSONB,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Salespersons can view own quotes" ON public.quotes FOR SELECT USING (auth.uid() = salesperson_id);
CREATE POLICY "Owners can view all quotes" ON public.quotes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
);
CREATE POLICY "Salespersons can insert quotes" ON public.quotes FOR INSERT WITH CHECK (auth.uid() = salesperson_id);
CREATE POLICY "Salespersons can update own quotes" ON public.quotes FOR UPDATE USING (auth.uid() = salesperson_id);

-- Quote places (itinerary stops)
CREATE TABLE IF NOT EXISTS public.quote_places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  place_id UUID NOT NULL REFERENCES public.places(id),
  hotel_id UUID REFERENCES public.hotels(id),
  days INTEGER NOT NULL DEFAULT 1,
  nights INTEGER NOT NULL DEFAULT 1,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.quote_places ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view quote places through quotes" ON public.quote_places FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.quotes WHERE quotes.id = quote_places.quote_id AND (quotes.salesperson_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')))
);
CREATE POLICY "Users can insert quote places" ON public.quote_places FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.quotes WHERE quotes.id = quote_places.quote_id AND quotes.salesperson_id = auth.uid())
);
CREATE POLICY "Users can update quote places" ON public.quote_places FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.quotes WHERE quotes.id = quote_places.quote_id AND quotes.salesperson_id = auth.uid())
);
CREATE POLICY "Users can delete quote places" ON public.quote_places FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.quotes WHERE quotes.id = quote_places.quote_id AND quotes.salesperson_id = auth.uid())
);
