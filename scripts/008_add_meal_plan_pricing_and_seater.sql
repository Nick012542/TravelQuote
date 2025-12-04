-- Add meal plan pricing columns to hotels
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS price_ep DECIMAL(10,2) DEFAULT 0;
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS price_cp DECIMAL(10,2) DEFAULT 0;
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS price_map DECIMAL(10,2) DEFAULT 0;
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS price_ap DECIMAL(10,2) DEFAULT 0;

-- Add vehicle name column if not exists
ALTER TABLE public.transport_prices ADD COLUMN IF NOT EXISTS vehicle_name TEXT;

-- Update hotels category constraint to allow more options
ALTER TABLE public.hotels DROP CONSTRAINT IF EXISTS hotels_category_check;
ALTER TABLE public.hotels ADD CONSTRAINT hotels_category_check 
  CHECK (category IN ('3-star', '3-star-basic', '3-star-premium', '4-star', '5-star'));

-- Add extra bed columns if not exists
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS extra_adult_with_mattress DECIMAL(10,2) DEFAULT 0;
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS extra_child_without_mattress DECIMAL(10,2) DEFAULT 0;
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS room_type TEXT DEFAULT 'Deluxe Room';
