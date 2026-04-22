-- ==============================================================================
-- CMS Data: Game Galleries Migration
-- Upgrade Billiards, Chess, and Darts galleries to include Titles and Descriptions
-- ==============================================================================

-- 1. Billiards Gallery
INSERT INTO cms_content (slug, title, body, published)
VALUES (
  'game-gallery-billiards',
  'World-Class Yalin Tables',
  '{
    "title": "World-Class Yalin Tables",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1595859703086-1d1230e87dcb?q=80&w=1470&auto=format&fit=crop",
        "title": "Precision Strike",
        "description": "A showcase of pinpoint accuracy and professional-grade Yalin tables, built for champions."
      },
      {
        "url": "https://images.unsplash.com/photo-154948344-c6b12a0614f1?q=80&w=1470&auto=format&fit=crop",
        "title": "Masterful Break",
        "description": "Analyzing the geometry of the table before executing the perfect sequence of shots."
      },
      {
        "url": "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        "title": "The Finals Setup",
        "description": "The ambient lighting sets the mood for a high-stakes, competitive atmosphere."
      },
      {
        "url": "https://images.unsplash.com/photo-1582046429391-7f8e87ad6a7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        "title": "Midnight Hustle",
        "description": "Exclusive VIP setup for members and dedicated enthusiasts aiming for mastery."
      }
    ]
  }',
  true
)
ON CONFLICT (slug) DO UPDATE 
SET body = EXCLUDED.body, title = EXCLUDED.title;

-- 2. Chess Gallery
INSERT INTO cms_content (slug, title, body, published)
VALUES (
  'game-gallery-chess',
  'Premium Chess Lounge',
  '{
    "title": "Premium Chess Lounge",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?q=80&w=1471&auto=format&fit=crop",
        "title": "Grandmaster''s Vision",
        "description": "Surrounded by an atmosphere of deep focus, where every move dictates the outcome."
      },
      {
        "url": "https://images.unsplash.com/photo-1580541832626-2a7131ee809f?q=80&w=1476&auto=format&fit=crop",
        "title": "Queen''s Gambit",
        "description": "A classic battle of minds depicted in elegant scenery, honoring centuries of tradition."
      },
      {
        "url": "https://images.unsplash.com/photo-1586165368502-1bad197a6461?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        "title": "The Final Mate",
        "description": "Strategic depth modeled in every piece, crafted for the true connoisseur."
      }
    ]
  }',
  true
)
ON CONFLICT (slug) DO UPDATE 
SET body = EXCLUDED.body, title = EXCLUDED.title;

-- 3. Darts Gallery
INSERT INTO cms_content (slug, title, body, published)
VALUES (
  'game-gallery-darts',
  'Tournament-Grade Darts',
  '{
    "title": "Tournament-Grade Darts",
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1629168953153-f7cc8cbee015?q=80&w=1470&auto=format&fit=crop",
        "title": "Bullseye Focus",
        "description": "Precision is key. Every throw is a calculated arc towards perfection."
      },
      {
        "url": "https://images.unsplash.com/photo-1596728362799-923cb5c1c876?q=80&w=1470&auto=format&fit=crop",
        "title": "The Perfect Throw",
        "description": "A dedicated zone that keeps you concentrated when stepping up to the line."
      },
      {
        "url": "https://images.unsplash.com/photo-1643666244463-54cd4ba214a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        "title": "Oche Supremacy",
        "description": "Celebrate every win. Our tournament-quality boards ensure undeniable scores."
      }
    ]
  }',
  true
)
ON CONFLICT (slug) DO UPDATE 
SET body = EXCLUDED.body, title = EXCLUDED.title;
