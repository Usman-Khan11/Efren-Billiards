import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/Toast';
import { Loader2, Save, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminSocialLinks: React.FC = () => {
    const { profile } = useAuth();
    const { showToast, ToastContainer } = useToast();
    const [socialLinks, setSocialLinks] = useState({
        facebook: '',
        instagram: '',
        tiktok: '',
        whatsapp: '',
        linkedin: '',
        googleBusinessProfile: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSocialLinks();
    }, []);

    const fetchSocialLinks = async () => {
        setLoading(true);
        try {
            const { data, error } = await (supabase.from('cms_content') as any)
                .select('*')
                .eq('slug', 'social-links')
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data && data.body) {
                const parsed = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
                setSocialLinks(parsed);
            } else {
                setSocialLinks({
                    facebook: "https://www.facebook.com/share/1DZ7ux6Qmi/?mibextid=wwXIfr",
                    instagram: "https://www.instagram.com/efrenbilliards?igsh=YnQwdDI1MjJ0aDZm",
                    tiktok: "https://www.tiktok.com/@efren.billiards.m?_r=1&_t=ZS-93hdvwpNUdp",
                    whatsapp: "https://wa.me/97451622111",
                    linkedin: "",
                    googleBusinessProfile: ""
                });
            }
        } catch (err: any) {
            console.error('Error fetching social links:', err);
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
                    slug: 'social-links',
                    title: 'Social Media Links',
                    body: socialLinks,
                    published: true,
                    author_id: profile?.id
                }, { onConflict: 'slug' });

            if (error) throw error;
            showToast('Social links updated successfully!', 'success');
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setSocialLinks(prev => ({ ...prev, [field]: value }));
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
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Social Links</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage URLs for social media profiles.</p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <LinkIcon size={120} />
                </div>
                
                {['facebook', 'instagram', 'tiktok', 'whatsapp', 'linkedin', 'googleBusinessProfile'].map((platform) => (
                    <div key={platform} className="space-y-2 relative z-10 md:col-span-2">
                        <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black px-1">{platform}</label>
                        <input
                            type="url"
                            value={socialLinks[platform as keyof typeof socialLinks] || ''}
                            onChange={e => handleChange(platform, e.target.value)}
                            placeholder={`https://${platform}.com/...`}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-sm focus:outline-none focus:border-brand/50 transition-all"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminSocialLinks;
