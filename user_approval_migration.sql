-- Migration: Enable User Approval System

-- 1. Update existing users (Optional: Set everyone to active to avoid locking out current users)
-- UPDATE public.profiles SET status = 'active' WHERE status IS NULL;

-- 2. Change column default to 'pending'
ALTER TABLE public.profiles 
ALTER COLUMN status SET DEFAULT 'pending';

-- 3. Update the Trigger Function (handle_new_user)
-- This ensures new users created via Auth are set to 'pending' explicitly
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role, status)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    'user',
    'pending' -- Default to pending approval
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Verify Trigger is still attached (It should be, but good to check)
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
