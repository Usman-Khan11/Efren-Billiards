import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/Toast';
import { Loader2, Save, Phone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminContactInfo: React.FC = () => {
    const { profile } = useAuth();
    const { showToast, ToastContainer } = useToast();
    const [contactInfo, setContactInfo] = useState({
        address: '',
        phone: '',
        email: '',
        hours: '',
        whatsapp: '',
        mapsUrl: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchContactInfo();
    }, []);

    const fetchContactInfo = async () => {
        setLoading(true);
        try {
            const { data, error } = await (supabase.from('cms_content') as any)
                .select('*')
                .eq('slug', 'contact-info')
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data && data.body) {
                const parsed = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
                setContactInfo(parsed);
            } else {
                setContactInfo({
                    address: "5th Floor Captsone Bldg., Al Mansoura\nDoha, Qatar",
                    phone: "+974 50986454, +974 66953450",
                    email: "efrenbilliards@gmail.com",
                    hours: "Open 24 Hours Daily",
                    whatsapp: "97451622111",
                    mapsUrl: "https://maps.app.goo.gl/NAggUvmWoE7Vh7cA6?g_st=ic"
                });
            }
        } catch (err: any) {
            console.error('Error fetching contact info:', err);
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
                    slug: 'contact-info',
                    title: 'Contact Information',
                    body: contactInfo,
                    published: true,
                    author_id: profile?.id
                }, { onConflict: 'slug' });

            if (error) throw error;
            showToast('Contact info updated successfully!', 'success');
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setContactInfo(prev => ({ ...prev, [field]: value }));
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
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Contact Info</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage address, phone, and email details.</p>
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
                    <Phone size={120} />
                </div>
                <div className="space-y-2 relative z-10 md:col-span-2">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black px-1">Address</label>
                    <input
                        type="text"
                        value={contactInfo.address || ''}
                        onChange={e => handleChange('address', e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-sm focus:outline-none focus:border-brand/50 transition-all"
                    />
                </div>
                <div className="space-y-2 relative z-10 md:col-span-2">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black px-1">Google Maps URL</label>
                    <input
                        type="text"
                        value={contactInfo.mapsUrl || ''}
                        onChange={e => handleChange('mapsUrl', e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-sm focus:outline-none focus:border-brand/50 transition-all"
                    />
                </div>
                <div className="space-y-2 relative z-10">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black px-1">Phone Number(s)</label>
                    <input
                        type="text"
                        value={contactInfo.phone || ''}
                        onChange={e => handleChange('phone', e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-sm focus:outline-none focus:border-brand/50 transition-all"
                    />
                </div>
                <div className="space-y-2 relative z-10">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black px-1">WhatsApp Number</label>
                    <input
                        type="text"
                        value={contactInfo.whatsapp || ''}
                        onChange={e => handleChange('whatsapp', e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-sm focus:outline-none focus:border-brand/50 transition-all"
                    />
                </div>
                <div className="space-y-2 relative z-10">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black px-1">Email Address</label>
                    <input
                        type="email"
                        value={contactInfo.email || ''}
                        onChange={e => handleChange('email', e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-sm focus:outline-none focus:border-brand/50 transition-all"
                    />
                </div>
                <div className="space-y-2 relative z-10">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black px-1">Opening Hours</label>
                    <input
                        type="text"
                        value={contactInfo.hours || ''}
                        onChange={e => handleChange('hours', e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-sm focus:outline-none focus:border-brand/50 transition-all"
                    />
                </div>
            </div>
        </div>
    );
};

export default AdminContactInfo;
