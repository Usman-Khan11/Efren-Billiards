-- ==============================================================================
-- CMS Data: visual-tour
-- Migrate existing visual tour to add "title" to the "description" field.
-- ==============================================================================

INSERT INTO cms_content (slug, title, body, published)
VALUES (
    'visual-tour',
    'Visual Tour',
    '{
      "images": [
        { "url": "https://iili.io/q2MSG29.md.jpg", "title": "Premium Tables", "description": "World-class Yalin tables for a professional experience." },
        { "url": "https://iili.io/q2MSWmb.md.jpg", "title": "Team Play", "description": "Gather your friends for competitive team matches." },
        { "url": "https://iili.io/q2MSM7e.md.jpg", "title": "Events", "description": "Host your private and corporate events with us." },
        { "url": "https://iili.io/q2MSVku.md.jpg", "title": "Lounge Vibes", "description": "Relax and unwind in our premium lounge area." },
        { "url": "https://iili.io/q2MSjhx.md.jpg", "title": "Parties", "description": "The perfect venue for unforgettable celebrations." },
        { "url": "https://iili.io/q2MSOBV.md.jpg", "title": "Haircut", "description": "Get a fresh cut before your big game." },
        { "url": "https://iili.io/q2MSwLQ.md.jpg", "title": "Darts", "description": "Tournament-grade darts boards available." },
        { "url": "https://iili.io/q2MSeEB.md.jpg", "title": "Target Focus", "description": "Precision matters on our dedicated dart lanes." },
        { "url": "https://iili.io/q2MSSYF.md.jpg", "title": "Lounge Area", "description": "Comfortable seating combined with a great atmosphere." },
        { "url": "https://iili.io/q2MSUkg.md.jpg", "title": "Billiards Action", "description": "Experience the thrill of competitive billiards." },
        { "url": "https://iili.io/q2MSgpa.md.jpg", "title": "Caterings", "description": "Delicious food and drinks available to enhance your visit." },
        { "url": "https://iili.io/q2MS4TJ.md.jpg", "title": "Corporate Events", "description": "Seamlessly integrate team building and play." },
        { "url": "https://iili.io/q2MSPQR.md.jpg", "title": "Special Nights", "description": "Join us for exclusive themed events." },
        { "url": "https://iili.io/q2MSsBp.md.jpg", "title": "Team Dynamics", "description": "Build coordination and enjoy friendly rivalries." },
        { "url": "https://iili.io/q2MSLEN.md.jpg", "title": "Tournaments", "description": "Compete against the best in our regular tournaments." },
        { "url": "https://iili.io/q2MSQ4I.md.jpg", "title": "The Hall", "description": "A spacious, beautifully designed hall awaits you." },
        { "url": "https://iili.io/q2MSbvn.md.jpg", "title": "Practice Mode", "description": "Sharpen your skills during quiet hours." },
        { "url": "https://iili.io/q2MSmps.md.jpg", "title": "Efren Billiards Hall", "description": "Your ultimate destination for billiards in Qatar." },
        { "url": "https://iili.io/q2MU9jf.md.jpg", "title": "The Legacy", "description": "Experience the excellence of Efren Billiards." },
        { "url": "https://iili.io/q2MUdCl.md.jpg", "title": "Champion''s Choice", "description": "Where champions come to play and train." }
      ]
    }'::jsonb,
    true
)
ON CONFLICT (slug) DO UPDATE 
SET body = EXCLUDED.body;
