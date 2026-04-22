import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from './ui/Toast';
import { Loader2, ArrowLeft, Trash2, UserPlus, Search, Trophy, Users } from 'lucide-react';
import type { Tournament, Profile, Registration } from '../types/database';
import BracketEditor from './admin/BracketEditor';

interface Props {
    tournament: Tournament;
    onBack: () => void;
    initialTab?: 'participants' | 'bracket';
}

const AdminTournamentParticipants: React.FC<Props> = ({ tournament, onBack, initialTab = 'participants' }) => {
    const { showToast, ToastContainer } = useToast();
    const [activeTab, setActiveTab] = useState<'participants' | 'bracket'>(initialTab);
    const [registrations, setRegistrations] = useState<(Registration & { profiles: Profile })[]>([]);
    const [availablePlayers, setAvailablePlayers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [addingPlayerId, setAddingPlayerId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, [tournament.id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch current registrations with player details
            const { data: regData, error: regError } = await (supabase.from('registrations') as any)
                .select(`
                    *,
                    profiles (*)
                `)
                .eq('tournament_id', tournament.id);

            if (regError) throw regError;
            
            // Type assertion since we know the join structure
            const typedRegData = (regData as any[]) || [];
            setRegistrations(typedRegData);

            // Fetch all players to find available ones
            const { data: playersData, error: playersError } = await (supabase.from('profiles') as any)
                .select('*')
                .neq('tier', 'Admin')
                .order('full_name', { ascending: true });

            if (playersError) throw playersError;

            // Filter out players already registered
            const registeredPlayerIds = new Set(typedRegData.map(r => r.user_id));
            const available = (playersData || []).filter(p => !registeredPlayerIds.has(p.id));
            setAvailablePlayers(available);

        } catch (err: any) {
            console.error('Error fetching participants:', err);
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddParticipant = async (playerId: string) => {
        setAddingPlayerId(playerId);
        try {
            const { error } = await (supabase.from('registrations') as any)
                .insert([{
                    tournament_id: tournament.id,
                    user_id: playerId
                }]);

            if (error) throw error;
            showToast('Player added to tournament', 'success');
            fetchData();
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setAddingPlayerId(null);
        }
    };

    const handleRemoveParticipant = async (registrationId: string) => {
        if (!confirm('Remove this player from the tournament?')) return;
        
        try {
            const { error } = await (supabase.from('registrations') as any)
                .delete()
                .eq('id', registrationId);

            if (error) throw error;
            showToast('Player removed', 'success');
            fetchData();
        } catch (err: any) {
            showToast(err.message, 'error');
        }
    };

    const filteredAvailablePlayers = availablePlayers.filter(p => 
        (p.full_name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
            <ToastContainer />
            
            <div className="flex items-center gap-4">
                <button 
                    onClick={onBack}
                    className="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-400 hover:text-white"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
                        {tournament.name}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage tournament participants</p>
                </div>
            </div>

            <div className="flex gap-2 border-b border-white/10 pb-1">
                <button
                    onClick={() => setActiveTab('participants')}
                    className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-t-lg transition-colors ${activeTab === 'participants' ? 'bg-white/10 text-white border-b-2 border-brand' : 'text-gray-500 hover:text-white'}`}
                >
                    <div className="flex items-center gap-2">
                        <Users size={16} />
                        Participants
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('bracket')}
                    className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-t-lg transition-colors ${activeTab === 'bracket' ? 'bg-white/10 text-white border-b-2 border-brand' : 'text-gray-500 hover:text-white'}`}
                >
                    <div className="flex items-center gap-2">
                        <Trophy size={16} />
                        Bracket Editor
                        <span className="ml-1 px-1.5 py-0.5 bg-brand/20 text-brand text-[8px] font-black rounded-full border border-brand/30">BETA</span>
                    </div>
                </button>
            </div>

            {activeTab === 'bracket' ? (
                <BracketEditor tournament={tournament} />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Current Participants */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center justify-between">
                        Registered Players
                        <span className="bg-brand/20 text-brand px-2 py-1 rounded-lg text-xs">
                            {registrations.length} Total
                        </span>
                    </h2>

                    <div className="rounded-3xl border border-white/5 bg-white/[0.01] overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/[0.02] border-b border-white/5">
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Player</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Rank</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    [1, 2, 3].map(i => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={3} className="px-6 py-6 bg-white/[0.01]" />
                                        </tr>
                                    ))
                                ) : registrations.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-12 text-center text-gray-500 text-sm">
                                            No players registered yet.
                                        </td>
                                    </tr>
                                ) : (
                                    registrations.map(reg => (
                                        <tr key={reg.id} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center font-bold text-brand text-xs overflow-hidden">
                                                        {reg.profiles?.avatar_url ? <img src={reg.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : reg.profiles?.full_name?.charAt(0) || '?'}
                                                    </div>
                                                    <p className="text-sm font-bold text-white">{reg.profiles?.full_name || 'Unknown'}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gold font-bold">
                                                {reg.profiles?.tier || 'Guest'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleRemoveParticipant(reg.id)}
                                                    className="p-2 hover:text-red-400 transition-all bg-white/5 hover:bg-red-500/10 rounded-lg text-gray-400"
                                                    title="Remove Player"
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
                </div>

                {/* Right Column: Add Participants */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-white uppercase tracking-wider">Add Players</h2>
                    
                    <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 space-y-4">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input 
                                type="text"
                                placeholder="Search players..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-brand/40"
                            />
                        </div>

                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {filteredAvailablePlayers.length === 0 ? (
                                <p className="text-center text-gray-500 text-sm py-4">No available players found.</p>
                            ) : (
                                filteredAvailablePlayers.map(player => (
                                    <div key={player.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-gray-400 overflow-hidden">
                                                {player.avatar_url ? <img src={player.avatar_url} alt="" className="w-full h-full object-cover" /> : player.full_name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{player.full_name || 'Unknown'}</p>
                                                <p className="text-[10px] text-gold font-bold">Tier: {player.tier}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleAddParticipant(player.id)}
                                            disabled={addingPlayerId === player.id}
                                            className="p-2 bg-brand/10 text-brand hover:bg-brand hover:text-white rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {addingPlayerId === player.id ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
                </div>
            )}
        </div>
    );
};

export default AdminTournamentParticipants;
