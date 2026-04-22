import React, { useState } from 'react';
import { Trophy, Coffee, Crown, Users, Clock, Gift } from 'lucide-react';

const Highlights: React.FC = () => {
  const highlights = [
    { icon: <Trophy size={24} />, text: "Tournament-Grade Tables" },
    { icon: <Crown size={24} />, text: "VIP Private Rooms" },
    { icon: <Users size={24} />, text: "Event Hosting" },
    { icon: <Clock size={24} />, text: "Open 24 Hours" },
    { icon: <Gift size={24} />, text: "Daily Offers" },
    { icon: <Coffee size={24} />, text: "Lounge Refreshments" },
  ];
  return (
    <div className="w-full bg-gradient-to-r from-brand-dark to-brand text-white border-y border-maroon overflow-hidden py-4 z-20 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-nowrap md:justify-between gap-8 md:gap-4 overflow-x-auto no-scrollbar items-center pb-2 md:pb-0">
          {highlights.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 shrink-0 animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
              <span className="p-2 bg-dark-900/20 rounded-full">{item.icon}</span>
              <span className="text-sm md:text-base font-bold uppercase tracking-wide whitespace-nowrap">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Highlights;