import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/Toast';
import { Loader2, Save, Plus, Trash2, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ScheduleItem {
    day: string;
    event: string;
    offer: string;
    time: string;
}

const AdminWeeklySchedule: React.FC = () => {
    const { profile } = useAuth();
    const { showToast, ToastContainer } = useToast();
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
        setLoading(true);
        try {
            const { data, error } = await (supabase.from('cms_content') as any)
                .select('*')
                .eq('slug', 'weekly-schedule')
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data && data.body) {
                const parsed = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
                setSchedule(parsed.schedule || []);
            } else {
                setSchedule([
                    { day: 'Monday', event: 'Industry Night', offer: '50% Off Tables for Hospitality Staff', time: '18:00 - Close' },
                    { day: 'Tuesday', event: 'League Night', offer: 'Competitive League Play', time: '19:00 Start' },
                    { day: 'Wednesday', event: 'Midweek Break', offer: 'Free Coffee with 2hrs Play', time: '14:00 - 18:00' },
                    { day: 'Thursday', event: 'Corporate Challenge', offer: 'Group Packages Available', time: 'All Evening' },
                    { day: 'Friday', event: 'Weekend Warmup', offer: 'DJ Sets & Late Night Play', time: '20:00 - 02:00' },
                    { day: 'Saturday', event: 'Open Tournament', offer: 'Winner Takes All - Cash Prize', time: '14:00 Start' },
                    { day: 'Sunday', event: 'Family Day', offer: 'Kids Play Free (with Adult)', time: '12:00 - 18:00' },
                ]);
            }
        } catch (err: any) {
            console.error('Error fetching schedule:', err);
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
                    slug: 'weekly-schedule',
                    title: 'Weekly Schedule',
                    body: { schedule },
                    published: true,
                    author_id: profile?.id
                }, { onConflict: 'slug' });

            if (error) throw error;
            showToast('Schedule updated successfully!', 'success');
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const addItem = () => {
        setSchedule([...schedule, { day: 'Monday', event: '', offer: '', time: '' }]);
    };

    const updateItem = (index: number, field: keyof ScheduleItem, value: string) => {
        const newSchedule = [...schedule];
        newSchedule[index][field] = value;
        setSchedule(newSchedule);
    };

    const removeItem = (index: number) => {
        setSchedule(schedule.filter((_, i) => i !== index));
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
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Weekly Schedule</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage daily events and special offers.</p>
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
                {schedule.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start bg-white/[0.02] border border-white/10 backdrop-blur-xl p-6 rounded-2xl">
                        <div className="md:col-span-2 space-y-1">
                            <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Day</label>
                            <select
                                value={item.day}
                                onChange={(e) => updateItem(index, 'day', e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand/40 appearance-none"
                            >
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                    <option key={day} value={day} className="bg-[#0a0a0c] text-white">{day}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-3 space-y-1">
                            <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Event Name</label>
                            <input
                                type="text"
                                value={item.event}
                                onChange={(e) => updateItem(index, 'event', e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand/40"
                                placeholder="e.g. Industry Night"
                            />
                        </div>
                        <div className="md:col-span-3 space-y-1">
                            <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Time</label>
                            <input
                                type="text"
                                value={item.time}
                                onChange={(e) => updateItem(index, 'time', e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand/40"
                                placeholder="e.g. 18:00 - Close"
                            />
                        </div>
                        <div className="md:col-span-3 space-y-1">
                            <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Special Offer</label>
                            <input
                                type="text"
                                value={item.offer}
                                onChange={(e) => updateItem(index, 'offer', e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand/40"
                                placeholder="e.g. 50% Off Tables"
                            />
                        </div>
                        <div className="md:col-span-1 flex justify-end mt-6">
                            <button
                                onClick={() => removeItem(index)}
                                className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                <button
                    onClick={addItem}
                    className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-gray-400 font-bold hover:border-brand/50 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                    <Plus size={18} />
                    Add Schedule Item
                </button>
            </div>
        </div>
    );
};

export default AdminWeeklySchedule;
