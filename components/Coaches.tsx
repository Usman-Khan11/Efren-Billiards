import React from 'react';
import Section from './ui/Section';

const Coaches: React.FC = () => {
  const coaches = [
    { name: "Sarah Al-Mahmoud", role: "Head of Female Fitness", img: "https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=400&auto=format&fit=crop" },
    { name: "James Thorne", role: "Performance Director", img: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=400&auto=format&fit=crop" },
    { name: "Miguel Santos", role: "Padel Head Coach", img: "https://images.unsplash.com/photo-1583468982228-19f19164aee2?q=80&w=400&auto=format&fit=crop" },
    { name: "Elena Kovic", role: "Yoga & Mobility", img: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=400&auto=format&fit=crop" },
  ];

  return (
    <Section id="coaches" className="bg-dark-800">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-extrabold text-white uppercase">The Squad</h2>
        <p className="text-gray-400 mt-4 max-w-xl mx-auto">
          Expertise drives results. Meet the professionals dedicated to your progress.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {coaches.map((coach, idx) => (
          <div key={idx} className="group relative overflow-hidden rounded-xl bg-dark-900 border border-dark-700">
            <div className="aspect-square overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500">
              <img src={coach.img} alt={coach.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="p-4 absolute bottom-0 left-0 w-full bg-gradient-to-t from-dark-900 to-transparent pt-12">
              <h3 className="text-lg font-bold text-white uppercase">{coach.name}</h3>
              <p className="text-brand text-xs font-bold tracking-wider uppercase">{coach.role}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default Coaches;