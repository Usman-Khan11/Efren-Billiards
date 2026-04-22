import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/Toast';
import { Save, Loader2, Gamepad2, Target, Brain, Music, Wind, Plus, Trash2, Mic2, Users, Star, Flame } from 'lucide-react';

interface Recommendation {
    drink: string;
    description: string;
    category: string;
    icon_name: string;
}

type Activity = string;

const ICON_MAP: Record<string, React.ReactNode> = {
    Gamepad2: <Gamepad2 size={20} />,
    Target: <Target size={20} />,
    Brain: <Brain size={20} />,
    Music: <Music size={20} />,
    Wind: <Wind size={20} />,
    Mic2: <Mic2 size={20} />,
    Users: <Users size={20} />,
    Star: <Star size={20} />,
    Flame: <Flame size={20} />
};

const AdminMatchMyGame: React.FC = () => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [recommendations, setRecommendations] = useState<Record<Activity, Recommendation>>({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data, error } = await (supabase.from('cms_content') as any)
                .select('*')
                .eq('slug', 'match-my-game')
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data && data.body) {
                setRecommendations(typeof data.body === 'string' ? JSON.parse(data.body) : data.body);
            } else {
                // Default data if none exists
                setRecommendations({
                    Billiards: { drink: 'Signature Spanish Latte', description: 'Smooth and mildly sweet, perfect for staying energized during long matches.', category: 'Espresso Bar', icon_name: 'Gamepad2' },
                    Darts: { drink: 'Lemon Mint Crush', description: 'Refreshing and sharp to keep your focus laser-tight at the oche.', category: 'Mocktails & Coolers', icon_name: 'Target' },
                    Chess: { drink: 'V60 Pour Over', description: 'A slow, deliberate brew for deep thinkers and strategic minds.', category: 'Espresso Bar', icon_name: 'Brain' },
                    Karaoke: { drink: 'Passion Fruit Mojito', description: 'Vibrant and fruity to keep those vocal cords lubricated and the party going.', category: 'Mocktails & Coolers', icon_name: 'Music' },
                    Relaxing: { drink: 'Honey Cake & Iced Tea', description: 'The perfect pairing to unwind after a long day.', category: 'Snacks & Pastries', icon_name: 'Wind' },
                });
            }
        } catch (err: any) {
            console.error('Error fetching Match My Game data:', err);
            showToast('Error loading data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await (supabase.from('cms_content') as any)
                .upsert({
                    slug: 'match-my-game',
                    title: 'Match My Game Recommendations',
                    body: JSON.stringify(recommendations),
                    published: true
                }, { onConflict: 'slug' });

            if (error) throw error;
            showToast('Recommendations updated successfully!', 'success');
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const updateRecommendation = (activity: string, field: keyof Recommendation, value: string) => {
        setRecommendations(prev => ({
            ...prev,
            [activity]: {
                ...prev[activity],
                [field]: value
            }
        }));
    };

    const addActivity = () => {
        const name = prompt('Enter activity name (e.g. Poker):');
        if (name && !recommendations[name]) {
            setRecommendations(prev => ({
                ...prev,
                [name]: {
                    drink: '',
                    description: '',
                    category: 'Espresso Bar',
                    icon_name: 'Gamepad2'
                }
            }));
        }
    };

    const removeActivity = (activity: string) => {
        if (confirm(`Are you sure you want to remove ${activity}?`)) {
            const newRecs = { ...recommendations };
            delete newRecs[activity];
            setRecommendations(newRecs);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 size={32} className="text-brand animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Match My Game CMS</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage drink pairings for different activities.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={addActivity}
                        className="flex items-center gap-2 px-6 py-2.5 bg-white/5 text-white rounded-xl text-sm font-bold hover:bg-white/10 transition-all border border-white/10"
                    >
                        <Plus size={18} />
                        Add Activity
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand/90 transition-all shadow-lg shadow-brand/20 disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {Object.entries(recommendations).map(([activity, rec]) => (
                    <div key={activity} className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all group relative">
                        <button 
                            onClick={() => removeActivity(activity)}
                            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 size={18} />
                        </button>

                        <div className="grid md:grid-cols-4 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
                                        {ICON_MAP[(rec as Recommendation).icon_name] || <Gamepad2 size={20} />}
                                    </div>
                                    <h3 className="text-lg font-bold text-white uppercase tracking-tight">{activity}</h3>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black">Icon</label>
                                    <select 
                                        value={(rec as Recommendation).icon_name}
                                        onChange={(e) => updateRecommendation(activity, 'icon_name', e.target.value)}
                                        className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand/50"
                                    >
                                        {Object.keys(ICON_MAP).map(icon => (
                                            <option key={icon} value={icon}>{icon}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="md:col-span-3 grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black">Recommended Drink</label>
                                        <input
                                            type="text"
                                            value={(rec as Recommendation).drink}
                                            onChange={(e) => updateRecommendation(activity, 'drink', e.target.value)}
                                            className="w-full bg-dark-900 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-brand/50"
                                            placeholder="Drink name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black">Category</label>
                                        <input
                                            type="text"
                                            value={(rec as Recommendation).category}
                                            onChange={(e) => updateRecommendation(activity, 'category', e.target.value)}
                                            className="w-full bg-dark-900 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-brand/50"
                                            placeholder="e.g. Espresso Bar"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black">Description</label>
                                    <textarea
                                        value={(rec as Recommendation).description}
                                        onChange={(e) => updateRecommendation(activity, 'description', e.target.value)}
                                        rows={4}
                                        className="w-full bg-dark-900 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-brand/50 resize-none"
                                        placeholder="Why is this a good match?"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminMatchMyGame;
