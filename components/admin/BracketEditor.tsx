import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/Toast';
import { Loader2, Save, RefreshCw, Trash2, Plus, X, Trophy, Crown, ChevronRight } from 'lucide-react';
import { generateTournamentStructure, getSeedOrder } from '../../lib/bracketology';
import type { Tournament, Profile, Match } from '../../types/database';

interface Props {
    tournament: Tournament;
}

interface MatchWithPlayers extends Match {
    player1?: Profile;
    player2?: Profile;
}

export const BracketEditor: React.FC<Props> = ({ tournament }) => {
    const { showToast, ToastContainer } = useToast();
    const [matches, setMatches] = useState<MatchWithPlayers[]>([]);
    const [registrations, setRegistrations] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [confirmWinner, setConfirmWinner] = useState<{ matchId: string; winnerId: string; winnerName: string } | null>(null);

    useEffect(() => {
        fetchData();
    }, [tournament.id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: matchesData, error: matchesError } = await supabase
                .from('matches')
                .select('*')
                .eq('tournament_id', tournament.id)
                .order('match_order', { ascending: true });

            if (matchesError) throw matchesError;

            const { data: regData, error: regError } = await supabase
                .from('registrations')
                .select('user_id, profiles(*)')
                .eq('tournament_id', tournament.id);

            if (regError) throw regError;

            const profiles = regData.map((r: any) => r.profiles).filter(Boolean);
            setRegistrations(profiles);

            const mappedMatches = (matchesData || []).map(m => ({
                ...m,
                player1: profiles.find(p => p.id === m.player1_id),
                player2: profiles.find(p => p.id === m.player2_id)
            }));

            setMatches(mappedMatches);
        } catch (err: any) {
            console.error('Error fetching bracket data:', err);
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const generateBracket = async () => {
        const count = registrations.length;
        const isPowerOfTwo = count > 1 && (count & (count - 1)) === 0;

        if (!isPowerOfTwo || count < 4) {
            const nearestLower = Math.pow(2, Math.floor(Math.log2(count)));
            const nearestHigher = Math.pow(2, Math.ceil(Math.log2(count)));
            const toRemove = count - nearestLower;
            const toAdd = nearestHigher - count;
            showToast(`Invalid player count. Remove ${toRemove} players or add ${toAdd} players to reach exactly ${nearestLower} or ${nearestHigher} players to continue.`, 'error');
            return;
        }

        const formatStr = tournament.format?.replace('_', ' ').toUpperCase() || 'SINGLE ELIMINATION';
        if (!confirm(`This will delete existing matches and create a new ${formatStr} bracket suited for ${count} players. Continue?`)) return;
        
        setGenerating(true);
        try {
            await supabase.from('matches').delete().eq('tournament_id', tournament.id);
            const matchesArray = generateTournamentStructure(tournament.id, tournament.format || 'single_elimination', count);
            const { error } = await (supabase.from('matches') as any).insert(matchesArray);
            if (error) throw error;
            
            showToast('Bracket generated successfully!', 'success');
            fetchData();
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setGenerating(false);
        }
    };


    const ensurePlayerExists = async (playerId: string) => {
        try {
            const { data: existing } = await (supabase.from('players') as any).select('id').eq('id', playerId).maybeSingle();
            if (!existing) {
                const profile = registrations.find(p => p.id === playerId);
                await (supabase.from('players') as any).insert([{
                    id: playerId,
                    name: profile?.full_name || 'Unknown Player',
                    rating: 1500, wins: 0, losses: 0
                }]);
            }
        } catch (err) {
            console.error('Error ensuring player exists:', err);
        }
    };

    // ── Elimination Logic ──────────────────────────────────────────────
    const declareWinner = async (matchId: string, winnerId: string) => {
        setSaving(true);
        setConfirmWinner(null);
        try {
            const match = matches.find(m => m.id === matchId);
            if (!match) return;

            // 1. Mark this match as completed with the winner
            const { error: matchError } = await (supabase.from('matches') as any)
                .update({ winner_id: winnerId, status: 'completed' })
                .eq('id', matchId);
            if (matchError) throw matchError;

            const loserId = match.player1_id === winnerId ? match.player2_id : match.player1_id;

            // 2 & 3: Advance winner / Drop loser (Handled perfectly by Supabase trigger 'on_match_completed' on the DB side!)
            // We rely on the SQL trigger to gracefully handle crossovers and COALESCE onto empty match slots 
            // without creating race conditions.

            // 4. Grand Final Reset Logic (True Double Elim)
            if (match.bracket_type === 'grand_final' && tournament.format === 'double_elimination' && !(match as any).is_reset) {
                const winnerHasLoss = matches.some(m => m.bracket_type === 'winners' && m.loser_next_match_id && m.winner_id && m.winner_id !== winnerId && (m.player1_id === winnerId || m.player2_id === winnerId));

                if (winnerHasLoss) {
                    await (supabase.from('matches') as any).insert({
                        tournament_id: tournament.id,
                        round: 2,
                        match_order: 0,
                        status: 'pending',
                        bracket_type: 'grand_final',
                        is_reset: true,
                        player1_id: winnerId,
                        player2_id: loserId
                    });
                    showToast('LB Winner forced a Reset! True Double Elimination Final created!', 'info');
                } else {
                    await finalizeTournamentData(winnerId, loserId);
                    showToast('🏆 Tournament Champion declared!', 'success');
                }
            } else if (!match.next_match_id && match.bracket_type !== 'winners' && match.bracket_type !== 'losers') {
                await finalizeTournamentData(winnerId, loserId);
                showToast('🏆 Tournament Champion declared!', 'success');
            }

            fetchData();
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const undoMatch = async (matchId: string) => {
        const match = matches.find(m => m.id === matchId);
        if (!match || match.status !== 'completed' || !match.winner_id) return;
        
        if (!confirm('Reopen this match? This will remove the advanced players from their next match slots if those matches are still pending.')) return;

        setSaving(true);
        try {
            const winnerId = match.winner_id;
            const loserId = match.player1_id === winnerId ? match.player2_id : match.player1_id;

            // 1. Revert Match to Pending
            const { error } = await (supabase.from('matches') as any).update({
                winner_id: null,
                status: 'pending'
            }).eq('id', match.id);
            if (error) throw error;

            // 2. Remove winner from next match
            if (match.next_match_id) {
                const nx = matches.find(m => m.id === match.next_match_id);
                if (nx && nx.status !== 'completed') {
                    if (nx.player1_id === winnerId) await (supabase.from('matches') as any).update({ player1_id: null }).eq('id', nx.id);
                    if (nx.player2_id === winnerId) await (supabase.from('matches') as any).update({ player2_id: null }).eq('id', nx.id);
                }
            }

            // 3. Remove loser from losers bracket match 
            if (match.loser_next_match_id && loserId) {
                const lx = matches.find(m => m.id === match.loser_next_match_id);
                if (lx && lx.status !== 'completed') {
                    if (lx.player1_id === loserId) await (supabase.from('matches') as any).update({ player1_id: null }).eq('id', lx.id);
                    if (lx.player2_id === loserId) await (supabase.from('matches') as any).update({ player2_id: null }).eq('id', lx.id);
                }
            }

            // Note: If this was the Grand Final, resetting doesn't easily 'undo' the tournament completed status or rankings. 
            // In a pro system, rankings are manually regenerated. We'll leave it as is for simplicity.

            showToast('Match reopened.', 'success');
            fetchData();
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const finalizeTournamentData = async (championId: string, runnerUpId: string | undefined | null) => {
        try {
            // Find 3rd place if Double Elim
            let thirdPlaceId = null;
            if (tournament.format === 'double_elimination') {
                const losersFinal = matches.find(m => m.bracket_type === 'losers' && !matches.some(child => child.bracket_type === 'losers' && child.next_match_id === m.id));
                if (losersFinal && losersFinal.winner_id) {
                    thirdPlaceId = losersFinal.player1_id === losersFinal.winner_id ? losersFinal.player2_id : losersFinal.player1_id;
                }
            }

            // Optional: Insert into rankings. 
            // In EfrenBilliards, we can just save it or mark the tournament as completed.
            await (supabase.from('tournaments') as any)
                .update({ status: 'completed', completed_at: new Date().toISOString() })
                .eq('id', tournament.id);

            // Record rankings in `rankings` table (1st, 2nd, 3rd)
            const ranksToInsert = [];
            const champ = registrations.find(p => p.id === championId);
            if (champ) ranksToInsert.push({ game_type: tournament.game_type, rank: 1, player_name: champ.full_name || 'Player', user_id: champ.id, score: 300, trend: 'up' as const });
            
            if (runnerUpId) {
                const runner = registrations.find(p => p.id === runnerUpId);
                if (runner) ranksToInsert.push({ game_type: tournament.game_type, rank: 2, player_name: runner.full_name || 'Player', user_id: runner.id, score: 200, trend: 'up' as const });
            }
            
            if (thirdPlaceId) {
                const third = registrations.find(p => p.id === thirdPlaceId);
                if (third) ranksToInsert.push({ game_type: tournament.game_type, rank: 3, player_name: third.full_name || 'Player', user_id: third.id, score: 100, trend: 'up' as const });
            }

            if (ranksToInsert.length > 0) {
                await (supabase.from('rankings') as any).insert(ranksToInsert);
            }
        } catch (err) {
            console.error('Error recording rankings:', err);
        }
    };

    // ── Drag & Drop ────────────────────────────────────────────────────
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        if (!over) return;
        const playerId = active.id as string;
        const targetId = over.id as string;
        if (!targetId.includes('-')) return;
        const lastHyphenIndex = targetId.lastIndexOf('-');
        const matchId = targetId.substring(0, lastHyphenIndex);
        const slot = targetId.substring(lastHyphenIndex + 1) as 'player1' | 'player2';
        await assignPlayerToSlot(matchId, slot, playerId);
    };

    const assignPlayerToSlot = async (matchId: string, slot: 'player1' | 'player2', playerId: string) => {
        const match = matches.find(m => m.id === matchId);
        if (!match) return;
        if (match.status === 'completed') { showToast('Cannot modify a completed match.', 'error'); return; }

        try {
            await ensurePlayerExists(playerId);
        } catch (err) { console.error(err); }

        if ((slot === 'player1' && match.player1_id === playerId) ||
            (slot === 'player2' && match.player2_id === playerId)) return;

        const previousMatch = matches.find(m => m.player1_id === playerId || m.player2_id === playerId);
        if (previousMatch) {
            const prevSlot = previousMatch.player1_id === playerId ? 'player1_id' : 'player2_id';
            await updateMatch(previousMatch.id, { [prevSlot]: null });
        }

        const updates: any = {};
        updates[slot === 'player1' ? 'player1_id' : 'player2_id'] = playerId;
        await updateMatch(matchId, updates);
    };

    const removePlayerFromSlot = async (matchId: string, slot: 'player1' | 'player2') => {
        const match = matches.find(m => m.id === matchId);
        if (match?.status === 'completed') { showToast('Cannot modify a completed match.', 'error'); return; }
        const updates: any = {};
        updates[slot === 'player1' ? 'player1_id' : 'player2_id'] = null;
        await updateMatch(matchId, updates);
    };

    const updateMatch = async (matchId: string, updates: any) => {
        setMatches(prev => prev.map(m => {
            if (m.id !== matchId) return m;
            const updated = { ...m, ...updates };
            if ('player1_id' in updates) updated.player1 = registrations.find(p => p.id === updates.player1_id);
            if ('player2_id' in updates) updated.player2 = registrations.find(p => p.id === updates.player2_id);
            return updated;
        }));
        try {
            const { error } = await (supabase.from('matches') as any).update(updates).eq('id', matchId);
            if (error) throw error;
        } catch (err: any) {
            showToast('Failed to update match', 'error');
            fetchData();
        }
    };

    const autoAssignPlayers = async () => {
        const round1Matches = matches.filter(m => m.round === 1 && m.bracket_type === 'winners').sort((a,b) => a.match_order - b.match_order);
        if (round1Matches.length === 0) { showToast('Generate a bracket first.', 'error'); return; }

        const assignedIds = new Set<string>();
        matches.forEach(m => { if (m.player1_id) assignedIds.add(m.player1_id); if (m.player2_id) assignedIds.add(m.player2_id); });
        
        // Unassigned players sorted (simulate ranking by sorting arbitrarily or by full_name for now)
        const available = [...registrations.filter(p => !assignedIds.has(p.id))].sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
        if (available.length === 0) { showToast('All players are already assigned.', 'info'); return; }

        const size = round1Matches.length * 2;
        const seedOrder = getSeedOrder(Math.log2(size));
        
        setSaving(true);
        try {
            let assignedCount = 0;
            
            for (let i = 0; i < size; i++) {
                 const seed = seedOrder[i];
                 const matchIndex = Math.floor(i / 2);
                 const slot = i % 2 === 0 ? 'player1_id' : 'player2_id';
                 const match = round1Matches[matchIndex];
                 
                 const playerIndex = seed - 1;
                 const playerId = playerIndex < available.length ? available[playerIndex].id : null;
                 
                 if (playerId) {
                     await ensurePlayerExists(playerId);
                     await updateMatch(match.id, { [slot]: playerId });
                     assignedCount++;
                 }
            }
            
            showToast(`Auto-assigned ${assignedCount} players using professional Byes/Seeding rules.`, 'success');
            fetchData();
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    // Assigned state maps
    const assignedIds = new Set<string>();
    matches.forEach(m => { if (m.player1_id) assignedIds.add(m.player1_id); if (m.player2_id) assignedIds.add(m.player2_id); });
    const unassignedPlayers = registrations.filter(p => !assignedIds.has(p.id));

    // Build global match map
    const matchNumberMap = new Map<string, number>();
    let counter = 1;
    ['winners', 'losers', 'grand_final'].forEach(sec => {
        const matchesInSection = matches.filter(m => m.bracket_type === sec || (!m.bracket_type && sec === 'winners'));
        matchesInSection.sort((a,b) => (a.round === b.round ? a.match_order - b.match_order : a.round - b.round));
        matchesInSection.forEach(m => matchNumberMap.set(m.id, counter++));
    });

    // Helper: Recursive Bracket Node
    const EditBracketNode: React.FC<{ match: MatchWithPlayers; allMatches: MatchWithPlayers[] }> = ({ match, allMatches }) => {
        const priorMatches = allMatches.filter(m => m.next_match_id === match.id).sort((a, b) => a.match_order - b.match_order);
        return (
            <div className="flex flex-row items-center">
                {priorMatches.length > 0 && (
                    <div className="flex flex-col justify-center gap-4 border-r-2 border-brand/20 pr-8 mr-8 relative py-4">
                        <div className="absolute top-1/2 right-0 w-8 h-[2px] bg-brand/20 -translate-y-1/2"></div>
                        {priorMatches.map(child => (
                            <div key={child.id} className="relative">
                                <div className="absolute top-1/2 -right-8 w-8 h-[2px] bg-brand/20"></div>
                                <EditBracketNode match={child} allMatches={allMatches} />
                            </div>
                        ))}
                    </div>
                )}
                <MatchCard
                    match={match}
                    matchNumber={matchNumberMap.get(match.id) || 1}
                    unassignedPlayers={unassignedPlayers}
                    onAssign={(slot, pid) => assignPlayerToSlot(match.id, slot, pid)}
                    onRemove={(slot) => removePlayerFromSlot(match.id, slot)}
                    onDeclareWinner={(winnerId, winnerName) => setConfirmWinner({ matchId: match.id, winnerId, winnerName })}
                    onUndoMatch={() => undoMatch(match.id)}
                />
            </div>
        );
    };

    // Tree Roots
    const hasDE = matches.some(m => m.bracket_type === 'losers');
    const winnersMatches = matches.filter(m => m.bracket_type === 'winners' || !m.bracket_type);
    const losersMatches = matches.filter(m => m.bracket_type === 'losers');
    const grandFinals = matches.filter(m => m.bracket_type === 'grand_final');

    const winnersRoot = winnersMatches.find(m => m.next_match_id === null || grandFinals.some(gf => gf.id === m.next_match_id)) || winnersMatches[winnersMatches.length - 1];
    const losersRoot = losersMatches.find(m => m.next_match_id === null || grandFinals.some(gf => gf.id === m.next_match_id)) || losersMatches[losersMatches.length - 1];
    const gfRoot = grandFinals.find(m => m.next_match_id === null) || grandFinals[grandFinals.length - 1];

    return (
        <DndContext onDragEnd={handleDragEnd} onDragStart={(e) => setActiveId(e.active.id as string)}>
            <ToastContainer />
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-white uppercase tracking-wider">Bracket Editor</h2>
                            <span className="px-2 py-0.5 bg-brand/20 text-brand text-[10px] font-black rounded-full border border-brand/30">LIVE</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Drag players to slots, then declare match winners to advance them.</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={autoAssignPlayers} disabled={saving || generating || unassignedPlayers.length === 0}
                            className="px-3 py-1.5 bg-brand/20 hover:bg-brand/30 border border-brand/30 rounded-lg text-xs font-bold text-brand flex items-center gap-2 transition-colors disabled:opacity-50">
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                            Auto Assign
                        </button>
                        <div className="w-px h-8 bg-white/10 mx-2" />
                        <button onClick={generateBracket} disabled={generating} className="px-5 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-600/40 rounded-lg text-xs font-bold text-blue-400">
                            Generate {tournament.format === 'double_elimination' ? 'Double' : 'Single'} Elim Bracket
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    {/* Unassigned Pool */}
                    <div className="xl:col-span-1 bg-white/[0.02] border border-white/10 rounded-2xl p-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Unassigned Players</h3>
                        <div className="space-y-2 min-h-[200px]">
                            {unassignedPlayers.map(player => (
                                <DraggablePlayer key={player.id} player={player} />
                            ))}
                            {unassignedPlayers.length === 0 && (
                                <p className="text-xs text-gray-600 text-center py-4">All players assigned</p>
                            )}
                        </div>
                    </div>

                    {/* Bracket */}
                    <div className="xl:col-span-3 bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 overflow-x-auto custom-scrollbar">
                        {loading ? (
                            <div className="flex items-center justify-center h-48">
                                <Loader2 size={28} className="animate-spin text-brand" />
                            </div>
                        ) : matches.length === 0 ? (
                            <div className="flex items-center justify-center h-48 text-gray-500">No Bracket Generated</div>
                        ) : (
                            <div className="flex flex-col gap-16 min-w-max">
                                {/* Winners Bracket */}
                                {winnersRoot && (
                                    <div className="bg-dark-900/30 p-8 rounded-3xl border border-white/5">
                                        <h3 className="text-white font-black uppercase tracking-widest text-lg mb-12 flex items-center gap-3">
                                            <div className="w-2 h-8 rounded-full bg-brand" /> Winners Bracket
                                        </h3>
                                        <div className="inline-block min-w-max">
                                            <EditBracketNode match={winnersRoot} allMatches={winnersMatches} />
                                        </div>
                                    </div>
                                )}

                                {/* Losers Bracket */}
                                {losersRoot && hasDE && (
                                    <div className="bg-dark-900/30 p-8 rounded-3xl border border-white/5">
                                        <h3 className="text-white font-black uppercase tracking-widest text-lg mb-12 flex items-center gap-3">
                                            <div className="w-2 h-8 rounded-full bg-maroon" /> Losers Bracket
                                        </h3>
                                        <div className="inline-block min-w-max">
                                            <EditBracketNode match={losersRoot} allMatches={losersMatches} />
                                        </div>
                                    </div>
                                )}

                                {/* Grand Final */}
                                {gfRoot && hasDE && (
                                    <div className="bg-gradient-to-r from-dark-900/30 to-brand/5 p-8 rounded-3xl border border-gold/20 shadow-[0_0_100px_rgba(245,142,28,0.05)]">
                                        <h3 className="text-gold font-black uppercase tracking-widest text-lg mb-12 flex items-center gap-3">
                                            <div className="w-2 h-8 rounded-full bg-gold" /> Grand Finals
                                        </h3>
                                        <div className="inline-block min-w-max relative z-20">
                                            <EditBracketNode match={gfRoot} allMatches={grandFinals} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <DragOverlay>
                {activeId ? (
                    <div className="px-3 py-2 bg-brand text-white rounded-lg font-bold text-sm shadow-xl cursor-grabbing">
                        {registrations.find(p => p.id === activeId)?.full_name || 'Player'}
                    </div>
                ) : null}
            </DragOverlay>

            {/* Winner Confirmation Modal */}
            {confirmWinner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-dark-800 border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center space-y-6">
                        <div className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/30 flex items-center justify-center mx-auto">
                            <Trophy size={32} className="text-brand" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Declare Winner?</h3>
                            <p className="text-gray-400 text-sm mt-2">
                                This will eliminate the other player and advance <span className="text-white font-bold">{confirmWinner.winnerName}</span> to the next round.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmWinner(null)}
                                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => declareWinner(confirmWinner.matchId, confirmWinner.winnerId)}
                                className="flex-1 py-3 rounded-xl bg-brand text-white font-black text-sm hover:bg-brand/90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand/30"
                            >
                                <Crown size={16} /> Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DndContext>
    );
};

// ── Sub‑components ─────────────────────────────────────────────────────

const DraggablePlayer: React.FC<{ player: Profile }> = ({ player }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: player.id });
    const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg cursor-grab active:cursor-grabbing flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-brand/20 flex items-center justify-center text-[10px] font-bold text-brand shrink-0">
                {player.full_name?.charAt(0)}
            </div>
            <span className="text-sm font-bold text-white truncate">{player.full_name}</span>
        </div>
    );
};

const MatchCard: React.FC<{
    match: MatchWithPlayers;
    matchNumber: number;
    unassignedPlayers: Profile[];
    onAssign: (slot: 'player1' | 'player2', playerId: string) => void;
    onRemove: (slot: 'player1' | 'player2') => void;
    onDeclareWinner: (winnerId: string, winnerName: string) => void;
    onUndoMatch: () => void;
}> = ({ match, matchNumber, unassignedPlayers, onAssign, onRemove, onDeclareWinner, onUndoMatch }) => {
    const isCompleted = match.status === 'completed';
    const canDeclareWinner = match.player1_id && match.player2_id && !isCompleted;

    return (
        <div className={`w-56 shrink-0 z-10 my-2 rounded-md overflow-hidden flex flex-col shadow-2xl border transition-all ${isCompleted ? 'border-brand/20 bg-dark-800' : 'border-white/10 bg-dark-800'}`}>
            {/* Match header */}
            <div className="bg-[#111] px-2 py-1 border-b border-white/5 text-[9px] text-gray-500 font-bold flex justify-between items-center group/header">
                <span className="text-[10px] text-gray-300">Match {matchNumber}</span>
                <div className="flex items-center gap-2">
                    {isCompleted && (
                        <button onClick={(e) => { e.stopPropagation(); onUndoMatch(); }} title="Reopen match" className="opacity-0 group-hover/header:opacity-100 hidden md:block px-1.5 py-0.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all uppercase tracking-widest text-[8px]">
                            Undo
                        </button>
                    )}
                    <span className={isCompleted ? 'text-brand font-black' : ''}>{isCompleted ? 'FINAL' : match.status}</span>
                </div>
            </div>

            {/* Player Slots Container */}
            <div className="flex flex-col bg-dark-900">
                <PlayerSlot
                    matchId={match.id}
                    slot="player1"
                    player={match.player1}
                    isWinner={isCompleted && match.winner_id === match.player1_id}
                    isLoser={isCompleted && !!match.winner_id && match.winner_id !== match.player1_id}
                    unassignedPlayers={unassignedPlayers}
                    onAssign={(pid) => onAssign('player1', pid)}
                    onRemove={() => onRemove('player1')}
                    onWin={canDeclareWinner && match.player1 ? () => onDeclareWinner(match.player1_id!, match.player1?.full_name || 'Player 1') : undefined}
                />
                <PlayerSlot
                    matchId={match.id}
                    slot="player2"
                    player={match.player2}
                    isWinner={isCompleted && match.winner_id === match.player2_id}
                    isLoser={isCompleted && !!match.winner_id && match.winner_id !== match.player2_id}
                    unassignedPlayers={unassignedPlayers}
                    onAssign={(pid) => onAssign('player2', pid)}
                    onRemove={() => onRemove('player2')}
                    onWin={canDeclareWinner && match.player2 ? () => onDeclareWinner(match.player2_id!, match.player2?.full_name || 'Player 2') : undefined}
                />
            </div>
        </div>
    );
};

const PlayerSlot: React.FC<{
    matchId: string;
    slot: 'player1' | 'player2';
    player?: Profile;
    isWinner?: boolean;
    isLoser?: boolean;
    unassignedPlayers: Profile[];
    onAssign: (playerId: string) => void;
    onRemove: () => void;
    onWin?: () => void;
}> = ({ matchId, slot, player, isWinner, isLoser, unassignedPlayers, onAssign, onRemove, onWin }) => {
    const { setNodeRef, isOver } = useDroppable({ id: `${matchId}-${slot}` });
    const [showSelector, setShowSelector] = useState(false);

    return (
        <div ref={setNodeRef}
            className={`h-9 flex items-stretch border-b last:border-b-0 border-white/5 transition-colors relative group
                ${isOver ? 'bg-brand/20' : ''}
            `}
        >
            {/* Player details area */}
            <div className={`flex-1 flex items-center px-3 truncate relative overflow-visible ${isWinner ? 'text-white font-bold' : isLoser ? 'text-gray-500 opacity-50' : 'text-gray-300'}`}>
                {player ? (
                    <div className="flex items-center gap-2 w-full justify-between pr-2">
                        <div className="flex items-center gap-2 truncate">
                            {isWinner && <Crown size={12} className="text-[#f58e1c] shrink-0" />}
                            <span className="truncate">{player.full_name}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-1">
                            {/* Actions overlayed to not push layout */}
                            {onWin && (
                                <button onClick={(e) => { e.stopPropagation(); onWin(); }}
                                    title="Declare Winner"
                                    className="p-1 bg-brand text-white rounded transition-all shadow shadow-black">
                                    <Trophy size={10} />
                                </button>
                            )}
                            {!isWinner && !isLoser && (
                                <button onClick={(e) => { e.stopPropagation(); onRemove(); }}
                                    title="Remove Player"
                                    className="p-1 bg-red-500/80 text-white rounded transition-colors shadow shadow-black">
                                    <Trash2 size={10} />
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between w-full opacity-50">
                        <span className="text-xs text-gray-500">Empty Slot</span>
                        <button onClick={(e) => { e.stopPropagation(); setShowSelector(!showSelector); }}
                            className="p-1 hover:text-white rounded transition-colors">
                            <Plus size={12} />
                        </button>
                    </div>
                )}
            </div>

            {/* Score / Rank UI Block (Orange for winner) */}
            <div className={`w-8 shrink-0 flex items-center justify-center border-l border-white/5 font-mono text-xs font-bold
                ${isWinner ? 'bg-[#f58e1c] text-white shadow-[0_0_10px_rgba(245,142,28,0.3)]' : isLoser ? 'bg-white/5 text-gray-600' : 'bg-dark-800 text-gray-500'}`}>
                {isWinner ? 1 : isLoser ? 0 : '-'}
            </div>

            {/* Selection Dropdown */}
            {showSelector && (
                <div className="absolute top-full left-0 w-full z-50 mt-1 bg-dark-800 border border-white/10 rounded-lg shadow-2xl max-h-48 overflow-y-auto">
                    <div className="p-2 border-b border-white/5 flex justify-between items-center sticky top-0 bg-dark-800">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Select Player</span>
                        <button onClick={() => setShowSelector(false)} className="text-gray-500 hover:text-white"><X size={12} /></button>
                    </div>
                    {unassignedPlayers.length === 0 ? (
                        <div className="p-3 text-[10px] text-gray-600 italic text-center">No unassigned players</div>
                    ) : (
                        unassignedPlayers.map(p => (
                            <button key={p.id} onClick={() => { onAssign(p.id); setShowSelector(false); }}
                                className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-brand hover:text-white transition-colors flex items-center gap-2">
                                <span className="truncate">{p.full_name}</span>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default BracketEditor;
