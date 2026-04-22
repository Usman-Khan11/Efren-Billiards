import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/Toast';
import { Loader2, Save, Upload, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const IMAGE_KEYS = [
    { key: 'site-logo', label: 'Site Logo (Navbar/Footer)' },
    { key: 'promo-banner-bg', label: 'Promo Banner Background' },
    { key: 'hero-billiards', label: 'Billiards Page Banner' },
    { key: 'hero-chess', label: 'Chess Page Banner' },
    { key: 'hero-darts', label: 'Darts Page Banner' },
    { key: 'hero-event-place', label: 'Event Place Page Banner' },
    { key: 'hero-karaoke', label: 'Karaoke Page Banner' }
];

const AdminSiteImages: React.FC = () => {
    const { profile } = useAuth();
    const { showToast, ToastContainer } = useToast();
    const [images, setImages] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingKey, setUploadingKey] = useState<string | null>(null);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        setLoading(true);
        try {
            const { data, error } = await (supabase.from('cms_content') as any)
                .select('*')
                .eq('slug', 'site-images')
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data && data.body) {
                setImages(typeof data.body === 'string' ? JSON.parse(data.body) : data.body);
            } else {
                setImages({
                    'site-logo': 'https://iili.io/qfWIEss.jpg',
                    'promo-banner-bg': 'https://iili.io/qFNV7xs.jpg'
                });
            }
        } catch (err: any) {
            console.error('Error fetching site images:', err);
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
                    slug: 'site-images',
                    title: 'Site Images',
                    body: images,
                    published: true,
                    author_id: profile?.id
                }, { onConflict: 'slug' });

            if (error) throw error;
            showToast('Site images updated successfully!', 'success');
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (key: string, file: File) => {
        setUploadingKey(key);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${key}-${Date.now()}.${fileExt}`;
            const { error } = await supabase.storage
                .from('cms_uploads')
                .upload(fileName, file);

            if (error) throw error;

            const { data: publicUrlData } = supabase.storage
                .from('cms_uploads')
                .getPublicUrl(fileName);

            setImages(prev => ({ ...prev, [key]: publicUrlData.publicUrl }));
            showToast('Image uploaded successfully', 'success');
        } catch (err: any) {
            showToast(err.message || 'Error uploading file', 'error');
        } finally {
            setUploadingKey(null);
        }
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
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Site Images</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage global static assets for the website.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand/90 transition-all shadow-lg shadow-brand/20 disabled:opacity-50"
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {IMAGE_KEYS.map(({ key, label }) => (
                    <div key={key} className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl flex flex-col gap-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">{label}</h3>
                        
                        <div className="aspect-video w-full rounded-xl bg-black border border-white/10 flex items-center justify-center text-gray-600 relative overflow-hidden group">
                            {images[key] ? (
                                <img src={images[key]} alt={label} className="w-full h-full object-cover" />
                            ) : (
                                <ImageIcon size={32} className="opacity-50" />
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center p-4">
                                <label className="cursor-pointer px-4 py-2 bg-brand text-white rounded-lg text-xs font-bold hover:bg-brand/90 transition-colors uppercase tracking-widest shadow-xl flex items-center gap-2">
                                    {uploadingKey === key ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                    Upload New
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                                handleFileUpload(key, e.target.files[0]);
                                            }
                                        }}
                                        disabled={uploadingKey === key}
                                    />
                                </label>
                            </div>
                        </div>
                        <input
                            type="text"
                            value={images[key] || ''}
                            onChange={(e) => setImages(prev => ({ ...prev, [key]: e.target.value }))}
                            placeholder="Or paste image URL here..."
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-brand/40"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminSiteImages;
