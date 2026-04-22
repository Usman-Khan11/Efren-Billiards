-- ============================================================================
-- Efren Billiards Admin CMS Expansion
-- SQL Schema Updates
-- ============================================================================

-- 1. Ensure cms_content table exists with proper schema
CREATE TABLE IF NOT EXISTS public.cms_content (
    slug TEXT PRIMARY KEY,
    title TEXT,
    body JSONB DEFAULT '{}'::jsonb,
    published BOOLEAN DEFAULT true,
    author_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on cms_content
ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cms_content
CREATE POLICY "Allow public read access to published cms_content"
    ON public.cms_content
    FOR SELECT
    TO public
    USING (published = true);

CREATE POLICY "Allow admins to manage cms_content"
    ON public.cms_content
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.tier = 'Admin'
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.tier = 'Admin'
    ));

-- 2. Update players table to include wins and losses if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'players' AND column_name = 'wins') THEN
        ALTER TABLE public.players ADD COLUMN wins INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'players' AND column_name = 'losses') THEN
        ALTER TABLE public.players ADD COLUMN losses INTEGER DEFAULT 0;
    END IF;
END $$;

-- 3. Create storage bucket for cms_uploads if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('cms_uploads', 'cms_uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for cms_uploads
CREATE POLICY "Allow public read access to cms_uploads"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'cms_uploads');

CREATE POLICY "Allow admins to upload to cms_uploads"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'cms_uploads' AND
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.tier = 'Admin'
        )
    );

CREATE POLICY "Allow admins to delete from cms_uploads"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'cms_uploads' AND
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.tier = 'Admin'
        )
    );

-- 4. Insert default CMS content for new modules

-- Site Images (Logo, Hero Background, About Section)
INSERT INTO public.cms_content (slug, title, body, published)
VALUES (
    'site-images',
    'Site Images',
    '{
        "site-logo": "https://placehold.co/200x200/0a0a1a/00d4ff?text=EB",
        "hero-background": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=2070&auto=format&fit=crop",
        "about-section-image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2070&auto=format&fit=crop",
        "promo-banner-bg": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=2070&auto=format&fit=crop",
        "default-placeholder": "https://placehold.co/800x600/1a1a2e/00d4ff?text=Efren+Billiards"
    }'::jsonb,
    true
)
ON CONFLICT (slug) DO NOTHING;

-- YouTube Videos
INSERT INTO public.cms_content (slug, title, body, published)
VALUES (
    'videos',
    'YouTube Videos',
    '{
        "videos": [
            {"title": "Welcome to Efren Billiards", "url": "https://youtube.com/watch?v=example1"},
            {"title": "Tournament Highlights", "url": "https://youtube.com/watch?v=example2"}
        ]
    }'::jsonb,
    true
)
ON CONFLICT (slug) DO NOTHING;

-- Package Prices
INSERT INTO public.cms_content (slug, title, body, published)
VALUES (
    'package-prices',
    'Package Prices',
    '{
        "categories": [
            {
                "category": "Billiards Tables",
                "items": [
                    {"name": "Standard Table (1 hour)", "price": "30 QAR", "description": "Regular pool table rental"},
                    {"name": "VIP Table (1 hour)", "price": "50 QAR", "description": "Premium table with better lighting"}
                ]
            },
            {
                "category": "Karaoke Rooms",
                "items": [
                    {"name": "Small Room (2 hours)", "price": "100 QAR", "description": "Up to 6 people"},
                    {"name": "Large Room (2 hours)", "price": "180 QAR", "description": "Up to 12 people"}
                ]
            },
            {
                "category": "Event Place",
                "items": [
                    {"name": "Half Day (4 hours)", "price": "800 QAR", "description": "Perfect for small gatherings"},
                    {"name": "Full Day (8 hours)", "price": "1500 QAR", "description": "Complete venue access"}
                ]
            }
        ]
    }'::jsonb,
    true
)
ON CONFLICT (slug) DO NOTHING;

-- Food Menu
INSERT INTO public.cms_content (slug, title, body, published)
VALUES (
    'food-menu',
    'Food & Coffee Menu',
    '{
        "categories": [
            {
                "category": "Espresso Bar",
                "items": [
                    {"name": "Signature Spanish Latte", "price": "24 QAR"},
                    {"name": "V60 Pour Over", "price": "28 QAR"},
                    {"name": "Double Espresso", "price": "18 QAR"},
                    {"name": "Iced Americano", "price": "20 QAR"}
                ]
            },
            {
                "category": "Mocktails & Coolers",
                "items": [
                    {"name": "Passion Fruit Mojito", "price": "26 QAR"},
                    {"name": "Blue Lagoon", "price": "26 QAR"},
                    {"name": "Lemon Mint Crush", "price": "22 QAR"},
                    {"name": "Classic Iced Tea", "price": "18 QAR"}
                ]
            },
            {
                "category": "Snacks & Pastries",
                "items": [
                    {"name": "Honey Cake", "price": "32 QAR"},
                    {"name": "Cheese Croissant", "price": "18 QAR"},
                    {"name": "Chicken Club Sandwich", "price": "38 QAR"},
                    {"name": "Truffle Fries", "price": "28 QAR"}
                ]
            }
        ]
    }'::jsonb,
    true
)
ON CONFLICT (slug) DO NOTHING;

-- Weekly Schedule
INSERT INTO public.cms_content (slug, title, body, published)
VALUES (
    'weekly-schedule',
    'Weekly Schedule',
    '{
        "schedule": [
            {"day": "Monday", "event": "Industry Night", "offer": "50% Off Tables for Hospitality Staff", "time": "18:00 - Close"},
            {"day": "Tuesday", "event": "League Night", "offer": "Competitive League Play", "time": "19:00 Start"},
            {"day": "Wednesday", "event": "Midweek Break", "offer": "Free Coffee with 2hrs Play", "time": "14:00 - 18:00"},
            {"day": "Thursday", "event": "Corporate Challenge", "offer": "Group Packages Available", "time": "All Evening"},
            {"day": "Friday", "event": "Weekend Warmup", "offer": "DJ Sets & Late Night Play", "time": "20:00 - 02:00"},
            {"day": "Saturday", "event": "Open Tournament", "offer": "Winner Takes All - Cash Prize", "time": "14:00 Start"},
            {"day": "Sunday", "event": "Family Day", "offer": "Kids Play Free (with Adult)", "time": "12:00 - 18:00"}
        ]
    }'::jsonb,
    true
)
ON CONFLICT (slug) DO NOTHING;

-- Contact Info
INSERT INTO public.cms_content (slug, title, body, published)
VALUES (
    'contact-info',
    'Contact Information',
    '{
        "address": "5th Floor Capstone Bldg., Al Mansoura, Doha, Qatar",
        "phone": "+974 50986454, +974 66953450",
        "email": "efrenbilliards@gmail.com",
        "hours": "Open 24 Hours Daily",
        "whatsapp": "+974 51622111",
        "mapsUrl": "https://maps.app.goo.gl/NAggUvmWoE7Vh7cA6?g_st=ic"
    }'::jsonb,
    true
)
ON CONFLICT (slug) DO NOTHING;

-- Social Links
INSERT INTO public.cms_content (slug, title, body, published)
VALUES (
    'social-links',
    'Social Media Links',
    '{
        "facebook": "https://www.facebook.com/share/1DZ7ux6Qmi/?mibextid=wwXIfr",
        "instagram": "https://www.instagram.com/efrenbilliards?igsh=YnQwdDI1MjJ0aDZm",
        "tiktok": "https://www.tiktok.com/@efren.billiards.m?_r=1&_t=ZS-93hdvwpNUdp",
        "whatsapp": "https://wa.me/97451622111"
    }'::jsonb,
    true
)
ON CONFLICT (slug) DO NOTHING;

-- Gallery
INSERT INTO public.cms_content (slug, title, body, published)
VALUES (
    'gallery',
    'Image Gallery',
    '{
        "images": [
            {"url": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=2070&auto=format&fit=crop", "description": "Main Billiards Hall", "category": "billiards"},
            {"url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2070&auto=format&fit=crop", "description": "VIP Room", "category": "vip"}
        ]
    }'::jsonb,
    true
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- Update existing gallery to support descriptions
-- ============================================================================

-- Check if gallery has old format (just array of strings) and update to new format
DO $$
DECLARE
    gallery_data JSONB;
BEGIN
    SELECT body::jsonb INTO gallery_data
    FROM public.cms_content
    WHERE slug = 'homepage-gallery';
    
    -- If gallery exists and has old format (array of strings), migrate it
    IF gallery_data IS NOT NULL AND jsonb_typeof(gallery_data->'images') = 'array' THEN
        -- Check first element to see if it's a string (old format)
        IF jsonb_typeof(gallery_data->'images'->0) = 'string' THEN
            -- Convert to new format with descriptions
            UPDATE public.cms_content
            SET body = (
                SELECT jsonb_build_object(
                    'images',
                    jsonb_agg(
                        jsonb_build_object(
                            'url', img,
                            'description', ''
                        )
                    )
                )
                FROM jsonb_array_elements_text(gallery_data->'images') AS img
            )
            WHERE slug = 'homepage-gallery';
        END IF;
    END IF;
END $$;

-- ============================================================================
-- Function to update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for cms_content
DROP TRIGGER IF EXISTS update_cms_content_updated_at ON public.cms_content;
CREATE TRIGGER update_cms_content_updated_at
    BEFORE UPDATE ON public.cms_content
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
