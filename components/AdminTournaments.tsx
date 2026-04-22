import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from './ui/Toast';
import { Loader2, Plus, Trophy, Users } from 'lucide-react';
import type { Tournament, TournamentCategory, TournamentStatus } from '../types/database';
import AdminTournamentParticipants from './AdminTournamentParticipants';
import AdminTournamentList from './admin/AdminTournamentList';

const AdminTournaments: React.FC = () => {
    const { showToast, ToastContainer } = useToast();
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
    const [initialTab, setInitialTab] = useState<'participants' | 'bracket'>('participants');

    // Parse deep link params once on mount
    useEffect(() => {
        const hash = window.location.hash;
        if (hash.includes('tournamentId=')) {
            const params = new URLSearchParams(hash.split('?')[1]);
            const maybeTab = params.get('tab');
            if (maybeTab === 'bracket') {
                setInitialTab('bracket');
            }
        }
    }, []);

    // Form State
    const [formData, setFormData] = useState<{
        name: string;
        game_type: TournamentCategory;
        status: TournamentStatus;
        format: 'single_elimination' | 'double_elimination';
        start_date: string;
        description: string;
        prize_amount: string;
    }>({
        name: '',
        game_type: 'billiards',
        status: 'pending',
        format: 'single_elimination',
        start_date: '',
        description: '',
        prize_amount: '',
    });

    useEffect(() => {
        fetchTournaments();
    }, []);

    const fetchTournaments = async () => {
        setLoading(true);
        try {
            const { data, error } = await (supabase.from('tournaments') as any)
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            const dataList = (data as Tournament[]) || [];
            setTournaments(dataList);

            // Handle deep linking to a specific tournament
            const hash = window.location.hash;
            if (hash.includes('tournamentId=')) {
                const params = new URLSearchParams(hash.split('?')[1]);
                const tId = params.get('tournamentId');
                if (tId) {
                    const found = dataList.find(t => t.id === tId);
                    if (found) setSelectedTournament(found);
                }
            }
        } catch (err: any) {
            console.error('Error fetching tournaments:', err);
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenForm = () => {
        setFormData({
            name: '',
            game_type: 'billiards',
            status: 'pending',
            format: 'single_elimination',
            start_date: '',
            description: '',
            prize_amount: '',
        });
        setShowForm(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const parsedPrize = formData.prize_amount ? parseFloat(formData.prize_amount) : null;
            const payload = {
                name: formData.name,
                game_type: formData.game_type,
                status: formData.status,
                format: formData.format,
                start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
                description: formData.description || null,
                prize_amount: parsedPrize,
            };

            const { error } = await (supabase.from('tournaments') as any).insert([payload]);
            if (error) throw error;
            showToast('Tournament created successfully', 'success');

            setShowForm(false);
            fetchTournaments();
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (selectedTournament) {
        return (
            <AdminTournamentParticipants 
                tournament={selectedTournament} 
                onBack={() => {
                    setSelectedTournament(null);
                    // Clear deep link from hash when backing out
                    window.location.hash = '#admin-cms?module=tournaments';
                }} 
                initialTab={initialTab}
            />
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
            <ToastContainer />
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Tournaments</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage events, drag to reorder, inline edit.</p>
                </div>
                {!showForm && (
                    <button
                        onClick={handleOpenForm}
                        className="flex items-center gap-2 px-6 py-2.5 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand/90 transition-all shadow-lg shadow-brand/20"
                    >
                        <Plus size={18} />
                        Create
                    </button>
                )}
            </div>

            {showForm ? (
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                    <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">New Tournament</h2>
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Tournament Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand/40"
                                    placeholder="e.g. Summer 8-Ball Classic"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Game Type</label>
                                <select
                                    value={formData.game_type}
                                    onChange={e => setFormData({ ...formData, game_type: e.target.value as TournamentCategory })}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand/40 appearance-none"
                                >
                                    <option className="bg-[#0a0a0c] text-white" value="billiards">Billiards</option>
                                    <option className="bg-[#0a0a0c] text-white" value="darts">Darts</option>
                                    <option className="bg-[#0a0a0c] text-white" value="chess">Chess</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Format</label>
                                <select
                                    value={formData.format}
                                    onChange={e => setFormData({ ...formData, format: e.target.value as 'single_elimination' | 'double_elimination' })}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand/40 appearance-none"
                                >
                                    <option className="bg-[#0a0a0c] text-white" value="single_elimination">Single Elimination</option>
                                    <option className="bg-[#0a0a0c] text-white" value="double_elimination">Double Elimination</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as TournamentStatus })}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand/40 appearance-none"
                                >
                                    <option className="bg-[#0a0a0c] text-white" value="pending">Pending (Accepting Registrations)</option>
                                    <option className="bg-[#0a0a0c] text-white" value="in_progress">In Progress</option>
                                    <option className="bg-[#0a0a0c] text-white" value="completed">Completed</option>
                                </select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Start Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={formData.start_date}
                                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                    min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand/40 [color-scheme:dark]"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Description (Optional)</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand/40 min-h-[100px]"
                                    placeholder="Enter tournament details, rules, or schedule..."
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Prize Amount (QAR) (Optional)</label>
                                <input
                                    type="number"
                                    value={formData.prize_amount}
                                    onChange={e => setFormData({ ...formData, prize_amount: e.target.value })}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand/40"
                                    placeholder="e.g. 1000"
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
                                Save Tournament
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
                <div className="mt-8">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 size={24} className="animate-spin text-brand" />
                        </div>
                    ) : tournaments.length === 0 ? (
                        <div className="text-center py-12 text-zinc-500 border border-zinc-800 rounded-2xl border-dashed">
                            No tournaments found. Create one to get started.
                        </div>
                    ) : (
                        <AdminTournamentList 
                            initialTournaments={tournaments} 
                            onTournamentsChange={setTournaments} 
                            onSelectTournament={setSelectedTournament}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminTournaments;
