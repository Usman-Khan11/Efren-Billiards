import React, { useState, useEffect } from 'react';
import { useTournamentsByGameType, useTournamentData } from '../hooks/useTournaments';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import TournamentBracket from './TournamentBracket';
import Button from './ui/Button';
import AuthModal from './auth/AuthModal';
import TournamentSuccessOverlay from './TournamentSuccessOverlay';
import { Trophy, Users, Calendar, UserPlus, UserMinus, CheckCircle, Loader2, X, ChevronDown, ChevronUp } from 'lucide-react';
import type { Tournament } from '../types/database';

interface GameTournamentSectionProps {
    gameType: 'billiards' | 'darts' | 'chess';
}

const TournamentInstance: React.FC<{ tournament: Tournament; user: any; profile: any; refreshProfile: () => Promise<void>; setIsAuthModalOpen: (open: boolean) => void }> = ({ tournament, user, profile, refreshProfile, setIsAuthModalOpen }) => {
    const { matches, participants, loading: dataLoading } = useTournamentData(tournament.id);
    const [registering, setRegistering] = useState(false);
    const [registered, setRegistered] = useState(false);
    const [regError, setRegError] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(tournament.status !== 'completed');

    // Profile Onboarding State
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profileData, setProfileData] = useState({ full_name: '', phone: '' });
    const [savingProfile, setSavingProfile] = useState(false);
    const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

    useEffect(() => {
        if (!user || !tournament) return;
        const checkRegistration = async () => {
            const { data } = await (supabase.from('registrations') as any)
                .select('id')
                .eq('tournament_id', tournament.id)
                .eq('user_id', user.id)
                .maybeSingle();
            if (data) setRegistered(true);
            else setRegistered(false);
        };
        checkRegistration();
    }, [user, tournament]);

    const handleRegisterClick = async () => {
        if (!user || !tournament) return;
        
        if (!profile?.full_name || !profile?.phone) {
            setProfileData({
                full_name: profile?.full_name || '',
                phone: profile?.phone || ''
            });
            setShowProfileModal(true);
            return;
        }

        await processRegistration();
    };

    const processRegistration = async () => {
        if (!user || !tournament) return;
        setRegistering(true);
        setRegError(null);

        try {
            const { error: rErr } = await (supabase.from('registrations') as any).insert({
                tournament_id: tournament.id,
                user_id: user.id,
            });
            if (rErr) {
                if (rErr.code === '23505') {
                    setRegistered(true);
                } else {
                    throw rErr;
                }
            } else {
                setRegistered(true);
                setShowSuccessOverlay(true);
            }
        } catch (err: any) {
            setRegError(err.message || 'Registration failed.');
        } finally {
            setRegistering(false);
        }
    };

    const handleUnregister = async () => {
        if (!user || !tournament) return;
        setRegistering(true);
        setRegError(null);

        try {
            const { error: rErr } = await (supabase.from('registrations') as any)
                .delete()
                .eq('tournament_id', tournament.id)
                .eq('user_id', user.id);
            
            if (rErr) throw rErr;
            setRegistered(false);
        } catch (err: any) {
            setRegError(err.message || 'Unregistration failed.');
        } finally {
            setRegistering(false);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        setSavingProfile(true);
        try {
            const { error } = await (supabase.from('profiles') as any)
                .update({
                    full_name: profileData.full_name,
                    phone: profileData.phone
                })
                .eq('id', user.id);
                
            if (error) throw error;
            
            await refreshProfile();
            setShowProfileModal(false);
            await processRegistration();
        } catch (err: any) {
            setRegError(err.message || 'Failed to save profile.');
        } finally {
            setSavingProfile(false);
        }
    };

    return (
        <div className="bg-dark-800/50 border border-white/10 rounded-3xl overflow-hidden mb-8">
            <TournamentSuccessOverlay 
                isOpen={showSuccessOverlay}
                onClose={() => setShowSuccessOverlay(false)}
                tournamentName={tournament.name}
                gameType={tournament.game_type}
                playerName={profile?.full_name || undefined}
                date={tournament.start_date ? new Date(tournament.start_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : undefined}
            />
            {/* Profile Onboarding Modal */}
            {showProfileModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-dark-800 border border-white/10 rounded-3xl p-6 md:p-10 max-w-md w-full relative shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                        <button onClick={() => setShowProfileModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors bg-dark-900 rounded-full p-2">
                            <X size={20} />
                        </button>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Complete Profile</h3>
                        <p className="text-gray-400 text-sm mb-8">
                            Please provide your name and contact number to complete your registration.
                        </p>
                        <form onSubmit={handleSaveProfile} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    value={profileData.full_name}
                                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                                    className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand outline-none transition-colors"
                                    placeholder="Enter your full name"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Contact Number</label>
                                <input
                                    required
                                    type="tel"
                                    value={profileData.phone}
                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                    className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand outline-none transition-colors"
                                    placeholder="Enter your phone number"
                                />
                            </div>
                            <Button
                                variant="primary"
                                fullWidth
                                type="submit"
                                disabled={savingProfile}
                                className="py-4 text-sm font-black uppercase tracking-widest flex justify-center items-center gap-2"
                            >
                                {savingProfile && <Loader2 size={16} className="animate-spin" />}
                                Save & Register
                            </Button>
                        </form>
                    </div>
                </div>
            )}

            <div 
                className="p-6 md:p-8 cursor-pointer hover:bg-white/5 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            tournament.status === 'pending' ? 'bg-emerald-500/10 text-emerald-400' :
                            tournament.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400' :
                            'bg-zinc-500/10 text-zinc-400'
                        }`}>
                            {tournament.status.replace('_', ' ')}
                        </span>
                        <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                            {tournament.name}
                        </h3>
                    </div>
                    <div className="flex flex-wrap gap-4 text-gray-400 text-xs font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-brand" /> {tournament.start_date ? new Date(tournament.start_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : new Date(tournament.created_at || Date.now()).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                            <Users size={14} className="text-brand" /> {participants.length} Registered
                        </div>
                        {tournament.prize_amount && (
                            <div className="flex items-center gap-2 text-brand">
                                <Trophy size={14} /> QAR {tournament.prize_amount.toLocaleString()}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {isExpanded ? <ChevronUp size={24} className="text-gray-500" /> : <ChevronDown size={24} className="text-gray-500" />}
                </div>
            </div>

            {isExpanded && (
                <div className="p-6 md:p-8 border-t border-white/5 bg-dark-900/30">
                    {tournament.description && (
                        <p className="text-gray-400 max-w-2xl mb-8 text-sm leading-relaxed">
                            {tournament.description}
                        </p>
                    )}

                    <div className="flex flex-col items-center gap-4 mb-12">
                        {tournament.status !== 'completed' && (
                            <div className="flex flex-col items-center gap-2 w-full max-w-xs">
                                {!user ? (
                                    <Button
                                        variant="primary"
                                        fullWidth
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            localStorage.setItem('pendingTournamentRegistration', tournament.id);
                                            setIsAuthModalOpen(true);
                                        }}
                                        className="py-3 uppercase tracking-widest font-black flex items-center justify-center gap-2"
                                    >
                                        <UserPlus size={18} /> Sign In to Register
                                    </Button>
                                ) : registered ? (
                                    <Button
                                        variant="outline"
                                        fullWidth
                                        onClick={(e) => { e.stopPropagation(); handleUnregister(); }}
                                        disabled={registering}
                                        className="py-3 uppercase tracking-widest font-black flex items-center justify-center gap-2 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500"
                                    >
                                        {registering ? <Loader2 size={18} className="animate-spin" /> : <UserMinus size={18} />}
                                        {registering ? 'Processing...' : 'Unregister'}
                                    </Button>
                                ) : (
                                    <Button
                                        variant="primary"
                                        fullWidth
                                        onClick={(e) => { e.stopPropagation(); handleRegisterClick(); }}
                                        disabled={registering}
                                        className="py-3 uppercase tracking-widest font-black flex items-center justify-center gap-2"
                                    >
                                        {registering ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
                                        {registering ? 'Registering...' : 'Register Now'}
                                    </Button>
                                )}
                                {regError && <p className="text-red-500 text-xs mt-2">{regError}</p>}
                            </div>
                        )}
                        {tournament.status === 'completed' && (
                            <div className="flex items-center gap-2 text-gray-500 font-black uppercase tracking-widest text-sm bg-white/5 px-6 py-2 rounded-full border border-white/5">
                                <CheckCircle size={18} /> Tournament Completed
                            </div>
                        )}
                    </div>

                    {dataLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 size={24} className="animate-spin text-brand" />
                        </div>
                    ) : (
                        matches && matches.length > 0 && (
                            <div className="mt-8">
                                <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6 text-center opacity-50">Tournament Bracket</h4>
                                <div className="bg-dark-900/50 rounded-2xl p-6 border border-white/5 overflow-x-auto">
                                    <TournamentBracket matches={matches} />
                                </div>
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
};

const GameTournamentSection: React.FC<GameTournamentSectionProps> = ({ gameType }) => {
    const { tournaments, loading, error } = useTournamentsByGameType(gameType);
    const { user, profile, refreshProfile } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    if (loading) {
        return (
            <div className="py-20 text-center flex flex-col items-center">
                <Loader2 size={32} className="animate-spin text-brand mb-4" />
                <p className="text-brand font-bold uppercase tracking-widest animate-pulse">Syncing Tournaments...</p>
            </div>
        );
    }

    if (error || tournaments.length === 0) {
        return (
            <div className="py-20 border-t border-white/10 bg-dark-800/50">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <span className="text-brand font-bold uppercase tracking-widest text-sm mb-4 block flex items-center justify-center gap-2">
                        <Trophy size={16} /> Tournament Status
                    </span>
                    <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-6">
                        {error ? 'Error Loading Tournaments' : 'No Tournaments Found'}
                    </h2>
                    <p className="text-gray-400 max-w-lg mx-auto mb-8">
                        {error ? error : `There are currently no ${gameType} tournaments recorded. Check back later for upcoming events.`}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="py-20 border-t border-white/10 bg-dark-800/50 relative">
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
            
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-16">
                    <span className="text-brand font-bold uppercase tracking-widest text-sm mb-4 block flex items-center justify-center gap-2">
                        <Trophy size={16} /> {gameType} Tournaments
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
                        Tournament History
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Explore all past, current, and upcoming {gameType} tournaments.
                    </p>
                </div>

                <div className="space-y-6">
                    {tournaments.map((tournament) => (
                        <TournamentInstance 
                            key={tournament.id} 
                            tournament={tournament} 
                            user={user} 
                            profile={profile} 
                            refreshProfile={refreshProfile}
                            setIsAuthModalOpen={setIsAuthModalOpen}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GameTournamentSection;
