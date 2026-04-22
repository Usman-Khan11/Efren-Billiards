import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Trophy } from 'lucide-react';
import type { Tournament } from '../types/database';

interface Props {
    gameType: 'billiards' | 'darts' | 'chess';
}

const TournamentCTA: React.FC<Props> = ({ gameType }) => {
    const { user } = useAuth();
    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTournament();
    }, [gameType, user]);

    const fetchTournament = async () => {
        setLoading(true);
        try {
            // Find active tournament (pending or in_progress)
            const { data, error } = await supabase
                .from('tournaments')
                .select('*')
                .eq('game_type', gameType)
                .in('status', ['pending', 'in_progress'])
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            const tournamentData = data as Tournament;
            setTournament(tournamentData);

            if (tournamentData && user) {
                const { data: regData, error: regError } = await supabase
                    .from('registrations')
                    .select('*')
                    .eq('tournament_id', tournamentData.id)
                    .eq('user_id', user.id)
                    .single();
                
                if (regError && regError.code !== 'PGRST116') throw regError;
                setIsRegistered(!!regData);
            }
        } catch (err) {
            console.error('Error fetching tournament CTA:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return null;
    if (!tournament) return null;

    return (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <a 
                href={`#tournament/${tournament.id}`}
                className={`inline-flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all shadow-xl hover:scale-105 ${
                    isRegistered 
                        ? 'bg-zinc-800 text-white hover:bg-zinc-700 border border-white/10' 
                        : 'bg-brand text-white hover:bg-brand/90 shadow-brand/20'
                }`}
            >
                <Trophy size={20} />
                {isRegistered ? 'View Tournament ' : 'Register for Tournament'}
            </a>
        </div>
    );
};

export default TournamentCTA;
