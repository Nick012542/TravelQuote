-- Enhanced hotel categories: 3-star basic, 3-star premium, 4-star, 5-star
ALTER TABLE public.hotels DROP CONSTRAINT IF EXISTS hotels_category_check;
ALTER TABLE public.hotels ADD CONSTRAINT hotels_category_check 
  CHECK (category IN ('3-star-basic', '3-star-premium', '4-star', '5-star'));

-- Add extra bed pricing to hotels
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS extra_adult_with_mattress DECIMAL(10,2) DEFAULT 0;
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS extra_child_without_mattress DECIMAL(10,2) DEFAULT 0;

-- Add cost breakdown fields to quotes for admin costing vs sales display
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS admin_costing JSONB;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS extra_adult_count INTEGER DEFAULT 0;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS extra_child_count INTEGER DEFAULT 0;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS extra_adult_cost DECIMAL(10,2) DEFAULT 0;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS extra_child_cost DECIMAL(10,2) DEFAULT 0;

-- Create admins table for managing admin accounts
-- The primary admin is patilnikhil6012@gmail.com
CREATE TABLE IF NOT EXISTS public.admin_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  is_primary BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert primary admin
INSERT INTO public.admin_accounts (email, is_primary) 
VALUES ('patilnikhil6012@gmail.com', TRUE)
ON CONFLICT (email) DO NOTHING;

ALTER TABLE public.admin_accounts ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin accounts
CREATE POLICY "Admins can view admin accounts" ON public.admin_accounts FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
);

-- Only admins can insert new admin accounts
CREATE POLICY "Admins can create admin accounts" ON public.admin_accounts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
);

-- Update profile trigger to handle admin role assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin BOOLEAN;
  should_approve BOOLEAN;
BEGIN
  -- Check if email is in admin_accounts
  SELECT EXISTS (SELECT 1 FROM public.admin_accounts WHERE email = new.email) INTO is_admin;
  
  -- Admins are auto-approved, salespersons need manual approval
  should_approve := is_admin;
  
  INSERT INTO public.profiles (id, email, full_name, role, is_approved)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    CASE WHEN is_admin THEN 'owner' ELSE 'salesperson' END,
    should_approve
  )
  ON CONFLICT (id) DO UPDATE SET
    role = CASE WHEN is_admin THEN 'owner' ELSE profiles.role END,
    is_approved = CASE WHEN is_admin THEN TRUE ELSE profiles.is_approved END;
  
  RETURN new;
END;
$$;

-- Update RLS policies for profiles to allow owners to manage all profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view profiles" ON public.profiles FOR SELECT USING (
  auth.uid() = id OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update profiles" ON public.profiles FOR UPDATE USING (
  auth.uid() = id OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
);
