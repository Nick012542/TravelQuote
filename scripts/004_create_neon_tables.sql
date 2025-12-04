-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS quote_places CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS hotels CASCADE;
DROP TABLE IF EXISTS transport_prices CASCADE;
DROP TABLE IF EXISTS train_prices CASCADE;
DROP TABLE IF EXISTS places CASCADE;
DROP TABLE IF EXISTS destinations CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table (for simple authentication without Supabase)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'salesperson' CHECK (role IN ('owner', 'salesperson')),
  is_approved BOOLEAN DEFAULT FALSE,
  is_primary_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table for authentication tokens
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Destinations (Himachal, Kashmir, Uttarakhand, etc.)
CREATE TABLE destinations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Places within destinations (Manali, Shimla, etc.)
CREATE TABLE places (
  id SERIAL PRIMARY KEY,
  destination_id INTEGER NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hotels with meal plan pricing
CREATE TABLE hotels (
  id SERIAL PRIMARY KEY,
  place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('3-star-basic', '3-star-premium', '4-star', '5-star')),
  room_type TEXT DEFAULT 'Deluxe Room',
  price_per_night DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_ep DECIMAL(10,2) DEFAULT 0,
  price_cp DECIMAL(10,2) DEFAULT 0,
  price_map DECIMAL(10,2) DEFAULT 0,
  price_ap DECIMAL(10,2) DEFAULT 0,
  extra_adult_with_mattress DECIMAL(10,2) DEFAULT 0,
  extra_child_without_mattress DECIMAL(10,2) DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Train pricing
CREATE TABLE train_prices (
  id SERIAL PRIMARY KEY,
  from_city TEXT NOT NULL,
  to_city TEXT NOT NULL,
  class TEXT NOT NULL CHECK (class IN ('sleeper', '3ac', '2ac', '1ac')),
  price_per_person DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(from_city, to_city, class)
);

-- Transport (Bus/Car) pricing
CREATE TABLE transport_prices (
  id SERIAL PRIMARY KEY,
  destination_id INTEGER NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('bus', 'car', 'tempo_traveller')),
  vehicle_name TEXT,
  capacity INTEGER NOT NULL,
  price_per_day DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quotes/Bookings
CREATE TABLE quotes (
  id SERIAL PRIMARY KEY,
  salesperson_id INTEGER NOT NULL REFERENCES users(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  destination_id INTEGER NOT NULL REFERENCES destinations(id),
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

-- Quote places (itinerary stops)
CREATE TABLE quote_places (
  id SERIAL PRIMARY KEY,
  quote_id INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  place_id INTEGER NOT NULL REFERENCES places(id),
  hotel_id INTEGER REFERENCES hotels(id),
  days INTEGER NOT NULL DEFAULT 1,
  nights INTEGER NOT NULL DEFAULT 1,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_places_destination ON places(destination_id);
CREATE INDEX idx_hotels_place ON hotels(place_id);
CREATE INDEX idx_quotes_salesperson ON quotes(salesperson_id);
CREATE INDEX idx_quotes_destination ON quotes(destination_id);
CREATE INDEX idx_quote_places_quote ON quote_places(quote_id);
