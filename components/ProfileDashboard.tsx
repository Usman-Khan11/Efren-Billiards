import React, { useState, useEffect } from 'react';
import {
    User, Users, Phone, Mail, Shield, Crown, Award, Trophy, Star,
    ChevronRight, Loader2, CheckCircle, AlertCircle,
    LogOut, ArrowRight, Link2, Smartphone
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useProfileLinking } from '../hooks/useProfile';
import { useToast } from './ui/Toast';
import type { Profile, MembershipTier } from '../types/database';

// ============================================================================
// Profile Dashboard — displays membership tier, status, and account linking
// ============================================================================

/** Tier visual configuration */
const TIER_CONFIG: Record<string, {
    label: string;
    color: string;
    bg: string;
    border: string;
    icon: React.ReactNode;
    gradient: string;
}> = {
    Guest: {
        label: 'Guest Player',
        color: 'text-gray-400',
        bg: 'bg-white/5',
        border: 'border-white/10',
        icon: <Users size={20} />,
        gradient: 'from-gray-800 to-gray-900',
    },
    Player: {
        label: 'Club Player',
        color: 'text-brand',
        bg: 'bg-brand/10',
        border: 'border-brand/20',
        icon: <Award size={20} />,
        gradient: 'from-brand/20 to-brand/10',
    },
    Bronze: {
        label: 'Bronze Member',
        color: 'text-[#CD7F32]',
        bg: 'bg-[#CD7F32]/10',
        border: 'border-[#CD7F32]/20',
        icon: <Trophy size={20} />,
        gradient: 'from-[#CD7F32] via-[#E3AF66] to-[#8B4513]',
    },
    Silver: {
        label: 'Silver Member',
        color: 'text-[#C0C0C0]',
        bg: 'bg-[#C0C0C0]/10',
        border: 'border-[#C0C0C0]/20',
        icon: <Star size={20} />,
        gradient: 'from-[#C0C0C0] via-[#F5F5F5] to-[#808080]',
    },
    Gold: {
        label: 'Gold Member',
        color: 'text-[#D4AF37]',
        bg: 'bg-[#D4AF37]/10',
        border: 'border-[#D4AF37]/20',
        icon: <Crown size={20} />,
        gradient: 'from-[#D4AF37] via-[#FFF8DC] to-[#B8860B]',
    },
    Admin: {
        label: 'System Admin',
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        icon: <Shield size={20} />,
        gradient: 'from-blue-900 via-blue-700 to-blue-900',
    },
    guest: {
        label: 'Guest Player',
        color: 'text-gray-400',
        bg: 'bg-white/5',
        border: 'border-white/10',
        icon: <Users size={20} />,
        gradient: 'from-gray-800 to-gray-900',
    },
    admin: {
        label: 'System Admin',
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        icon: <Shield size={20} />,
        gradient: 'from-blue-900 via-blue-700 to-blue-900',
    },
};

/** Membership privileges per tier */
const TIER_BENEFITS: Record<MembershipTier, string[]> = {
    Guest: [
        'Access to common areas',
        'Standard table rates',
        'Public event access'
    ],
    Player: [
        'Access to member lounge',
        '10% off table bookings',
        'Priority registration for local tournaments'
    ],
    Bronze: [
        'All Player benefits',
        'One free guest pass per month',
        'Dedicated cue locker storage',
        '15% off at the coffee lounge'
    ],
    Silver: [
        'All Bronze benefits',
        'Complimentary drink on arrival',
        'Advanced booking window (48h)',
        '20% off all dining & coffee'
    ],
    Gold: [
        'All Silver benefits',
        'Private VIP room access',
        'Personal concierge service',
        'Free entry to all monthly tournaments',
        'First access to international exhibitions'
    ],
    Admin: [
        'Complete system access',
        'Full management control',
        'Reporting & Analytics'
    ],
    guest: [
        'Access to common areas',
        'Standard table rates',
        'Public event access'
    ],
    admin: [
        'Complete system access',
        'Full management control',
        'Reporting & Analytics'
    ],
};

const ProfileDashboard: React.FC = () => {
    const { user, profile, loading: authLoading, signOut, refreshProfile, setProfile } = useAuth();
    const { showToast, ToastContainer } = useToast();
    const {
        phoneLinking,
        emailLinking,
        otpSent,
        sendPhoneOtp,
        verifyPhoneOtp,
        linkEmail,
    } = useProfileLinking();

    // Linking form state
    const [members, setMembers] = useState<Profile[]>([]);
    const [setupData, setSetupData] = useState({ full_name: '', phone: '' });
    const [submittingSetup, setSubmittingSetup] = useState(false);
    const [newPhone, setNewPhone] = useState('');
    const [phoneOtpCode, setPhoneOtpCode] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [showPhoneLink, setShowPhoneLink] = useState(false);
    const [showEmailLink, setShowEmailLink] = useState(false);
    const [setupComplete, setSetupComplete] = useState(false);

    // My Tournaments State
    const [myTournaments, setMyTournaments] = useState<any[]>([]);
    const [tournamentsLoading, setTournamentsLoading] = useState(true);

    // Player Stats State
    const [playerStats, setPlayerStats] = useState<{ wins: number, losses: number, rating: number } | null>(null);

    // Fetch Player Stats
    useEffect(() => {
        if (!user) return;
        const fetchStats = async () => {
            try {
                const { data } = await supabase.from('players').select('wins, losses, rating').eq('id', user.id).maybeSingle();
                if (data) setPlayerStats(data);
            } catch (err) {
                console.error("Failed to fetch player stats:", err);
            }
        };
        fetchStats();
    }, [user]);

    // Fetch My Tournaments — reads from `registrations` table (user_id = auth uid)
    useEffect(() => {
        if (!user) return;
        const fetchMyTournaments = async () => {
            setTournamentsLoading(true);
            try {
                const { data, error } = await (supabase as any)
                    .from('registrations')
                    .select('*, tournaments(*)')
                    .eq('user_id', user.id)
                    .neq('status', 'withdrawn');

                if (error) throw error;
                // extract tournaments from the join
                const t = data?.map((d: any) => d.tournaments).filter(Boolean) || [];
                setMyTournaments(t);
            } catch (err) {
                console.error("Failed to fetch tournaments:", err);
            } finally {
                setTournamentsLoading(false);
            }
        };
        fetchMyTournaments();
    }, [user]);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            window.location.hash = '#home';
        }
    }, [user, authLoading]);

    // Show toast for linking results
    useEffect(() => {
        if (phoneLinking.error) showToast(phoneLinking.error, 'error');
        if (phoneLinking.success) showToast(phoneLinking.success, 'success');
    }, [phoneLinking.error, phoneLinking.success, showToast]); // Added showToast dependency

    useEffect(() => {
        if (emailLinking.error) showToast(emailLinking.error, 'error');
        if (emailLinking.success) showToast(emailLinking.success, 'success');
    }, [emailLinking.error, emailLinking.success, showToast]); // Added showToast dependency

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0c] via-[#0f1110] to-[#0a0a0c]">
                <Loader2 size={32} className="animate-spin text-brand" />
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect in useEffect
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0c] via-[#0f1110] to-[#0a0a0c] px-4">
                <div className="flex flex-col items-center gap-6 text-center max-w-sm">
                    <div className="relative">
                        <Loader2 size={32} className="animate-spin text-brand" />
                        <AlertCircle size={16} className="absolute -top-1 -right-1 text-red-500" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-white font-bold text-lg">Profile Sync Issue</p>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            We're having trouble syncing your profile from the database. This is usually due to a configuration error in Supabase (RLS recursion).
                        </p>
                    </div>
                    <div className="flex flex-col w-full gap-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-3 bg-brand text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-brand/90 transition-all"
                        >
                            Retry Connection
                        </button>
                        <button
                            onClick={signOut}
                            className="w-full py-3 bg-white/5 border border-white/10 text-gray-400 rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-white/10 hover:text-white transition-all"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const tier = TIER_CONFIG[profile.tier] || TIER_CONFIG.Guest;
    const hasPhone = !!profile.phone;
    const hasEmail = !!profile.email;
    // Check verified status from Supabase auth user metadata
    const phoneVerified = !!user?.phone;
    const emailVerified = !!user?.email_confirmed_at;

    const needsSetup = !setupComplete && (!profile.full_name || !profile.phone); // Moved needsSetup here for rendering logic

    const handleSetupSubmit = async (e: React.FormEvent) => { // Moved handleSetupSubmit here for rendering logic
        e.preventDefault();
        if (!setupData.full_name || !setupData.phone) {
            showToast('Please provide both name and phone number.', 'error');
            return;
        }

        setSubmittingSetup(true);
        try {
            const { data, error } = await (supabase.from('profiles') as any)
                .upsert({
                    id: profile?.id,
                    full_name: setupData.full_name,
                    phone: setupData.phone,
                    tier: profile?.tier || 'Guest',
                    status: profile?.status || 'active',
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;
            
            setSetupComplete(true);
            showToast('Profile setup complete! Welcome to the club.', 'success');
            
            // Optimistically update local state to prevent loop
            if (data) {
                setProfile(data as Profile);
            } else {
                await refreshProfile();
            }
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setSubmittingSetup(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a0c] via-[#0f1110] to-[#0a0a0c] pt-28 pb-16 px-4">
            <ToastContainer />

            {/* ── Background Elements ── */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
            </div>

            <div className="max-w-2xl mx-auto relative z-10">
                {needsSetup && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="w-full max-w-md bg-[#0d0d0f] border border-white/10 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-500">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center mx-auto mb-4 border border-brand/20">
                                    <User size={32} className="text-brand" />
                                </div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Welcome to the Club</h2>
                                <p className="text-gray-500 text-sm mt-2 font-medium">Please complete your profile details to continue.</p>
                            </div>

                            <form onSubmit={handleSetupSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold px-2">Player Name</label>
                                    <div className="relative">
                                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Efren Reyes"
                                            required
                                            value={setupData.full_name}
                                            onChange={e => setSetupData(prev => ({ ...prev, full_name: e.target.value }))}
                                            className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-brand/40 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold px-2">Mobile Number</label>
                                    <div className="relative">
                                        <Smartphone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <input
                                            type="tel"
                                            placeholder="+974 5555 1234"
                                            required
                                            value={setupData.phone}
                                            onChange={e => setSetupData(prev => ({ ...prev, phone: e.target.value }))}
                                            className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-brand/40 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submittingSetup}
                                    className="w-full py-4 bg-brand text-white rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-brand/90 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                                >
                                    {submittingSetup ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <>
                                            Complete Profile
                                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
                {/* ── Digital Membership Card ── */}
                <div className="relative group perspective-1000 mb-8">
                    <div className={`
                        relative w-full aspect-[1.586/1] rounded-2xl p-6 md:p-8 overflow-hidden
                        bg-gradient-to-br ${tier.gradient} border ${tier.border}
                        shadow-2xl shadow-black/60 backdrop-blur-xl
                        transition-all duration-700 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]
                        group-hover:scale-[1.02]
                    `}>
                        {/* Metallic Glass Overlay */}
                        <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />
                        
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />

                        <div className="h-full flex flex-col justify-between relative z-10">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_5px_rgba(52,211,153,0.5)]" />
                                        <p className="text-[10px] uppercase tracking-[0.3em] text-white/60 font-black">Digital Membership</p>
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter drop-shadow-lg">Efren Club</h2>
                                </div>
                                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl ${tier.bg} flex items-center justify-center border border-white/20 shadow-2xl backdrop-blur-md transform group-hover:rotate-6 transition-transform duration-500`}>
                                    {React.cloneElement(tier.icon as React.ReactElement, { size: 32, className: "text-white drop-shadow-md" })}
                                </div>
                            </div>

                            <div className="mt-4 md:mt-8">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold mb-0.5">Member Name</p>
                                        <p className="text-xl md:text-2xl font-black text-white tracking-tight drop-shadow-md">
                                            {profile.full_name || 'REGISTERED MEMBER'}
                                        </p>
                                    </div>
                                    <div className="text-right hidden md:block">
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold mb-0.5">Member Since</p>
                                        <p className="text-sm font-bold text-white/90">
                                            {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-end pt-4 border-t border-white/10">
                                <div className="flex items-center gap-4">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold mb-0.5">Tier</p>
                                        <p className="text-sm md:text-base font-black text-white uppercase tracking-widest flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-white/20" />
                                            {tier.label}
                                        </p>
                                    </div>
                                    <div className="h-8 w-[1px] bg-white/10" />
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold mb-0.5">Card ID</p>
                                        <p className="text-xs md:text-sm font-mono font-bold text-white/70 tracking-tighter">EF-{profile.id.slice(0, 8).toUpperCase()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`px-3 py-1 rounded-full border ${profile.status === 'active' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-red-500/20 border-red-500/30 text-red-400'} text-[10px] font-black uppercase tracking-widest shadow-inner`}>
                                        {profile.status}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Premium Card Accents */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                        
                        {/* Chip Graphic */}
                        <div className="absolute top-1/2 right-12 -translate-y-1/2 w-12 h-10 bg-gradient-to-br from-yellow-200/20 to-yellow-600/20 rounded-md border border-white/10 flex flex-col justify-around p-1 opacity-40">
                            <div className="h-[1px] w-full bg-white/20" />
                            <div className="h-[1px] w-full bg-white/20" />
                            <div className="h-[1px] w-full bg-white/20" />
                        </div>
                    </div>
                </div>

                {/* ── Player Stats ── */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl text-center">
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Wins</p>
                        <p className="text-2xl font-black text-white">{playerStats?.wins || 0}</p>
                    </div>
                    <div className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl text-center">
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Losses</p>
                        <p className="text-2xl font-black text-white">{playerStats?.losses || 0}</p>
                    </div>
                    <div className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl text-center">
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Rating</p>
                        <p className="text-2xl font-black text-gold">{playerStats?.rating || 1500}</p>
                    </div>
                </div>

                {/* ── Active Registrations ── */}
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 mb-6 backdrop-blur-xl">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Trophy size={16} className="text-brand" />
                        My Tournaments
                    </h2>
                    <div className="space-y-4">
                        {tournamentsLoading ? (
                            <div className="flex justify-center p-4">
                                <Loader2 size={24} className="animate-spin text-brand" />
                            </div>
                        ) : myTournaments.length === 0 ? (
                            <div className="text-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                                <p className="text-sm text-gray-500">You haven't registered for any tournaments yet.</p>
                                <a href="#tournaments" className="text-brand text-xs font-bold uppercase tracking-widest mt-2 inline-block hover:text-white transition-colors">Find a Tournament</a>
                            </div>
                        ) : (
                            myTournaments.map(t => {
                                const dateStr = t.start_date || t.started_at;
                                return (
                                    <div key={t.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                        <div>
                                            <p className="text-sm font-bold text-white">{t.name}</p>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                                                {t.game_type && <span className="text-brand mr-2">{t.game_type}</span>}
                                                {dateStr ? new Date(dateStr).toLocaleDateString('en-US', { dateStyle: 'medium' }) : 'Date TBA'}
                                            </p>
                                        </div>
                                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                                            Registered
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* ── Tier Benefits List ── */}
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 mb-6 backdrop-blur-xl">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Star size={16} className="text-gold" />
                        Exclusive {tier.label} Perks
                    </h2>
                    <ul className="space-y-3">
                        {TIER_BENEFITS[profile.tier].map((benefit, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm text-gray-400">
                                <CheckCircle size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                {benefit}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* ── Sign Out Shortcut ── */}
                <div className="flex justify-end mb-6">
                    <button
                        onClick={signOut}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-gray-400 text-xs font-semibold hover:bg-white/[0.06] hover:text-white transition-all shadow-sm"
                    >
                        <LogOut size={14} />
                        Sign Out
                    </button>
                </div>

                {/* ── Contact Methods ── */}

                {/* ── Contact Methods ── */}
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 mb-6 backdrop-blur-xl">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Link2 size={16} className="text-brand" />
                        Linked Accounts
                    </h2>
                    <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                        Link your phone and email to secure your account. Accounts do not auto-merge — link them manually here.
                    </p>

                    {/* Phone */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${hasPhone ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/[0.03] border border-white/[0.06]'}`}>
                                    <Phone size={18} className={hasPhone ? 'text-emerald-400' : 'text-gray-500'} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">
                                        {hasPhone ? profile.phone : 'No phone linked'}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        {hasPhone && phoneVerified ? (
                                            <>
                                                <CheckCircle size={12} className="text-emerald-400" />
                                                <span className="text-xs text-emerald-400 font-medium">Verified</span>
                                            </>
                                        ) : hasPhone ? (
                                            <>
                                                <AlertCircle size={12} className="text-yellow-400" />
                                                <span className="text-xs text-yellow-400 font-medium">Unverified</span>
                                            </>
                                        ) : (
                                            <span className="text-xs text-gray-600">Not configured</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowPhoneLink(!showPhoneLink)}
                                className="text-xs text-brand font-semibold hover:underline flex items-center gap-1"
                            >
                                {hasPhone ? 'Change' : 'Link'}
                                <ChevronRight size={14} className={`transition-transform ${showPhoneLink ? 'rotate-90' : ''}`} />
                            </button>
                        </div>

                        {/* Phone linking form */}
                        {showPhoneLink && (
                            <div className="mt-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-3">
                                {!otpSent ? (
                                    <>
                                        <input
                                            type="tel"
                                            value={newPhone}
                                            onChange={(e) => setNewPhone(e.target.value)}
                                            placeholder="+974 XXXX XXXX"
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all"
                                        />
                                        <button
                                            onClick={() => sendPhoneOtp(newPhone)}
                                            disabled={phoneLinking.loading || !newPhone}
                                            className="w-full py-3 bg-brand/20 border border-brand/30 rounded-xl text-sm font-bold text-brand hover:bg-brand/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                        >
                                            {phoneLinking.loading ? <Loader2 size={16} className="animate-spin" /> : <>Send Code <ArrowRight size={14} /></>}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-xs text-gray-400">Enter the code sent to <span className="text-white font-semibold">{newPhone}</span></p>
                                        <input
                                            type="text"
                                            value={phoneOtpCode}
                                            onChange={(e) => setPhoneOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            placeholder="000000"
                                            maxLength={6}
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm text-center tracking-[0.3em] font-bold placeholder-gray-600 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all"
                                        />
                                        <button
                                            onClick={() => verifyPhoneOtp(newPhone, phoneOtpCode)}
                                            disabled={phoneLinking.loading || phoneOtpCode.length < 6}
                                            className="w-full py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-sm font-bold text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                        >
                                            {phoneLinking.loading ? <Loader2 size={16} className="animate-spin" /> : <>Verify <CheckCircle size={14} /></>}
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${hasEmail ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/[0.03] border border-white/[0.06]'}`}>
                                    <Mail size={18} className={hasEmail ? 'text-emerald-400' : 'text-gray-500'} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">
                                        {hasEmail ? profile.email : 'No email linked'}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        {hasEmail && emailVerified ? (
                                            <>
                                                <CheckCircle size={12} className="text-emerald-400" />
                                                <span className="text-xs text-emerald-400 font-medium">Verified</span>
                                            </>
                                        ) : hasEmail ? (
                                            <>
                                                <AlertCircle size={12} className="text-yellow-400" />
                                                <span className="text-xs text-yellow-400 font-medium">Unverified</span>
                                            </>
                                        ) : (
                                            <span className="text-xs text-gray-600">Not configured</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowEmailLink(!showEmailLink)}
                                className="text-xs text-brand font-semibold hover:underline flex items-center gap-1"
                            >
                                {hasEmail ? 'Change' : 'Link'}
                                <ChevronRight size={14} className={`transition-transform ${showEmailLink ? 'rotate-90' : ''}`} />
                            </button>
                        </div>

                        {/* Email linking form */}
                        {showEmailLink && (
                            <div className="mt-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-3">
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all"
                                />
                                <button
                                    onClick={() => linkEmail(newEmail)}
                                    disabled={emailLinking.loading || !newEmail}
                                    className="w-full py-3 bg-brand/20 border border-brand/30 rounded-xl text-sm font-bold text-brand hover:bg-brand/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    {emailLinking.loading ? <Loader2 size={16} className="animate-spin" /> : <>Link Email <ArrowRight size={14} /></>}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Quick Actions ── */}
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-xl">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <a
                            href="#tournaments"
                            className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center group-hover:bg-brand/20 transition-all">
                                <Award size={18} className="text-brand" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">Tournaments</p>
                                <p className="text-xs text-gray-500">View & register</p>
                            </div>
                        </a>

                        <a
                            href="#membership-packages"
                            className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:bg-gold/20 transition-all">
                                <Crown size={18} className="text-gold" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">Upgrade</p>
                                <p className="text-xs text-gray-500">Membership plans</p>
                            </div>
                        </a>
                    </div>
                </div>

                {/* Admin shortcut */}
                {profile.tier === 'Admin' && (
                    <a
                        href="#admin-cms"
                        className="mt-4 flex items-center justify-between p-4 rounded-2xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <Shield size={20} className="text-red-400" />
                            <div>
                                <p className="text-sm font-bold text-white">Admin Dashboard</p>
                                <p className="text-xs text-gray-500">Manage content, users & tournaments</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </a>
                )}
            </div>
        </div>
    );
};

export default ProfileDashboard;
