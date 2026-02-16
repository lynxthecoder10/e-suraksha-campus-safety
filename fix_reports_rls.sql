-- Fix RLS Policies for Admin Visibility
-- Run this in Supabase SQL Editor

-- 1. INCIDENT REPORTS
-- Enable RLS
ALTER TABLE public.incident_reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Users can view their own reports" ON public.incident_reports;
DROP POLICY IF EXISTS "Admins can view all reports" ON public.incident_reports;
DROP POLICY IF EXISTS "Users can insert reports" ON public.incident_reports;
DROP POLICY IF EXISTS "Admins can update reports" ON public.incident_reports;

-- Create Policies
-- Users see their own, Admins see ALL
CREATE POLICY "Visibility Policy" ON public.incident_reports
    FOR SELECT USING (
        auth.uid() = user_id 
        OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Users can insert their own reports
CREATE POLICY "Insert Policy" ON public.incident_reports
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
    );

-- Admins can update any report (e.g. status), Users can update their own (if needed, e.g. details)
CREATE POLICY "Update Policy" ON public.incident_reports
    FOR UPDATE USING (
        auth.uid() = user_id 
        OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );


-- 2. ALERTS (SOS)
-- Enable RLS
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can insert alerts" ON public.alerts;
DROP POLICY IF EXISTS "Users can view own alerts" ON public.alerts;
DROP POLICY IF EXISTS "Admins can view all alerts" ON public.alerts;
DROP POLICY IF EXISTS "Admins can update alerts" ON public.alerts;

-- Create Policies
-- Public/Users can insert alerts (authenticated)
CREATE POLICY "Insert Alerts" ON public.alerts
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
    );

-- Users see own, Admins see ALL
CREATE POLICY "View Alerts" ON public.alerts
    FOR SELECT USING (
        auth.uid() = user_id 
        OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Admins can update alerts (Resolve)
CREATE POLICY "Admin Update Alerts" ON public.alerts
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
