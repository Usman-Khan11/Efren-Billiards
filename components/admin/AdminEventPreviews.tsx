import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/Toast';
import { Loader2, Save, Image as ImageIcon, Upload } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface EventPreview {
    image: string;
    description: string;
}

const defaultContent: Record<string, EventPreview> = {
    'Corporate event': {
        image: 'https://iili.io/q2MS4TJ.md.jpg',
        description: 'Elegant seating, buffet setup, and premium lighting.'
    },
    'Tournament': {
        image: 'https://iili.io/q2MSgpa.md.jpg',
        description: 'Optimized floorplan for competitive play and spectator viewing.'
    },
    'Birthday': {
        image: 'https://iili.io/q2MSjhx.md.jpg',
        description: 'Casual layout with dance floor and catering stations.'
    }
};

const AdminEventPreviews: React.FC = () => {
    const { profile } = useAuth();
    const { showToast, ToastContainer } = useToast();
    const [previews, setPreviews] = useState<Record<string, EventPreview>>(defaultContent);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingKey, setUploadingKey] = useState<string | null>(null);

    const eventTypes = ['Corporate event', 'Tournament', 'Birthday'];

    useEffect(() => {
        fetchPreviews();
    }, []);

    const fetchPreviews = async () => {
        setLoading(true);
        try {
            const { data, error } = await (supabase.from('cms_content') as any)
                .select('*')
                .eq('slug', 'event-previews')
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data && data.body) {
                setPreviews(typeof data.body === 'string' ? JSON.parse(data.body) : data.body);
            }
        } catch (err: any) {
            console.error('Error fetching event previews:', err);
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await (supabase.from('cms_content') as any)
                .upsert({
                    slug: 'event-previews',
                    title: 'Event Estimator Previews',
                    body: previews,
                    published: true,
                    author_id: profile?.id
                }, { onConflict: 'slug' });

            if (error) throw error;
            showToast('Event previews updated successfully!', 'success');
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingKey(key);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `event-preview-${key.toLowerCase().replace(' ', '-')}-${Date.now()}.${fileExt}`;
            const { error } = await supabase.storage
                .from('cms_uploads')
                .upload(fileName, file);

            if (error) throw error;

            const { data: publicUrlData } = supabase.storage
                .from('cms_uploads')
                .getPublicUrl(fileName);

            updateField(key, 'image', publicUrlData.publicUrl);
            showToast('Image uploaded successfully', 'success');
        } catch (err: any) {
            showToast(err.message || 'Error uploading file', 'error');
        } finally {
            setUploadingKey(null);
        }
    };

    const updateField = (key: string, field: keyof EventPreview, value: string) => {
        setPreviews(prev => ({
            ...prev,
            [key]: { ...prev[key], [field]: value }
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
                        <ImageIcon className="text-brand" size={28} /> Event Previews
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage the images and descriptions shown in the Budget Estimator.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand/90 transition-all shadow-lg shadow-brand/20 disabled:opacity-50 uppercase tracking-widest"
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {eventTypes.map((type) => {
                    const preview = previews[type] || defaultContent[type];
                    const isUploading = uploadingKey === type;

                    return (
                        <div key={type} className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl group">
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2 text-brand">
                                <span className="w-2 h-2 rounded-full bg-brand"></span>
                                {type}
                            </h3>
                            
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="aspect-video w-full rounded-2xl bg-black border border-white/10 overflow-hidden relative group-hover:border-brand/30 transition-colors">
                                        <img src={preview.image} alt={type} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                            <label className="cursor-pointer px-4 py-2 bg-brand text-white rounded-lg text-xs font-bold hover:bg-brand/90 transition-colors uppercase tracking-widest shadow-xl flex items-center gap-2">
                                                {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                                Change Image
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => handleFileUpload(e, type)}
                                                    disabled={isUploading}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                    <input
                                        type="url"
                                        value={preview.image}
                                        onChange={(e) => updateField(type, 'image', e.target.value)}
                                        placeholder="Or paste URL here..."
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-brand/40"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2 block">Preview Description</label>
                                        <textarea
                                            value={preview.description}
                                            onChange={(e) => updateField(type, 'description', e.target.value)}
                                            rows={4}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-4 text-white text-sm focus:outline-none focus:border-brand/40 resize-none leading-relaxed"
                                            placeholder="Write a short description of this event setup..."
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

export default AdminEventPreviews;
