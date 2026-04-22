import React, { useState, useEffect } from 'react';
import {
    Users, Trophy, Coffee, Layout, Settings,
    Search, Filter, Shield,
    ChevronLeft, ChevronRight, MoreVertical, CheckCircle, XCircle, Loader2,
    Image as ImageIcon, Plus, Save, ExternalLink, Video, Calendar, Phone, Link as LinkIcon, Crown, Zap
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './ui/Toast';
import AdminTournaments from './AdminTournaments';
import AdminPlayers from './AdminPlayers';
import AdminSiteImages from './admin/AdminSiteImages';
import AdminGallery from './admin/AdminGallery';
import AdminVideos from './admin/AdminVideos';
import AdminFoodMenu from './admin/AdminFoodMenu';
import AdminWeeklySchedule from './admin/AdminWeeklySchedule';
import AdminContactInfo from './admin/AdminContactInfo';
import AdminSocialLinks from './admin/AdminSocialLinks';
import AdminMembershipPlans from './admin/AdminMembershipPlans';
import AdminRankings from './admin/AdminRankings';
import AdminOfferings from './admin/AdminOfferings';
import AdminVisualTour from './admin/AdminVisualTour';
import AdminMatchMyGame from './admin/AdminMatchMyGame';
import AdminEventPricing from './admin/AdminEventPricing';
import AdminGameGalleries from './admin/AdminGameGalleries';
import AdminPageHeroes from './admin/AdminPageHeroes';
import AdminEventPreviews from './admin/AdminEventPreviews';
import AdminMemberBanners from './admin/AdminMemberBanners';
import Loading from './ui/Loading';
import type { Profile, MembershipTier } from '../types/database';

type CMSModule = 'hero' | 'gallery' | 'offerings' | 'visual-tour' | 'site-images' | 'videos' | 'food-menu' | 'match-my-game' | 'weekly-schedule' | 'membership-plans' | 'contact-info' | 'social-links' | 'tournaments' | 'players' | 'members' | 'member-banners' | 'rankings' | 'event-pricing' | 'game-galleries' | 'page-heroes' | 'event-previews' | 'settings';

const AdminCMS: React.FC = () => {
    const { profile, loading: authLoading } = useAuth();
    const { showToast, ToastContainer } = useToast();
    const [activeModule, setActiveModule] = useState<CMSModule>('hero');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    // Members State
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [saving, setSaving] = useState(false);

    // Real Content State
    const [heroData, setHeroData] = useState({
        title: '',
        subtitle: '',
        cta: ''
    });

    // Redirect if not admin
    useEffect(() => {
        if (!authLoading && (!profile || profile.tier !== 'Admin')) {
            window.location.hash = '#home';
        }
    }, [profile, authLoading]);

    // Fetch Hero & Content
    useEffect(() => {
        if (activeModule === 'hero') {
            fetchHeroData();
        }
        
        // Handle deep linking from hash params
        const hash = window.location.hash;
        if (hash.includes('?')) {
            const params = new URLSearchParams(hash.split('?')[1]);
            const module = params.get('module') as CMSModule;
            if (module) {
                setActiveModule(module);
            }
        }
    }, [activeModule]);

    const fetchHeroData = async () => {
        setLoading(true);
        try {
            const { data, error } = await (supabase.from('cms_content') as any)
                .select('*')
                .eq('slug', 'homepage-hero')
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data) {
                const content = JSON.parse(data.body);
                setHeroData({
                    title: data.title,
                    subtitle: content.subtitle || '',
                    cta: content.cta || ''
                });
            } else {
                setHeroData({
                    title: 'The Ultimate Billiards Experience',
                    subtitle: 'A premium members-only club where legends are built and the game never ends.',
                    cta: 'Join the Lounge'
                });
            }
        } catch (err: any) {
            console.error('Error fetching hero content:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch members when on members module
    useEffect(() => {
        if (activeModule === 'members') {
            fetchMembers();
        }
    }, [activeModule]);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const { data: profilesData, error: profilesError } = await (supabase.from('profiles') as any)
                .select('*')
                .order('created_at', { ascending: false });

            if (profilesError) throw profilesError;

            const { data: playersData, error: playersError } = await (supabase.from('players') as any)
                .select('id, wins, losses, rating');

            if (playersError) {
                console.warn('Could not fetch players for stats:', playersError);
            }

            const playersMap = new Map((playersData || []).map((p: any) => [p.id, p]));

            const merged = (profilesData || []).map((profile: any) => ({
                ...profile,
                player: playersMap.get(profile.id) || null
            }));

            setMembers(merged);
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const updateMemberTier = async (id: string, tier: MembershipTier) => {
        try {
            const { error } = await (supabase.from('profiles') as any)
                .update({ tier })
                .eq('id', id);

            if (error) throw error;
            showToast('Member tier updated successfully', 'success');
            fetchMembers();
        } catch (err: any) {
            showToast(err.message, 'error');
        }
    };

    const deleteMember = async (id: string) => {
        if (!confirm('Are you sure you want to delete this member?')) return;
        try {
            const { error } = await (supabase.from('profiles') as any).delete().eq('id', id);
            if (error) throw error;
            showToast('Member deleted successfully', 'success');
            fetchMembers();
        } catch(err: any) {
            showToast(err.message, 'error');
        }
    };

    const editMember = async (member: any) => {
        const newName = prompt('Enter new full name:', member.full_name || '');
        if (newName !== null) {
            try {
                const { error } = await (supabase.from('profiles') as any).update({ full_name: newName }).eq('id', member.id);
                if (error) throw error;
                showToast('Member updated successfully', 'success');
                fetchMembers();
            } catch(err: any) {
                showToast(err.message, 'error');
            }
        }
    };


    const handleSaveHero = async () => {
        setSaving(true);
        try {
            const body = JSON.stringify({
                subtitle: heroData.subtitle,
                cta: heroData.cta
            });

            // Upsert the content
            const { error } = await (supabase.from('cms_content') as any)
                .upsert({
                    slug: 'homepage-hero',
                    title: heroData.title,
                    body: body,
                    published: true,
                    author_id: profile?.id
                }, { onConflict: 'slug' });

            if (error) throw error;
            showToast('Homepage Hero updated successfully!', 'success');
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || !profile || profile.tier !== 'Admin') {
        return <Loading />;
    }

    const filteredMembers = members.filter(m =>
        m.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.phone?.includes(searchQuery)
    );

    return (
        <div className="min-h-screen bg-[#0a0a0c] flex">
            <ToastContainer />

            {/* ── Sidebar ── */}
            <aside
                className="border-r border-white/5 bg-[#0d0d0f] flex flex-col pt-24 shadow-2xl relative transition-[width] duration-300 ease-in-out overflow-hidden"
                style={{ width: sidebarOpen ? '18rem' : '4rem' }}
            >
                {/* Toggle Button */}
                <button
                    onClick={() => setSidebarOpen(prev => !prev)}
                    title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                    className="absolute top-[5.5rem] -right-3 z-50 w-6 h-6 flex items-center justify-center rounded-full bg-brand text-white shadow-lg shadow-brand/30 border-2 border-[#0d0d0f] hover:bg-brand/90 transition-all"
                >
                    {sidebarOpen ? <ChevronLeft size={12} strokeWidth={3} /> : <ChevronRight size={12} strokeWidth={3} />}
                </button>

                <div className="flex-1 px-2 space-y-8 overflow-y-auto overflow-x-hidden">
                    {/* Site Builder Section */}
                    <div className="space-y-6">
                        {/* Branding & Visuals */}
                        <div className="space-y-2">
                            {sidebarOpen && (
                                <div className="px-2 mb-2">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] whitespace-nowrap">Branding & Visuals</p>
                                </div>
                            )}
                            <nav className="space-y-1">
                                {([
                                    { module: 'hero', icon: <Layout size={18} />, label: 'Hero Section' },
                                    { module: 'site-images', icon: <ImageIcon size={18} />, label: 'Site Images' },
                                    { module: 'gallery', icon: <ImageIcon size={18} />, label: 'Image Gallery' },
                                    { module: 'game-galleries', icon: <ImageIcon size={18} />, label: 'Game Galleries' },
                                    { module: 'page-heroes', icon: <Layout size={18} />, label: 'Page Heroes' },
                                    { module: 'videos', icon: <Video size={18} />, label: 'YouTube Videos' },
                                    { module: 'visual-tour', icon: <Layout size={18} />, label: 'Visual Tour' },
                                ] as { module: CMSModule; icon: React.ReactNode; label: string }[]).map(({ module, icon, label }) => (
                                    <button
                                        key={module}
                                        title={!sidebarOpen ? label : undefined}
                                        onClick={() => setActiveModule(module)}
                                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all ${
                                            activeModule === module ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        } ${!sidebarOpen ? 'justify-center' : ''}`}
                                    >
                                        <span className="flex-shrink-0">{icon}</span>
                                        {sidebarOpen && <span className="truncate">{label}</span>}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Services & Menu */}
                        <div className="space-y-2">
                            {sidebarOpen && (
                                <div className="px-2 mb-2">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] whitespace-nowrap">Services & Menu</p>
                                </div>
                            )}
                            <nav className="space-y-1">
                                {([
                                    { module: 'offerings', icon: <Trophy size={18} />, label: 'Our Offerings' },
                                    { module: 'food-menu', icon: <Coffee size={18} />, label: 'Food Menu' },
                                    { module: 'match-my-game', icon: <Zap size={18} />, label: 'Match My Game' },
                                    { module: 'membership-plans', icon: <Crown size={18} />, label: 'Membership Plans' },
                                    { module: 'event-pricing', icon: <Calendar size={18} />, label: 'Event Pricing' },
                                    { module: 'event-previews', icon: <ImageIcon size={18} />, label: 'Event Previews' },
                                ] as { module: CMSModule; icon: React.ReactNode; label: string }[]).map(({ module, icon, label }) => (
                                    <button
                                        key={module}
                                        title={!sidebarOpen ? label : undefined}
                                        onClick={() => setActiveModule(module)}
                                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all ${
                                            activeModule === module ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        } ${!sidebarOpen ? 'justify-center' : ''}`}
                                    >
                                        <span className="flex-shrink-0">{icon}</span>
                                        {sidebarOpen && <span className="truncate">{label}</span>}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Operations & Contact */}
                        <div className="space-y-2">
                            {sidebarOpen && (
                                <div className="px-2 mb-2">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] whitespace-nowrap">Operations & Contact</p>
                                </div>
                            )}
                            <nav className="space-y-1">
                                {([
                                    { module: 'weekly-schedule', icon: <Calendar size={18} />, label: 'Weekly Schedule' },
                                    { module: 'contact-info', icon: <Phone size={18} />, label: 'Contact Info' },
                                    { module: 'social-links', icon: <LinkIcon size={18} />, label: 'Social Links' },
                                ] as { module: CMSModule; icon: React.ReactNode; label: string }[]).map(({ module, icon, label }) => (
                                    <button
                                        key={module}
                                        title={!sidebarOpen ? label : undefined}
                                        onClick={() => setActiveModule(module)}
                                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all ${
                                            activeModule === module ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        } ${!sidebarOpen ? 'justify-center' : ''}`}
                                    >
                                        <span className="flex-shrink-0">{icon}</span>
                                        {sidebarOpen && <span className="truncate">{label}</span>}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Club Management Section */}
                    <div className="space-y-2">
                        {sidebarOpen && (
                            <div className="px-2 mb-4">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] whitespace-nowrap">Club Management</p>
                            </div>
                        )}
                        <nav className="space-y-1">
                            {([
                                { module: 'tournaments', icon: <Trophy size={18} />, label: 'Tournaments' },
                                { module: 'players', icon: <Users size={18} />, label: 'Players' },
                                { module: 'rankings', icon: <Trophy size={18} />, label: 'Rankings' },
                                { module: 'members', icon: <Shield size={18} />, label: 'Members' },
                                { module: 'member-banners', icon: <Zap size={18} />, label: 'Member Banners' },
                                { module: 'settings', icon: <Settings size={18} />, label: 'Settings' },
                            ] as { module: CMSModule; icon: React.ReactNode; label: string }[]).map(({ module, icon, label }) => (
                                <button
                                    key={module}
                                    title={!sidebarOpen ? label : undefined}
                                    onClick={() => setActiveModule(module)}
                                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all ${
                                        activeModule === module ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    } ${!sidebarOpen ? 'justify-center' : ''}`}
                                >
                                    <span className="flex-shrink-0">{icon}</span>
                                    {sidebarOpen && <span className="truncate">{label}</span>}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Footer / User Profile */}
                <div className="p-2 border-t border-white/5 bg-black/20 flex flex-col gap-2">
                    <a
                        href="/#"
                        target="_blank"
                        rel="noopener noreferrer"
                        title={!sidebarOpen ? 'View Live Site' : undefined}
                        className={`flex items-center gap-2 w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-all border border-white/10 hover:border-white/20 ${
                            !sidebarOpen ? 'justify-center' : 'justify-center'
                        }`}
                    >
                        <ExternalLink size={16} className="flex-shrink-0" />
                        {sidebarOpen && <span className="truncate">View Live Site</span>}
                    </a>
                    <div className={`flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 ${
                        !sidebarOpen ? 'justify-center' : ''
                    }`}>
                        <div className="w-9 h-9 flex-shrink-0 rounded-lg bg-brand/10 flex items-center justify-center text-brand font-black">
                            {profile.full_name?.[0] || 'A'}
                        </div>
                        {sidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-white truncate">{profile.full_name || 'Administrator'}</p>
                                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Admin Portal</span>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* ── Main Content Area ── */}
            <main className="flex-1 flex flex-col pt-24 min-w-0 bg-[#0a0a0c]">
                <div className="flex-1 overflow-y-auto p-8">
                    {/* Hero Module */}
                    {activeModule === 'hero' && (
                        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Hero Section</h1>
                                    <p className="text-gray-500 text-sm mt-1">Directly edit the content of your homepage hero area.</p>
                                </div>
                                <button
                                    onClick={handleSaveHero}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand/90 transition-all shadow-lg shadow-brand/20 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    Save Content
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-8">
                                <section className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Layout size={120} />
                                    </div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <div className="w-1.5 h-6 bg-brand rounded-full" />
                                        Main Introduction
                                    </h3>
                                    <div className="space-y-6 max-w-2xl relative z-10">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black px-1">Heading</label>
                                            <input
                                                type="text"
                                                value={heroData.title}
                                                onChange={e => setHeroData(prev => ({ ...prev, title: e.target.value }))}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-4 text-white font-bold text-lg focus:outline-none focus:border-brand/50 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black px-1">Sub-heading</label>
                                            <textarea
                                                value={heroData.subtitle}
                                                onChange={e => setHeroData(prev => ({ ...prev, subtitle: e.target.value }))}
                                                rows={4}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-4 text-white text-sm focus:outline-none focus:border-brand/50 transition-all resize-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black px-1">CTA Button Text</label>
                                            <input
                                                type="text"
                                                value={heroData.cta}
                                                onChange={e => setHeroData(prev => ({ ...prev, cta: e.target.value }))}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-sm focus:outline-none focus:border-brand/50 transition-all"
                                            />
                                        </div>
                                    </div>
                                </section>

                                <section className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Preview</h3>
                                    <div className="aspect-video w-full rounded-2xl bg-[#050505] border border-white/10 flex flex-col items-center justify-center p-8 text-center">
                                        <h4 className="text-xl font-black text-white uppercase max-w-md">{heroData.title}</h4>
                                        <p className="text-gray-500 text-xs mt-2 max-w-sm">{heroData.subtitle}</p>
                                        <div className="mt-6 px-4 py-1.5 bg-brand rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
                                            {heroData.cta}
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    )}

                    {/* Gallery Module */}
                    {activeModule === 'gallery' && (
                        <AdminGallery />
                    )}

                    {/* Offerings Module */}
                    {activeModule === 'offerings' && (
                        <AdminOfferings />
                    )}

                    {/* Visual Tour Module */}
                    {activeModule === 'visual-tour' && (
                        <AdminVisualTour />
                    )}

                    {/* Members Module */}
                    {activeModule === 'members' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Member Directory</h1>
                                    <p className="text-gray-500 text-sm mt-1">Manage access control and user status.</p>
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative">
                                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Search members..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            className="pl-12 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-brand/40 w-64 transition-all"
                                        />
                                    </div>
                                    <button className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-gray-400 hover:text-white transition-all">
                                        <Filter size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-white/5 bg-white/[0.01] overflow-hidden">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-white/[0.02] border-b border-white/5">
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Member</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Date Started</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Tier</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Stats</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
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
                                        ) : (
                                            filteredMembers.map(member => (
                                                <tr key={member.id} className="group hover:bg-white/[0.02] transition-colors">
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center font-bold text-gray-400">
                                                                {member.full_name?.[0] || '?'}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-white">{member.full_name || 'Unnamed Player'}</p>
                                                                <p className="text-[10px] text-gray-500 font-medium">{member.phone || member.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                            {new Date(member.created_at).toLocaleDateString()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <select
                                                            value={member.tier}
                                                            onChange={(e) => updateMemberTier(member.id, e.target.value as MembershipTier)}
                                                            className="bg-brand/10 text-brand border border-brand/20 text-[10px] font-black uppercase tracking-widest rounded-lg px-3 py-1.5 focus:outline-none"
                                                        >
                                                            <option className="bg-[#0a0a0c] text-brand" value="Guest">Guest</option>
                                                            <option className="bg-[#0a0a0c] text-brand" value="Bronze">Bronze</option>
                                                            <option className="bg-[#0a0a0c] text-brand" value="Silver">Silver</option>
                                                            <option className="bg-[#0a0a0c] text-brand" value="Gold">Gold</option>
                                                            <option className="bg-[#0a0a0c] text-brand" value="Admin">Admin</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col gap-1 text-[10px] uppercase font-bold text-gray-400">
                                                            <span>W: {member.player?.wins || 0}</span>
                                                            <span>L: {member.player?.losses || 0}</span>
                                                            <span className="text-gold">R: {member.player?.rating || 1500}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${member.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                                            }`}>
                                                            <div className={`w-1 h-1 rounded-full ${member.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                                            {member.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button 
                                                                onClick={() => editMember(member)}
                                                                className="text-[10px] font-bold uppercase tracking-widest text-brand hover:text-white transition-all bg-brand/10 hover:bg-brand px-2 py-1 rounded-lg"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button 
                                                                onClick={() => deleteMember(member.id)}
                                                                className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-white transition-all bg-red-500/10 hover:bg-red-500 px-2 py-1 rounded-lg"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Member Banners Module */}
                    {activeModule === 'member-banners' && (
                        <AdminMemberBanners />
                    )}

                    {/* Tournaments Module */}
                    {activeModule === 'tournaments' && (
                        <AdminTournaments />
                    )}

                    {/* Players Module */}
                    {activeModule === 'players' && (
                        <AdminPlayers />
                    )}

                    {/* Rankings Module */}
                    {activeModule === 'rankings' && (
                        <AdminRankings />
                    )}

                    {/* Site Images Module */}
                    {activeModule === 'site-images' && (
                        <AdminSiteImages />
                    )}

                    {/* Videos Module */}
                    {activeModule === 'videos' && (
                        <AdminVideos />
                    )}

                    {/* Food Menu Module */}
                    {activeModule === 'food-menu' && (
                        <AdminFoodMenu />
                    )}

                    {/* Match My Game Module */}
                    {activeModule === 'match-my-game' && (
                        <AdminMatchMyGame />
                    )}

                    {/* Weekly Schedule Module */}
                    {activeModule === 'weekly-schedule' && (
                        <AdminWeeklySchedule />
                    )}

                    {/* Contact Info Module */}
                    {activeModule === 'contact-info' && (
                        <AdminContactInfo />
                    )}

                    {/* Social Links Module */}
                    {activeModule === 'social-links' && (
                        <AdminSocialLinks />
                    )}

                    {/* Membership Plans Module */}
                    {activeModule === 'membership-plans' && (
                        <AdminMembershipPlans />
                    )}

                    {/* Event Pricing Module */}
                    {activeModule === 'event-pricing' && (
                        <AdminEventPricing />
                    )}

                    {/* Game Galleries Module */}
                    {activeModule === 'game-galleries' && (
                        <AdminGameGalleries />
                    )}

                    {activeModule === 'page-heroes' && (
                        <AdminPageHeroes />
                    )}

                    {activeModule === 'event-previews' && (
                        <AdminEventPreviews />
                    )}

                    {/* Placeholder for other modules */}
                    {['settings'].includes(activeModule) && (
                        <div className="h-full flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in-95 duration-500">
                            <div className="w-20 h-20 rounded-3xl bg-white/[0.02] border border-white/10 flex items-center justify-center mb-6 text-brand">
                                <Settings size={40} />
                            </div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Module Under Construction</h2>
                            <p className="text-gray-500 text-sm mt-2 max-w-sm text-center">We're building this part of the CMS to be perfectly integrated with the live site.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminCMS;
