import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, MessageSquare, Crown, Star, ShieldCheck, ArrowRight, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { handleHashClick } from '../lib/scroll';
import type { MemberBanner } from '../types/database';

const TieredHeroBanner: React.FC = () => {
    const { user, profile, loading: authLoading } = useAuth();
    const [activeBanner, setActiveBanner] = useState<MemberBanner | null>(null);
    const [loading, setLoading] = useState(true);

    // Fallback/Placeholder Data - Golden Metallic Glassmorphic
    const placeholderBanner: Partial<MemberBanner> = {
        title: "Join the Elite Club",
        marketing_message: "Unlock exclusive member rates, priority table bookings, and invitation-only tournaments in the heart of Doha.",
        instruction_message: "Complete your profile or upgrade your tier to unlock more rewards.",
        whatsapp_preset: "Hi, I'm interested in joining the Elite Member Club."
    };

    useEffect(() => {
        fetchBanner();
    }, [user, profile?.tier]);

    const fetchBanner = async () => {
        try {
            setLoading(true);
            const { data: banners, error } = await supabase
                .from('member_banners')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (!banners || banners.length === 0) {
                setActiveBanner(null);
                return;
            }

            let targetBanner = null;
            if (user) {
                targetBanner = banners.find(b => b.target_type === 'specific_member' && b.target_value === user.id);
                if (!targetBanner) {
                    targetBanner = banners.find(b => b.target_type === 'tier' && b.target_value?.toLowerCase() === profile?.tier?.toLowerCase());
                }
            }

            if (!targetBanner) {
                targetBanner = banners.find(b => b.target_type === 'general');
            }

            setActiveBanner(targetBanner || null);
        } catch (err) {
            console.error('Error fetching member banner:', err);
        } finally {
            setLoading(false);
        }
    };

    const displayBanner = activeBanner || placeholderBanner;

    const getTierColor = (tier: string = 'Guest') => {
        switch (tier.toLowerCase()) {
            case 'gold': return 'from-[#D4AF37] via-[#FFF8DC] to-[#B8860B]'; // Metallic Gold
            case 'silver': return 'from-[#C0C0C0] via-[#F5F5F5] to-[#808080]'; // Metallic Silver
            case 'bronze': return 'from-[#CD7F32] via-[#E3AF66] to-[#8B4513]'; // Metallic Bronze
            case 'admin': return 'from-brand via-brand-light to-brand-dark';
            default: return 'from-[#D4AF37] via-[#FFF8DC] to-[#B8860B]'; // Default Gold for Placeholder
        }
    };

    const getTierIcon = (tier: string = 'Guest') => {
        switch (tier.toLowerCase()) {
            case 'gold': return <Crown size={20} className="text-[#B8860B] md:size-6" />;
            case 'silver': return <Star size={20} className="text-[#808080] md:size-6" />;
            case 'bronze': return <Trophy size={20} className="text-[#8B4513] md:size-6" />;
            case 'admin': return <ShieldCheck size={20} className="text-white md:size-6" />;
            default: return <Trophy size={20} className="text-[#B8860B] md:size-6" />;
        }
    };

    const getNextTier = (currentTier: string = 'Guest') => {
        const tiers = ['Guest', 'Bronze', 'Silver', 'Gold'];
        const currentIndex = tiers.findIndex(t => t.toLowerCase() === currentTier.toLowerCase());
        if (currentIndex === -1 || currentIndex >= tiers.length - 1) return null;
        return tiers[currentIndex + 1];
    };

    const nextTier = getNextTier(profile?.tier);
    const isAdmin = profile?.tier?.toLowerCase() === 'admin';
    const buttonText = isAdmin
        ? 'View Admin Settings'
        : nextTier
            ? `Upgrade to ${nextTier} Now`
            : profile?.tier === 'Gold'
                ? 'Inquire About My Benefits'
                : 'Claim Offer';

    const whatsappUrl = `https://wa.me/97451622111?text=${encodeURIComponent(displayBanner.whatsapp_preset || `Hi, I am interested in ${nextTier ? `upgrading to ${nextTier}` : 'membership'} benefits.`)}`;

    if (authLoading || !user) return null;

    return (
        <div className="w-full max-w-6xl mx-auto px-2 md:px-4 z-20 mt-8 md:mt-12 mb-8">
            <div className="flex flex-row gap-2 md:gap-6 justify-center items-stretch">

                {/* Left Card: Marketing - Golden Metallic Glassmorphic */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-[2] relative group min-w-0"
                >
                    {/* Metallic Glow Border */}
                    <div className={`absolute -inset-[1px] bg-gradient-to-r ${getTierColor(profile?.tier)} rounded-2xl md:rounded-3xl blur-[1px] opacity-30 group-hover:opacity-60 transition-all duration-500`}></div>

                    <div className="relative h-full p-3 md:p-8 rounded-2xl md:rounded-3xl overflow-hidden backdrop-blur-2xl bg-white/5 border border-white/10 shadow-2xl flex flex-col justify-between gap-2 md:gap-6">
                        {/* Decorative background accent */}
                        <div className={`absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 md:w-64 h-32 md:h-64 bg-gradient-to-br ${getTierColor(profile?.tier)} opacity-10 rounded-full blur-3xl pointer-events-none`}></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-1.5 md:gap-3 mb-2 md:mb-4">
                                <div className={`p-1.5 md:p-2.5 rounded-lg md:rounded-xl bg-gradient-to-br ${getTierColor(profile?.tier)} border border-white/20 text-black shadow-lg`}>
                                    <Trophy size={14} className="animate-pulse md:size-5" />
                                </div>
                                <span className={`text-[7px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.3em] bg-clip-text text-transparent bg-gradient-to-r ${getTierColor(profile?.tier)} whitespace-nowrap`}>
                                    Premium Rewards
                                </span>
                            </div>

                            <h2 className="text-xs md:text-3xl font-black text-white uppercase tracking-tight mb-1 md:mb-3 text-left line-clamp-1 md:line-clamp-none">
                                {displayBanner.title}
                            </h2>
                            <div
                                className="text-gray-300 text-[8px] md:text-base font-medium leading-tight md:leading-relaxed max-w-md text-left line-clamp-2 md:line-clamp-none"
                                dangerouslySetInnerHTML={{ __html: displayBanner.marketing_message || '' }}
                            />
                        </div>

                        <div className="relative z-10 flex items-center gap-2 md:gap-4">
                            {isAdmin ? (
                                <button
                                    onClick={(e) => handleHashClick(e, '#admin-cms')}
                                    className={`flex items-center gap-2 md:gap-4 px-4 md:px-10 py-3 md:py-5 bg-gradient-to-r ${getTierColor(profile?.tier)} text-white rounded-lg md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xl hover:scale-105 transition-transform shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_20px_rgba(245,142,28,0.3)] border-2 border-white/40 whitespace-nowrap z-30`}
                                >
                                    <Settings size={14} className="md:size-7 animate-[spin_4s_linear_infinite]" />
                                    <span>{buttonText}</span>
                                </button>
                            ) : (
                                <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-1.5 md:gap-3 px-3 md:px-6 py-2 md:py-3 bg-gradient-to-r ${getTierColor(profile?.tier)} text-black rounded-lg md:rounded-xl font-black uppercase tracking-widest text-[8px] md:text-xs hover:scale-105 transition-transform shadow-xl border border-white/20 whitespace-nowrap`}
                                >
                                    <MessageSquare size={12} className="md:size-4.5" />
                                    <span>{buttonText}</span>
                                </a>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Right Card: User Info - Separated Holder */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1 max-w-[120px] md:max-w-none md:w-80 relative group min-w-0"
                >
                    {/* Metallic Glow Border */}
                    <div className={`absolute -inset-[1px] bg-gradient-to-r ${getTierColor(profile?.tier)} rounded-2xl md:rounded-3xl blur-[1px] opacity-30 group-hover:opacity-60 transition-all duration-500`}></div>

                    <div className="relative h-full p-3 md:p-8 rounded-2xl md:rounded-3xl overflow-hidden backdrop-blur-2xl bg-white/5 border border-white/10 shadow-2xl flex flex-col justify-between gap-2 md:gap-6">
                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-2 md:mb-6 gap-2">
                                <div className={`w-8 md:w-14 h-8 md:h-14 rounded-lg md:rounded-2xl bg-gradient-to-br ${getTierColor(profile?.tier)} flex items-center justify-center shadow-2xl border border-white/30 transform -rotate-3 group-hover:rotate-0 transition-transform duration-500 flex-shrink-0`}>
                                    {getTierIcon(profile?.tier)}
                                </div>
                                <div className="text-left md:text-right overflow-hidden w-full">
                                    <div className="text-[6px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5 md:mb-1">Membership Tier</div>
                                    <div className={`text-[8px] md:text-[14px] font-black uppercase tracking-widest px-1.5 md:px-3 py-0.5 md:py-1 rounded border shadow-inner bg-black/40 text-white border-white/20 truncate`}>
                                        {profile?.tier || 'Guest'}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-2 md:mb-6">
                                <h3 className="text-white font-black text-[10px] md:text-xl mb-0.5 md:mb-1 text-left leading-tight">
                                    {user ? `Welcome Back!, ${profile?.full_name?.split(' ')[0] || 'Member'}` : 'Guest'}
                                </h3>
                                <div className={`h-0.5 md:h-1 w-6 md:w-12 bg-gradient-to-r ${getTierColor(profile?.tier)} rounded-full mb-1.5 md:mb-3`}></div>
                                <div
                                    className="text-gray-400 text-[6px] md:text-[11px] font-bold uppercase tracking-widest leading-tight md:leading-relaxed text-left italic line-clamp-2 md:line-clamp-none"
                                    dangerouslySetInnerHTML={{ __html: displayBanner.instruction_message || '' }}
                                />
                            </div>

                            {user && (
                                <button
                                    onClick={(e) => handleHashClick(e, '#profile')}
                                    className={`w-full py-1.5 md:py-2.5 rounded-lg border border-white/10 bg-white/5 text-white text-[7px] md:text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2 group/profile`}
                                >
                                    View My Profile
                                    <ArrowRight size={10} className="md:size-3.5 group-hover/profile:translate-x-1 transition-transform" />
                                </button>
                            )}
                        </div>

                        <div className="relative z-10">
                            <div className="p-1.5 md:p-4 rounded-lg md:rounded-2xl bg-black/40 border border-white/5 space-y-1 md:space-y-3">
                                <div className="flex items-center justify-between text-[5px] md:text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-gray-500 hidden xs:inline">Tier Status</span>
                                    <span className={`bg-clip-text text-transparent bg-gradient-to-r ${getTierColor(profile?.tier)}`}>
                                        {profile?.tier === 'Gold' ? 'ELITE' : 'ACTIVE'}
                                    </span>
                                </div>
                                <div className="h-1 md:h-2 w-full bg-white/5 rounded-full overflow-hidden p-[0.5px] border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: profile?.tier === 'Gold' ? '100%' : profile?.tier === 'Silver' ? '66%' : profile?.tier === 'Bronze' ? '33%' : '15%' }}
                                        className={`h-full rounded-full bg-gradient-to-r ${getTierColor(profile?.tier)} shadow-[0_0_10px_rgba(212,175,55,0.3)]`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default TieredHeroBanner;