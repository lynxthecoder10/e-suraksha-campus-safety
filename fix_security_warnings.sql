-- Fix Supabase Security Warnings
-- Run this in Supabase SQL Editor

-- 1. Fix "Function Search Path Mutable" for is_admin
-- We add 'SET search_path = public' to ensure the function only looks in the public schema
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Fix "Function Search Path Mutable" for handle_new_user
-- Validates that the trigger function is secure
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role, status)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    COALESCE(new.raw_user_meta_data->>'role', 'user'),
    COALESCE(new.raw_user_meta_data->>'status', 'pending')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Leaked Password Protection
-- This cannot be fixed via SQL. 
-- Please go to: Supabase Dashboard -> Authentication -> Security -> Password Protection
-- Check the box for "Enable Leaked Password Protection"
