import React from 'react';
import { motion } from 'framer-motion';
import type { Profile } from '../types/database';
import type { MatchWithPlayers } from '../hooks/useTournaments';

interface TournamentBracketProps {
    matches: MatchWithPlayers[];
}

interface BracketNodeProps {
    match: MatchWithPlayers;
    allMatches: MatchWithPlayers[];
    matchNumberMap: Map<string, number>;
    isDE?: boolean;
}

const MatchPlayerNode: React.FC<{ 
    player?: Profile | null, 
    isWinner: boolean, 
    isLoser: boolean,
    placeholder?: string 
}> = ({ player, isWinner, isLoser, placeholder }) => {
    return (
        <div className={`flex items-stretch border-b last:border-b-0 border-white/5 bg-dark-900 transition-colors h-9`}>
            <div className={`flex-1 flex items-center px-3 truncate ${isWinner ? 'text-white font-bold' : isLoser ? 'text-gray-500 opacity-50' : 'text-gray-300'}`}>
                {player ? player.full_name : (
                    <span className="text-[10px] text-gray-500 italic opacity-50 font-bold tracking-tight">
                        {placeholder || 'TBD'}
                    </span>
                )}
                {player?.tier && (
                    <span className="ml-2 text-[8px] font-mono bg-white/5 px-1 py-0.5 rounded border border-white/10 text-gray-400">
                        {player.tier}
                    </span>
                )}
            </div>
            {/* Score block styling mimicking Challonge attachments (orange highlight for winners) */}
            <div className={`w-8 shrink-0 flex items-center justify-center border-l border-white/5 font-mono text-xs font-bold
                ${isWinner ? 'bg-[#f58e1c] text-white' : isLoser ? 'bg-white/5 text-gray-600' : 'bg-dark-800 text-gray-500'}`}>
                {isWinner ? 1 : isLoser ? 0 : '-'}
            </div>
        </div>
    );
};

const BracketNode: React.FC<BracketNodeProps> = ({ match, allMatches, matchNumberMap, isDE }) => {
    // Find children (matches that point to this match)
    const priorMatches = allMatches.filter(m => m.next_match_id === match.id)
        .sort((a, b) => a.match_order - b.match_order);

    const isMatchCompleted = match.status === 'completed';

    // Helper to find what should feed into a slot if empty
    const getPlaceholder = (playerIndex: number) => {
        if (!isDE) return 'TBD';
        
        // Check if a match feeds into this slot via next_match_id
        const sources = allMatches.filter(m => m.next_match_id === match.id).sort((a,b) => a.match_order - b.match_order);
        if (sources[playerIndex]) {
            return `Winner Match ${matchNumberMap.get(sources[playerIndex].id)}`;
        }

        // If no direct winner feed, check if it's a loser feed from WB
        if (match.bracket_type === 'losers') {
            const wbSource = allMatches.find(m => m.loser_next_match_id === match.id);
            if (wbSource) {
                if (wbSource.status === 'completed' && wbSource.winner_id) {
                    const loserId = wbSource.player1_id === wbSource.winner_id ? wbSource.player2_id : wbSource.player1_id;
                    const loserName = [wbSource.player1, wbSource.player2].find(p => p?.id === loserId)?.full_name;
                    if (loserName) return loserName;
                }
                return `Loser Match ${matchNumberMap.get(wbSource.id)}`;
            }
        }

        return 'TBD';
    };

    return (
        <div className="flex flex-row items-center">
            {priorMatches.length > 0 && (
                <div className="flex flex-col justify-center gap-4 border-r-2 border-brand/20 pr-8 mr-8 relative py-4">
                    {/* Horizontal line extending to the parent (current match) */}
                    <div className="absolute top-1/2 right-0 w-8 h-[2px] bg-brand/20 -translate-y-1/2"></div>
                    {priorMatches.map(child => (
                        <div key={child.id} className="relative">
                            {/* Line coming OUT of the child's right side to hit the vertical spine */}
                            <div className="absolute top-1/2 -right-8 w-8 h-[2px] bg-brand/20"></div>
                            <BracketNode match={child} allMatches={allMatches} matchNumberMap={matchNumberMap} isDE={isDE}/>
                        </div>
                    ))}
                </div>
            )}

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-56 bg-dark-800 rounded-md shadow-2xl flex flex-col overflow-hidden shrink-0 relative z-10 border border-white/10 my-2"
            >
                <div className="bg-[#111] px-2 py-1 border-b border-white/5 text-[9px] text-gray-500 font-bold flex justify-between items-center">
                    <span className="text-[10px] text-gray-300">Match {matchNumberMap.get(match.id)}</span>
                    <span className={isMatchCompleted ? 'text-brand font-black' : ''}>{isMatchCompleted ? 'FINAL' : ''}</span>
                </div>

                <div className="flex flex-col">
                    <MatchPlayerNode
                        player={match.player1}
                        isWinner={isMatchCompleted && match.winner_id === match.player1_id}
                        isLoser={isMatchCompleted && match.winner_id !== match.player1_id}
                        placeholder={getPlaceholder(0)}
                    />
                    <MatchPlayerNode
                        player={match.player2}
                        isWinner={isMatchCompleted && match.winner_id === match.player2_id}
                        isLoser={isMatchCompleted && match.winner_id !== match.player2_id}
                        placeholder={getPlaceholder(1)}
                    />
                </div>
            </motion.div>
        </div>
    );
};

export const TournamentBracket: React.FC<TournamentBracketProps> = ({ matches }) => {
    if (!matches || matches.length === 0) {
        return (
            <div className="p-8 text-center text-gray-400 border border-dashed border-white/20 rounded-xl bg-dark-900">
                <p className="uppercase tracking-widest font-bold text-sm">No Bracket Data</p>
                <p className="text-xs mt-2">Waiting for matches to be seeded.</p>
            </div>
        );
    }

    // Default to Single Elimination rendering if no bracket_type exists on any match
    const hasDE = matches.some(m => m.bracket_type === 'losers');

    // Build match numbering map (Match 1, Match 2, etc.) based on bracket order
    const matchNumberMap = new Map<string, number>();
    let counter = 1;
    ['winners', 'losers', 'grand_final'].forEach(sec => {
        const matchesInSection = matches.filter(m => (m.bracket_type === sec) || (!m.bracket_type && sec === 'winners'));
        matchesInSection.sort((a,b) => {
            // Sort by round then by match_order
            if (a.round !== b.round) return a.round - b.round;
            return a.match_order - b.match_order;
        });
        matchesInSection.forEach(m => {
            matchNumberMap.set(m.id, counter++);
        });
    });

    const allMatchesWithNumbers = matches; // Reference for all lookups

    if (!hasDE) {
        // Find single elimination root (or grand_final)
        const rootMatch = matches.find(m => m.next_match_id === null) || matches[matches.length - 1];
        if (!rootMatch) return <div className="text-red-500">Error: Invalid bracket structure.</div>;
        return (
            <div className="overflow-x-auto py-12 px-6 bg-[#0a0a0c] rounded-3xl border border-white/5 custom-scrollbar">
                <div className="inline-block min-w-max">
                    <BracketNode match={rootMatch} allMatches={matches} matchNumberMap={matchNumberMap} />
                </div>
            </div>
        );
    }

    // Double Elimination render
    const winnersMatches = matches.filter(m => m.bracket_type === 'winners' || !m.bracket_type);
    const losersMatches = matches.filter(m => m.bracket_type === 'losers');
    const grandFinals = matches.filter(m => m.bracket_type === 'grand_final');

    const winnersRoot = winnersMatches.find(m => m.next_match_id === null || grandFinals.some(gf => gf.id === m.next_match_id)) || winnersMatches[winnersMatches.length - 1];
    const losersRoot = losersMatches.find(m => m.next_match_id === null || grandFinals.some(gf => gf.id === m.next_match_id)) || losersMatches[losersMatches.length - 1];
    const gfRoot = grandFinals.find(m => m.next_match_id === null) || grandFinals[grandFinals.length - 1];

    return (
        <div className="overflow-x-auto py-12 px-6 bg-dark-950 rounded-3xl border border-white/5 custom-scrollbar space-y-20">
            
            {/* Winners Bracket */}
            {winnersRoot && (
                <div className="bg-dark-900/30 p-8 rounded-3xl border border-white/5">
                    <h3 className="text-white font-black uppercase tracking-widest text-lg mb-12 flex items-center gap-3">
                        <div className="w-2 h-8 rounded-full bg-brand" /> Winners Bracket
                    </h3>
                    <div className="inline-block min-w-max">
                        <BracketNode match={winnersRoot} allMatches={matches} matchNumberMap={matchNumberMap} isDE={hasDE} />
                    </div>
                </div>
            )}

            {/* Losers Bracket */}
            {losersRoot && (
                <div className="bg-dark-900/30 p-8 rounded-3xl border border-white/5">
                    <h3 className="text-white font-black uppercase tracking-widest text-lg mb-12 flex items-center gap-3">
                        <div className="w-2 h-8 rounded-full bg-maroon" /> Losers Bracket
                    </h3>
                    <div className="inline-block min-w-max">
                        {/* Check if Round 1 has multiple separate match chains (often the case in DE) */}
                        <div className="flex flex-col gap-12">
                            {matches.filter(m => m.bracket_type === 'losers' && m.next_match_id === losersRoot.id).length > 1 ? (
                                <div className="flex flex-col gap-8">
                                    <BracketNode match={losersRoot} allMatches={matches} matchNumberMap={matchNumberMap} isDE={hasDE} />
                                </div>
                            ) : (
                                <BracketNode match={losersRoot} allMatches={matches} matchNumberMap={matchNumberMap} isDE={hasDE} />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Grand Final Bracket */}
            {gfRoot && (
                <div className="bg-gradient-to-r from-dark-900/30 to-brand/5 p-8 rounded-3xl border border-gold/20 shadow-[0_0_100px_rgba(245,142,28,0.05)]">
                    <h3 className="text-gold font-black uppercase tracking-widest text-lg mb-12 flex items-center gap-3">
                        <div className="w-2 h-8 rounded-full bg-gold" /> Grand Finals
                    </h3>
                    <div className="inline-block min-w-max relative z-20">
                        <BracketNode match={gfRoot} allMatches={matches} matchNumberMap={matchNumberMap} isDE={hasDE} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TournamentBracket;
