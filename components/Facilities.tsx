import React from 'react';
import Section from './ui/Section';
import Reveal from './ui/Reveal';
import { Trophy, GraduationCap, CalendarClock, Users, Crown, Award } from 'lucide-react';

const DartsIcon = ({ className, size = 40 }: { className?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm9.71-3.71l-4.24 4.24 1.41 1.41 4.24-4.24-1.41-1.41z" />
  </svg>
);

const ChessIcon = ({ className, size = 40 }: { className?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19 22H5v-2h14v2zm-2-3H7v-2h10v2zm-1-3H8l1-8h6l1 8zM12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm3 5H9c-1.1 0-2 .9-2 2v1h10V9c0-1.1-.9-2-2-2z" />
  </svg>
);

const Facilities: React.FC = () => {
  const features = [
    {
      icon: <Award className="text-brand" size={40} />,
      title: "Pro Equipment",
      desc: "Play on well-maintained Yalin Pro Billiards table used in Qatar Billiard World Cup Tournament Events tailored for the perfect game.",
      link: "#billiards-service"
    },
    {
      icon: <Trophy className="text-brand" size={40} />,
      title: "Leagues & Tournaments",
      desc: "Join our vibrant competitive scene. Weekly leagues and monthly cash-prize tournaments.",
      link: "#tournament"
    },
    {
      icon: <Crown className="text-brand" size={40} />,
      title: "VIP Rooms",
      desc: "Exclusive private spaces with premium service, perfect for groups who want privacy.",
      link: "#event-place"
    },
    {
      icon: <GraduationCap className="text-brand" size={40} />,
      title: "Coaching",
      desc: "Improve your technique with tips from our resident pros. Beginners welcome.",
      link: "#billiards-service"
    },
    {
      icon: <DartsIcon className="text-brand" size={40} />,
      title: "Darts",
      desc: "Test your aim on our professional dart boards. Perfect for casual play or friendly competition.",
      link: "#darts"
    },
    {
      icon: <ChessIcon className="text-brand" size={40} />,
      title: "Chess",
      desc: "Test your strategy and focus. Our chess corner is available for players of all skill levels.",
      link: "#chess"
    },
    {
      icon: <Users className="text-brand" size={40} />,
      title: "Social Vibe",
      desc: "Great music, dim lighting, and a community of players make every night memorable.",
      link: "#gallery"
    },
    {
      icon: <CalendarClock className="text-brand" size={40} />,
      title: "Easy Booking",
      desc: "Reserve specific tables in advance for you and your friends to guarantee your spot.",
      link: "#contact"
    }
  ];

  return (
    <Section id="billiards" className="bg-dark-900">
      <div className="mb-16 md:flex justify-between items-end">
        <div className="md:w-2/3">
          <Reveal>
            <h2 className="text-maroon font-bold uppercase tracking-wider mb-2">The Experience</h2>
            <h3 className="text-3xl md:text-5xl font-extrabold text-white uppercase">Precision & Passion</h3>
          </Reveal>
        </div>
        <div className="md:w-1/3 mt-4 md:mt-0">
          <Reveal delay={200}>
            <p className="text-gray-400">
              Whether you're a casual player or a serious competitor, Efren Billiards offers the finest environment in Doha for the game.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feat, idx) => (
          <Reveal key={idx} delay={idx * 100} variant="slide-left">
            <a 
              href={feat.link}
              className="block bg-dark-800 p-8 rounded-xl border border-dark-700 h-full group transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:border-brand hover:shadow-glow"
            >
              <div className="bg-dark-900 w-16 h-16 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-brand/10 group-hover:shadow-brand/30">
                {feat.icon}
              </div>
              <h4 className="text-xl font-bold text-white mb-3 uppercase">{feat.title}</h4>
              <p className="text-gray-400 leading-relaxed text-sm group-hover:text-gray-300">
                {feat.desc}
              </p>
            </a>
          </Reveal>
        ))}
      </div>
    </Section>
  );
};

export default Facilities;