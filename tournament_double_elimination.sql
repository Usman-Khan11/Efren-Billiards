-- SQL Queries to add Double Elimination Support

-- 1. Add bracket_type to identify if a match is in the Winners, Losers, or Grand Final bracket
ALTER TABLE public.matches 
ADD COLUMN bracket_type TEXT DEFAULT 'winners' 
CHECK (bracket_type IN ('winners', 'losers', 'grand_final'));

-- 2. Add loser_next_match_id to track where the loser of a Winners bracket match drops
ALTER TABLE public.matches 
ADD COLUMN loser_next_match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL;

-- 3. (Optional) If you want to automatically drop losers via a database trigger:
CREATE OR REPLACE FUNCTION handle_match_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- If the match was just completed and has a winner
    IF NEW.status = 'completed' AND NEW.winner_id IS NOT NULL AND OLD.status != 'completed' THEN
        
        -- Determine the loser
        DECLARE
            loser_id UUID;
        BEGIN
            IF NEW.winner_id = NEW.player1_id THEN
                loser_id := NEW.player2_id;
            ELSE
                loser_id := NEW.player1_id;
            END IF;

            -- Advance the winner
            IF NEW.next_match_id IS NOT NULL THEN
                UPDATE public.matches
                SET 
                    player1_id = COALESCE(player1_id, CASE WHEN player2_id IS NULL THEN NEW.winner_id ELSE player1_id END),
                    player2_id = COALESCE(player2_id, CASE WHEN player1_id IS NOT NULL THEN NEW.winner_id ELSE player2_id END)
                WHERE id = NEW.next_match_id;
            END IF;

            -- Drop the loser to the lower bracket
            IF NEW.loser_next_match_id IS NOT NULL THEN
                UPDATE public.matches
                SET 
                    player1_id = COALESCE(player1_id, CASE WHEN player2_id IS NULL THEN loser_id ELSE player1_id END),
                    player2_id = COALESCE(player2_id, CASE WHEN player1_id IS NOT NULL THEN loser_id ELSE player2_id END)
                WHERE id = NEW.loser_next_match_id;
            END IF;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_match_completed ON public.matches;
CREATE TRIGGER on_match_completed
AFTER UPDATE ON public.matches
FOR EACH ROW
EXECUTE FUNCTION handle_match_completion();


-- SQL Queries for Admin CMS Members Management Enhancements

-- If using Supabase Auth, remember that users in auth.users cannot be easily deleted strictly from public.profiles
-- without falling foul of foreign key constraints (profiles.id references auth.users.id).
-- A clean way to allow Admins to delete a member completely is via an Edge Function with Service Role rights,
-- or by setting the Foreign Key on `public.profiles` to CASCADE and using a secure Postgres function.

-- Allow Admin to Delete user securely:
CREATE OR REPLACE FUNCTION delete_user_by_admin(target_user_id UUID)
RETURNS void AS $$
BEGIN
    -- Only allow if the executing user is an 'Admin' tier
    IF EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND tier = 'Admin'
    ) THEN
        DELETE FROM auth.users WHERE id = target_user_id;
        -- `public.profiles` will be deleted automatically if the foreign key has ON DELETE CASCADE
    ELSE
        RAISE EXCEPTION 'Unauthorized: Only Admins can delete users.';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
