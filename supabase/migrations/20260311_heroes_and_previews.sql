-- ==============================================================================
-- CMS Data: Page Heroes & Event Previews
-- ==============================================================================

-- 1. Hero / Banner Images
INSERT INTO cms_content (slug, title, body, published)
VALUES 
('hero-billiards', 'Billiards Page Hero', '{"url": "https://iili.io/qK7iGKg.md.jpg", "title": "World-Class Billiards"}', true),
('hero-chess', 'Chess Page Hero', '{"url": "https://iili.io/qK7LeFn.png", "title": "Strategic Excellence"}', true),
('hero-darts', 'Darts Page Hero', '{"url": "https://iili.io/qK7L29s.md.jpg", "title": "Precision Darts"}', true),
('hero-event-place', 'Event Place Page Hero', '{"url": "https://iili.io/qK7s4rg.png", "title": "Premium Event Place"}', true),
('hero-karaoke', 'Karaoke Page Hero', '{"url": "https://iili.io/qK7LeFn.png", "title": "Private Karaoke Rooms"}', true)
ON CONFLICT (slug) DO UPDATE SET body = EXCLUDED.body;

-- 2. Event Previews for Budget Estimator
INSERT INTO cms_content (slug, title, body, published)
VALUES (
  'event-previews',
  'Event Previews',
  '{
    "Corporate event": {
      "image": "https://iili.io/q2MS4TJ.md.jpg",
      "description": "Elegant seating, buffet setup, and premium lighting."
    },
    "Tournament": {
      "image": "https://iili.io/q2MSgpa.md.jpg",
      "description": "Optimized floorplan for competitive play and spectator viewing."
    },
    "Birthday": {
      "image": "https://iili.io/q2MSjhx.md.jpg",
      "description": "Casual layout with dance floor and catering stations."
    }
  }',
  true
)
ON CONFLICT (slug) DO UPDATE SET body = EXCLUDED.body;
