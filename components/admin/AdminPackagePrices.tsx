import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/Toast';
import { Loader2, Save, Plus, Trash2, Tag } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface PackageItem {
    name: string;
    price: string;
    description: string;
}

interface PackageCategory {
    category: string;
    items: PackageItem[];
}

const AdminPackagePrices: React.FC = () => {
    const { profile } = useAuth();
    const { showToast, ToastContainer } = useToast();
    const [categories, setCategories] = useState<PackageCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        setLoading(true);
        try {
            const { data, error } = await (supabase.from('cms_content') as any)
                .select('*')
                .eq('slug', 'package-prices')
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data && data.body) {
                const parsed = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
                setCategories(parsed.categories || []);
            } else {
                setCategories([
                    {
                        category: "Billiards & Games",
                        items: [
                            { name: "Standard Table", price: "45 QAR / hr", description: "Professional Yalin tables" },
                            { name: "VIP Room", price: "150 QAR / hr", description: "Private room with service" },
                            { name: "Darts", price: "25 QAR / hr", description: "Professional dart boards" }
                        ]
                    },
                    {
                        category: "Coaching & Clinics",
                        items: [
                            { name: "Pro Clinic", price: "200 QAR", description: "Group session with resident pro" },
                            { name: "Private Coaching", price: "150 QAR / session", description: "One-on-one personalized training" }
                        ]
                    }
                ]);
            }
        } catch (err: any) {
            console.error('Error fetching packages:', err);
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
                    slug: 'package-prices',
                    title: 'Package Prices',
                    body: { categories },
                    published: true,
                    author_id: profile?.id
                }, { onConflict: 'slug' });

            if (error) throw error;
            showToast('Packages updated successfully!', 'success');
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const addCategory = () => {
        setCategories([...categories, { category: 'New Category', items: [] }]);
    };

    const updateCategoryName = (index: number, name: string) => {
        const newCats = [...categories];
        newCats[index].category = name;
        setCategories(newCats);
    };

    const removeCategory = (index: number) => {
        setCategories(categories.filter((_, i) => i !== index));
    };

    const addItem = (catIndex: number) => {
        const newCats = [...categories];
        newCats[catIndex].items.push({ name: '', price: '', description: '' });
        setCategories(newCats);
    };

    const updateItem = (catIndex: number, itemIndex: number, field: keyof PackageItem, value: string) => {
        const newCats = [...categories];
        newCats[catIndex].items[itemIndex][field] = value;
        setCategories(newCats);
    };

    const removeItem = (catIndex: number, itemIndex: number) => {
        const newCats = [...categories];
        newCats[catIndex].items = newCats[catIndex].items.filter((_, i) => i !== itemIndex);
        setCategories(newCats);
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
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Packages & Pricing</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage pricing categories and items.</p>
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

            <div className="space-y-8">
                {categories.map((cat, catIndex) => (
                    <div key={catIndex} className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl">
                        <div className="flex items-center gap-4 mb-6">
                            <input
                                type="text"
                                value={cat.category}
                                onChange={(e) => updateCategoryName(catIndex, e.target.value)}
                                className="flex-1 bg-transparent border-b border-white/20 px-2 py-2 text-white font-black text-xl focus:outline-none focus:border-brand transition-all"
                            />
                            <button
                                onClick={() => removeCategory(catIndex)}
                                className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {cat.items.map((item, itemIndex) => (
                                <div key={itemIndex} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start bg-black/20 p-4 rounded-xl border border-white/5">
                                    <div className="md:col-span-4 space-y-1">
                                        <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Item Name</label>
                                        <input
                                            type="text"
                                            value={item.name}
                                            onChange={(e) => updateItem(catIndex, itemIndex, 'name', e.target.value)}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand/40"
                                        />
                                    </div>
                                    <div className="md:col-span-3 space-y-1">
                                        <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Price</label>
                                        <input
                                            type="text"
                                            value={item.price}
                                            onChange={(e) => updateItem(catIndex, itemIndex, 'price', e.target.value)}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand/40"
                                        />
                                    </div>
                                    <div className="md:col-span-4 space-y-1">
                                        <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Description</label>
                                        <input
                                            type="text"
                                            value={item.description}
                                            onChange={(e) => updateItem(catIndex, itemIndex, 'description', e.target.value)}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand/40"
                                        />
                                    </div>
                                    <div className="md:col-span-1 flex justify-end mt-6">
                                        <button
                                            onClick={() => removeItem(catIndex, itemIndex)}
                                            className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={() => addItem(catIndex)}
                                className="w-full py-3 border border-dashed border-white/10 rounded-xl text-gray-400 text-sm font-bold hover:border-brand/50 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={16} />
                                Add Item to {cat.category}
                            </button>
                        </div>
                    </div>
                ))}

                <button
                    onClick={addCategory}
                    className="w-full py-6 border-2 border-dashed border-white/10 rounded-3xl text-gray-400 font-bold hover:border-brand/50 hover:text-white transition-all flex items-center justify-center gap-2 text-lg"
                >
                    <Plus size={24} />
                    Add New Category
                </button>
            </div>
        </div>
    );
};

export default AdminPackagePrices;
