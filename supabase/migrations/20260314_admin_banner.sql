-- ============================================================================
-- Migration: Admin Member Banner Preset
-- Date: 2026-03-14
-- Adds a tier-targeted banner for Admin users
-- ============================================================================

INSERT INTO public.member_banners (title, marketing_message, instruction_message, target_type, target_value, whatsapp_preset, is_active)
VALUES (
    'Admin Control Center',
    'Welcome back, Administrator. Manage tournaments, CMS content, player registrations, and site settings from your dashboard.',
    'Access your admin dashboard to manage content, players, and tournaments.',
    'tier',
    'Admin',
    'Hi, I am the site administrator and I need assistance with the platform.',
    true
);
