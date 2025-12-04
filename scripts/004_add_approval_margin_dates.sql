-- Add is_approved column to profiles for admin approval system
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;

-- Set owner accounts as always approved
UPDATE public.profiles SET is_approved = TRUE WHERE role = 'owner';

-- Add margin fields and dates to quotes table
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS margin_percentage DECIMAL(5,2) DEFAULT 0;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS margin_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS final_cost DECIMAL(10,2);
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS final_per_person DECIMAL(10,2);
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS arrival_date DATE;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS departure_date DATE;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS package_code TEXT;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS num_adults INTEGER DEFAULT 0;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS num_children INTEGER DEFAULT 0;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS meal_plan TEXT DEFAULT 'MAP';
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS gst_percentage DECIMAL(5,2) DEFAULT 5;

-- Add room type to hotels
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS room_type TEXT DEFAULT 'Deluxe Room';

-- Add itinerary descriptions table for detailed day-wise descriptions
CREATE TABLE IF NOT EXISTS public.itinerary_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  day_description TEXT NOT NULL,
  activities TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.itinerary_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view itinerary templates" ON public.itinerary_templates FOR SELECT USING (true);
CREATE POLICY "Only owners can manage itinerary templates" ON public.itinerary_templates FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
);

-- Update RLS to check approval status for salespersons
DROP POLICY IF EXISTS "Salespersons can insert quotes" ON public.quotes;
CREATE POLICY "Approved salespersons can insert quotes" ON public.quotes FOR INSERT WITH CHECK (
  auth.uid() = salesperson_id AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_approved = TRUE)
);

-- Add package includes/excludes table
CREATE TABLE IF NOT EXISTS public.package_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id UUID REFERENCES public.destinations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('include', 'exclude', 'payment', 'cancellation')),
  description TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.package_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view package policies" ON public.package_policies FOR SELECT USING (true);
CREATE POLICY "Only owners can manage package policies" ON public.package_policies FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
);

-- Insert default package policies
INSERT INTO public.package_policies (type, description, order_index, is_default) VALUES
('include', 'Daily breakfast + Lunch or dinner as selected.', 1, TRUE),
('include', 'Accommodation on double / triple sharing basis at above mentioned hotels / similar in base category rooms.', 2, TRUE),
('include', 'Exclusive a/c vehicle for pick up and drop as per the itinerary (not at disposal).', 3, TRUE),
('include', 'Airport pick up and drop.', 4, TRUE),
('include', 'Assistance at all arrival and departure points.', 5, TRUE),
('include', 'Entry permits | Entry tickets | Parking charges | Boat / ferry tickets wherever applicable.', 6, TRUE),
('include', 'GST (5%)', 7, TRUE),
('exclude', 'Airfare / Train fare.', 1, TRUE),
('exclude', 'All kind of personal expenses such as tips, laundry, telephone bills and beverages.', 2, TRUE),
('exclude', 'It does not include any meals unless and otherwise specifically mentioned.', 3, TRUE),
('exclude', 'Guide charges.', 4, TRUE),
('exclude', 'Optional, suggested or unspecified activities.', 5, TRUE),
('exclude', 'Camera fee (still or movie).', 6, TRUE),
('exclude', 'Additional usage of vehicles.', 7, TRUE),
('exclude', 'Any dispute regarding the child age to be settled directly with the hotels.', 8, TRUE),
('payment', '50% of the package amount at the time of booking.', 1, TRUE),
('payment', 'Balance amount 03 days before check-in.', 2, TRUE),
('cancellation', 'Booking Cancelled on or before 30 days of arrival : Nil cancellation.', 1, TRUE),
('cancellation', 'Booking Cancelled in between 30 to 15 days of arrival : 50% retention charge & 50% refund.', 2, TRUE),
('cancellation', 'Booking Cancelled on or within 15 days of arrival : Nil refund.', 3, TRUE),
('cancellation', 'Any booking for peak season (15 Dec to 15 Jan) : Nil refund.', 4, TRUE),
('cancellation', 'No refund will be made for unused room night.', 5, TRUE)
ON CONFLICT DO NOTHING;
