import React from 'react';
import Section from './ui/Section';
import Reveal from './ui/Reveal';
import { handleHashClick } from '../lib/scroll';
import { useCMSContent } from '../hooks/useCMSContent';
import { Loader2 } from 'lucide-react';

const ActivitySections: React.FC = () => {
  const { data, loading } = useCMSContent('offerings', {
    items: [
      {
        id: 'billiards-detail',
        title: 'Professional Billiards',
        description: 'Experience the game on our world-class Yalin Pro tables, the same equipment used in international championships. Whether you are practicing your break or competing in a tournament, our professional-grade environment ensures every shot counts.',
        url: 'https://iili.io/q2fFdAP.jpg',
        align: 'left'
      },
      {
        id: 'darts-detail',
        title: 'Precision Darts',
        description: 'Aim for the bullseye in our dedicated darts zone. Featuring professional-standard boards and a relaxed atmosphere, it is the perfect place to sharpen your focus or enjoy a friendly match with friends.',
        url: 'https://iili.io/qFN1vwb.jpg',
        align: 'right'
      },
      {
        id: 'events-detail',
        title: 'Premier Event Space',
        description: 'From corporate team building to private celebrations, our versatile event space is designed to impress. With customizable layouts, premium catering options, and full AV support, we make your special occasions unforgettable.',
        url: 'https://iili.io/q2fF3DF.jpg',
        align: 'left'
      },
      {
        id: 'karaoke-detail',
        title: 'Private Karaoke',
        description: 'Sing your heart out in our state-of-the-art private karaoke rooms. Equipped with the latest sound systems and an extensive library of hits, it is the ultimate destination for music lovers and party-goers alike.',
        url: 'https://picsum.photos/seed/karaoke-lounge/800/600',
        align: 'right'
      }
    ]
  });

  const activities = data.items || [];

  if (loading) {
    return (
      <div className="bg-dark-900 py-20 flex justify-center">
        <Loader2 size={32} className="animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="bg-dark-900">
      {activities.map((activity: any, index: number) => (
        <Section 
          key={activity.id || index} 
          id={activity.id || `offering-${index}`} 
          className={index % 2 === 0 ? 'bg-dark-900' : 'bg-dark-800'}
        >
          <div className={`flex flex-col lg:flex-row items-center gap-12 ${(activity.align || (index % 2 !== 0 ? 'right' : 'left')) === 'right' ? 'lg:flex-row-reverse' : ''}`}>
            {/* Image Side */}
            <div className="w-full lg:w-1/2">
              <Reveal variant={(activity.align || (index % 2 !== 0 ? 'right' : 'left')) === 'left' ? 'slide-left' : 'slide-right'}>
                <div className="relative group overflow-hidden rounded-2xl border border-white/5 shadow-2xl">
                  <img 
                    src={activity.url} 
                    alt={activity.title} 
                    className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-transparent to-transparent opacity-60"></div>
                </div>
              </Reveal>
            </div>

            {/* Text Side */}
            <div className="w-full lg:w-1/2 space-y-6">
              <Reveal delay={200}>
                <h2 className="text-maroon font-bold uppercase tracking-widest text-sm">Experience</h2>
                <h3 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight leading-none">
                  {activity.title}
                </h3>
                <div className="w-20 h-1 bg-brand rounded-full"></div>
              </Reveal>
              
              <Reveal delay={400}>
                <p className="text-gray-400 text-lg leading-relaxed max-w-xl">
                  {activity.description}
                </p>
              </Reveal>

              <Reveal delay={600}>
                <button 
                  onClick={(e) => handleHashClick(e, '#contact')}
                  className="inline-flex items-center gap-2 text-white font-bold uppercase tracking-widest text-sm group"
                >
                  <span className="border-b-2 border-brand pb-1 group-hover:border-white transition-colors">Book this space</span>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-brand transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </button>
              </Reveal>
            </div>
          </div>
        </Section>
      ))}
    </div>
  );
};

export default ActivitySections;
