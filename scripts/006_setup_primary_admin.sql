-- =====================================================
-- ADMIN SYSTEM SETUP
-- Primary Admin: patilnikhil6012@gmail.com
-- Password: Nikhil@123 (set during signup)
-- =====================================================

-- Create admin_accounts table if not exists
CREATE TABLE IF NOT EXISTS public.admin_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  is_primary BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admin_accounts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can view admin accounts" ON public.admin_accounts;
DROP POLICY IF EXISTS "Admins can create admin accounts" ON public.admin_accounts;
DROP POLICY IF EXISTS "Public can check admin emails" ON public.admin_accounts;
DROP POLICY IF EXISTS "Admins can delete admin accounts" ON public.admin_accounts;

-- Allow anyone to check if an email is an admin (needed for signup flow)
CREATE POLICY "Public can check admin emails" ON public.admin_accounts 
  FOR SELECT USING (true);

-- Only admins can insert new admin accounts
CREATE POLICY "Admins can create admin accounts" ON public.admin_accounts 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- Only admins can delete admin accounts (except primary)
CREATE POLICY "Admins can delete admin accounts" ON public.admin_accounts 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
    AND is_primary = FALSE
  );

-- Insert primary admin email
-- This email will automatically get admin access when they sign up
INSERT INTO public.admin_accounts (email, is_primary) 
VALUES ('patilnikhil6012@gmail.com', TRUE)
ON CONFLICT (email) DO UPDATE SET is_primary = TRUE;

-- Update the handle_new_user function to auto-assign admin role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  -- Check if email is in admin_accounts table (case-insensitive)
  SELECT EXISTS (
    SELECT 1 FROM public.admin_accounts 
    WHERE LOWER(email) = LOWER(NEW.email)
  ) INTO is_admin;
  
  -- Insert profile with appropriate role and approval status
  INSERT INTO public.profiles (id, email, full_name, role, is_approved)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    CASE WHEN is_admin THEN 'owner' ELSE 'salesperson' END,
    is_admin  -- Admins auto-approved, salespersons need manual approval
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    role = CASE WHEN is_admin THEN 'owner' ELSE profiles.role END,
    is_approved = CASE WHEN is_admin THEN TRUE ELSE profiles.is_approved END;
  
  RETURN NEW;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
