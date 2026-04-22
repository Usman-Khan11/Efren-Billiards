-- ==============================================================================
-- SUPABASE POSTGRESQL SCHEMA MIGRATION
-- For: Web App Enhancements (Carousels, Social Links, Pricing)
-- ==============================================================================

-- 1. Create a dedicated table for Game Page Carousels (if avoiding cms_content JSON blobs)
CREATE TABLE IF NOT EXISTS public.game_page_carousels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_type TEXT NOT NULL CHECK (game_type IN ('billiards', 'darts', 'chess')),
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for Game Page Carousels
ALTER TABLE public.game_page_carousels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to game_page_carousels" ON public.game_page_carousels FOR SELECT USING (true);
CREATE POLICY "Allow admins to manage game_page_carousels" ON public.game_page_carousels FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tier = 'Admin')
);

-- 2. Create a Site Settings table for global variables like social links
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert new social links into site settings
INSERT INTO public.site_settings (key, value) VALUES ('linkedin_link', '') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.site_settings (key, value) VALUES ('google_business_link', '') ON CONFLICT (key) DO NOTHING;

-- RLS Policies for Site Settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Allow admins to manage site_settings" ON public.site_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tier = 'Admin')
);

-- 3. Optionally inject 'per hour' default JSON config into cms_content if not present
INSERT INTO public.cms_content (slug, title, body, published)
VALUES (
    'event-pricing',
    'Event Pricing (Per Hour)',
    '{"corporate": 250, "tournament": 150, "birthday": 200}',
    true
)
ON CONFLICT (slug) DO UPDATE
SET body = '{"corporate": 250, "tournament": 150, "birthday": 200}'
WHERE public.cms_content.slug = 'event-pricing';
