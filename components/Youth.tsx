import React from 'react';
import Section from './ui/Section';
import Reveal from './ui/Reveal';
import { Coffee, Armchair } from 'lucide-react';
import Button from './ui/Button';

const Youth: React.FC = () => {
  return (
    <Section id="coffee" className="bg-dark-800 border-y border-dark-700" containerClass="relative z-10">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <Reveal>
          <div className="order-2 lg:order-1">
            <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-gray-900 shadow-2xl relative border border-dark-700">
              <img
                src="https://iili.io/qfWIV1f.jpg"
                alt="Lounge Area"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900 to-transparent"></div>
            </div>
          </div>
        </Reveal>

        <div className="order-1 lg:order-2">
          <Reveal delay={200}>
            <div className="flex items-center gap-2 mb-2">
              <Coffee className="text-maroon" />
              <h2 className="text-maroon font-bold uppercase tracking-wider">The Lounge</h2>
            </div>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white uppercase mb-6 leading-tight">
              Refuel Between Frames
            </h3>
            <p className="text-gray-400 mb-6 text-lg leading-relaxed">
              Need a break from the action? Our lounge offers a relaxed setting to recharge. Grab a specialty coffee, a cold drink, or a light snack while you watch the games or catch up with friends.
            </p>

            <div className="flex gap-8 mb-8">
              <div>
                <h4 className="font-bold text-white uppercase mb-1 flex items-center gap-2"><Coffee size={18} className="text-brand" /> Sports Cafe</h4>
                <p className="text-sm text-gray-500">Food & Beverages</p>
              </div>
              <div>
                <h4 className="font-bold text-white uppercase mb-1 flex items-center gap-2"><Armchair size={18} className="text-brand" /> Chill Zone</h4>
                <p className="text-sm text-gray-500">Comfortable Seating & Wi-Fi</p>
              </div>
            </div>

            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-white hover:text-dark-900 hover:border-white" onClick={() => window.location.hash = '#coffee-menu'}>
              View Full Menu
            </Button>
          </Reveal>
        </div>
      </div>
    </Section>
  );
};

export default Youth;