import React, { useState, useEffect, useRef } from 'react';
import { 
    Plus, Save, Trash2, Zap, Target, MessageSquare, 
    CheckCircle, XCircle, Loader2, Search, Filter, 
    User, Crown, ShieldAlert, AlertCircle, Bold, Type, Palette,
    Trophy, Star, Pencil
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/Toast';
import type { MemberBanner, Profile, MembershipTier } from '../../types/database';

const Tooltip = ({ children, content }: { children: React.ReactNode, content: string }) => (
    <div className="relative group/tooltip">
        {children}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 translate-y-1 group-hover/tooltip:translate-y-0 border border-white/10 shadow-2xl backdrop-blur-md">
            {content}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90" />
        </div>
    </div>
);

const AdminMemberBanners: React.FC = () => {
    const { showToast } = useToast();
    const [banners, setBanners] = useState<MemberBanner[]>([]);
    const [members, setMembers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentBanner, setCurrentBanner] = useState<Partial<MemberBanner>>({
        title: '',
        marketing_message: '',
        instruction_message: '',
        target_type: 'general',
        target_value: null,
        whatsapp_preset: '',
        is_active: true
    });

    const marketingRef = useRef<HTMLTextAreaElement>(null);
    const instructionRef = useRef<HTMLTextAreaElement>(null);

    const tiers: MembershipTier[] = ['Guest', 'Bronze', 'Silver', 'Gold', 'Admin'];

    const insertTag = (ref: React.RefObject<HTMLTextAreaElement>, openTag: string, closeTag: string, field: 'marketing_message' | 'instruction_message') => {
        const el = ref.current;
        if (!el) return;

        const start = el.selectionStart;
        const end = el.selectionEnd;
        const text = el.value;
        const selectedText = text.substring(start, end);
        const newText = text.substring(0, start) + openTag + selectedText + closeTag + text.substring(end);

        setCurrentBanner(prev => ({ ...prev, [field]: newText }));

        // Refocus and set selection after state update (using setTimeout to wait for re-render)
        setTimeout(() => {
            el.focus();
            el.setSelectionRange(start + openTag.length, end + openTag.length);
        }, 0);
    };

    const RichTextToolbar = ({ textareaRef, field }: { textareaRef: React.RefObject<HTMLTextAreaElement | null>, field: 'marketing_message' | 'instruction_message' }) => (
        <div className="flex items-center gap-1 mb-2 p-1.5 bg-white/[0.03] border border-white/10 rounded-lg">
            <button
                onClick={() => insertTag(textareaRef, '<b>', '</b>', field)}
                className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-all"
                title="Bold"
            >
                <Bold size={14} />
            </button>
            <div className="w-px h-4 bg-white/10 mx-1" />
            <button
                onClick={() => insertTag(textareaRef, '<span class="font-galio uppercase tracking-widest">', '</span>', field)}
                className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-all"
                title="Galio Font"
            >
                <Type size={14} />
            </button>
            <div className="w-px h-4 bg-white/10 mx-1" />
            <button
                onClick={() => insertTag(textareaRef, '<span style="color: #D4AF37">', '</span>', field)}
                className="p-1.5 hover:bg-white/10 rounded text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all"
                title="Gold Color"
            >
                <Palette size={14} />
            </button>
            <button
                onClick={() => insertTag(textareaRef, '<span style="color: #C0C0C0">', '</span>', field)}
                className="p-1.5 hover:bg-white/10 rounded text-[#C0C0C0] hover:bg-[#C0C0C0]/10 transition-all"
                title="Silver Color"
            >
                <Palette size={14} />
            </button>
            <button
                onClick={() => insertTag(textareaRef, '<span style="color: #CD7F32">', '</span>', field)}
                className="p-1.5 hover:bg-white/10 rounded text-[#CD7F32] hover:bg-[#CD7F32]/10 transition-all"
                title="Bronze Color"
            >
                <Palette size={14} />
            </button>
        </div>
    );

    useEffect(() => {
        fetchBanners();
        fetchMembers();
    }, []);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('member_banners')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBanners(data || []);
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchMembers = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('full_name', { ascending: true });

            if (error) throw error;
            setMembers(data || []);
        } catch (err: any) {
            console.error('Error fetching members:', err);
        }
    };

    const handleSave = async () => {
        if (!currentBanner.title) {
            showToast('Title is required', 'error');
            return;
        }

        setSaving(true);
        try {
            const { error } = await supabase
                .from('member_banners')
                .upsert({
                    ...currentBanner,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            showToast('Banner saved successfully', 'success');
            setIsEditing(false);
            fetchBanners();
            setCurrentBanner({
                title: '',
                marketing_message: '',
                instruction_message: '',
                target_type: 'general',
                target_value: null,
                whatsapp_preset: '',
                is_active: true
            });
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this banner?')) return;

        try {
            const { error } = await supabase
                .from('member_banners')
                .delete()
                .eq('id', id);

            if (error) throw error;
            showToast('Banner deleted successfully', 'success');
            fetchBanners();
        } catch (err: any) {
            showToast(err.message, 'error');
        }
    };

    const toggleActive = async (banner: MemberBanner) => {
        try {
            const { error } = await supabase
                .from('member_banners')
                .update({ is_active: !banner.is_active })
                .eq('id', banner.id);

            if (error) throw error;
            fetchBanners();
        } catch (err: any) {
            showToast(err.message, 'error');
        }
    };

    const getTierColor = (tier: string = 'Guest') => {
        switch (tier.toLowerCase()) {
            case 'gold': return 'from-[#D4AF37] via-[#FFF8DC] to-[#B8860B]';
            case 'silver': return 'from-[#C0C0C0] via-[#F5F5F5] to-[#808080]';
            case 'bronze': return 'from-[#CD7F32] via-[#E3AF66] to-[#8B4513]';
            default: return 'from-[#D4AF37] via-[#FFF8DC] to-[#B8860B]';
        }
    };

    const getTierIcon = (tier: string = 'Guest') => {
        switch (tier.toLowerCase()) {
            case 'gold': return <Crown size={20} className="text-[#B8860B]" />;
            case 'silver': return <Star size={20} className="text-[#808080]" />;
            case 'bronze': return <Trophy size={20} className="text-[#8B4513]" />;
            default: return <Trophy size={20} className="text-[#B8860B]" />;
        }
    };

    const BannerPreview = () => {
        const previewTier = currentBanner.target_type === 'tier' ? currentBanner.target_value || 'Guest' : 'Guest';
        
        return (
            <div className="mb-12 space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 px-1">Live Preview</h4>
                <div className="w-full bg-[#0a0a0c] p-8 rounded-3xl border border-white/5 overflow-hidden relative">
                    <div className="flex flex-row gap-4 justify-center items-stretch scale-90 origin-top">
                        {/* Left Card */}
                        <div className="flex-[2] relative min-w-0">
                            <div className={`absolute -inset-[1px] bg-gradient-to-r ${getTierColor(previewTier)} rounded-2xl blur-[1px] opacity-30`}></div>
                            <div className="relative h-full p-4 rounded-2xl overflow-hidden backdrop-blur-2xl bg-white/5 border border-white/10 flex flex-col justify-between gap-4">
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`p-1.5 rounded-lg bg-gradient-to-br ${getTierColor(previewTier)} border border-white/20 text-black shadow-lg`}>
                                            <Trophy size={14} className="animate-pulse" />
                                        </div>
                                        <span className={`text-[7px] font-black uppercase tracking-[0.1em] bg-clip-text text-transparent bg-gradient-to-r ${getTierColor(previewTier)}`}>
                                            Premium Rewards
                                        </span>
                                    </div>
                                    <h2 className="text-sm font-black text-white uppercase tracking-tight mb-1">{currentBanner.title || 'Banner Title'}</h2>
                                    <div className="text-gray-300 text-[9px] font-medium leading-tight max-w-md" dangerouslySetInnerHTML={{ __html: currentBanner.marketing_message || 'Marketing message goes here...' }} />
                                </div>
                                <div className="relative z-10">
                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r ${getTierColor(previewTier)} text-black rounded-lg font-black uppercase tracking-widest text-[7px]`}>
                                        <MessageSquare size={10} />
                                        Upgrade to Bronze Now
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Card */}
                        <div className="flex-1 max-w-[140px] relative">
                            <div className={`absolute -inset-[1px] bg-gradient-to-r ${getTierColor(previewTier)} rounded-2xl blur-[1px] opacity-30`}></div>
                            <div className="relative h-full p-4 rounded-2xl overflow-hidden backdrop-blur-2xl bg-white/5 border border-white/10 flex flex-col justify-between gap-4">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getTierColor(previewTier)} flex items-center justify-center border border-white/30`}>
                                            {getTierIcon(previewTier)}
                                        </div>
                                    </div>
                                    <h3 className="text-white font-black text-[10px] mb-0.5">Member Name</h3>
                                    <div className={`h-0.5 w-6 bg-gradient-to-r ${getTierColor(previewTier)} rounded-full mb-1`}></div>
                                    <div className="text-gray-400 text-[7px] font-bold uppercase tracking-widest leading-tight italic" dangerouslySetInnerHTML={{ __html: currentBanner.instruction_message || 'Instruction message...' }} />
                                </div>
                                <div className="p-1.5 rounded-lg bg-black/40 border border-white/5 space-y-1">
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden p-[0.5px]">
                                        <div className={`h-full w-1/3 rounded-full bg-gradient-to-r ${getTierColor(previewTier)}`} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Member Banners</h1>
                    <p className="text-gray-500 text-sm mt-1">Create targeted marketing messages for members.</p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand/90 transition-all shadow-lg shadow-brand/20"
                    >
                        <Plus size={18} />
                        New Banner
                    </button>
                )}
            </div>

            {isEditing && (
                <section className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-brand rounded-full" />
                            {currentBanner.id ? 'Edit Banner' : 'Create New Banner'}
                        </h3>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-6 py-2 text-gray-400 hover:text-white text-sm font-bold transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-8 py-2.5 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand/90 transition-all shadow-lg shadow-brand/20 disabled:opacity-50"
                            >
                                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                {currentBanner.id ? 'Update Banner' : 'Save Banner'}
                            </button>
                        </div>
                    </div>

                    <BannerPreview />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black px-1">Banner Title</label>
                                <input
                                    type="text"
                                    value={currentBanner.title}
                                    onChange={e => setCurrentBanner(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="e.g., Upgrade to Gold"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-sm focus:outline-none focus:border-brand/50 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black px-1">Marketing Message</label>
                                <RichTextToolbar textareaRef={marketingRef} field="marketing_message" />
                                <textarea
                                    ref={marketingRef}
                                    value={currentBanner.marketing_message || ''}
                                    onChange={e => setCurrentBanner(prev => ({ ...prev, marketing_message: e.target.value }))}
                                    placeholder="The main message shown on the left side..."
                                    rows={3}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand/50 transition-all resize-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black px-1">Instruction Message (Right Side)</label>
                                <RichTextToolbar textareaRef={instructionRef} field="instruction_message" />
                                <textarea
                                    ref={instructionRef}
                                    value={currentBanner.instruction_message || ''}
                                    onChange={e => setCurrentBanner(prev => ({ ...prev, instruction_message: e.target.value }))}
                                    placeholder="Instructions for the user..."
                                    rows={2}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand/50 transition-all resize-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black px-1">WhatsApp Preset Message</label>
                                <input
                                    type="text"
                                    value={currentBanner.whatsapp_preset || ''}
                                    onChange={e => setCurrentBanner(prev => ({ ...prev, whatsapp_preset: e.target.value }))}
                                    placeholder="e.g., Hi, I want to upgrade to Gold..."
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand/50 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                                    <Target size={14} className="text-brand" /> Targeting Logic
                                </h4>
                                
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        {(['general', 'tier', 'specific_member'] as const).map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setCurrentBanner(prev => ({ ...prev, target_type: type, target_value: null }))}
                                                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                    currentBanner.target_type === type 
                                                    ? 'bg-brand text-white border-brand shadow-lg shadow-brand/20' 
                                                    : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'
                                                }`}
                                            >
                                                {type.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>

                                    {currentBanner.target_type === 'tier' && (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                            <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black px-1">Target Tier</label>
                                            <select
                                                value={currentBanner.target_value || ''}
                                                onChange={e => setCurrentBanner(prev => ({ ...prev, target_value: e.target.value }))}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand/50 transition-all appearance-none"
                                            >
                                                <option value="" disabled>Select a tier...</option>
                                                {tiers.map(tier => (
                                                    <option key={tier} value={tier} className="bg-[#0a0a0c]">{tier}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {currentBanner.target_type === 'specific_member' && (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                            <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black px-1">Target Member</label>
                                            <select
                                                value={currentBanner.target_value || ''}
                                                onChange={e => setCurrentBanner(prev => ({ ...prev, target_value: e.target.value }))}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand/50 transition-all appearance-none"
                                            >
                                                <option value="" disabled>Select a member...</option>
                                                {members.map(member => (
                                                    <option key={member.id} value={member.id} className="bg-[#0a0a0c]">
                                                        {member.full_name || 'Unnamed'} ({member.phone || member.email})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4 pt-2">
                                        <div className="flex items-center gap-3">
                                            <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black">Status:</label>
                                            <button
                                                onClick={() => setCurrentBanner(prev => ({ ...prev, is_active: !prev.is_active }))}
                                                className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
                                                    currentBanner.is_active ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-red-500/20 border-red-500/30'
                                                } border p-1`}
                                            >
                                                <motion.div 
                                                    animate={{ x: currentBanner.is_active ? 20 : 0 }}
                                                    className={`w-3.5 h-3.5 rounded-full shadow-lg ${
                                                        currentBanner.is_active ? 'bg-emerald-400' : 'bg-red-400'
                                                    }`}
                                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                />
                                            </button>
                                        </div>
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest italic">
                                            {currentBanner.target_type === 'general' ? 'Everyone will see this banner' : 
                                             currentBanner.target_type === 'tier' ? `Only ${currentBanner.target_value || 'selected'} members will see this` : 
                                             `Only a specific member will see this private message`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-brand" size={32} />
                    </div>
                ) : banners.length === 0 ? (
                    <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-3xl">
                        <AlertCircle className="mx-auto text-gray-500 mb-4" size={40} />
                        <h3 className="text-white font-bold">No Banners Found</h3>
                        <p className="text-gray-500 text-sm mt-1">Create your first member targeting banner above.</p>
                    </div>
                ) : (
                    banners.map(banner => (
                        <div 
                            key={banner.id}
                            className={`p-6 rounded-3xl bg-white/[0.02] border transition-all hover:bg-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-6 group ${
                                banner.is_active ? 'border-white/5' : 'border-red-500/10 grayscale opacity-60'
                            }`}
                        >
                            <div className="flex items-center gap-6 flex-1">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg ${
                                    banner.is_active ? 'bg-brand/10 border-brand/20 text-brand' : 'bg-gray-800 border-gray-700 text-gray-500'
                                }`}>
                                    <Zap size={24} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className="text-lg font-black text-white uppercase tracking-tight">{banner.title}</h4>
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-[0.2em] border ${
                                            banner.target_type === 'general' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                            banner.target_type === 'tier' ? 'bg-gold/10 text-gold border-gold/20' :
                                            'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                        }`}>
                                            {banner.target_type}
                                        </span>
                                        {banner.target_value && (
                                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                                » {banner.target_type === 'specific_member' ? 'Private' : banner.target_value}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-500 text-xs font-medium max-w-xl truncate">{banner.marketing_message}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Tooltip content={banner.is_active ? 'Deactivate' : 'Activate'}>
                                    <button 
                                        onClick={() => toggleActive(banner)}
                                        className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                                            banner.is_active ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-red-500/20 border-red-500/30'
                                        } border p-1 group-hover:scale-105`}
                                    >
                                        <motion.div 
                                            animate={{ x: banner.is_active ? 24 : 0 }}
                                            className={`w-4 h-4 rounded-full shadow-lg ${
                                                banner.is_active ? 'bg-emerald-400' : 'bg-red-400'
                                            } flex items-center justify-center`}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        >
                                            {banner.is_active ? <CheckCircle size={8} className="text-emerald-900" /> : <XCircle size={8} className="text-red-900" />}
                                        </motion.div>
                                    </button>
                                </Tooltip>

                                <Tooltip content="Edit Banner">
                                    <button 
                                        onClick={() => {
                                            setCurrentBanner(banner);
                                            setIsEditing(true);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:border-brand/40 transition-all group/edit"
                                    >
                                        <motion.div
                                            whileHover={{ rotate: [-10, 10, -10, 10, 0], scale: 1.1 }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <Pencil size={18} />
                                        </motion.div>
                                    </button>
                                </Tooltip>

                                <Tooltip content="Delete Banner">
                                    <button 
                                        onClick={() => handleDelete(banner.id)}
                                        className="p-2.5 bg-red-500/5 border border-red-500/10 rounded-xl text-red-400 hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        <motion.div whileHover={{ scale: 1.1, rotate: 5 }}>
                                            <Trash2 size={18} />
                                        </motion.div>
                                    </button>
                                </Tooltip>
                            </div>

                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminMemberBanners;