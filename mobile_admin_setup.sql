-- Mobile Admin Setup
-- Run this in Supabase SQL Editor to enable Real-time User Management

-- 1. Helper Function: Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Real-time Replication: Enable for 'profiles' table
-- This allows the mobile app to receive instant updates when a role changes
BEGIN;
  -- Check if table is already in publication to avoid error
  -- But simplified for SQL Editor:
  ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
EXCEPTION
  WHEN duplicate_object THEN NULL; -- Ignore if already added
END;

-- 3. Schema Migration: Add 'status' column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- 4. RLS Policy: Allow Admins to Update Profiles (Promote/Demote & Suspend)
-- Drop existing policy if it conflicts or just create new specific one
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (public.is_admin());

-- 5. Verification
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
