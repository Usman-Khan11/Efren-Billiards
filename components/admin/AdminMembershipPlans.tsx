import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/Toast';
import { Loader2, Save, Plus, Trash2, Crown, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface MembershipPlan {
    id: string;
    name: string;
    desc: string;
    priceMonthly: number;
    priceAnnual: number;
    features: string[];
    isGold?: boolean;
    popular?: boolean;
}

const AdminMembershipPlans: React.FC = () => {
    const { profile } = useAuth();
    const { showToast, ToastContainer } = useToast();
    const [plans, setPlans] = useState<MembershipPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const { data, error } = await (supabase.from('cms_content') as any)
                .select('*')
                .eq('slug', 'membership-plans')
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data && data.body) {
                const parsed = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
                setPlans(parsed.plans || []);
            } else {
                setPlans([
                    {
                        id: "gold",
                        name: "Gold",
                        desc: "The ultimate VIP experience.",
                        priceMonthly: 85,
                        priceAnnual: 59,
                        features: [
                            "Free 3 hours playing time monthly",
                            "Discounted table rate: QAR30/hour with Free 1 large Efren signature coffee per visit",
                            "Free haircut (Soon to offer)",
                            "Free use of event place for 3 hours on your birthday (Valued @ QAR600)",
                            "20% Discounts in food and drinks",
                            "20% discount on event place rental",
                            "20% discount on photobooth and 360 videbooth rental",
                            "Free 7 sessions of professional career coaching (transferrable)"
                        ],
                        isGold: true
                    },
                    {
                        id: "silver",
                        name: "Silver",
                        desc: "For the regular enthusiast.",
                        priceMonthly: 60,
                        priceAnnual: 42,
                        features: [
                            "Free 2 hours playing time monthly",
                            "Discounted table rate: QAR30/hour",
                            "Free haircut (Soon to offer)",
                            "Free use of event place for 2 hours on your birthday (Valued @ QAR400)",
                            "20% Discounts in food and drinks",
                            "20% discount on event place rental",
                            "20% discount on photobooth and 360 videbooth rental",
                            "Free 5 sessions of professional career coaching (transferrable)"
                        ],
                        popular: true
                    },
                    {
                        id: "bronze",
                        name: "Bronze",
                        desc: "Perfect for casual players.",
                        priceMonthly: 35,
                        priceAnnual: 24,
                        features: [
                            "Free 1 hour playing time monthly",
                            "Discounted table rate: QAR30/hour",
                            "Free haircut (Soon to offer)",
                            "Free use of event place for 1 hour on your birthday (Valued @ QAR200)",
                            "20% Discounts in food and drinks",
                            "20% discount on event place rental",
                            "20% discount on photobooth and 360 videbooth rental",
                            "Free 3 sessions of professional career coaching (transferrable)"
                        ]
                    }
                ]);
            }
        } catch (err: any) {
            console.error('Error fetching plans:', err);
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
                    slug: 'membership-plans',
                    title: 'Membership Plans',
                    body: { plans },
                    published: true,
                    author_id: profile?.id
                }, { onConflict: 'slug' });

            if (error) throw error;
            showToast('Membership plans updated successfully!', 'success');
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const addPlan = () => {
        const newId = Math.random().toString(36).substr(2, 9);
        setPlans([...plans, {
            id: newId,
            name: 'New Plan',
            desc: 'Description here',
            priceMonthly: 0,
            priceAnnual: 0,
            features: []
        }]);
    };

    const updatePlan = (index: number, field: keyof MembershipPlan, value: any) => {
        const newPlans = [...plans];
        (newPlans[index] as any)[field] = value;
        setPlans(newPlans);
    };

    const removePlan = (index: number) => {
        setPlans(plans.filter((_, i) => i !== index));
    };

    const addFeature = (planIndex: number) => {
        const newPlans = [...plans];
        newPlans[planIndex].features.push('');
        setPlans(newPlans);
    };

    const updateFeature = (planIndex: number, featIndex: number, value: string) => {
        const newPlans = [...plans];
        newPlans[planIndex].features[featIndex] = value;
        setPlans(newPlans);
    };

    const removeFeature = (planIndex: number, featIndex: number) => {
        const newPlans = [...plans];
        newPlans[planIndex].features = newPlans[planIndex].features.filter((_, i) => i !== featIndex);
        setPlans(newPlans);
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
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Membership Plans</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage membership tiers, pricing, and features.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand/90 transition-all shadow-lg shadow-brand/20 disabled:opacity-50"
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Save Plans
                </button>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {plans.map((plan, idx) => (
                    <div key={idx} className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl relative">
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex-1 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Plan Name</label>
                                        <input
                                            type="text"
                                            value={plan.name}
                                            onChange={(e) => updatePlan(idx, 'name', e.target.value)}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-lg focus:outline-none focus:border-brand/40"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Short Description</label>
                                        <input
                                            type="text"
                                            value={plan.desc}
                                            onChange={(e) => updatePlan(idx, 'desc', e.target.value)}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand/40"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Monthly Price (QAR)</label>
                                        <input
                                            type="number"
                                            value={plan.priceMonthly}
                                            onChange={(e) => updatePlan(idx, 'priceMonthly', parseInt(e.target.value) || 0)}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand/40"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Annual Price (QAR/mo)</label>
                                        <input
                                            type="number"
                                            value={plan.priceAnnual}
                                            onChange={(e) => updatePlan(idx, 'priceAnnual', parseInt(e.target.value) || 0)}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand/40"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-6">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={plan.isGold}
                                            onChange={(e) => updatePlan(idx, 'isGold', e.target.checked)}
                                            className="w-5 h-5 rounded border-white/20 bg-white/5 text-brand focus:ring-brand"
                                        />
                                        <span className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors flex items-center gap-2">
                                            <Crown size={16} className={plan.isGold ? 'text-yellow-500' : ''} />
                                            Gold Tier (VIP)
                                        </span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={plan.popular}
                                            onChange={(e) => updatePlan(idx, 'popular', e.target.checked)}
                                            className="w-5 h-5 rounded border-white/20 bg-white/5 text-brand focus:ring-brand"
                                        />
                                        <span className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors flex items-center gap-2">
                                            <Star size={16} className={plan.popular ? 'text-brand' : ''} />
                                            Popular Badge
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="w-full md:w-80 space-y-4">
                                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Features</label>
                                <div className="space-y-2">
                                    {plan.features.map((feat, fIdx) => (
                                        <div key={fIdx} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={feat}
                                                onChange={(e) => updateFeature(idx, fIdx, e.target.value)}
                                                className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-brand/40"
                                                placeholder="Feature description"
                                            />
                                            <button
                                                onClick={() => removeFeature(idx, fIdx)}
                                                className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => addFeature(idx)}
                                        className="w-full py-2 border border-dashed border-white/10 rounded-lg text-gray-500 text-xs font-bold hover:border-brand/50 hover:text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        <Plus size={14} />
                                        Add Feature
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => removePlan(idx)}
                            className="absolute top-4 right-4 p-2 text-gray-600 hover:text-red-500 transition-colors"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                ))}

                <button
                    onClick={addPlan}
                    className="w-full py-8 border-2 border-dashed border-white/10 rounded-3xl text-gray-400 font-bold hover:border-brand/50 hover:text-white transition-all flex items-center justify-center gap-2 text-lg"
                >
                    <Plus size={24} />
                    Add New Membership Tier
                </button>
            </div>
        </div>
    );
};

export default AdminMembershipPlans;
