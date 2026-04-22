-- ============================================================================
-- Migration: Fix Profile Page — Registered Tournaments Visibility
-- Date: 2026-03-14
-- Issue: ProfileDashboard was reading from `tournament_participants`
--        (which stores seeded player UUIDs) instead of `registrations`
--        (which stores auth.users UUIDs when a user clicks "Register Now").
--
-- This migration ensures:
--   1. The `registrations` table exists with the correct schema.
--   2. RLS policies allow authenticated users to SELECT their own rows.
--   3. The foreign key from registrations.tournament_id → tournaments.id
--      supports the JOIN used in ProfileDashboard:
--        SELECT *, tournaments(*) FROM registrations WHERE user_id = auth.uid()
-- ============================================================================

-- 1. Ensure the registrations table exists (safe no-op if already created)
CREATE TABLE IF NOT EXISTS public.registrations (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    status        TEXT NOT NULL DEFAULT 'registered'
                    CHECK (status IN ('registered', 'checked_in', 'withdrawn')),
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, tournament_id)
);

-- 2. Enable RLS (idempotent)
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- 3. Public SELECT policy — allows any authenticated user to read their own rows
--    (Required for ProfileDashboard to show "My Tournaments")
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'registrations'
          AND policyname = 'Allow users to read own registrations'
    ) THEN
        CREATE POLICY "Allow users to read own registrations"
            ON public.registrations
            FOR SELECT
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- 4. INSERT policy — allows users to register themselves
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'registrations'
          AND policyname = 'Allow users to register'
    ) THEN
        CREATE POLICY "Allow users to register"
            ON public.registrations
            FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- 5. UPDATE policy — users can update their own registration (e.g., withdraw)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'registrations'
          AND policyname = 'Allow users to update own registration'
    ) THEN
        CREATE POLICY "Allow users to update own registration"
            ON public.registrations
            FOR UPDATE
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- 6. DELETE policy — users can delete (unregister from) their own registrations
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'registrations'
          AND policyname = 'Allow users to delete own registration'
    ) THEN
        CREATE POLICY "Allow users to delete own registration"
            ON public.registrations
            FOR DELETE
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- 7. Admin policy — admins can see and manage all registrations
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'registrations'
          AND policyname = 'Allow admins to manage registrations'
    ) THEN
        CREATE POLICY "Allow admins to manage registrations"
            ON public.registrations
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

-- ============================================================================
-- VERIFICATION QUERIES (Run these in Supabase SQL Editor to confirm)
-- ============================================================================

-- Check RLS policies on registrations:
-- SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'registrations';

-- Test: see current user's tournament registrations (run as a logged-in user):
-- SELECT r.id, r.status, r.registered_at, t.name, t.game_type, t.start_date
-- FROM public.registrations r
-- JOIN public.tournaments t ON t.id = r.tournament_id
-- WHERE r.user_id = auth.uid()
--   AND r.status != 'withdrawn';
