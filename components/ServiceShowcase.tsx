import React from 'react';
import Section from './ui/Section';
import Reveal from './ui/Reveal';

interface ShowcaseItemProps {
  title: string;
  description: string;
  image: string;
  reverse?: boolean;
}

const ShowcaseItem: React.FC<ShowcaseItemProps> = ({ title, description, image, reverse }) => {
  return (
    <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 mb-24 last:mb-0`}>
      <div className="w-full md:w-1/2">
        <Reveal variant={reverse ? 'slide-right' : 'slide-left'}>
          <div className="relative group overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
            <img 
              src={image} 
              alt={title} 
              className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-transparent to-transparent opacity-60"></div>
          </div>
        </Reveal>
      </div>
      <div className="w-full md:w-1/2 text-center md:text-left">
        <Reveal variant="fade-up">
          <h3 className="text-3xl md:text-4xl font-galio uppercase tracking-tight text-white mb-6">
            {title}
          </h3>
          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            {description}
          </p>
          <div className="h-1 w-20 bg-brand mx-auto md:mx-0 rounded-full"></div>
        </Reveal>
      </div>
    </div>
  );
};

const ServiceShowcase: React.FC = () => {
  const services = [
    {
      title: "World-Class Billiards",
      description: "Experience the game on professional Yalin tables, the same used in the Qatar Billiard World Cup. Our tables are meticulously maintained to ensure consistent play for both casual enthusiasts and serious competitors.",
      image: "https://iili.io/qK7iGKg.md.jpg",
      reverse: false
    },
    {
      title: "Professional Darts",
      description: "Step up to the oche in our dedicated darts zone. Featuring tournament-grade boards and a focused atmosphere, it's the perfect place to sharpen your aim or challenge friends to a high-stakes match.",
      image: "https://iili.io/qK7s7gs.md.png",
      reverse: true
    },
    {
      title: "Premium Event Place",
      description: "From corporate team-building to private birthday celebrations, our versatile event space offers the perfect backdrop. We provide customizable layouts, high-end audio-visual equipment, and dedicated service to make your gathering unforgettable.",
      image: "https://iili.io/qK7s4rg.png",
      reverse: false
    },
    {
      title: "Private Karaoke Rooms",
      description: "Sing your heart out in our state-of-the-art private karaoke suites. Featuring an extensive library of international hits, premium sound systems, and mood lighting, it's the ultimate social experience for you and your group.",
      image: "https://iili.io/qK7LeFn.png",
      reverse: true
    }
  ];

  return (
    <Section id="services" className="bg-dark-900 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <div className="text-center mb-20">
            <h2 className="text-maroon font-bold uppercase tracking-widest mb-4">Our Offerings</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-white uppercase mb-6">More Than Just a Club</h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Discover a diverse range of entertainment options designed to provide the ultimate social experience in Doha.
            </p>
          </div>
        </Reveal>

        <div className="space-y-12">
          {services.map((service, index) => (
            <ShowcaseItem key={index} {...service} />
          ))}
        </div>
      </div>
    </Section>
  );
};

export default ServiceShowcase;
