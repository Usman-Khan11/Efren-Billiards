import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCMSContent } from '../hooks/useCMSContent';
import Reveal from './ui/Reveal';

// Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Swiper modules
import { EffectCoverflow, Mousewheel, Pagination, Keyboard } from 'swiper/modules';

// Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

interface GalleryImage {
    url: string;
    title?: string;
    description?: string;
}

interface GameGalleryProps {
    gameType: 'billiards' | 'chess' | 'darts';
}

const defaultContent = {
    billiards: {
        title: "World-Class Yalin Tables",
        images: [
            { url: "https://images.unsplash.com/photo-1595859703086-1d1230e87dcb?q=80&w=1470&auto=format&fit=crop", title: "Precision Strike", description: "A showcase of pinpoint accuracy and professional-grade Yalin tables, built for champions." },
            { url: "https://images.unsplash.com/photo-1549488344-c6b12a0614f1?q=80&w=1470&auto=format&fit=crop", title: "Masterful Break", description: "Analyzing the geometry of the table before executing the perfect sequence of shots." },
            { url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", title: "The Finals Setup", description: "The ambient lighting sets the mood for a high-stakes, competitive atmosphere." },
            { url: "https://images.unsplash.com/photo-1582046429391-7f8e87ad6a7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", title: "Midnight Hustle", description: "Exclusive VIP setup for members and dedicated enthusiasts aiming for mastery." }
        ]
    },
    chess: {
        title: "Premium Chess Lounge",
        images: [
            { url: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?q=80&w=1471&auto=format&fit=crop", title: "Grandmaster's Vision", description: "Surrounded by an atmosphere of deep focus, where every move dictates the outcome." },
            { url: "https://images.unsplash.com/photo-1580541832626-2a7131ee809f?q=80&w=1476&auto=format&fit=crop", title: "Queen's Gambit", description: "A classic battle of minds depicted in elegant scenery, honoring centuries of tradition." },
            { url: "https://images.unsplash.com/photo-1586165368502-1bad197a6461?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", title: "The Final Mate", description: "Strategic depth modeled in every piece, crafted for the true connoisseur." }
        ]
    },
    darts: {
        title: "Tournament-Grade Darts",
        images: [
            { url: "https://images.unsplash.com/photo-1629168953153-f7cc8cbee015?q=80&w=1470&auto=format&fit=crop", title: "Bullseye Focus", description: "Precision is key. Every throw is a calculated arc towards perfection." },
            { url: "https://images.unsplash.com/photo-1596728362799-923cb5c1c876?q=80&w=1470&auto=format&fit=crop", title: "The Perfect Throw", description: "A dedicated zone that keeps you concentrated when stepping up to the line." },
            { url: "https://images.unsplash.com/photo-1643666244463-54cd4ba214a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80", title: "Oche Supremacy", description: "Celebrate every win. Our tournament-quality boards ensure undeniable scores." }
        ]
    }
};

// Generates dynamic title/desc so we don't have to alter the CMS immediately
const getDynamicText = (gameType: string, index: number, total: number) => {
    const titles = {
        billiards: ["Precision Strike", "Masterful Break", "The Finals Setup", "Midnight Hustle"],
        chess: ["Grandmaster's Vision", "Queen's Gambit", "The Final Mate"],
        darts: ["Bullseye Focus", "The Perfect Throw", "Oche Supremacy"]
    };
    
    const descriptions = {
        billiards: [
            "A showcase of pinpoint accuracy and professional-grade Yalin tables, built for champions.",
            "Analyzing the geometry of the table before executing the perfect sequence of shots.",
            "The ambient lighting sets the mood for a high-stakes, competitive atmosphere.",
            "Exclusive VIP setup for members and dedicated enthusiasts aiming for mastery."
        ],
        chess: [
            "Surrounded by an atmosphere of deep focus, where every move dictates the outcome.",
            "A classic battle of minds depicted in elegant scenery, honoring centuries of tradition.",
            "Strategic depth modeled in every piece, crafted for the true connoisseur."
        ],
        darts: [
            "Precision is key. Every throw is a calculated arc towards perfection.",
            "A dedicated zone that keeps you concentrated when stepping up to the line.",
            "Celebrate every win. Our tournament-quality boards ensure undeniable scores."
        ]
    };

    const typeList = (titles as any)[gameType] || [];
    const descList = (descriptions as any)[gameType] || [];

    // Fallback if not enough hardcoded texts
    const title = typeList[index % typeList.length] || `Exhibit ${index + 1}`;
    const desc = descList[index % descList.length] || `A stunning display of our premier ${gameType} offerings and facilities.`;

    return { title, desc };
};

const GameGallery: React.FC<GameGalleryProps> = ({ gameType }) => {
    const { data: galleryData, loading } = useCMSContent(`game-gallery-${gameType}`, defaultContent[gameType]);
    
    const [activeIndex, setActiveIndex] = useState(0);

    const title = galleryData?.title || defaultContent[gameType].title;
    const images = galleryData?.images || defaultContent[gameType].images;

    const currentImg = images[activeIndex];
    const isString = typeof currentImg === 'string';
    const imgUrl = isString ? currentImg : currentImg.url;
    
    // Fallback to dynamic text if CMS values are missing
    const dynamicText = getDynamicText(gameType, activeIndex, images.length);
    const displayTitle = (!isString && currentImg.title) ? currentImg.title : dynamicText.title;
    const displayDesc = (!isString && currentImg.description) ? currentImg.description : dynamicText.desc;

    return (
        <div className="py-24 w-full bg-gradient-to-b from-dark-900 via-black to-dark-900 relative overflow-hidden flex flex-col items-center border-y border-white/5">
            {/* Ambient Lighting Behind Carousel */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-brand/10 blur-[120px] rounded-[100%] pointer-events-none" />

            <Reveal className="w-full max-w-7xl mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    
                    {/* Dynamic Text Area (Left Side) */}
                    <div className="flex-1 lg:max-w-md w-full text-center lg:text-left z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="mb-6 lg:mb-12"
                        >
                            <span className="text-brand text-xs lg:text-sm font-bold uppercase tracking-[0.3em] font-mono">
                                {title}
                            </span>
                        </motion.div>

                        {/* AnimatePresence for smooth fading text updates */}
                        <div className="relative min-h-[160px] lg:min-h-[200px]">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeIndex}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    className="absolute inset-0"
                                >
                                    <h3 className="text-3xl lg:text-5xl font-black text-white uppercase tracking-tight mb-6 leading-[1.1]">
                                        {displayTitle}
                                    </h3>
                                    <p className="text-gray-400 text-sm lg:text-base leading-relaxed">
                                        {displayDesc}
                                    </p>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        
                        <div className="hidden lg:flex items-center gap-4 mt-8 opacity-50">
                            <span className="text-white text-xs font-mono uppercase tracking-widest">{activeIndex + 1} / {images.length}</span>
                            <div className="h-[1px] w-24 bg-white/20"></div>
                        </div>
                    </div>

                    {/* 3D Coverflow Carousel (Right Side) */}
                    <div className="w-full lg:w-[60%] lg:-mr-12 perspective-[1000px] z-10">
                        <Swiper
                            effect={'coverflow'}
                            grabCursor={true}
                            centeredSlides={true}
                            slidesPerView={'auto'}
                            initialSlide={0}
                            mousewheel={{
                                forceToAxis: true,
                            }}
                            keyboard={{
                                enabled: true,
                            }}
                            coverflowEffect={{
                                rotate: 20,       // Card rotation along Y-axis in degrees
                                stretch: 0,       // Space between cards (negative to overlay more)
                                depth: 250,       // How far pushed back in Z-axis
                                modifier: 1,      // Multiply effect values
                                slideShadows: true, // Swiper generates cool shadows automatically!
                            }}
                            pagination={{
                                clickable: true,
                                dynamicBullets: true
                            }}
                            modules={[EffectCoverflow, Mousewheel, Pagination, Keyboard]}
                            onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                            className="w-full !pb-16"
                        >
                            {(images as (string | GalleryImage)[]).map((img, index: number) => (
                                <SwiperSlide 
                                    key={index}
                                    className="!w-[280px] md:!w-[400px] lg:!w-[450px]"
                                >
                                    {({ isActive }) => (
                                        <motion.div
                                            animate={{ 
                                                opacity: isActive ? 1 : 0.6,
                                            }}
                                            transition={{ duration: 0.4 }}
                                            className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 group"
                                        >
                                            <img
                                                src={typeof img === 'string' ? img : img.url}
                                                alt={`Gallery display ${index + 1}`}
                                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                            />
                                            {/* Subtitle / Overlay on image */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                                                <h4 className="text-white font-black uppercase tracking-widest text-lg md:text-xl drop-shadow-md lg:hidden">
                                                    {(typeof img !== 'string' && img.title) || (titles as any)?.[gameType]?.[index] || `Exhibit ${index + 1}`}
                                                </h4>
                                            </div>
                                        </motion.div>
                                    )}
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>

                </div>
            </Reveal>

            {/* Global overrides for Swiper Pagination specifically in this component */}
            <style dangerouslySetInnerHTML={{__html: `
                .swiper-pagination-bullet {
                    background: rgba(255,255,255,0.3) !important;
                    transition: all 0.3s ease;
                }
                .swiper-pagination-bullet-active {
                    background: #c5a059 !important; /* brand color */
                    width: 24px !important;
                    border-radius: 12px !important;
                }
            `}} />
        </div>
    );
};

// Necessary to pass down fallback titles onto the image overlay
const titles = {
    billiards: ["Precision Strike", "Masterful Break", "The Finals Setup", "Midnight Hustle"],
    chess: ["Grandmaster's Vision", "Queen's Gambit", "The Final Mate"],
    darts: ["Bullseye Focus", "The Perfect Throw", "Oche Supremacy"]
};

export default GameGallery;
