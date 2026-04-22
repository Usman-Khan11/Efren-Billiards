-- ==============================================================================
-- SUPABASE STORAGE & PROFILE STATS SETUP
-- Run this in your Supabase SQL Editor
-- ==============================================================================

-- 1. ADD STATS TO PLAYERS
-- Adds wins and losses tracking for player profiles and admin dashboards
ALTER TABLE public.players 
ADD COLUMN IF NOT EXISTS wins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS losses INTEGER DEFAULT 0;

-- 2. CREATE STORAGE BUCKET FOR CMS UPLOADS
-- Create a new public bucket for Gallery and other CMS images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cms_uploads', 'cms_uploads', true)
ON CONFLICT (id) DO NOTHING;

-- 3. STORAGE BUCKET POLICIES (Row Level Security)

-- A. Allow public read access to all images in cms_uploads
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'cms_uploads');

-- B. Allow Admins to upload images
CREATE POLICY "Admins can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'cms_uploads' AND 
  public.is_admin()
);

-- C. Allow Admins to update their images
CREATE POLICY "Admins can update images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'cms_uploads' AND 
  public.is_admin()
);

-- D. Allow Admins to delete images
CREATE POLICY "Admins can delete images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'cms_uploads' AND 
  public.is_admin()
);
