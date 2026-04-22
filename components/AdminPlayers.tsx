import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from './ui/Toast';
import { Loader2, Plus, Edit2, Trash2, User } from 'lucide-react';
import type { Player } from '../types/database';

const AdminPlayers: React.FC = () => {
    const { showToast, ToastContainer } = useToast();
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<{
        name: string;
        rating: number;
        wins: number;
        losses: number;
    }>({
        name: '',
        rating: 1500,
        wins: 0,
        losses: 0
    });

    useEffect(() => {
        fetchPlayers();
    }, []);

    const fetchPlayers = async () => {
        setLoading(true);
        try {
            const { data: profilesData, error: profilesError } = await (supabase.from('profiles') as any)
                .select('*')
                .order('full_name', { ascending: true });

            if (profilesError) throw profilesError;

            const { data: playersData, error: playersError } = await (supabase.from('players') as any)
                .select('id, wins, losses, rating');

            if (playersError) {
                console.warn('Could not fetch players for stats:', playersError);
            }

            const playersMap = new Map<string, any>((playersData || []).map((p: any) => [p.id, p]));

            const merged = (profilesData || []).map((profile: any) => ({
                id: profile.id,
                name: profile.full_name || 'Unknown',
                avatar_url: profile.avatar_url,
                rating: playersMap.get(profile.id)?.rating || 1500,
                wins: playersMap.get(profile.id)?.wins || 0,
                losses: playersMap.get(profile.id)?.losses || 0,
                created_at: profile.created_at,
                is_manual: profile.is_manual || false
            }));

            setPlayers(merged);
        } catch (err: any) {
            console.error('Error fetching players:', err);
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenForm = (player?: Player & { is_manual?: boolean }) => {
        if (player) {
            setEditingId(player.id);
            setFormData({
                name: player.name || '',
                rating: player.rating || 1500,
                wins: player.wins || 0,
                losses: player.losses || 0
            });
        } else {
            setEditingId(null);
            setFormData({
                name: '',
                rating: 1500,
                wins: 0,
                losses: 0
            });
        }
        setShowForm(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingId) {
                // Update profile name
                await (supabase.from('profiles') as any).update({ full_name: formData.name }).eq('id', editingId);
                
                // Update or insert player stats
                const { data: existingPlayer } = await (supabase.from('players') as any).select('id').eq('id', editingId).maybeSingle();
                if (existingPlayer) {
                    await (supabase.from('players') as any).update({
                        name: formData.name,
                        rating: formData.rating,
                        wins: formData.wins,
                        losses: formData.losses
                    }).eq('id', editingId);
                } else {
                    await (supabase.from('players') as any).insert([{
                        id: editingId,
                        name: formData.name,
                        rating: formData.rating,
                        wins: formData.wins,
                        losses: formData.losses
                    }]);
                }
                showToast('Player updated successfully', 'success');
            } else {
                // Create new manual player
                const newId = crypto.randomUUID();
                
                // Insert into profiles
                const { error: profileError } = await (supabase.from('profiles') as any).insert([{
                    id: newId,
                    full_name: formData.name,
                    is_manual: true,
                    tier: 'Player'
                }]);
                if (profileError) throw profileError;

                // Insert into players
                const { error: playerError } = await (supabase.from('players') as any).insert([{
                    id: newId,
                    name: formData.name,
                    rating: formData.rating,
                    wins: formData.wins,
                    losses: formData.losses
                }]);
                if (playerError) throw playerError;

                showToast('Player created successfully', 'success');
            }

            setShowForm(false);
            fetchPlayers();
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string, is_manual: boolean) => {
        if (!confirm('Are you sure you want to delete this player?')) return;
        try {
            if (is_manual) {
                // Delete from profiles (will cascade to registrations if foreign key is set up)
                const { error: profileError } = await (supabase.from('profiles') as any).delete().eq('id', id);
                if (profileError) throw profileError;
            }
            
            // Delete from players
            await (supabase.from('players') as any).delete().eq('id', id);
            
            showToast('Player deleted', 'success');
            fetchPlayers();
        } catch (err: any) {
            showToast(err.message, 'error');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
            <ToastContainer />
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Players</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage tournament players and their stats.</p>
                </div>
            </div>

            {showForm ? (
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                    <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">{editingId ? 'Edit Player' : 'New Player'}</h2>
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand/40"
                                    placeholder="e.g. Efren Reyes"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Rating (Elo)</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.rating}
                                    onChange={e => setFormData({ ...formData, rating: parseInt(e.target.value) || 1500 })}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand/40"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Wins</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.wins}
                                    onChange={e => setFormData({ ...formData, wins: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand/40"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Losses</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.losses}
                                    onChange={e => setFormData({ ...formData, losses: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand/40"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-white/10">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-6 py-2.5 bg-brand text-white font-bold rounded-xl hover:bg-brand/90 flex items-center gap-2 disabled:opacity-50"
                            >
                                {submitting && <Loader2 size={16} className="animate-spin" />}
                                Save Player
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                disabled={submitting}
                                className="px-6 py-2.5 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="rounded-3xl border border-white/5 bg-white/[0.01] overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Player</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Rank</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Record (W-L)</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={4} className="px-6 py-8 bg-white/[0.01]" />
                                    </tr>
                                ))
                            ) : players.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 text-sm">
                                        No players found.
                                    </td>
                                </tr>
                            ) : (
                                players.map(p => (
                                    <tr key={p.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center font-bold text-brand overflow-hidden">
                                                    {p.avatar_url ? <img src={p.avatar_url} alt="" className="w-full h-full object-cover" /> : <User size={18} />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">{p.name || 'Unknown'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-gold font-bold">
                                            {p.rating}
                                        </td>
                                        <td className="px-6 py-5 text-sm text-gray-400">
                                            <span className="text-emerald-400">{p.wins || 0}</span> - <span className="text-red-400">{p.losses || 0}</span>
                                        </td>
                                        <td className="px-6 py-5 text-right flex items-center justify-end gap-2 text-gray-400">
                                            <button
                                                onClick={() => handleOpenForm(p)}
                                                className="p-2 hover:text-white transition-all bg-white/5 hover:bg-white/10 rounded-lg"
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(p.id, (p as any).is_manual)}
                                                className="p-2 hover:text-red-400 transition-all bg-white/5 hover:bg-red-500/10 rounded-lg"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminPlayers;
