-- Neon PostgreSQL Database Schema
-- Simple schema without RLS - authorization handled in application code

-- Users table (replaces Supabase auth.users and profiles)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'salesperson', -- 'owner' or 'salesperson'
  is_approved BOOLEAN DEFAULT FALSE,
  is_primary_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table for auth tokens
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Destinations
CREATE TABLE IF NOT EXISTS destinations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Places within destinations
CREATE TABLE IF NOT EXISTS places (
  id SERIAL PRIMARY KEY,
  destination_id INTEGER REFERENCES destinations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hotels with categories
CREATE TABLE IF NOT EXISTS hotels (
  id SERIAL PRIMARY KEY,
  place_id INTEGER REFERENCES places(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT '3_star_basic', -- '3_star_basic', '3_star_premium', '4_star', '5_star'
  price_per_night DECIMAL(10,2) NOT NULL DEFAULT 0,
  extra_adult_with_mattress DECIMAL(10,2) DEFAULT 0,
  extra_child_without_mattress DECIMAL(10,2) DEFAULT 0,
  description TEXT,
  amenities TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Train prices
CREATE TABLE IF NOT EXISTS train_prices (
  id SERIAL PRIMARY KEY,
  from_location VARCHAR(255) NOT NULL,
  to_location VARCHAR(255) NOT NULL,
  class VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transport prices
CREATE TABLE IF NOT EXISTS transport_prices (
  id SERIAL PRIMARY KEY,
  destination_id INTEGER REFERENCES destinations(id) ON DELETE CASCADE,
  vehicle_type VARCHAR(100) NOT NULL,
  price_per_day DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quotes
CREATE TABLE IF NOT EXISTS quotes (
  id SERIAL PRIMARY KEY,
  salesperson_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  destination_id INTEGER REFERENCES destinations(id),
  start_date DATE,
  end_date DATE,
  num_adults INTEGER DEFAULT 1,
  num_children INTEGER DEFAULT 0,
  extra_adults_with_mattress INTEGER DEFAULT 0,
  extra_children_without_mattress INTEGER DEFAULT 0,
  total_cost DECIMAL(10,2) DEFAULT 0,
  admin_cost DECIMAL(10,2) DEFAULT 0,
  margin DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quote places (many-to-many)
CREATE TABLE IF NOT EXISTS quote_places (
  id SERIAL PRIMARY KEY,
  quote_id INTEGER REFERENCES quotes(id) ON DELETE CASCADE,
  place_id INTEGER REFERENCES places(id) ON DELETE CASCADE,
  hotel_id INTEGER REFERENCES hotels(id),
  nights INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Itinerary templates
CREATE TABLE IF NOT EXISTS itinerary_templates (
  id SERIAL PRIMARY KEY,
  destination_id INTEGER REFERENCES destinations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  days INTEGER NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Package policies
CREATE TABLE IF NOT EXISTS package_policies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_places_destination ON places(destination_id);
CREATE INDEX IF NOT EXISTS idx_hotels_place ON hotels(place_id);
CREATE INDEX IF NOT EXISTS idx_quotes_salesperson ON quotes(salesperson_id);
