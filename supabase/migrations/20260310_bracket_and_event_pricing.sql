-- ============================================================================
-- Migration: Bracket Elimination Logic + Event Place Pricing CMS
-- Run this in your Supabase SQL Editor
-- Date: 2026-03-10
-- ============================================================================

-- ============================================================================
-- PART 1: BRACKET ELIMINATION LOGIC
-- The matches table already exists. We need to ensure:
--   1. The status column allows 'in_progress' (it currently uses 'active')
--   2. Admin RLS policy allows updating winner_id and status
-- ============================================================================

-- 1a. Update the status CHECK constraint to also accept 'in_progress'
--     (The BracketEditor sets status to 'completed' which is already allowed)
--     If your matches table used 'active' instead of 'in_progress', align it:
ALTER TABLE public.matches
    DROP CONSTRAINT IF EXISTS matches_status_check;

ALTER TABLE public.matches
    ADD CONSTRAINT matches_status_check
    CHECK (status IN ('pending', 'active', 'in_progress', 'completed'));

-- 1b. Ensure admins can UPDATE matches (including winner_id and status)
--     This policy may already exist — the IF NOT EXISTS guards against duplicates.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'matches' AND policyname = 'Allow admins to manage matches'
    ) THEN
        CREATE POLICY "Allow admins to manage matches"
            ON public.matches
            FOR ALL
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE profiles.id = auth.uid() AND profiles.tier = 'Admin'
                )
            )
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE profiles.id = auth.uid() AND profiles.tier = 'Admin'
                )
            );
    END IF;
END $$;

-- 1c. Ensure public can SELECT matches (read bracket state)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'matches' AND policyname = 'Allow public read access to matches'
    ) THEN
        CREATE POLICY "Allow public read access to matches"
            ON public.matches
            FOR SELECT
            USING (true);
    END IF;
END $$;


-- ============================================================================
-- PART 2: EVENT PLACE PRICING CMS
-- Inserts a default pricing row into cms_content.
-- The AdminEventPricing component reads/writes to slug = 'event-place-pricing'
-- ============================================================================

-- 2a. Make sure cms_content table exists (safe no-op if it already does)
CREATE TABLE IF NOT EXISTS public.cms_content (
    slug       TEXT PRIMARY KEY,
    title      TEXT,
    body       TEXT NOT NULL DEFAULT '{}',
    published  BOOLEAN DEFAULT true,
    author_id  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY;

-- Public read policy (safe to re-run)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'cms_content'
          AND policyname = 'Allow public read access to published cms_content'
    ) THEN
        CREATE POLICY "Allow public read access to published cms_content"
            ON public.cms_content
            FOR SELECT
            TO public
            USING (published = true);
    END IF;
END $$;

-- Admin write policy
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'cms_content'
          AND policyname = 'Allow admins to manage cms_content'
    ) THEN
        CREATE POLICY "Allow admins to manage cms_content"
            ON public.cms_content
            FOR ALL
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE profiles.id = auth.uid() AND profiles.tier = 'Admin'
                )
            )
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE profiles.id = auth.uid() AND profiles.tier = 'Admin'
                )
            );
    END IF;
END $$;

-- 2b. Seed default event pricing (skipped if already set by admin)
INSERT INTO public.cms_content (slug, title, body, published)
VALUES (
    'event-place-pricing',
    'Event Place Base Pricing',
    '{"corporate": 150, "tournament": 100, "birthday": 80}',
    true
)
ON CONFLICT (slug) DO NOTHING;

-- 2c. Auto-update updated_at on cms_content changes
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_cms_content_updated_at ON public.cms_content;
CREATE TRIGGER update_cms_content_updated_at
    BEFORE UPDATE ON public.cms_content
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();


-- ============================================================================
-- VERIFICATION QUERIES (Run these after to confirm everything is in order)
-- ============================================================================

-- Check all cms_content slugs:
-- SELECT slug, title, body FROM public.cms_content ORDER BY created_at;

-- Check matches table constraints:
-- SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'public.matches'::regclass;

-- Check RLS policies on matches and cms_content:
-- SELECT tablename, policyname, cmd FROM pg_policies WHERE tablename IN ('matches', 'cms_content');
