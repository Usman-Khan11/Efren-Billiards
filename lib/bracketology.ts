import { supabase } from './supabase';
import type { Match, TournamentFormat } from '../types/database';

export const getSeedOrder = (rounds: number): number[] => {
    let seeds = [1, 2];
    for (let r = 2; r <= rounds; r++) {
        const nextSeeds: number[] = [];
        const sum = Math.pow(2, r) + 1;
        for (const seed of seeds) {
            nextSeeds.push(seed);
            nextSeeds.push(sum - seed);
        }
        seeds = nextSeeds;
    }
    return seeds;
};

export const generateTournamentStructure = (
    tournamentId: string, 
    format: TournamentFormat, 
    participantCount: number
): Partial<Match>[] => {
    const rounds = Math.max(1, Math.ceil(Math.log2(participantCount)));
    const allMatches: Partial<Match>[] = [];

    // 1. CREATE WINNERS BRACKET
    const wbMatchesByRound: any[][] = [];
    let wbNextMatches: any[] = [];
    
    for (let r = rounds; r >= 1; r--) {
        const matchesInRound = Math.pow(2, rounds - r);
        const currentRound = [];
        
        for (let i = 0; i < matchesInRound; i++) {
            const nextMatchIndex = Math.floor(i / 2);
            const parentMatchId = r < rounds ? wbNextMatches[nextMatchIndex].id : null;
            
            const match = {
                id: crypto.randomUUID(),
                tournament_id: tournamentId,
                round: r,
                match_order: i,
                status: 'pending' as const,
                next_match_id: parentMatchId,
                bracket_type: 'winners' as const
            };
            currentRound.push(match);
            allMatches.push(match);
        }
        wbMatchesByRound.unshift(currentRound); 
        wbNextMatches = currentRound;
    }

    if (format === 'single_elimination') {
        return allMatches;
    }

    // 2. CREATE LOSERS BRACKET
    const lbMatchesByRound: any[][] = [];
    const lbRoundCount = rounds * 2 - 2;
    let lbNextMatches: any[] = [];
    const size = Math.pow(2, rounds);
    let currentLbSize = size / 4; 
    let isMinor = lbRoundCount % 2 === 0 ? false : true;

    for (let r = lbRoundCount; r >= 1; r--) {
        const currentRound = [];
        for (let i = 0; i < currentLbSize; i++) {
            const parentMatchIndex = isMinor ? i : Math.floor(i / 2);
            const parentMatchId = r < lbRoundCount ? lbNextMatches[parentMatchIndex].id : null;

            const match = {
                id: crypto.randomUUID(),
                tournament_id: tournamentId,
                round: r,
                match_order: i,
                status: 'pending' as const,
                next_match_id: parentMatchId,
                bracket_type: 'losers' as const
            };
            currentRound.push(match);
            allMatches.push(match);
        }
        lbMatchesByRound.unshift(currentRound);
        lbNextMatches = currentRound;
        
        if (isMinor) currentLbSize *= 2;
        isMinor = !isMinor;
    }

    // 3. CREATE GRAND FINAL
    const gf1 = {
        id: crypto.randomUUID(),
        tournament_id: tournamentId, round: 1, match_order: 0, status: 'pending' as const, bracket_type: 'grand_final' as const
    };
    allMatches.push(gf1);

    // Link WB Final and LB Final to Grand Final
    const wbFinal = wbMatchesByRound[rounds - 1][0];
    const lbFinal = lbMatchesByRound[lbRoundCount - 1][0];
    wbFinal.next_match_id = gf1.id;
    lbFinal.next_match_id = gf1.id;

    // 4. MAP LOSER DROPS FROM WB TO LB
    for (let wR = 0; wR < rounds - 1; wR++) {
        const wbRoundMatches = wbMatchesByRound[wR];
        const targetLbRnd = wR === 0 ? 0 : wR * 2 - 1;
        const isFlip = wR > 0 && wR % 2 !== 0; // Flip on minor rounds to avoid rematches
        
        const targetLbMatches = lbMatchesByRound[targetLbRnd];
        
        for (let i = 0; i < wbRoundMatches.length; i++) {
            const wMatch = wbRoundMatches[i];
            const targetLbMatchIndex = wR === 0 ? Math.floor(i / 2) : (isFlip ? (wbRoundMatches.length - 1 - i) : i);
            wMatch.loser_next_match_id = targetLbMatches[targetLbMatchIndex].id;
        }
    }
    
    // WB Final loser drops to LB Final
    wbFinal.loser_next_match_id = lbFinal.id;

    return allMatches;
};
