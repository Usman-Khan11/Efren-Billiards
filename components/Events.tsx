import React from 'react';
import Section from './ui/Section';
import Button from './ui/Button';
import Reveal from './ui/Reveal';
import { handleHashClick } from '../lib/scroll';

const Events: React.FC = () => {
  return (
    <Section id="events" className="bg-dark-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="text-center mb-12 relative z-10">
        <Reveal>
          <h2 className="text-gold font-bold uppercase tracking-wider mb-2">Event Place for Rent</h2>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white uppercase max-w-2xl mx-auto">
            Your Next Event, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-white">Sorted</span>
          </h2>
          <p className="text-gray-400 mt-4 max-w-xl mx-auto">
            From birthdays to corporate team-building, we provide the perfect blend of entertainment and atmosphere.
          </p>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {[
          {
            title: "Birthday Bash",
            desc: "Celebrate in style with reserved tables and a private area for your crew.",
            cat: "Social",
            action: (e: any) => handleHashClick(e, '#contact'),
            cta: "Inquire Now"
          },
          {
            title: "Corporate Events",
            desc: "Boost morale with a billiards tournament. We organize the brackets and prizes.",
            cat: "Business",
            action: (e: any) => handleHashClick(e, '#contact'),
            cta: "Inquire Now"
          },
          {
            title: "Grandmaster Simul",
            desc: "Monthly chess exhibition. Face off against top-ranked masters. View bracket and reserve your board.",
            cat: "Tournament",
            action: (e: any) => handleHashClick(e, '#tournaments?id=SIMUL-001'),
            cta: "View Details"
          }
        ].map((evt, idx) => (
          <Reveal key={idx} delay={idx * 150} variant="slide-left">
            <div className="bg-dark-800 p-8 rounded-lg border-t-4 border-maroon flex flex-col h-full shadow-xl transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:shadow-glow-maroon hover:bg-dark-700">
              <span className="text-xs font-bold text-brand uppercase tracking-widest mb-2">{evt.cat}</span>
              <h3 className="text-2xl font-bold text-white uppercase mb-4">{evt.title}</h3>
              <p className="text-gray-400 mb-8 flex-grow leading-relaxed">{evt.desc}</p>
              <Button
                variant="outline"
                className="w-full"
                onClick={evt.action}
              >
                {evt.cta}
              </Button>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
};

export default Events;