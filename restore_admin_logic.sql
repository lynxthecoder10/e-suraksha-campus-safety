-- Restore Admin Logic (Fixing the Conflict)
-- Run this in Supabase SQL Editor to restore the correct Role-Based Access Control

BEGIN;

-- 1. Drop the incorrect table-based function
DROP FUNCTION IF EXISTS public.is_admin();

-- 2. Drop the redundant admins table (we use profiles.role)
DROP TABLE IF EXISTS public.admins;

-- 3. Re-create the correct is_admin() function based on Profiles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Re-apply Admin Policies (Just to be safe and ensure they use the new function)

-- Incident Reports: UPDATE
DROP POLICY IF EXISTS "Admins update reports" ON public.incident_reports;
CREATE POLICY "Admins update reports" 
ON public.incident_reports FOR UPDATE 
USING ( public.is_admin() );

-- Report Comments: INSERT
DROP POLICY IF EXISTS "Admins insert report comments" ON public.report_comments;
CREATE POLICY "Admins insert report comments" 
ON public.report_comments FOR INSERT 
WITH CHECK ( public.is_admin() );

-- Incident Reports: SELECT (Users see own, Admins see all)
DROP POLICY IF EXISTS "Users see own, Admins see all" ON public.incident_reports;
CREATE POLICY "Users see own, Admins see all" 
ON public.incident_reports FOR SELECT 
USING (
  auth.uid() = user_id OR public.is_admin()
);

COMMIT;
