import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ChevronUp, ChevronDown, TrendingUp, Loader2 } from 'lucide-react';
import type { Ranking } from '../types/database';

interface RankingSectionProps {
    gameType: 'darts' | 'chess' | 'billiards';
    title?: string;
    showTabs?: boolean;
}

const RankingSection: React.FC<RankingSectionProps> = ({ gameType, title = "Hall of Fame", showTabs = true }) => {
    const [rankings, setRankings] = useState<Ranking[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'individual' | 'corporate'>('individual');

    useEffect(() => {
        if (gameType === 'billiards') {
            setActiveTab('individual');
        } else if (gameType === 'darts') {
            setActiveTab('corporate');
        }
        fetchRankings();
    }, [gameType]);

    const fetchRankings = async () => {
        setLoading(true);
        try {
            const { data, error } = await (supabase.from('rankings') as any)
                .select('*')
                .eq('game_type', gameType)
                .order('rank', { ascending: true });

            if (error) throw error;
            setRankings(data || []);
        } catch (err) {
            console.error('Error fetching rankings:', err);
        } finally {
            setLoading(false);
        }
    };

    const individualRankings = gameType === 'billiards'
        ? rankings
        : rankings.filter(r => !r.company);
    const corporateRankings = rankings.filter(r => r.company);

    const displayData = activeTab === 'individual' ? individualRankings : corporateRankings;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 size={32} className="animate-spin text-brand" />
            </div>
        );
    }

    const showCorporateTab = showTabs && gameType !== 'billiards' && gameType !== 'darts';

    return (
        <div className="bg-dark-800 rounded-3xl border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            {/* Header / Tabs */}
            {showCorporateTab ? (
                <div className="flex border-b border-white/5">
                    <button
                        onClick={() => setActiveTab('individual')}
                        className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'individual' ? 'bg-dark-700 text-brand' : 'text-gray-500 hover:text-white hover:bg-dark-700/50'}`}
                    >
                        {title}
                    </button>
                    <button
                        onClick={() => setActiveTab('corporate')}
                        className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'corporate' ? 'bg-dark-700 text-brand' : 'text-gray-500 hover:text-white hover:bg-dark-700/50'}`}
                    >
                        Corporate Rivalry
                    </button>
                </div>
            ) : (
                <div className="p-6 border-b border-white/5">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                        <Trophy className="text-brand" size={20} /> {title}
                    </h3>
                </div>
            )}

            {/* List */}
            <div className="p-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-3"
                    >
                        {displayData.length === 0 ? (
                            <div className="py-8 text-center text-gray-500 text-sm italic">
                                No rankings available yet.
                            </div>
                        ) : (
                            displayData.map((player) => (
                                <div key={player.id} className="flex items-center p-4 bg-dark-900 rounded-xl border border-white/5 hover:border-brand/30 transition-colors">
                                    <div className="w-8 font-black text-gray-500 flex items-center justify-center">
                                        {player.rank === 1 ? <Trophy size={20} className="text-gold" /> : `#${player.rank}`}
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <p className="text-white font-bold uppercase tracking-wider text-sm">{player.player_name}</p>
                                        {player.company && <p className="text-xs text-gray-500 uppercase tracking-widest">{player.company}</p>}
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono text-brand font-black text-lg">{player.score.toLocaleString()}</p>
                                    </div>
                                    <div className="ml-4 w-6 flex justify-end text-xs">
                                        {player.trend === 'up' && <ChevronUp className="text-green-500" />}
                                        {player.trend === 'down' && <ChevronDown className="text-red-500" />}
                                        {player.trend === 'same' && <TrendingUp className="text-gray-600 scale-75 opacity-50" />}
                                    </div>
                                </div>
                            ))
                        )}

                        <div className="pt-4 text-center">
                            <span className="text-[10px] text-gray-600 uppercase tracking-widest">Resets at end of month</span>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default RankingSection;
