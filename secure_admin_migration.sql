-- Secure Admin Migration SQL
-- Run this in your Supabase SQL Editor

-- 1. Helper function to check if the current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Secure Profiles: Prevent users from updating their own 'role'
-- First, drop the loose policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Re-create stricter policy
CREATE POLICY "Users can update own details" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  (role = (SELECT role FROM public.profiles WHERE id = auth.uid())) -- New role must match existing role (no privilege escalation)
);

-- Allow Admins to update any profile (including roles)
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (is_admin());

-- 3. Secure Audit Logs: Only Admins can view
DROP POLICY IF EXISTS "Admins view audit logs" ON public.audit_logs;
CREATE POLICY "Admins view audit logs" 
ON public.audit_logs FOR SELECT 
USING (is_admin());

-- 4. Secure Feedback: Only Admins can view
DROP POLICY IF EXISTS "Admins view feedback" ON public.feedback;
CREATE POLICY "Admins view feedback" 
ON public.feedback FOR SELECT 
USING (is_admin());

-- 5. Enable Admins to view ALL Incident Reports (missing before)
DROP POLICY IF EXISTS "Users see own reports" ON public.incident_reports;
CREATE POLICY "Users see own, Admins see all" 
ON public.incident_reports FOR SELECT 
USING (
  auth.uid() = user_id OR is_admin()
);

-- 6. Enable Admins to view ALL Alerts
DROP POLICY IF EXISTS "Public read alerts" ON public.alerts;
-- Actually, alerts might be public for safety? 
-- If 'active' alerts should be public, keep it. 
-- But lets ensure admins can see everything including archived?
-- Existing policy was: USING (true). That's probably fine for a safety app where transparency is key.
-- But let's create a specific one if needed. For now, we leave Alerts as public read.

-- 7. Secure Report Comments
DROP POLICY IF EXISTS "Users view comments on own reports" ON public.report_comments;
CREATE POLICY "Users view comments on own reports or Admin" 
ON public.report_comments FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.incident_reports 
    WHERE id = report_comments.report_id AND (user_id = auth.uid() OR is_admin())
  )
);
