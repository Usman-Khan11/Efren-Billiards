import React, { useState, useEffect } from 'react';
import Button from './ui/Button';
import { Timer } from 'lucide-react';
import { handleHashClick } from '../lib/scroll';

const PromoBanner: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 11, minutes: 59, seconds: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 }; // Reset for demo purposes
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (val: number) => val.toString().padStart(2, '0');

  return (
    <div className="bg-gradient-to-r from-brand-dark to-brand border-y-4 border-white shadow-[0_0_30px_rgba(59,130,246,0.5)] relative overflow-hidden z-30 transform -translate-y-12 max-w-6xl mx-auto rounded-xl">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>

      <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">

        <div className="flex-1">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <span className="bg-white text-brand font-black px-2 py-1 text-xs uppercase rounded animate-pulse">Flash Sale</span>
            <span className="text-white font-bold tracking-wider text-sm uppercase">Limited Time Offer</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tight leading-tight">
            🏆 PRO LEVEL ACCESS: <br />
            Claim 20% OFF Your First Booking!
          </h2>
        </div>

        <div className="flex items-center gap-6">
          <div className="bg-dark-900/40 p-3 rounded-lg backdrop-blur-sm border border-white/20">
            <div className="flex items-center gap-2 text-white font-mono text-2xl font-bold">
              <Timer className="text-yellow-400" />
              <span>{formatTime(timeLeft.hours)}</span>:
              <span>{formatTime(timeLeft.minutes)}</span>:
              <span>{formatTime(timeLeft.seconds)}</span>
            </div>
            <p className="text-[10px] text-center text-gray-200 uppercase tracking-widest mt-1">Time Remaining</p>
          </div>

          <Button
            variant="secondary"
            className="whitespace-nowrap shadow-xl hover:shadow-2xl transform hover:scale-105 border-2 border-transparent hover:border-white transition-all"
            onClick={(e) => handleHashClick(e, '#contact')}
          >
            Claim Offer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;