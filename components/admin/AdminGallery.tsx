import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/Toast';
import { Loader2, Save, Plus, Trash2, Image as ImageIcon, Upload } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface GalleryImage {
    url: string;
    description: string;
    category: string;
}

const AdminGallery: React.FC = () => {
    const { profile } = useAuth();
    const { showToast, ToastContainer } = useToast();
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchGallery();
    }, []);

    const fetchGallery = async () => {
        setLoading(true);
        try {
            const { data, error } = await (supabase.from('cms_content') as any)
                .select('*')
                .eq('slug', 'gallery')
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data && data.body) {
                const parsed = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
                setImages(parsed.images || []);
            } else {
                setImages([
                    { url: "https://iili.io/qfWIEss.jpg", description: "Professional Yalin Tables", category: "billiards" },
                    { url: "https://iili.io/qFN1vwb.jpg", description: "VIP Lounge Area", category: "vip" },
                    { url: "https://iili.io/qFNV7xs.jpg", description: "Tournament Finals", category: "tournaments" },
                    { url: "https://iili.io/q2fFdAP.jpg", description: "Sports Cafe", category: "cafe" }
                ]);
            }
        } catch (err: any) {
            console.error('Error fetching gallery:', err);
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
                    slug: 'gallery',
                    title: 'Image Gallery',
                    body: { images },
                    published: true,
                    author_id: profile?.id
                }, { onConflict: 'slug' });

            if (error) throw error;
            showToast('Gallery updated successfully!', 'success');
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const addImage = (url: string = '') => {
        setImages([{ url, description: '', category: 'general' }, ...images]);
    };

    const updateImage = (index: number, field: keyof GalleryImage, value: string) => {
        const newImages = [...images];
        newImages[index][field] = value;
        setImages(newImages);
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `gallery-${Date.now()}.${fileExt}`;
            const { error } = await supabase.storage
                .from('cms_uploads')
                .upload(fileName, file);

            if (error) throw error;

            const { data: publicUrlData } = supabase.storage
                .from('cms_uploads')
                .getPublicUrl(fileName);

            addImage(publicUrlData.publicUrl);
            showToast('Image uploaded successfully', 'success');
        } catch (err: any) {
            showToast(err.message || 'Error uploading file', 'error');
        } finally {
            setUploading(false);
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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
            <ToastContainer />
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Image Gallery</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage images shown in the gallery section.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand/90 transition-all shadow-lg shadow-brand/20 disabled:opacity-50"
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Save Gallery
                </button>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl flex flex-col gap-4">
                <div className="flex gap-4 items-center">
                    <button
                        onClick={() => addImage('')}
                        className="px-6 py-3 bg-white text-black font-bold text-sm rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Add Empty Entry
                    </button>
                    <div className="flex items-center gap-4 text-sm font-bold text-gray-400">
                        <span className="w-10 h-px bg-white/10"></span> OR <span className="w-10 h-px bg-white/10"></span>
                    </div>
                    <label className="flex-1 cursor-pointer bg-white/[0.03] border border-dashed border-white/20 hover:border-brand/50 rounded-xl px-4 py-4 text-center text-white text-sm transition-all relative">
                        <div className="flex items-center justify-center gap-2">
                            {uploading ? <Loader2 size={20} className="animate-spin text-brand" /> : <Upload size={20} className="text-brand" />}
                            <span>{uploading ? 'Uploading...' : 'Click to upload image file securely'}</span>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            disabled={uploading}
                        />
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {images.map((img, idx) => (
                    <div key={idx} className="rounded-xl bg-white/[0.02] border border-white/10 overflow-hidden flex flex-col">
                        <div className="aspect-video bg-black relative group">
                            {img.url ? (
                                <img src={img.url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600">
                                    <ImageIcon size={32} />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center p-4">
                                <button
                                    onClick={() => removeImage(idx)}
                                    className="px-4 py-2 bg-red-500/80 text-white rounded-lg text-xs font-bold hover:bg-red-500 transition-colors uppercase tracking-widest shadow-xl"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                        <div className="p-4 space-y-3 flex-1 flex flex-col">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Image URL</label>
                                <input
                                    type="text"
                                    value={img.url}
                                    onChange={(e) => updateImage(idx, 'url', e.target.value)}
                                    placeholder="https://..."
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-brand/40"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Category</label>
                                <input
                                    type="text"
                                    value={img.category}
                                    onChange={(e) => updateImage(idx, 'category', e.target.value)}
                                    placeholder="e.g. billiards, vip"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-brand/40"
                                />
                            </div>
                            <div className="space-y-1 flex-1">
                                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Description</label>
                                <textarea
                                    value={img.description}
                                    onChange={(e) => updateImage(idx, 'description', e.target.value)}
                                    placeholder="Image description..."
                                    rows={2}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-brand/40 resize-none h-full"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminGallery;
