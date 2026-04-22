import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, X, Bell, AlertCircle, ArrowRight } from 'lucide-react';
import Section from './ui/Section';
import Reveal from './ui/Reveal';
import Button from './ui/Button';
import GameTournamentSection from './GameTournamentSection';
import GameGallery from './GameGallery';
import TournamentCTA from './TournamentCTA';
import RankingSection from './RankingSection';
import { handleHashClick } from '../lib/scroll';
import { useCMSContent } from '../hooks/useCMSContent';

// Mock Data Types

const BilliardsPage: React.FC = () => {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    const [showFormModal, setShowFormModal] = useState(false);
    const [formType, setFormType] = useState<'Clinic' | 'Coaching'>('Clinic');
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        skillLevel: 'Beginner',
        schedule: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const typeText = formType === 'Clinic' ? 'Book a Pro Clinic' : 'Inquire about Coaching';
        const message = `Hello! I would like to ${typeText}.\n\n*Name:* ${formData.name}\n*Skill Level:* ${formData.skillLevel}\n*Preferred Schedule:* ${formData.schedule}`;
        const whatsappUrl = `https://wa.me/97451622111?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        setShowFormModal(false);
    };

    const { data: heroData } = useCMSContent('hero-billiards', {
        url: "https://iili.io/qK7iGKg.md.jpg",
        title: "World-Class Billiards"
    });

    return (
        <div className="pt-24 min-h-screen bg-dark-900">
            <Reveal>
                <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
                    <img src={heroData.url} className="w-full h-full object-cover scale-105" alt={heroData.title} />
                    <div className="absolute inset-0 bg-dark-900/60 flex items-center justify-center">
                        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-widest text-center px-4">{heroData.title}</h1>
                    </div>
                </div>
            </Reveal>

            <Section id="content" className="py-20 max-w-4xl mx-auto px-6 text-center text-gray-300">
                <Reveal variant="fade-up">
                    <p className="text-xl md:text-2xl font-bold text-white leading-relaxed mb-8">
                        Experience the game on professional Yalin tables, the same used in the Qatar Billiard World Cup.
                    </p>
                    <p className="text-lg leading-relaxed mb-12 text-gray-400">
                        Our tables are meticulously maintained to ensure consistent play for both casual enthusiasts and serious competitors. Whether you're practicing for your next tournament or enjoying a relaxed evening with friends, our billiards area is designed to provide the ultimate playing experience. We offer premium cues, pristine felt, and a dedicated staff ready to reset your racks.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Button 
                            variant="primary" 
                            onClick={() => handleHashClick({ preventDefault: () => {} }, '#contact')} 
                            className="px-12 py-5 text-sm uppercase tracking-[0.2em] font-black rounded-full hover:scale-105 transition-transform duration-300 w-full sm:w-auto"
                        >
                            Book a Table
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => { setFormType('Coaching'); setShowFormModal(true); }} 
                            className="px-12 py-5 text-sm uppercase tracking-[0.2em] font-black rounded-full w-full sm:w-auto flex items-center justify-center gap-2 border-brand text-brand hover:bg-brand hover:text-black transition-colors duration-300"
                        >
                            Inquire Coaching Service
                        </Button>
                    </div>
                    <TournamentCTA gameType="billiards" />
                </Reveal>

                <div className="mt-16 -mx-4 md:-mx-8 lg:-mx-16">
                    <GameGallery gameType="billiards" />
                </div>
            </Section>

            <GameTournamentSection gameType="billiards" />

            <Section className="py-20 max-w-4xl mx-auto px-6">
                <Reveal variant="fade-up">
                    <RankingSection gameType="billiards" title="Billiards Hall of Fame" />
                </Reveal>
            </Section>

            {/* Coaching Questionnaire Modal */}
            <AnimatePresence>
                {showFormModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-dark-800 border border-white/10 rounded-3xl p-6 md:p-10 max-w-lg w-full relative shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-y-auto max-h-[90vh]"
                        >
                            <button onClick={() => setShowFormModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors bg-dark-900 rounded-full p-2">
                                <X size={20} />
                            </button>

                            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
                                {formType === 'Clinic' ? 'Book Pro Clinic' : 'Coaching Inquiry'}
                            </h3>
                            <p className="text-gray-400 text-sm mb-8">
                                Please fill out the form below and we'll connect with you on WhatsApp.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand outline-none transition-colors"
                                        placeholder="Enter your name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Mobile Number</label>
                                    <input
                                        required
                                        type="tel"
                                        value={formData.mobile}
                                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                        className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand outline-none transition-colors"
                                        placeholder="+974 ..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Skill Level</label>
                                    <select
                                        value={formData.skillLevel}
                                        onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value })}
                                        className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand outline-none transition-colors appearance-none"
                                    >
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Preferred Date/Time</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.schedule}
                                        onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                                        className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand outline-none transition-colors"
                                        placeholder="e.g. Monday at 6 PM"
                                    />
                                </div>

                                <Button
                                    variant="primary"
                                    fullWidth
                                    type="submit"
                                    className="py-4 text-sm font-black uppercase tracking-widest"
                                >
                                    Submit to WhatsApp
                                </Button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default BilliardsPage;
