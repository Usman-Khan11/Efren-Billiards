-- ==============================================================================
-- CMS Data: Social Links Update
-- Add LinkedIn and Google Business Profile URLs
-- ==============================================================================

UPDATE cms_content
SET body = '{
    "facebook": "https://www.facebook.com/share/1DZ7ux6Qmi/?mibextid=wwXIfr",
    "instagram": "https://www.instagram.com/efrenbilliards?igsh=YnQwdDI1MjJ0aDZm",
    "tiktok": "https://www.tiktok.com/@efren.billiards.m?_r=1&_t=ZS-93hdvwpNUdp",
    "whatsapp": "https://wa.me/97451622111",
    "linkedin": "https://www.linkedin.com/company/efren-billiards",
    "googleBusinessProfile": "https://maps.app.goo.gl/NAggUvmWoE7Vh7cA6?g_st=ic"
}'
WHERE slug = 'social-links';

-- If the row doesn''t exist, insert it
INSERT INTO cms_content (slug, title, body, published)
SELECT 'social-links', 'Social Media Links', '{
    "facebook": "https://www.facebook.com/share/1DZ7ux6Qmi/?mibextid=wwXIfr",
    "instagram": "https://www.instagram.com/efrenbilliards?igsh=YnQwdDI1MjJ0aDZm",
    "tiktok": "https://www.tiktok.com/@efren.billiards.m?_r=1&_t=ZS-93hdvwpNUdp",
    "whatsapp": "https://wa.me/97451622111",
    "linkedin": "https://www.linkedin.com/company/efren-billiards",
    "googleBusinessProfile": "https://maps.app.goo.gl/NAggUvmWoE7Vh7cA6?g_st=ic"
}', true
WHERE NOT EXISTS (SELECT 1 FROM cms_content WHERE slug = 'social-links');
