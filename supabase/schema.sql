-- ==============================================================================
-- SUPABASE POSTGRESQL SCHEMA & SEED DATA 
-- For: Efren Billiards Tournament & Bracket System
-- ==============================================================================

-- 1. CLEANUP (Optional: Drops tables if they exist so you can re-run)
DROP TABLE IF EXISTS public.matches CASCADE;
DROP TABLE IF EXISTS public.tournament_participants CASCADE;
DROP TABLE IF EXISTS public.registrations CASCADE;
DROP TABLE IF EXISTS public.tournaments CASCADE;
DROP TABLE IF EXISTS public.players CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.cms_content CASCADE;

-- ==========================================
-- 2. CREATE SCHEMAS (TABLES)
-- ==========================================

-- A. Profiles Table (Extends auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    email TEXT,
    phone TEXT,
    tier TEXT DEFAULT 'Guest' CHECK (tier IN ('Guest', 'Player', 'Bronze', 'Silver', 'Gold', 'Admin')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- B. Players Table
CREATE TABLE public.players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    avatar_url TEXT,
    rating INTEGER DEFAULT 1500,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- C. Tournaments Table
CREATE TABLE public.tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    game_type TEXT NOT NULL CHECK (game_type IN ('billiards', 'darts', 'chess')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- D. Tournament Participants (Bridging / Seed Table)
CREATE TABLE public.tournament_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
    seed INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tournament_id, player_id) -- A player can only enter a tournament once
);

-- E. Matches (The Relational Bracket Nodes)
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

-- F. CMS Content Table
CREATE TABLE public.cms_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    published BOOLEAN DEFAULT true,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- G. Registrations Table
CREATE TABLE public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'checked_in', 'withdrawn')),
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, tournament_id)
);

-- ==========================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public read access to players" ON public.players FOR SELECT USING (true);
CREATE POLICY "Allow public read access to tournaments" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "Allow public read access to participants" ON public.tournament_participants FOR SELECT USING (true);
CREATE POLICY "Allow public read access to matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Allow public read access to cms_content" ON public.cms_content FOR SELECT USING (true);
CREATE POLICY "Allow public read access to registrations" ON public.registrations FOR SELECT USING (true);

-- Allow authenticated users to manage their own profile
CREATE POLICY "Allow users to insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Allow users to update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Allow authenticated users to register for tournaments
CREATE POLICY "Allow users to register" ON public.registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to update own registration" ON public.registrations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow users to delete own registration" ON public.registrations FOR DELETE USING (auth.uid() = user_id);

-- Allow admins to manage everything (Assuming tier = 'Admin' in profiles)
-- Note: In a real app, you might want a more secure admin check, but this works for now.
CREATE POLICY "Allow admins to manage profiles" ON public.profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tier = 'Admin')
);
CREATE POLICY "Allow admins to manage players" ON public.players FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tier = 'Admin')
);
CREATE POLICY "Allow admins to manage tournaments" ON public.tournaments FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tier = 'Admin')
);
CREATE POLICY "Allow admins to manage participants" ON public.tournament_participants FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tier = 'Admin')
);
CREATE POLICY "Allow admins to manage matches" ON public.matches FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tier = 'Admin')
);
CREATE POLICY "Allow admins to manage cms_content" ON public.cms_content FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tier = 'Admin')
);
CREATE POLICY "Allow admins to manage registrations" ON public.registrations FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tier = 'Admin')
);

-- ==========================================
-- 4. TRIGGERS
-- ==========================================
-- Create a profile automatically when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email, new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- 5. INSERT MOCK SEED DATA
-- ==========================================

DO $$
DECLARE
    -- Players
    p1 UUID := gen_random_uuid();
    p2 UUID := gen_random_uuid();
    p3 UUID := gen_random_uuid();
    p4 UUID := gen_random_uuid();
    
    -- Tournaments
    t_chess UUID := '00000000-0000-0000-0000-000000000001';
    t_darts UUID := '00000000-0000-0000-0000-000000000002';
    
    -- Matches
    m_final UUID := gen_random_uuid();
    m_semi1 UUID := gen_random_uuid();
    m_semi2 UUID := gen_random_uuid();
BEGIN

    -- A. Seed Players
    INSERT INTO public.players (id, name, rating, wins, losses) VALUES 
        (p1, 'Eugenio T.', 2450, 15, 2),
        (p2, 'Wesley S.', 2380, 12, 4),
        (p3, 'Rogelio A.', 2200, 8, 8),
        (p4, 'Mark P.', 2100, 5, 10);

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

    -- D. Seed Matches
    INSERT INTO public.matches (id, tournament_id, round, match_order, status, next_match_id) 
    VALUES (m_final, t_chess, 2, 0, 'pending', NULL);

    INSERT INTO public.matches (id, tournament_id, round, match_order, player1_id, player2_id, status, next_match_id) 
    VALUES (m_semi1, t_chess, 1, 0, p1, p4, 'active', m_final);

    INSERT INTO public.matches (id, tournament_id, round, match_order, player1_id, player2_id, winner_id, status, next_match_id) 
    VALUES (m_semi2, t_chess, 1, 1, p2, p3, p2, 'completed', m_final);

    UPDATE public.matches 
    SET player2_id = p2 
    WHERE id = m_final;

END $$;
