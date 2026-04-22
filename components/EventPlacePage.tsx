import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, Clock, ArrowRight, Music, AlertCircle, Calculator, Building, Gift } from 'lucide-react';
import Section from './ui/Section';
import Reveal from './ui/Reveal';
import Button from './ui/Button';
import { handleHashClick } from '../lib/scroll';
import { useCMSContent } from '../hooks/useCMSContent';
import { supabase } from '../lib/supabase';

// Mock Data Types
type EventType = 'Corporate event' | 'Tournament' | 'Birthday';

interface EventData {
    type: EventType;
    basePrice: number;
    image: string;
    description: string;
}

const DEFAULT_PRICES: Record<EventType, number> = {
    'Corporate event': 150,
    'Tournament': 100,
    'Birthday': 80,
};

    // Fallbacks handled by useCMSContent
const defaultEventTypes: Record<EventType, EventData> = {
    'Corporate event': {
        type: 'Corporate event',
        basePrice: DEFAULT_PRICES['Corporate event'],
        image: 'https://iili.io/q2MS4TJ.md.jpg',
        description: 'Elegant seating, buffet setup, and premium lighting.'
    },
    Tournament: {
        type: 'Tournament',
        basePrice: DEFAULT_PRICES['Tournament'],
        image: 'https://iili.io/q2MSgpa.md.jpg',
        description: 'Optimized floorplan for competitive play and spectator viewing.'
    },
    Birthday: {
        type: 'Birthday',
        basePrice: DEFAULT_PRICES['Birthday'],
        image: 'https://iili.io/q2MSjhx.md.jpg',
        description: 'Casual layout with dance floor and catering stations.'
    }
};

const EventPlacePage: React.FC = () => {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    // Calculator State
    const [eventType, setEventType] = useState<EventType>('Corporate event');
    const [hours, setHours] = useState<number>(4);
    const [basePrices, setBasePrices] = useState<Record<EventType, number>>(DEFAULT_PRICES);

    const { data: heroData } = useCMSContent('hero-event-place', {
        url: "https://iili.io/qK7s4rg.png",
        title: "Premium Event Place"
    });

    const { data: cmsEventPreviews } = useCMSContent('event-previews', defaultEventTypes);

    // Fetch CMS pricing
    useEffect(() => {
        (async () => {
            try {
                const { data, error } = await (supabase.from('cms_content') as any)
                    .select('body')
                    .eq('slug', 'event-place-pricing')
                    .single();
                if (!error && data?.body) {
                    const cms = JSON.parse(data.body);
                    setBasePrices({
                        'Corporate event': cms.corporate ?? DEFAULT_PRICES['Corporate event'],
                        'Tournament': cms.tournament ?? DEFAULT_PRICES['Tournament'],
                        'Birthday': cms.birthday ?? DEFAULT_PRICES['Birthday'],
                    });
                }
            } catch { /* use defaults */ }
        })();
    }, []);

    // Merge pricing with CMS previews
    const eventTypes: Record<EventType, EventData> = {
        'Corporate event': {
            ...defaultEventTypes['Corporate event'],
            ...(cmsEventPreviews['Corporate event'] || {}),
            basePrice: basePrices['Corporate event']
        },
        'Tournament': {
            ...defaultEventTypes['Tournament'],
            ...(cmsEventPreviews['Tournament'] || {}),
            basePrice: basePrices['Tournament']
        },
        'Birthday': {
            ...defaultEventTypes['Birthday'],
            ...(cmsEventPreviews['Birthday'] || {}),
            basePrice: basePrices['Birthday']
        }
    };

    const estimatedCost = hours * basePrices[eventType];

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

            <Section id="content" className="py-20 max-w-6xl mx-auto px-6 text-gray-300">
                <Reveal variant="fade-up" className="text-center mb-16">
                    <p className="text-xl md:text-2xl font-bold text-white leading-relaxed mb-8 max-w-3xl mx-auto">
                        From corporate team-building to private birthday celebrations, our versatile event space offers the perfect backdrop.
                    </p>
                    <p className="text-lg leading-relaxed text-gray-400 max-w-3xl mx-auto">
                        We provide customizable layouts, high-end audio-visual equipment, and a dedicated service team to make your gathering truly unforgettable. Let us take care of the details while you enjoy the occasion.
                    </p>
                </Reveal>

                {/* Event Budget Calculator Widget */}
                <Reveal delay={100}>
                    <div className="bg-dark-800 rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand to-maroon"></div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
                            <Calculator className="text-brand" /> Budget Estimator
                        </h2>

                        <div className="grid md:grid-cols-2 gap-12">
                            {/* Controls */}
                            <div className="space-y-8">
                                <div>
                                    <label className="block text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Event Type</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(Object.keys(eventTypes) as EventType[]).map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setEventType(type)}
                                                className={`py - 3 px - 2 text - xs font - bold uppercase tracking - wider rounded - lg transition - all ${eventType === type ? 'bg-brand text-black shadow-[0_0_15px_rgba(197,160,89,0.4)]' : 'bg-dark-900 text-gray-400 hover:bg-dark-700'
                                                    } `}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="flex justify-between text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">
                                        <span>Duration</span>
                                        <span className="text-brand">{hours} Hours</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="12"
                                        step="1"
                                        value={hours}
                                        onChange={(e) => setHours(parseInt(e.target.value))}
                                        className="w-full h-2 bg-dark-900 rounded-lg appearance-none cursor-pointer accent-brand"
                                    />
                                    {hours >= 12 && (
                                        <p className="text-xs text-brand/80 mt-2 flex items-center gap-1"><AlertCircle size={12} /> Contact us for full-day or multi-day booking.</p>
                                    )}
                                </div>

                                <div className="p-6 bg-dark-900 rounded-xl border border-white/5 text-center">
                                    <p className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2">Estimated Cost</p>
                                    <motion.p
                                        key={estimatedCost}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="text-4xl font-black text-white"
                                    >
                                        {estimatedCost.toLocaleString()} <span className="text-lg text-brand">QAR</span>
                                    </motion.p>
                                </div>

                                <Button variant="primary" fullWidth onClick={(e) => handleHashClick(e, '#contact')} className="py-4 shadow-lg shadow-brand/20">
                                    Request Formal Quote
                                </Button>
                                
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8, duration: 0.5 }}
                                    className="mt-4 flex items-center justify-center gap-2 group cursor-default"
                                >
                                    <motion.div
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                    >
                                        <Gift size={16} className="text-yellow-500" />
                                    </motion.div>
                                    <p className="text-[11px] md:text-xs font-bold italic text-brand tracking-tight">
                                        Don't leave time on the table, get up to <span className="text-yellow-500 not-italic font-black underline decoration-yellow-500/30 underline-offset-4">3 hours FREE</span> as a member!
                                    </p>
                                </motion.div>

                                <div className="mt-3 text-center">
                                    <a href="/#/membership-landing" className="inline-block text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-white transition-colors border-b border-gray-600 hover:border-white border-dashed pb-1">
                                        Click Here to Become A Member
                                    </a>
                                </div>
                            </div>

                            {/* Event Preview */}
                            <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-dark-900">
                                <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                                    <Building size={14} className="text-brand" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-white">Event Preview: {eventType}</span>
                                </div>
                                <AnimatePresence mode="wait">
                                    <motion.img
                                        key={eventType}
                                        src={eventTypes[eventType].image}
                                        initial={{ opacity: 0, scale: 1.05 }}
                                        animate={{ opacity: 0.6, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="w-full h-full object-cover min-h-[300px]"
                                        alt={`${eventType} Preview`}
                                    />
                                </AnimatePresence>
                                <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
                                    <p className="text-sm text-gray-300">
                                        {eventTypes[eventType].description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </Section>
        </div>
    );
}

export default EventPlacePage;
