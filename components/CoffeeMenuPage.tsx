import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Citrus, Croissant, QrCode, ArrowRight, Target, Brain, Music, Gamepad2, Zap, Wind, Mic2, Users, Star, Flame } from 'lucide-react';
import Section from './ui/Section';
import Reveal from './ui/Reveal';
import Button from './ui/Button';
import { scrollToElement } from '../lib/scroll';
import { useCMSContent } from '../hooks/useCMSContent';

// Gamification Data
type Activity = string;

interface Recommendation {
  drink: string;
  description: string;
  category: string;
  icon_name: string;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Gamepad2: <Gamepad2 size={24} />,
  Target: <Target size={24} />,
  Brain: <Brain size={24} />,
  Music: <Music size={24} />,
  Wind: <Wind size={24} />,
  Mic2: <Mic2 size={24} />,
  Users: <Users size={24} />,
  Star: <Star size={24} />,
  Flame: <Flame size={24} />
};

const CoffeeMenuPage: React.FC = () => {
  const [selectedActivity, setSelectedActivity] = useState<Activity>('Billiards');

  const { data: recData } = useCMSContent<Record<Activity, Recommendation>>('match-my-game', {
    Billiards: { drink: 'Signature Spanish Latte', description: 'Smooth and mildly sweet, perfect for staying energized during long matches.', category: 'Espresso Bar', icon_name: 'Gamepad2' },
    Darts: { drink: 'Lemon Mint Crush', description: 'Refreshing and sharp to keep your focus laser-tight at the oche.', category: 'Mocktails & Coolers', icon_name: 'Target' },
    Chess: { drink: 'V60 Pour Over', description: 'A slow, deliberate brew for deep thinkers and strategic minds.', category: 'Espresso Bar', icon_name: 'Brain' },
    Karaoke: { drink: 'Passion Fruit Mojito', description: 'Vibrant and fruity to keep those vocal cords lubricated and the party going.', category: 'Mocktails & Coolers', icon_name: 'Music' },
    Relaxing: { drink: 'Honey Cake & Iced Tea', description: 'The perfect pairing to unwind after a long day.', category: 'Snacks & Pastries', icon_name: 'Wind' },
  });

  const recommendations = recData || {};

  const { data: menuData } = useCMSContent('food-menu', {
    categories: [
      {
        category: "Espresso Bar",
        items: [
          { name: "Signature Spanish Latte", price: "24 QAR" },
          { name: "V60 Pour Over", price: "28 QAR" },
          { name: "Double Espresso", price: "18 QAR" },
          { name: "Iced Americano", price: "20 QAR" }
        ]
      },
      {
        category: "Mocktails & Coolers",
        items: [
          { name: "Passion Fruit Mojito", price: "26 QAR" },
          { name: "Blue Lagoon", price: "26 QAR" },
          { name: "Lemon Mint Crush", price: "22 QAR" },
          { name: "Classic Iced Tea", price: "18 QAR" }
        ]
      },
      {
        category: "Snacks & Pastries",
        items: [
          { name: "Honey Cake", price: "32 QAR" },
          { name: "Cheese Croissant", price: "18 QAR" },
          { name: "Chicken Club Sandwich", price: "38 QAR" },
          { name: "Truffle Fries", price: "28 QAR" }
        ]
      }
    ]
  });

  const categories = menuData.categories || [];

  const getCategoryIcon = (index: number) => {
      const icons = [<Coffee size={24} className="text-brand" />, <Citrus size={24} className="text-brand" />, <Croissant size={24} className="text-brand" />];
      return icons[index % icons.length];
  };

  const getCategoryImage = (index: number) => {
      const images = [
          "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1509365465985-25d11c17e812?q=80&w=800&auto=format&fit=crop"
      ];
      return images[index % images.length];
  };

  const targetUrl = "https://efren-billiards-and-events-place-359701191378.us-west1.run.app/#coffee-menu";
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(targetUrl)}`;

  return (
    <div className="pt-20 min-h-screen bg-dark-900">
      {/* Hero */}
      <div className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden border-b border-maroon">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=2574&auto=format&fit=crop"
            alt="Sports Cafe Background"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/60 to-transparent"></div>
        </div>
        <div className="relative z-10 text-center px-6">
          <Reveal>
            <h1 className="text-5xl md:text-7xl font-extrabold uppercase text-white mb-4">
              The <span className="text-brand">Sports Cafe</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-xl mx-auto">
              Premium beans, handcrafted mocktails, and the perfect atmosphere to recharge.
            </p>
          </Reveal>
        </div>
      </div>

      {/* Gamification Widget: Match My Game */}
      <Section id="match-my-game" className="bg-dark-900 pb-0">
        <Reveal>
          <div className="max-w-4xl mx-auto bg-dark-800 rounded-3xl p-8 md:p-12 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="absolute -top-10 -right-10 text-brand/5 rotate-12 cursor-default"><Coffee size={300} /></div>

            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest mb-2 flex items-center gap-3">
                <Zap className="text-brand" /> Match My Game
              </h2>
              <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-8">Select your activity to get the perfect pairing recommendation</p>

              <div className="grid md:grid-cols-5 gap-3 mb-10">
                {Object.keys(recommendations).map(activity => (
                  <button
                    key={activity}
                    onClick={() => setSelectedActivity(activity)}
                    className={`flex flex-col flex-1 items-center justify-center p-4 rounded-xl transition-all duration-300 ${selectedActivity === activity
                      ? 'bg-brand text-black shadow-[0_0_20px_rgba(197,160,89,0.4)] scale-105'
                      : 'bg-dark-900 text-gray-400 hover:bg-dark-700 hover:text-white'
                      }`}
                  >
                    {ICON_MAP[recommendations[activity].icon_name] || <Gamepad2 size={24} />}
                    <span className="text-[10px] font-bold uppercase tracking-wider mt-2">{activity}</span>
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedActivity}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-dark-900 border border-brand/30 rounded-2xl p-6 text-center min-h-[160px] flex flex-col justify-center"
                >
                  {recommendations[selectedActivity] && (
                    <>
                      <span className="text-xs font-bold uppercase tracking-widest text-brand block mb-2">{recommendations[selectedActivity].category}</span>
                      <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-4">{recommendations[selectedActivity].drink}</h3>
                      <p className="text-gray-400 max-w-lg mx-auto leading-relaxed">{recommendations[selectedActivity].description}</p>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </Section>

      <Section id="qr-menu" className="bg-dark-900 pt-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* QR Code Section */}
          <div className="bg-white text-dark-900 p-8 rounded-2xl shadow-glow transform rotate-1 md:rotate-2 hover:rotate-0 transition-transform duration-500 max-w-sm mx-auto md:mx-0">
            <div className="border-4 border-dark-900 p-4 rounded-xl mb-6">
              <img
                src={qrCodeUrl}
                alt="Menu QR Code"
                className="w-full h-auto"
              />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold uppercase mb-2">Scan for Full Menu</h3>
              <p className="text-gray-600 font-medium">View detailed ingredients and seasonal specials on your phone.</p>
              <div className="mt-6 flex justify-center">
                <QrCode size={32} className="text-maroon animate-pulse" />
              </div>
            </div>
          </div>

          {/* Intro Text */}
          <div>
            <Reveal delay={200}>
              <span className="text-brand font-bold tracking-widest uppercase mb-2 block">Taste the Quality</span>
              <h2 className="text-4xl font-extrabold text-white uppercase mb-6">More Than Just A Break</h2>
              <p className="text-gray-400 leading-relaxed mb-6">
                Our Sports Cafe isn't an afterthought. It's a destination. We partner with top local roasters to bring you specialty grade coffee.
                Whether you need a caffeine kick before a tournament or a refreshing mocktail to cool down, we've got you covered.
              </p>
              <Button variant="outline" onClick={() => scrollToElement('preview-list')}>
                Preview Favorites <ArrowRight size={16} className="ml-2" />
              </Button>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* Menu Preview Grid */}
      <Section id="preview-list" className="bg-dark-800">
        <div className="text-center mb-16">
          <Reveal>
            <h2 className="text-3xl font-bold text-white uppercase">Menu Highlights</h2>
          </Reveal>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {categories.map((cat: any, idx: number) => (
            <Reveal key={idx} delay={idx * 150} variant="fade-up">
              <div className="bg-dark-900 rounded-xl border border-dark-700 hover:border-brand transition-colors h-full overflow-hidden group flex flex-col">

                {/* Graphical Header */}
                <div className="h-48 relative overflow-hidden">
                  <img
                    src={getCategoryImage(idx)}
                    alt={cat.category}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900 to-transparent opacity-80"></div>
                  <div className="absolute bottom-4 left-4 p-3 bg-dark-800/90 backdrop-blur rounded-lg shadow-lg border border-dark-700">
                    {getCategoryIcon(idx)}
                  </div>
                </div>

                <div className="p-8 pt-4 flex-grow">
                  <h3 className="text-xl font-bold text-white uppercase mb-6 pl-1">{cat.category}</h3>
                  <ul className="space-y-6">
                    {cat.items.map((item: any, i: number) => (
                      <li key={i} className="flex justify-between items-center border-b border-dark-700 pb-4 border-dashed">
                        <div className="flex items-center gap-4 flex-1">
                          <img 
                            src={item.image || "https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=200&auto=format&fit=crop"} 
                            alt={item.name} 
                            className="w-12 h-12 object-cover rounded-full border border-dark-700"
                          />
                          <span className="text-gray-300 font-medium flex-1">{item.name}</span>
                        </div>
                        <span className="text-brand font-bold whitespace-nowrap ml-4">{item.price}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">Prices and availability subject to change. Please scan QR for live menu.</p>
        </div>
      </Section>
    </div>
  );
};

export default CoffeeMenuPage;