import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Share2, Award, Zap, TrendingUp, ChevronUp, ChevronDown } from 'lucide-react';
import Section from './ui/Section';
import Reveal from './ui/Reveal';
import Button from './ui/Button';
import GameTournamentSection from './GameTournamentSection';
import GameGallery from './GameGallery';
import TournamentCTA from './TournamentCTA';
import RankingSection from './RankingSection';
import { handleHashClick } from '../lib/scroll';
import { useCMSContent } from '../hooks/useCMSContent';

// Web Share API Utility
const handleShareScore = async () => {
    const shareData = {
        title: 'Efren Billiards - Darts High Score',
        text: 'I just hit a new high score in Darts at Efren Billiards! Come challenge my rank.',
        url: window.location.href, // Or custom URL
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            console.log('Error sharing:', err);
        }
    } else {
        // Fallback to clipboard or simple alert
        alert("Web Share API not supported on this device. Score copied to clipboard (Mock)!");
    }
};

// Mock Leaderboard Data Types
interface Player {
    id: string;
    rank: number;
    name: string;
    score: number;
    trend: 'up' | 'down' | 'same';
    company?: string; // For corporate rivalry
}

const hallOfFame: Player[] = [
    { id: '1', rank: 1, name: 'Tarek M.', score: 1420, trend: 'same' },
    { id: '2', rank: 2, name: 'Sarah J.', score: 1385, trend: 'up' },
    { id: '3', rank: 3, name: 'Ahmed Q.', score: 1350, trend: 'down' },
    { id: '4', rank: 4, name: 'Chris W.', score: 1290, trend: 'up' },
    { id: '5', rank: 5, name: 'Nour E.', score: 1100, trend: 'same' },
];

const corporateRivalry: Player[] = [
    { id: 'c1', rank: 1, name: 'TechCorp Eng.', company: 'TechCorp', score: 4500, trend: 'up' },
    { id: 'c2', rank: 2, name: 'Qatar Air. Ops', company: 'QA', score: 4320, trend: 'down' },
    { id: 'c3', rank: 3, name: 'Ooredoo Sales', company: 'Ooredoo', score: 3800, trend: 'same' },
];

const DartsPage: React.FC = () => {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    const { data: heroData } = useCMSContent('hero-darts', {
        url: "https://iili.io/qK7s7gs.md.png",
        title: "Professional Darts"
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

            <Section id="content" className="py-20 max-w-6xl mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <Reveal variant="slide-right">
                        <p className="text-brand font-bold uppercase tracking-widest mb-4 flex items-center justify-center md:justify-start gap-2">Precision & Focus</p>
                        <h2 className="text-3xl md:text-5xl font-black text-white uppercase leading-tight mb-8 text-center md:text-left">
                            Step up to the <br /> oche zone.
                        </h2>
                        <p className="text-lg leading-relaxed mb-10 text-gray-400 text-center md:text-left">
                            Featuring tournament-grade boards and a focused atmosphere, it's the perfect place to sharpen your aim or challenge friends. Get your favorite drink from the cafe and let the friendly competition begin!
                        </p>

                        <div className="bg-dark-800 p-6 rounded-2xl border border-white/5 mb-8 flex items-center justify-between shadow-2xl">
                            <div>
                                <p className="text-white font-bold uppercase tracking-wider mb-1">Your Personal Best</p>
                                <p className="text-gray-500 text-sm">Not registered yet</p>
                            </div>
                            <Button variant="outline" onClick={handleShareScore} className="px-4 py-2 text-xs flex items-center gap-2 border-white/10 hover:border-brand">
                                <Share2 size={14} /> Share Rankings to Friends
                            </Button>
                        </div>

                        <div className="flex justify-center md:justify-start">
                            <Button variant="primary" onClick={(e) => handleHashClick(e, '#contact')} className="px-12 py-5 text-sm uppercase tracking-[0.2em] font-black rounded-full hover:scale-105 transition-transform duration-300">
                                Book a Board
                            </Button>
                        </div>
                        <TournamentCTA gameType="darts" />
                    </Reveal>

                    {/* Gamification Widget: Leaderboards */}
                    <Reveal variant="slide-left">
                        <RankingSection gameType="darts" title="Rankings" />
                    </Reveal>
                </div>

                <div className="mt-16 -mx-4 md:-mx-8 lg:-mx-16">
                    <GameGallery gameType="darts" />
                </div>
            </Section>

            <GameTournamentSection gameType="darts" />
        </div>
    );
}

export default DartsPage;
