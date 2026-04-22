-- ==============================================================================
-- SUPABASE POSTGRESQL SCHEMA & SEED DATA 
-- For: Efren Billiards Tournament & Bracket System
-- ==============================================================================

-- 1. CLEANUP (Optional: Drops tables if they exist so you can re-run)
DROP TABLE IF EXISTS public.matches CASCADE;
DROP TABLE IF EXISTS public.tournament_participants CASCADE;
DROP TABLE IF EXISTS public.tournaments CASCADE;
DROP TABLE IF EXISTS public.players CASCADE;


-- ==========================================
-- 2. CREATE SCHEMAS (TABLES)
-- ==========================================

-- A. Players Table
CREATE TABLE public.players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    avatar_url TEXT,
    rating INTEGER DEFAULT 1500,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- B. Tournaments Table
-- ENUM for tournament_status: 'pending', 'in_progress', 'completed'
-- ENUM for game_type: 'billiards', 'darts', 'chess'
CREATE TABLE public.tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    game_type TEXT NOT NULL CHECK (game_type IN ('billiards', 'darts', 'chess')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- C. Tournament Participants (Bridging / Seed Table)
CREATE TABLE public.tournament_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
    seed INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tournament_id, player_id) -- A player can only enter a tournament once
);

-- D. Matches (The Relational Bracket Nodes)
CREATE TABLE public.matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    round INTEGER NOT NULL,
    match_order INTEGER NOT NULL, -- Tracks vertical positioning in the UI
    player1_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
    player2_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
    winner_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed')),
    next_match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ==========================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
-- (Optional: For public read access. Adjust based on your Auth rules later)
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to players" ON public.players FOR SELECT USING (true);
CREATE POLICY "Allow public read access to tournaments" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "Allow public read access to participants" ON public.tournament_participants FOR SELECT USING (true);
CREATE POLICY "Allow public read access to matches" ON public.matches FOR SELECT USING (true);


-- ==========================================
-- 4. INSERT MOCK SEED DATA
-- ==========================================

-- Variables to hold UUIDs across inserts (Postgres Anonymous Block)
DO $$
DECLARE
    -- Players
    p1 UUID := gen_random_uuid();
    p2 UUID := gen_random_uuid();
    p3 UUID := gen_random_uuid();
    p4 UUID := gen_random_uuid();
    
    -- Tournaments
    t_chess UUID := '00000000-0000-0000-0000-000000000001'; -- Fixed ID so we know it
    t_darts UUID := '00000000-0000-0000-0000-000000000002';
    
    -- Matches (Final, Semis)
    m_final UUID := gen_random_uuid();
    m_semi1 UUID := gen_random_uuid();
    m_semi2 UUID := gen_random_uuid();
BEGIN

    -- A. Seed Players
    INSERT INTO public.players (id, name, rating) VALUES 
        (p1, 'Eugenio T.', 2450),
        (p2, 'Wesley S.', 2380),
        (p3, 'Rogelio A.', 2200),
        (p4, 'Mark P.', 2100);

    -- B. Seed Tournaments
    INSERT INTO public.tournaments (id, name, game_type, status) VALUES 
        (t_chess, 'Grandmaster Simul: Open Challenge', 'chess', 'in_progress'),
        (t_darts, 'Weekend Darts Showdown', 'darts', 'pending');

    -- C. Seed Participants for Chess Tournament
    INSERT INTO public.tournament_participants (tournament_id, player_id, seed) VALUES 
        (t_chess, p1, 1),
        (t_chess, p2, 2),
        (t_chess, p3, 3),
        (t_chess, p4, 4);

    -- D. Seed Matches (Relational Bracket Tree for a 4-Player Semifinal/Final)
    
    -- Note: We insert Final FIRST so we can reference its ID as 'next_match_id' for Semis
    
    -- The Championship Final (Round 2)
    -- Neither player is decided yet (status pending)
    INSERT INTO public.matches (id, tournament_id, round, match_order, status, next_match_id) 
    VALUES (m_final, t_chess, 2, 0, 'pending', NULL);

    -- Semi-Final 1 (Round 1) - Eugenio (Seed 1) vs Mark (Seed 4)
    -- This match is 'active'
    INSERT INTO public.matches (id, tournament_id, round, match_order, player1_id, player2_id, status, next_match_id) 
    VALUES (m_semi1, t_chess, 1, 0, p1, p4, 'active', m_final);

    -- Semi-Final 2 (Round 1) - Wesley (Seed 2) vs Rogelio (Seed 3)
    -- Let's say this match is 'completed' and Wesley won
    INSERT INTO public.matches (id, tournament_id, round, match_order, player1_id, player2_id, winner_id, status, next_match_id) 
    VALUES (m_semi2, t_chess, 1, 1, p2, p3, p2, 'completed', m_final);

    -- E. Auto-Advance winner to Final (Because Wesley won Semi 2, he should be in Final slot)
    -- Note: In a real app, an UPDATE trigger or backend logic would do this when a match is completed.
    UPDATE public.matches 
    SET player2_id = p2 
    WHERE id = m_final;

END $$;
