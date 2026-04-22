# CMS Setup SQL Queries

Run the following SQL queries in your Supabase SQL Editor to prefill the CMS content for Efren Billiards.

```sql
-- 1. Membership Plans
INSERT INTO cms_content (slug, title, body, published)
VALUES (
    'membership-plans',
    'Membership Plans',
    '{
        "plans": [
            {
                "id": "gold",
                "name": "Gold",
                "desc": "The ultimate VIP experience.",
                "priceMonthly": 85,
                "priceAnnual": 59,
                "features": [
                    "Free 3 hours playing time monthly",
                    "Discounted table rate: QAR30/hour with Free 1 large Efren signature coffee per visit",
                    "Free haircut (Soon to offer)",
                    "Free use of event place for 3 hours on your birthday (Valued @ QAR600)",
                    "20% Discounts in food and drinks",
                    "20% discount on event place rental",
                    "20% discount on photobooth and 360 videbooth rental",
                    "Free 7 sessions of professional career coaching (transferrable)"
                ],
                "isGold": true
            },
            {
                "id": "silver",
                "name": "Silver",
                "desc": "For the regular enthusiast.",
                "priceMonthly": 60,
                "priceAnnual": 42,
                "features": [
                    "Free 2 hours playing time monthly",
                    "Discounted table rate: QAR30/hour",
                    "Free haircut (Soon to offer)",
                    "Free use of event place for 2 hours on your birthday (Valued @ QAR400)",
                    "20% Discounts in food and drinks",
                    "20% discount on event place rental",
                    "20% discount on photobooth and 360 videbooth rental",
                    "Free 5 sessions of professional career coaching (transferrable)"
                ],
                "popular": true
            },
            {
                "id": "bronze",
                "name": "Bronze",
                "desc": "Perfect for casual players.",
                "priceMonthly": 35,
                "priceAnnual": 24,
                "features": [
                    "Free 1 hour playing time monthly",
                    "Discounted table rate: QAR30/hour",
                    "Free haircut (Soon to offer)",
                    "Free use of event place for 1 hour on your birthday (Valued @ QAR200)",
                    "20% Discounts in food and drinks",
                    "20% discount on event place rental",
                    "20% discount on photobooth and 360 videbooth rental",
                    "Free 3 sessions of professional career coaching (transferrable)"
                ]
            }
        ]
    }',
    true
)
ON CONFLICT (slug) DO UPDATE SET body = EXCLUDED.body;

-- 2. Package Prices
INSERT INTO cms_content (slug, title, body, published)
VALUES (
    'package-prices',
    'Package Prices',
    '{
        "categories": [
            {
                "category": "Billiards & Games",
                "items": [
                    { "name": "Standard Table", "price": "45 QAR / hr", "description": "Professional Yalin tables" },
                    { "name": "VIP Room", "price": "150 QAR / hr", "description": "Private room with service" },
                    { "name": "Darts", "price": "25 QAR / hr", "description": "Professional dart boards" }
                ]
            },
            {
                "category": "Coaching & Clinics",
                "items": [
                    { "name": "Pro Clinic", "price": "200 QAR", "description": "Group session with resident pro" },
                    { "name": "Private Coaching", "price": "150 QAR / session", "description": "One-on-one personalized training" }
                ]
            }
        ]
    }',
    true
)
ON CONFLICT (slug) DO UPDATE SET body = EXCLUDED.body;

-- 3. Site Images
INSERT INTO cms_content (slug, title, body, published)
VALUES (
    'site-images',
    'Site Images',
    '{
        "site-logo": "https://iili.io/qfWIEss.jpg",
        "promo-banner-bg": "https://iili.io/qFNV7xs.jpg"
    }',
    true
)
ON CONFLICT (slug) DO UPDATE SET body = EXCLUDED.body;

-- 4. YouTube Videos
INSERT INTO cms_content (slug, title, body, published)
VALUES (
    'videos',
    'YouTube Videos',
    '{
        "videos": [
            { "title": "Hero Background", "url": "https://www.youtube.com/embed/RfiLxYAGQYY" },
            { "title": "Cinematic Highlights", "url": "https://www.youtube.com/embed/KfPa315R4DI" },
            { "title": "Membership Background", "url": "https://www.youtube.com/embed/RfiLxYAGQYY" }
        ]
    }',
    true
)
ON CONFLICT (slug) DO UPDATE SET body = EXCLUDED.body;

-- 5. Our Offerings
INSERT INTO cms_content (slug, title, body, published)
VALUES (
    'offerings',
    'Our Offerings',
    '{
        "items": [
            { "url": "https://iili.io/q2fFdAP.jpg", "title": "Professional Billiards", "description": "Experience the game on our world-class Yalin Pro tables, the same equipment used in international championships." },
            { "url": "https://iili.io/qFN1vwb.jpg", "title": "Precision Darts", "description": "Aim for the bullseye in our dedicated darts zone featuring professional-standard boards." },
            { "url": "https://iili.io/q2fF3DF.jpg", "title": "Premier Event Space", "description": "From corporate team building to private celebrations, our versatile event space is designed to impress." }
        ]
    }',
    true
)
ON CONFLICT (slug) DO UPDATE SET body = EXCLUDED.body;

-- 6. Visual Tour (Life at Efren''s)
INSERT INTO cms_content (slug, title, body, published)
VALUES (
    'visual-tour',
    'Visual Tour',
    '{
        "images": [
            { "url": "https://iili.io/q2MSG29.md.jpg", "description": "Premium Tables" },
            { "url": "https://iili.io/q2MSWmb.md.jpg", "description": "Team Play" },
            { "url": "https://iili.io/q2MSM7e.md.jpg", "description": "Events" },
            { "url": "https://iili.io/q2MSVku.md.jpg", "description": "Lounge Vibes" },
            { "url": "https://iili.io/q2MSjhx.md.jpg", "description": "Parties" },
            { "url": "https://iili.io/q2MSOBV.md.jpg", "description": "Haircut" },
            { "url": "https://iili.io/q2MSwLQ.md.jpg", "description": "Darts" },
            { "url": "https://iili.io/q2MSeEB.md.jpg", "description": "Darts" },
            { "url": "https://iili.io/q2MSSYF.md.jpg", "description": "Lounge" },
            { "url": "https://iili.io/q2MSUkg.md.jpg", "description": "Billiards" },
            { "url": "https://iili.io/q2MSgpa.md.jpg", "description": "Caterings" },
            { "url": "https://iili.io/q2MS4TJ.md.jpg", "description": "Events" },
            { "url": "https://iili.io/q2MSPQR.md.jpg", "description": "Events" },
            { "url": "https://iili.io/q2MSsBp.md.jpg", "description": "Team Play" },
            { "url": "https://iili.io/q2MSLEN.md.jpg", "description": "Tournament" },
            { "url": "https://iili.io/q2MSQ4I.md.jpg", "description": "The Hall" },
            { "url": "https://iili.io/q2MSbvn.md.jpg", "description": "Practice" },
            { "url": "https://iili.io/q2MSmps.md.jpg", "description": "Efren Billiards Hall" },
            { "url": "https://iili.io/q2MU9jf.md.jpg", "description": "Efren Billiards" },
            { "url": "https://iili.io/q2MUdCl.md.jpg", "description": "Efren Billiards" }
        ]
    }',
    true
)
ON CONFLICT (slug) DO UPDATE SET body = EXCLUDED.body;

-- 7. Contact Info
INSERT INTO cms_content (slug, title, body, published)
VALUES (
    'contact-info',
    'Contact Info',
    '{
        "phone": "+974 5162 2111",
        "email": "info@efrenbilliards.com",
        "address": "Doha, Qatar",
        "whatsapp": "97451622111"
    }',
    true
)
ON CONFLICT (slug) DO UPDATE SET body = EXCLUDED.body;

-- 8. Social Links
INSERT INTO cms_content (slug, title, body, published)
VALUES (
    'social-links',
    'Social Links',
    '{
        "facebook": "https://www.facebook.com/share/1DZ7ux6Qmi/?mibextid=wwXIfr",
        "instagram": "https://www.instagram.com/efrenbilliards?igsh=YnQwdDI1MjJ0aDZm",
        "tiktok": "https://www.tiktok.com/@efren.billiards.m?_r=1&_t=ZS-93hdvwpNUdp"
    }',
    true
)
ON CONFLICT (slug) DO UPDATE SET body = EXCLUDED.body;
```
