import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Music } from 'lucide-react';
import Section from './ui/Section';
import Reveal from './ui/Reveal';
import Button from './ui/Button';
import { handleHashClick } from '../lib/scroll';
import { useCMSContent } from '../hooks/useCMSContent';

// Mock Add-ons Data
interface ThemeAddon {
    id: string;
    name: string;
    price: number;
}

const themeAddons: ThemeAddon[] = [
    { id: '1', name: 'Neon Party Glasses Set (10x)', price: 30 },
    { id: '2', name: 'Retro Disco Wigs Bundle', price: 80 },
    { id: '3', name: 'Inflatable Guitars & Mics', price: 40 },
    { id: '4', name: 'Smoke Machine Rental', price: 150 },
    { id: '5', name: 'VIP Photobooth Props', price: 50 },
];

const KaraokePage: React.FC = () => {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    const { data: heroData } = useCMSContent('hero-karaoke', {
        url: "https://iili.io/qK7LeFn.png",
        title: "Private Karaoke Rooms"
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
                        Sing your heart out in our state-of-the-art private karaoke suites.
                    </p>
                    <p className="text-lg leading-relaxed mb-12 text-gray-400">
                        Featuring an extensive library of international hits updated weekly, premium concert-grade sound systems, and customizable mood lighting options, it's the ultimate social experience. Perfect for birthdays, after-work parties, or just a night out with friends.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Button variant="primary" onClick={(e) => handleHashClick(e, '#contact')} className="px-12 py-5 text-sm uppercase tracking-[0.2em] font-black rounded-full hover:scale-105 transition-transform duration-300 w-full sm:w-auto">
                            Book a Room
                        </Button>
                    </div>
                </Reveal>
            </Section>
        </div>
    );
}

export default KaraokePage;
