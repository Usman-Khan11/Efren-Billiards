import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Tournament, Registration, Match, Profile } from '../types/database';

export interface MatchWithPlayers extends Match {
    player1?: Profile | null;
    player2?: Profile | null;
    winner?: Profile | null;
}

export function generateRelationalBracket(
    tournamentId: string,
    participants: Registration[]
): MatchWithPlayers[] {
    const matches: MatchWithPlayers[] = [];
    const N = participants.length;
    if (N < 2) return [];

    let powerOfTwo = 1;
    while (powerOfTwo < N) powerOfTwo *= 2;

    // We don't have seeds in the new schema yet, so just use order of registration
    const seeded = [...participants];
    const totalRounds = Math.log2(powerOfTwo);
    let matchOrderGlobal = 0;

    function buildNode(round: number, siblingIndex: number, nextMatchId: string | null): number {
        const matchId = crypto.randomUUID();
        const currentOrder = matchOrderGlobal++;

        const match: MatchWithPlayers = {
            id: matchId,
            tournament_id: tournamentId,
            round,
            match_order: currentOrder,
            player1_id: null,
            player2_id: null,
            winner_id: null,
            status: 'pending',
            next_match_id: nextMatchId,
            bracket_type: 'winners',
            created_at: new Date().toISOString()
        };

        matches.push(match);

        if (round === 1) return matches.length - 1;
        buildNode(round - 1, siblingIndex * 2, matchId);
        buildNode(round - 1, siblingIndex * 2 + 1, matchId);
        return -1;
    }

    buildNode(totalRounds, 0, null);

    const round1Matches = matches.filter(m => m.round === 1).sort((a, b) => a.match_order - b.match_order);
    let currentParticipantIndex = 0;

    round1Matches.forEach((m) => {
        if (currentParticipantIndex < seeded.length) {
            const p = (seeded[currentParticipantIndex] as any).profiles;
            m.player1_id = seeded[currentParticipantIndex].user_id;
            m.player1 = p ? { ...p, name: p.full_name } : null;
            currentParticipantIndex++;
        }
    });

    round1Matches.forEach((m) => {
        if (currentParticipantIndex < seeded.length) {
            const p = (seeded[currentParticipantIndex] as any).profiles;
            m.player2_id = seeded[currentParticipantIndex].user_id;
            m.player2 = p ? { ...p, name: p.full_name } : null;
            currentParticipantIndex++;
        } else {
            m.status = 'completed';
            m.winner_id = m.player1_id;
            m.winner = m.player1;
        }
    });

    round1Matches.forEach(m => {
        if (m.winner_id && m.next_match_id) {
            const nextMatch = matches.find(nm => nm.id === m.next_match_id);
            if (nextMatch) {
                if (!nextMatch.player1_id) {
                    nextMatch.player1_id = m.winner_id;
                    nextMatch.player1 = m.winner;
                } else {
                    nextMatch.player2_id = m.winner_id;
                    nextMatch.player2 = m.winner;
                }
            }
        }
    });

    return matches;
}

async function fetchParticipantsWithPlayers(tournamentId: string): Promise<Registration[]> {
    const { data, error } = await supabase
        .from('registrations')
        .select('*, profiles(*)')
        .eq('tournament_id', tournamentId)
        .order('registered_at', { ascending: true });

    if (error) throw error;

    return data as any[];
}

async function fetchMatchesWithPlayers(tournamentId: string): Promise<MatchWithPlayers[]> {
    const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('round', { ascending: true })
        .order('match_order', { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) return [];

    const playerIds = new Set<string>();
    data.forEach((m: any) => {
        if (m.player1_id) playerIds.add(m.player1_id);
        if (m.player2_id) playerIds.add(m.player2_id);
        if (m.winner_id) playerIds.add(m.winner_id);
    });

    const playerMap: Record<string, any> = {};
    if (playerIds.size > 0) {
        const { data: players, error: pErr } = await supabase
            .from('players')
            .select('*')
            .in('id', Array.from(playerIds));
        if (!pErr && players) {
            players.forEach((p: any) => { 
                playerMap[p.id] = {
                    ...p,
                    full_name: p.name // Map 'name' to 'full_name' for the UI
                }; 
            });
        }
    }

    return data.map((m: any) => ({
        ...m,
        player1: m.player1_id ? playerMap[m.player1_id] ?? null : null,
        player2: m.player2_id ? playerMap[m.player2_id] ?? null : null,
        winner: m.winner_id ? playerMap[m.winner_id] ?? null : null,
    }));
}

export function useAllTournaments() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tournaments, setTournaments] = useState<Tournament[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data, error: qErr } = await supabase
                    .from('tournaments')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (qErr) throw qErr;
                setTournaments((data as Tournament[]) || []);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch tournaments.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { tournaments, loading, error };
}

export function useTournamentsByGameType(gameType: 'billiards' | 'darts' | 'chess') {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tournaments, setTournaments] = useState<Tournament[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { data, error: tErr } = await supabase
                    .from('tournaments')
                    .select('*')
                    .eq('game_type', gameType)
                    .order('created_at', { ascending: false });

                if (tErr) throw tErr;
                setTournaments((data as Tournament[]) || []);
            } catch (err: any) {
                setError(err.message || `Failed to fetch ${gameType} tournaments.`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [gameType]);

    return { tournaments, loading, error };
}

export function useActiveTournamentByGameType(gameType: 'billiards' | 'darts' | 'chess') {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [matches, setMatches] = useState<MatchWithPlayers[]>([]);
    const [participants, setParticipants] = useState<Registration[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { data: tData, error: tErr } = await supabase
                    .from('tournaments')
                    .select('*')
                    .eq('game_type', gameType)
                    .in('status', ['pending', 'in_progress'])
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (tErr) throw tErr;
                if (!tData) {
                    setTournament(null);
                    setParticipants([]);
                    setMatches([]);
                    return;
                }
                const t = tData as Tournament;
                setTournament(t);

                const [parts, matchData] = await Promise.all([
                    fetchParticipantsWithPlayers(t.id),
                    fetchMatchesWithPlayers(t.id),
                ]);

                setParticipants(parts);

                if (matchData.length > 0) {
                    setMatches(matchData);
                } else if (parts.length >= 2) {
                    setMatches(generateRelationalBracket(t.id, parts));
                }
            } catch (err: any) {
                setError(err.message || `Failed to fetch active ${gameType} tournament.`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [gameType]);

    return { tournament, matches, participants, loading, error };
}

export function useTournamentData(tournamentId: string | null) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [matches, setMatches] = useState<MatchWithPlayers[]>([]);
    const [participants, setParticipants] = useState<Registration[]>([]);

    useEffect(() => {
        if (!tournamentId) { setLoading(false); return; }

        const fetchData = async () => {
            setLoading(true);
            try {
                const { data: tData, error: tErr } = await supabase
                    .from('tournaments')
                    .select('*')
                    .eq('id', tournamentId)
                    .single();

                if (tErr) throw tErr;
                const t = tData as Tournament;
                setTournament(t);

                const [parts, matchData] = await Promise.all([
                    fetchParticipantsWithPlayers(t.id),
                    fetchMatchesWithPlayers(t.id),
                ]);

                setParticipants(parts);

                if (matchData.length > 0) {
                    setMatches(matchData);
                } else if (parts.length >= 2) {
                    setMatches(generateRelationalBracket(t.id, parts));
                }
            } catch (err: any) {
                setError(err.message || 'Failed to fetch tournament data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [tournamentId]);

    return { tournament, matches, participants, loading, error };
}
