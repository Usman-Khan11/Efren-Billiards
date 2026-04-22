import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/Toast';
import { Loader2, Save, Plus, Trash2, Video } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface VideoLink {
    title: string;
    url: string;
}

const AdminVideos: React.FC = () => {
    const { profile } = useAuth();
    const { showToast, ToastContainer } = useToast();
    const [videos, setVideos] = useState<VideoLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        setLoading(true);
        try {
            const { data, error } = await (supabase.from('cms_content') as any)
                .select('*')
                .eq('slug', 'videos')
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data && data.body) {
                const parsed = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
                setVideos(parsed.videos || []);
            } else {
                setVideos([
                    { title: 'Hero Background', url: 'https://www.youtube.com/embed/RfiLxYAGQYY' },
                    { title: 'Cinematic Highlights', url: 'https://www.youtube.com/embed/KfPa315R4DI' },
                    { title: 'Membership Background', url: 'https://www.youtube.com/embed/RfiLxYAGQYY' }
                ]);
            }
        } catch (err: any) {
            console.error('Error fetching videos:', err);
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
                    slug: 'videos',
                    title: 'YouTube Videos',
                    body: { videos },
                    published: true,
                    author_id: profile?.id
                }, { onConflict: 'slug' });

            if (error) throw error;
            showToast('Videos updated successfully!', 'success');
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const addVideo = () => {
        setVideos([...videos, { title: '', url: '' }]);
    };

    const updateVideo = (index: number, field: keyof VideoLink, value: string) => {
        const newVideos = [...videos];
        newVideos[index][field] = value;
        setVideos(newVideos);
    };

    const removeVideo = (index: number) => {
        setVideos(videos.filter((_, i) => i !== index));
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
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">YouTube Videos</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage video links displayed on the site.</p>
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

            <div className="space-y-4">
                {videos.map((video, index) => (
                    <div key={index} className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl flex flex-col md:flex-row gap-4 items-start md:items-center">
                        <div className="flex-1 space-y-2 w-full">
                            <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Video Title</label>
                            <div className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-gray-400 text-sm font-bold">
                                {video.title}
                            </div>
                        </div>
                        <div className="flex-1 space-y-2 w-full">
                            <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">YouTube URL</label>
                            <input
                                type="text"
                                value={video.url}
                                onChange={(e) => updateVideo(index, 'url', e.target.value)}
                                placeholder="https://youtube.com/watch?v=..."
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand/40"
                            />
                        </div>

                    </div>
                ))}


            </div>
        </div>
    );
};

export default AdminVideos;
