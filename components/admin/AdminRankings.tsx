import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/Toast';
import { Loader2, Plus, Trash2, Save, Trophy, ChevronUp, ChevronDown, TrendingUp, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { Ranking, TournamentCategory as GameType } from '../../types/database';

type Trend = 'up' | 'down' | 'same';

interface PlayerProfile {
    id: string;
    full_name: string;
}

const AdminRankings: React.FC = () => {
    const { profile } = useAuth();
    const { showToast, ToastContainer } = useToast();
    const [rankings, setRankings] = useState<Ranking[]>([]);
    const [profiles, setProfiles] = useState<PlayerProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeGameType, setActiveGameType] = useState<GameType>('billiards');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch rankings
            const { data: rankData, error: rankError } = await supabase.from('rankings')
                .select('*')
                .order('rank', { ascending: true });

            if (rankError) throw rankError;
            setRankings(rankData || []);

            // Fetch profiles
            const { data: profData, error: profError } = await (supabase.from('profiles') as any)
                .select('id, full_name')
                .order('full_name', { ascending: true });

            if (profError) throw profError;
            setProfiles(profData || []);
        } catch (err: any) {
            console.error('Error fetching data:', err);
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddRow = () => {
        const newRow: Ranking = {
            id: crypto.randomUUID(),
            game_type: activeGameType,
            rank: rankings.filter(r => r.game_type === activeGameType).length + 1,
            player_name: '',
            user_id: null,
            score: 0,
            trend: 'same',
            company: ''
        };
        setRankings([...rankings, newRow]);
    };

    const handleRemoveRow = async (id: string) => {
        try {
            const { error } = await (supabase.from('rankings') as any)
                .delete()
                .eq('id', id);

            if (error) {
                setRankings(rankings.filter(r => r.id !== id));
            } else {
                setRankings(rankings.filter(r => r.id !== id));
                showToast('Player removed from rankings', 'success');
            }
        } catch (err: any) {
            setRankings(rankings.filter(r => r.id !== id));
        }
    };

    const handleUpdateRow = (id: string, field: keyof Ranking, value: any) => {
        if (field === 'user_id') {
            const selectedProfile = profiles.find(p => p.id === value);
            setRankings(rankings.map(r => r.id === id ? {
                ...r,
                user_id: value,
                player_name: selectedProfile?.full_name || r.player_name
            } : r));
        } else {
            setRankings(rankings.map(r => r.id === id ? { ...r, [field]: value } : r));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Filter out empty names or missing user_ids
            const validRankings = rankings.filter(r => r.player_name.trim() !== '');

            if (validRankings.length < rankings.length) {
                showToast('Some rows were skipped because no registered player was selected.', 'info');
            }

            const { error } = await (supabase.from('rankings') as any)
                .upsert(validRankings.map(({ id, ...rest }) => ({ id, ...rest })));

            if (error) throw error;
            showToast('Rankings updated successfully!', 'success');
            fetchData();
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const filteredRankings = rankings.filter(r => r.game_type === activeGameType);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-brand" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ToastContainer />
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Game Rankings</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage player leaderboards for Billiards, Darts, and Chess.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleAddRow}
                        className="flex items-center gap-2 px-6 py-2.5 bg-white/5 text-white rounded-xl text-sm font-bold hover:bg-white/10 transition-all border border-white/10"
                    >
                        <Plus size={18} />
                        Add Player
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand/90 transition-all shadow-lg shadow-brand/20 disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Save All
                    </button>
                </div>
            </div>

            {/* Game Type Tabs */}
            <div className="flex gap-2 p-1 bg-white/5 rounded-2xl w-fit">
                {(['billiards', 'darts', 'chess'] as GameType[]).map((type) => (
                    <button
                        key={type}
                        onClick={() => setActiveGameType(type)}
                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeGameType === type ? 'bg-brand text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                    >
                        {type}
                    </button>
                ))}
            </div>

            <div className="rounded-3xl border border-white/5 bg-white/[0.01] overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white/[0.02] border-b border-white/5">
                            <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest w-20">Rank</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Player Name</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Score / Rating</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Trend</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Company (Optional)</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredRankings.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic text-sm">
                                    No rankings found for {activeGameType}. Click "Add Player" to start.
                                </td>
                            </tr>
                        ) : (
                            filteredRankings.map((ranking) => (
                                <tr key={ranking.id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4">
                                        <input
                                            type="number"
                                            value={ranking.rank}
                                            onChange={e => handleUpdateRow(ranking.id, 'rank', parseInt(e.target.value))}
                                            className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-brand/50"
                                        />
                                    </td>
                                    <td className="px-6 py-4 space-y-2">
                                        <select
                                            value={ranking.user_id || ''}
                                            onChange={e => handleUpdateRow(ranking.id, 'user_id', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white font-bold text-xs focus:outline-none focus:border-brand/50 appearance-none"
                                        >
                                            <option value="">-- Manual Entry / No Link --</option>
                                            {profiles.map(p => (
                                                <option key={p.id} value={p.id} className="bg-dark-900">
                                                    {p.full_name}
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="text"
                                            value={ranking.player_name}
                                            onChange={e => handleUpdateRow(ranking.id, 'player_name', e.target.value)}
                                            placeholder="Enter Player Name"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-brand/50"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="number"
                                            value={ranking.score}
                                            onChange={e => handleUpdateRow(ranking.id, 'score', parseInt(e.target.value))}
                                            className="w-32 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-brand font-mono font-black text-sm focus:outline-none focus:border-brand/50"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            {(['up', 'down', 'same'] as Trend[]).map((t) => (
                                                <button
                                                    key={t}
                                                    onClick={() => handleUpdateRow(ranking.id, 'trend', t)}
                                                    className={`p-2 rounded-lg border transition-all ${ranking.trend === t ? 'bg-brand/20 border-brand text-brand' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'}`}
                                                >
                                                    {t === 'up' && <ChevronUp size={16} />}
                                                    {t === 'down' && <ChevronDown size={16} />}
                                                    {t === 'same' && <TrendingUp size={16} />}
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="text"
                                            value={ranking.company || ''}
                                            onChange={e => handleUpdateRow(ranking.id, 'company', e.target.value)}
                                            placeholder="e.g. Qatar Airways"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-gray-400 text-xs focus:outline-none focus:border-brand/50"
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleRemoveRow(ranking.id)}
                                            className="p-2 text-gray-500 hover:text-red-500 transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminRankings;
