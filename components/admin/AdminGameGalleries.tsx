import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/Toast';
import { Loader2, Save, Plus, Trash2, Image as ImageIcon, Upload } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface GalleryImage {
    url: string;
    title?: string;
    description?: string;
}

interface GalleryData {
    title: string;
    images: (string | GalleryImage)[];
}

const defaultContent: Record<string, GalleryData> = {
    billiards: {
        title: "World-Class Yalin Tables",
        images: [
            { url: "https://images.unsplash.com/photo-1595859703086-1d1230e87dcb?q=80&w=1470&auto=format&fit=crop", title: "Precision Strike", description: "A showcase of pinpoint accuracy and professional-grade Yalin tables, built for champions." },
            { url: "https://images.unsplash.com/photo-1549488344-c6b12a0614f1?q=80&w=1470&auto=format&fit=crop", title: "Masterful Break", description: "Analyzing the geometry of the table before executing the perfect sequence of shots." }
        ]
    },
    chess: {
        title: "Premium Chess Lounge",
        images: [
            { url: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?q=80&w=1471&auto=format&fit=crop", title: "Grandmaster's Vision", description: "Surrounded by an atmosphere of deep focus, where every move dictates the outcome." }
        ]
    },
    darts: {
        title: "Tournament-Grade Darts",
        images: [
            { url: "https://images.unsplash.com/photo-1629168953153-f7cc8cbee015?q=80&w=1470&auto=format&fit=crop", title: "Bullseye Focus", description: "Precision is key. Every throw is a calculated arc towards perfection." }
        ]
    }
};

const AdminGameGalleries: React.FC = () => {
    const { profile } = useAuth();
    const { showToast, ToastContainer } = useToast();
    const [galleries, setGalleries] = useState<Record<string, GalleryData>>(defaultContent);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState<{ gameType: string, index: number } | null>(null);

    const gameTypes = ['billiards', 'chess', 'darts'];

    useEffect(() => {
        fetchGalleries();
    }, []);

    const fetchGalleries = async () => {
        setLoading(true);
        try {
            const { data, error } = await (supabase.from('cms_content') as any)
                .select('*')
                .like('slug', 'game-gallery-%');

            if (error) throw error;

            const fetched: Record<string, GalleryData> = { ...defaultContent };
            data?.forEach((row: any) => {
                const gameType = row.slug.replace('game-gallery-', '');
                if (fetched[gameType]) {
                    fetched[gameType] = typeof row.body === 'string' ? JSON.parse(row.body) : row.body;
                }
            });

            setGalleries(fetched);
        } catch (err: any) {
            console.error('Error fetching galleries:', err);
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (gameType: string) => {
        setSaving(gameType);
        try {
            const { error } = await (supabase.from('cms_content') as any)
                .upsert({
                    slug: `game-gallery-${gameType}`,
                    title: `${gameType} Gallery`,
                    body: galleries[gameType],
                    published: true,
                    author_id: profile?.id
                }, { onConflict: 'slug' });

            if (error) throw error;
            showToast(`${gameType} gallery updated successfully!`, 'success');
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setSaving(null);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, gameType: string, index: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage({ gameType, index });
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `game-gallery-${gameType}-${Date.now()}.${fileExt}`;
            const { error } = await supabase.storage
                .from('cms_uploads')
                .upload(fileName, file);

            if (error) throw error;

            const { data: publicUrlData } = supabase.storage
                .from('cms_uploads')
                .getPublicUrl(fileName);

            updateImageField(gameType, index, 'url', publicUrlData.publicUrl);
            showToast('Image uploaded successfully', 'success');
        } catch (err: any) {
            showToast(err.message || 'Error uploading file', 'error');
        } finally {
            setUploadingImage(null);
        }
    };

    const updateTitle = (gameType: string, newTitle: string) => {
        setGalleries(prev => ({
            ...prev,
            [gameType]: { ...prev[gameType], title: newTitle }
        }));
    };

    const addImage = (gameType: string) => {
        setGalleries(prev => ({
            ...prev,
            [gameType]: { ...prev[gameType], images: [...prev[gameType].images, { url: '', title: '', description: '' }] }
        }));
    };

    const updateImageField = (gameType: string, index: number, field: keyof GalleryImage, value: string) => {
        setGalleries(prev => {
            const newImages = [...prev[gameType].images];
            const currentImg = newImages[index];
            
            if (typeof currentImg === 'string') {
                newImages[index] = { url: field === 'url' ? value : currentImg, [field]: value };
            } else {
                newImages[index] = { ...currentImg, [field]: value };
            }
            
            return {
                ...prev,
                [gameType]: { ...prev[gameType], images: newImages }
            };
        });
    };

    const removeImage = (gameType: string, index: number) => {
        setGalleries(prev => {
            const newImages = prev[gameType].images.filter((_, i) => i !== index);
            return {
                ...prev,
                [gameType]: { ...prev[gameType], images: newImages }
            };
        });
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
            <div>
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                    <ImageIcon className="text-brand" size={28} /> Game Galleries
                </h1>
                <p className="text-gray-500 text-sm mt-1">Manage the carousel images and titles for Billiards, Chess, and Darts pages.</p>
            </div>

            <div className="space-y-8">
                {gameTypes.map((gameType) => {
                    const gallery = galleries[gameType];
                    const isSaving = saving === gameType;

                    return (
                        <div key={gameType} className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold uppercase text-white tracking-widest leading-none flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-brand block"></span>
                                    {gameType}
                                </h3>
                                <button
                                    onClick={() => handleSave(gameType)}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-6 py-2 bg-brand text-white rounded-xl text-xs font-bold hover:bg-brand/90 transition-all shadow-lg shadow-brand/20 disabled:opacity-50 uppercase tracking-widest"
                                >
                                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    Save
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2 block">Gallery Title (Optional text above carousel)</label>
                                    <input
                                        type="text"
                                        value={gallery.title}
                                        onChange={(e) => updateTitle(gameType, e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-brand/40"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4 block">Images</label>
                                    <div className="space-y-4">
                                        {gallery.images.map((img, index) => {
                                            const imgUrl = typeof img === 'string' ? img : img.url;
                                            const imgTitle = typeof img === 'string' ? '' : (img.title || '');
                                            const imgDesc = typeof img === 'string' ? '' : (img.description || '');

                                            return (
                                                <div key={index} className="bg-black/20 border border-white/5 p-4 rounded-2xl space-y-4">
                                                    <div className="flex gap-4 items-center">
                                                        <div className="w-20 h-16 bg-dark-900 rounded-xl border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                                                            {imgUrl ? (
                                                                <img src={imgUrl} alt="preview" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <ImageIcon size={20} className="text-gray-600" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 space-y-2">
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="url"
                                                                    value={imgUrl}
                                                                    onChange={(e) => updateImageField(gameType, index, 'url', e.target.value)}
                                                                    placeholder="Image URL (https://...)"
                                                                    className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-brand/40"
                                                                />
                                                                <div className="relative overflow-hidden group/upload shrink-0">
                                                                    <label className="cursor-pointer bg-white/5 hover:bg-brand text-white rounded-lg px-4 py-2 flex items-center justify-center transition-all gap-2 border border-white/10">
                                                                        {uploadingImage?.gameType === gameType && uploadingImage?.index === index ? (
                                                                            <Loader2 size={14} className="animate-spin" />
                                                                        ) : (
                                                                            <Upload size={14} />
                                                                        )}
                                                                        <span className="text-[10px] font-bold uppercase tracking-widest">Upload</span>
                                                                        <input
                                                                            type="file"
                                                                            accept="image/*"
                                                                            className="hidden"
                                                                            onChange={(e) => handleFileUpload(e, gameType, index)}
                                                                            disabled={!!uploadingImage}
                                                                        />
                                                                    </label>
                                                                </div>
                                                                <button
                                                                    onClick={() => removeImage(gameType, index)}
                                                                    className="p-2 text-gray-500 hover:text-red-500 transition-colors shrink-0"
                                                                    title="Remove Image"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-24">
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Photo Sub-title</label>
                                                            <input
                                                                type="text"
                                                                value={imgTitle}
                                                                onChange={(e) => updateImageField(gameType, index, 'title', e.target.value)}
                                                                placeholder="e.g. Precision Strike"
                                                                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-brand/40"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Photo Description</label>
                                                            <textarea
                                                                value={imgDesc}
                                                                onChange={(e) => updateImageField(gameType, index, 'description', e.target.value)}
                                                                placeholder="Tell the story behind this photo..."
                                                                rows={2}
                                                                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-brand/40 resize-none"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        <button
                                            onClick={() => addImage(gameType)}
                                            className="w-full py-3 border border-dashed border-white/10 rounded-xl text-gray-400 text-xs font-bold uppercase tracking-widest hover:border-brand/50 hover:text-white transition-all flex items-center justify-center gap-2 mt-2"
                                        >
                                            <Plus size={16} />
                                            Add Image
                                        </button>
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

export default AdminGameGalleries;
