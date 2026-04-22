import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/Toast';
import { Loader2, Save, Calculator, Building, Trophy, Cake } from 'lucide-react';

interface EventPricing {
    corporate: number;
    tournament: number;
    birthday: number;
}

const DEFAULT_PRICING: EventPricing = {
    corporate: 150,
    tournament: 100,
    birthday: 80,
};

const CMS_SLUG = 'event-place-pricing';

const AdminEventPricing: React.FC = () => {
    const { showToast, ToastContainer } = useToast();
    const [pricing, setPricing] = useState<EventPricing>(DEFAULT_PRICING);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchPricing();
    }, []);

    const fetchPricing = async () => {
        setLoading(true);
        try {
            const { data, error } = await (supabase.from('cms_content') as any)
                .select('body')
                .eq('slug', CMS_SLUG)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            if (data?.body) {
                setPricing({ ...DEFAULT_PRICING, ...JSON.parse(data.body) });
            }
        } catch (err: any) {
            console.error('Error loading event pricing:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await (supabase.from('cms_content') as any).upsert({
                slug: CMS_SLUG,
                title: 'Event Place Base Pricing',
                body: JSON.stringify(pricing),
                published: true,
            }, { onConflict: 'slug' });

            if (error) throw error;
            showToast('Event pricing saved!', 'success');
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const eventTypes = [
        {
            key: 'corporate' as keyof EventPricing,
            label: 'Corporate Event',
            description: 'Per-hour base rate for corporate team events',
            icon: Building,
            color: 'blue',
        },
        {
            key: 'tournament' as keyof EventPricing,
            label: 'Tournament',
            description: 'Per-hour base rate for competitive tournaments',
            icon: Trophy,
            color: 'gold',
        },
        {
            key: 'birthday' as keyof EventPricing,
            label: 'Birthday Party',
            description: 'Per-hour base rate for birthday celebrations',
            icon: Cake,
            color: 'pink',
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 size={28} className="animate-spin text-brand" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ToastContainer />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                        <Calculator className="text-brand" size={28} /> Event Pricing
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Set the base price per person for each event type. This adjusts the Budget Estimator on the Event Place page.
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand/90 transition-all shadow-lg shadow-brand/20 disabled:opacity-50"
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Save Prices
                </button>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-6">
                {eventTypes.map(({ key, label, description, icon: Icon }) => (
                    <div key={key} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-5 hover:border-brand/20 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
                                <Icon size={20} />
                            </div>
                            <div>
                                <p className="text-white font-black text-sm uppercase tracking-wide">{label}</p>
                                <p className="text-gray-500 text-xs">{description}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black">
                                Base Price per Hour (QAR)
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand font-black text-sm">QAR</span>
                                <input
                                    type="number"
                                    min={1}
                                    step={5}
                                    value={pricing[key]}
                                    onChange={(e) => setPricing(prev => ({ ...prev, [key]: parseInt(e.target.value) || 0 }))}
                                    className="w-full bg-dark-900 border border-white/10 rounded-xl pl-14 pr-4 py-3 text-white font-bold text-lg focus:outline-none focus:border-brand/50 transition-all"
                                />
                            </div>
                        </div>

                        {/* Live preview calculation for 4 hours */}
                        <div className="bg-dark-900 rounded-xl p-4 text-center border border-white/5">
                            <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">Example (4 hours)</p>
                            <p className="text-2xl font-black text-white">
                                {(pricing[key] * 4).toLocaleString()} <span className="text-sm text-brand font-bold">QAR</span>
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Info Note */}
            <div className="p-4 rounded-xl bg-brand/5 border border-brand/10 text-sm text-gray-400">
                <strong className="text-brand">How it works:</strong> The Budget Estimator on the Event Place page multiplies the duration in hours by the base price for the selected event type. Changes saved here will reflect immediately on the live site.
            </div>
        </div>
    );
};

export default AdminEventPricing;
