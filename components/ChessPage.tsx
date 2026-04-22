import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Trophy, X, Award, Calendar, Swords } from 'lucide-react';
import Section from './ui/Section';
import Reveal from './ui/Reveal';
import Button from './ui/Button';
import GameTournamentSection from './GameTournamentSection';
import GameGallery from './GameGallery';
import TournamentCTA from './TournamentCTA';
import RankingSection from './RankingSection';
import { handleHashClick } from '../lib/scroll';
import { useCMSContent } from '../hooks/useCMSContent';

interface TopPlayer {
    id: string;
    rank: number;
    name: string;
    rating: number;
    title?: string;
}

const topPlayers: TopPlayer[] = [
    { id: '1', rank: 1, name: 'Eugenio T.', rating: 2450, title: 'GM' },
    { id: '2', rank: 2, name: 'Wesley S.', rating: 2380, title: 'IM' },
    { id: '3', rank: 3, name: 'Rogelio A.', rating: 2200, title: 'FM' },
    { id: '4', rank: 4, name: 'Julio C.', rating: 2150 },
    { id: '5', rank: 5, name: 'Mark P.', rating: 2100 },
];

const ChessPage: React.FC = () => {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    // State for Rebate Modal
    const [showRebateModal, setShowRebateModal] = useState(false);

    // State for Challenge Modal
    const [showChallengeModal, setShowChallengeModal] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<TopPlayer | null>(null);

    const handleChallengeClick = (player: TopPlayer) => {
        setSelectedPlayer(player);
        setShowChallengeModal(true);
    };

    const { data: heroData } = useCMSContent('hero-chess', {
        url: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?q=80&w=1471&auto=format&fit=crop",
        title: "Chess Lounge"
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
                        Engage your mind in our quiet, premium chess area.
                    </p>
                    <p className="text-lg leading-relaxed mb-12 text-gray-400">
                        Challenge your focus and strategic thinking. We offer beautifully crafted, weighted tournament chess sets and digital clocks for those who love speed chess. The lounge area provides a serene environment perfect for studying openings, casual play, or intense competition, all while enjoying our specialty coffee.
                    </p>
                    <div className="flex gap-4 justify-center font-black">
                        <Button variant="primary" onClick={(e) => handleHashClick(e, '#contact')} className="px-8 py-4 text-sm uppercase tracking-[0.2em] rounded-full hover:scale-105 transition-transform duration-300">
                            Book a Table
                        </Button>
                    </div>
                    <TournamentCTA gameType="chess" />
                </Reveal>

                <div className="mt-16 -mx-4 md:-mx-8 lg:-mx-16">
                    <GameGallery gameType="chess" />
                </div>

                {/* Grandmaster Simul & Player Challenges */}
                <Reveal delay={200} className="mt-24">
                    <div className="bg-dark-800 rounded-3xl p-8 md:p-12 border border-brand/20 shadow-[0_0_40px_rgba(197,160,89,0.1)] relative overflow-hidden text-left">
                        <div className="flex flex-col md:flex-row gap-12">
                            {/* Monthly Simul Info */}
                            <div className="flex-1 w-full">
                                <h3 className="text-brand font-bold uppercase tracking-widest text-sm flex items-center gap-2 mb-2"><Brain size={16} /> Elite Events</h3>
                                <h4 className="text-3xl font-black text-white uppercase tracking-tight mb-4">Grandmaster Simul</h4>
                                <p className="text-gray-400 mb-8 text-sm leading-relaxed">
                                    Join our monthly exhibition event! Face off against top-ranked masters in a simultaneous exhibition match. Think you have what it takes to draw or defeat a Grandmaster?
                                </p>

                                <div className="space-y-4">
                                    <Button 
                                        variant="primary" 
                                        onClick={() => window.location.hash = '#tournament'} 
                                        className="w-full font-black text-sm uppercase tracking-widest py-4 hover:scale-105 transition-transform duration-300 flex items-center justify-center gap-2"
                                    >
                                        <Trophy size={18} /> View All Tournaments
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        onClick={(e) => handleHashClick(e, '#contact')} 
                                        className="w-full font-black text-sm uppercase tracking-widest py-4 border-white/10 text-white hover:bg-white/5"
                                    >
                                        Inquire for Private Match
                                    </Button>
                                </div>
                            </div>

                            {/* Top Ranked Players & Challenge */}
                            <div className="flex-1 w-full">
                                <RankingSection gameType="chess" title="Top Ranked Players" showTabs={false} />
                            </div>
                        </div>
                    </div>
                </Reveal>
            </Section>

            <GameTournamentSection gameType="chess" />

            {/* Challenge Modal */}
            <AnimatePresence>
                {showChallengeModal && selectedPlayer && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-dark-800 border border-white/10 rounded-3xl p-8 max-w-md w-full relative shadow-2xl"
                        >
                            <button onClick={() => setShowChallengeModal(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>

                            <div className="w-12 h-12 bg-dark-900 border border-brand/20 rounded-full flex items-center justify-center mb-6 text-brand">
                                <Swords size={20} />
                            </div>

                            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Schedule Challenge</h3>
                            <p className="text-gray-400 leading-relaxed mb-6 text-sm">
                                Request a seated match against <span className="text-white font-bold">{selectedPlayer.name} {selectedPlayer.title && `(${selectedPlayer.title})`}</span>. If accepted, you will receive an email to confirm the table booking.
                            </p>

                            <form className="space-y-4 mb-8" onSubmit={(e) => { 
                                e.preventDefault(); 
                                setShowChallengeModal(false); 
                                handleHashClick(e as any, '#contact');
                            }}>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Preferred Date</label>
                                    <input type="date" className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white uppercase outline-none focus:border-brand transition-colors text-sm" required />
                                </div>
                                <Button variant="primary" type="submit" fullWidth className="py-4">
                                    Send Challenge Request
                                </Button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default ChessPage;
