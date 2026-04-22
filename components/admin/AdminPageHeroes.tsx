import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/Toast';
import { Loader2, Save, Image as ImageIcon, Upload } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeroData {
    url: string;
    title: string;
}

const HERO_CONFIG = [
    { slug: 'hero-billiards', label: 'Billiards Page Hero', defaultTitle: 'World-Class Billiards' },
    { slug: 'hero-chess', label: 'Chess Page Hero', defaultTitle: 'Strategic Excellence' },
    { slug: 'hero-darts', label: 'Darts Page Hero', defaultTitle: 'Precision Darts' },
    { slug: 'hero-event-place', label: 'Event Place Page Hero', defaultTitle: 'Premium Event Place' },
    { slug: 'hero-karaoke', label: 'Karaoke Page Hero', defaultTitle: 'Private Karaoke Rooms' }
];

const AdminPageHeroes: React.FC = () => {
    const { profile } = useAuth();
    const { showToast, ToastContainer } = useToast();
    const [heroes, setHeroes] = useState<Record<string, HeroData>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [uploadingSlug, setUploadingSlug] = useState<string | null>(null);

    useEffect(() => {
        fetchHeroes();
    }, []);

    const fetchHeroes = async () => {
        setLoading(true);
        try {
            const { data, error } = await (supabase.from('cms_content') as any)
                .select('*')
                .in('slug', HERO_CONFIG.map(h => h.slug));

            if (error) throw error;

            const fetched: Record<string, HeroData> = {};
            data?.forEach((row: any) => {
                fetched[row.slug] = typeof row.body === 'string' ? JSON.parse(row.body) : row.body;
            });

            // Fill defaults if missing
            HERO_CONFIG.forEach(h => {
                if (!fetched[h.slug]) {
                    fetched[h.slug] = { url: '', title: h.defaultTitle };
                }
            });

            setHeroes(fetched);
        } catch (err: any) {
            console.error('Error fetching heroes:', err);
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (slug: string) => {
        setSaving(slug);
        try {
            const { error } = await (supabase.from('cms_content') as any)
                .upsert({
                    slug,
                    title: HERO_CONFIG.find(h => h.slug === slug)?.label || 'Page Hero',
                    body: heroes[slug],
                    published: true,
                    author_id: profile?.id
                }, { onConflict: 'slug' });

            if (error) throw error;
            showToast(`${slug} updated successfully!`, 'success');
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setSaving(null);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, slug: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingSlug(slug);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `page-hero-${slug}-${Date.now()}.${fileExt}`;
            const { error } = await supabase.storage
                .from('cms_uploads')
                .upload(fileName, file);

            if (error) throw error;

            const { data: publicUrlData } = supabase.storage
                .from('cms_uploads')
                .getPublicUrl(fileName);

            updateField(slug, 'url', publicUrlData.publicUrl);
            showToast('Image uploaded successfully', 'success');
        } catch (err: any) {
            showToast(err.message || 'Error uploading file', 'error');
        } finally {
            setUploadingSlug(null);
        }
    };

    const updateField = (slug: string, field: keyof HeroData, value: string) => {
        setHeroes(prev => ({
            ...prev,
            [slug]: { ...prev[slug], [field]: value }
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-brand" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
            <ToastContainer />
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                        <ImageIcon className="text-brand" size={28} /> Page Heroes
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage banner images and main titles for all service pages.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {HERO_CONFIG.map(({ slug, label }) => {
                    const hero = heroes[slug];
                    const isSaving = saving === slug;
                    const isUploading = uploadingSlug === slug;

                    return (
                        <div key={slug} className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl group">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 text-brand">
                                    <span className="w-2 h-2 rounded-full bg-brand"></span>
                                    {label}
                                </h3>
                                <button
                                    onClick={() => handleSave(slug)}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-6 py-2 bg-brand text-white rounded-xl text-xs font-bold hover:bg-brand/90 transition-all shadow-lg shadow-brand/20 disabled:opacity-50 uppercase tracking-widest"
                                >
                                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    Save
                                </button>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="aspect-video w-full rounded-2xl bg-black border border-white/10 overflow-hidden relative group-hover:border-brand/30 transition-colors">
                                        {hero.url ? (
                                            <img src={hero.url} alt={label} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-700">
                                                <ImageIcon size={32} />
                                                <span className="text-[10px] uppercase font-black tracking-widest mt-2">No Image</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                            <label className="cursor-pointer px-4 py-2 bg-brand text-white rounded-lg text-xs font-bold hover:bg-brand/90 transition-colors uppercase tracking-widest shadow-xl flex items-center gap-2">
                                                {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                                {hero.url ? 'Change Image' : 'Upload Image'}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => handleFileUpload(e, slug)}
                                                    disabled={isUploading}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                    <input
                                        type="url"
                                        value={hero.url}
                                        onChange={(e) => updateField(slug, 'url', e.target.value)}
                                        placeholder="Or paste URL here..."
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-brand/40"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2 block">Hero Heading Text</label>
                                        <input
                                            type="text"
                                            value={hero.title}
                                            onChange={(e) => updateField(slug, 'title', e.target.value)}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold focus:outline-none focus:border-brand/40"
                                            placeholder="e.g. World-Class Billiards"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AdminPageHeroes;
