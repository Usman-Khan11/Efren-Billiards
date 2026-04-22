import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, CheckCircle, Share2, X, Calendar, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';
import Button from './ui/Button';

interface TournamentSuccessOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    tournamentName: string;
    gameType: string;
    playerName?: string;
    date?: string;
}

const TournamentSuccessOverlay: React.FC<TournamentSuccessOverlayProps> = ({ 
    isOpen, 
    onClose, 
    tournamentName, 
    gameType,
    playerName,
    date 
}) => {
    useEffect(() => {
        if (isOpen) {
            // High-energy confetti blast
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function() {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                // since particles fall down, start a bit higher than random
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);

            return () => clearInterval(interval);
        }
    }, [isOpen]);

    const handleShare = async () => {
        const text = `I just registered for the ${tournamentName} at Efren Billiards! Wish me luck! 🏆 #EfrenBilliards #Tournament`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Efren Billiards Tournament',
                    text: text,
                    url: window.location.href,
                });
            } catch (err) {
                console.error('Share failed', err);
            }
        } else {
            // Fallback to clipboard
            navigator.clipboard.writeText(text);
            alert('Share text copied to clipboard!');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark-900/90 backdrop-blur-md"
                >
                    <motion.div
                        initial={{ scale: 0.8, y: 50, opacity: 0 }}
                        animate={{ 
                            scale: 1, 
                            y: 0, 
                            opacity: 1,
                            transition: { 
                                type: "spring", 
                                damping: 15, 
                                stiffness: 100,
                                delay: 0.1 
                            }
                        }}
                        exit={{ scale: 0.8, y: 50, opacity: 0 }}
                        className="relative max-w-lg w-full bg-dark-800 border border-brand/30 rounded-[2.5rem] p-8 md:p-12 text-center shadow-[0_0_100px_rgba(197,160,89,0.2)] overflow-hidden"
                    >
                        {/* Decorative background elements */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand/10 rounded-full blur-3xl" />
                        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-brand/10 rounded-full blur-3xl" />

                        <button 
                            onClick={onClose}
                            className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors bg-dark-900/50 rounded-full p-2 hover:bg-dark-900"
                        >
                            <X size={20} />
                        </button>

                        <motion.div
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ 
                                scale: 1, 
                                rotate: 0,
                                transition: { 
                                    type: "spring", 
                                    damping: 12, 
                                    stiffness: 200,
                                    delay: 0.3 
                                }
                            }}
                            className="inline-flex items-center justify-center w-24 h-24 bg-brand rounded-full mb-8 shadow-[0_0_40px_rgba(197,160,89,0.4)]"
                        >
                            <Trophy size={48} className="text-black" />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
                        >
                            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4 leading-none">
                                {playerName ? `You're In, ${playerName.split(' ')[0]}!` : "You're In!"}
                            </h2>
                            <p className="text-brand font-black uppercase tracking-[0.2em] text-sm mb-8">
                                Registration Confirmed
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1, transition: { delay: 0.7 } }}
                            className="bg-dark-900/50 border border-white/5 rounded-3xl p-6 mb-10 text-left"
                        >
                            <h3 className="text-white font-bold text-xl mb-4">{tournamentName}</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-gray-400 text-sm">
                                    <CheckCircle size={16} className="text-brand" />
                                    <span className="uppercase tracking-widest font-bold">{gameType} Tournament</span>
                                </div>
                                {date && (
                                    <div className="flex items-center gap-3 text-gray-400 text-sm">
                                        <Calendar size={16} className="text-brand" />
                                        <span>{date}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-gray-400 text-sm">
                                    <MapPin size={16} className="text-brand" />
                                    <span>Efren Billiards & Events Place</span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0, transition: { delay: 0.9 } }}
                            className="flex flex-col sm:flex-row gap-4"
                        >
                            <Button 
                                variant="primary" 
                                fullWidth 
                                onClick={onClose}
                                className="py-4 text-sm font-black uppercase tracking-widest"
                            >
                                Let's Go!
                            </Button>
                            <Button 
                                variant="outline" 
                                fullWidth 
                                onClick={handleShare}
                                className="py-4 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 border-white/10 text-white hover:bg-white/5"
                            >
                                <Share2 size={18} />
                                Share
                            </Button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TournamentSuccessOverlay;
