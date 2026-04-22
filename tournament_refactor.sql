-- Tournament Refactoring Queries

-- 1. Add format to tournaments
ALTER TABLE public.tournaments 
ADD COLUMN format text DEFAULT 'single_elimination' 
CHECK (format IN ('single_elimination', 'double_elimination'));

-- 2. Add is_reset to matches to denote the 'True Double' final match
ALTER TABLE public.matches 
ADD COLUMN is_reset boolean DEFAULT false;

-- 3. Modify the handle_match_completion trigger to correctly handle Byes and auto-progression
-- This is a more advanced version that respects the rules of billiards double elimination drops
CREATE OR REPLACE FUNCTION handle_match_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- If the match was just completed and has a winner
    IF NEW.status = 'completed' AND NEW.winner_id IS NOT NULL AND OLD.status != 'completed' THEN
        
        -- Determine the loser (will be NULL if player2_id is NULL, which happens in a Bye)
        DECLARE
            loser_id UUID;
        BEGIN
            IF NEW.player1_id IS NOT NULL AND NEW.player2_id IS NOT NULL THEN
                IF NEW.winner_id = NEW.player1_id THEN
                    loser_id := NEW.player2_id;
                ELSE
                    loser_id := NEW.player1_id;
                END IF;
            ELSE
                -- If it's a Bye, there is no loser to drop
                loser_id := NULL;
            END IF;

            -- Advance the winner
            IF NEW.next_match_id IS NOT NULL THEN
                UPDATE public.matches
                SET 
                    player1_id = COALESCE(player1_id, CASE WHEN player2_id IS NULL AND player1_id IS NULL THEN NEW.winner_id ELSE player1_id END),
                    player2_id = COALESCE(player2_id, CASE WHEN player1_id IS NOT NULL THEN NEW.winner_id ELSE player2_id END)
                WHERE id = NEW.next_match_id;
            END IF;

            -- Drop the loser to the lower bracket
            IF loser_id IS NOT NULL AND NEW.loser_next_match_id IS NOT NULL THEN
                UPDATE public.matches
                SET 
                    player1_id = COALESCE(player1_id, CASE WHEN player2_id IS NULL AND player1_id IS NULL THEN loser_id ELSE player1_id END),
                    player2_id = COALESCE(player2_id, CASE WHEN player1_id IS NOT NULL THEN loser_id ELSE player2_id END)
                WHERE id = NEW.loser_next_match_id;
            END IF;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
