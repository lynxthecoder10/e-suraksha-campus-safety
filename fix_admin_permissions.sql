-- Fix Admin Permissions
-- Run this in Supabase SQL Editor to enable Admin Dashboard features

-- 1. Helper: Ensure is_admin() is available (if not run secure_admin_migration.sql first)
-- CREATE OR REPLACE FUNCTION public.is_admin() ...

-- 2. Allow Admins to UPDATE Incident Reports (Change Status)
-- Policy for UPDATE was missing.
CREATE POLICY "Admins update reports" 
ON public.incident_reports FOR UPDATE 
USING ( public.is_admin() );

-- 3. Allow Admins to INSERT Report Comments (Add Updates)
-- Existing insertion policy only covered report owners.
CREATE POLICY "Admins insert report comments" 
ON public.report_comments FOR INSERT 
WITH CHECK ( public.is_admin() );

-- 4. Audit Trail for Status Updates (Optional Trigger)
-- Ideally update trigger to log changes.
