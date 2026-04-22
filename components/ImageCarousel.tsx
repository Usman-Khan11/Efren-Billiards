import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCMSContent } from '../hooks/useCMSContent';
import Reveal from './ui/Reveal';

// Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Swiper modules
import { EffectCoverflow, Mousewheel, Pagination, Keyboard } from 'swiper/modules';

// Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

const ImageCarousel: React.FC = () => {
  const { data, loading } = useCMSContent('visual-tour', {
    images: [
      { url: "https://iili.io/q2MSG29.md.jpg", title: "Premium Tables", description: "World-class Yalin tables for a professional experience." },
      { url: "https://iili.io/q2MSWmb.md.jpg", title: "Team Play", description: "Gather your friends for competitive team matches." },
      { url: "https://iili.io/q2MSM7e.md.jpg", title: "Events", description: "Host your private and corporate events with us." },
      { url: "https://iili.io/q2MSVku.md.jpg", title: "Lounge Vibes", description: "Relax and unwind in our premium lounge area." },
      { url: "https://iili.io/q2MSjhx.md.jpg", title: "Parties", description: "The perfect venue for unforgettable celebrations." },
      { url: "https://iili.io/q2MSOBV.md.jpg", title: "Haircut", description: "Get a fresh cut before your big game." },
      { url: "https://iili.io/q2MSwLQ.md.jpg", title: "Darts", description: "Tournament-grade darts boards available." },
      { url: "https://iili.io/q2MSeEB.md.jpg", title: "Target Focus", description: "Precision matters on our dedicated dart lanes." },
      { url: "https://iili.io/q2MSSYF.md.jpg", title: "Lounge Area", description: "Comfortable seating combined with a great atmosphere." },
      { url: "https://iili.io/q2MSUkg.md.jpg", title: "Billiards Action", description: "Experience the thrill of competitive billiards." },
      { url: "https://iili.io/q2MSgpa.md.jpg", title: "Caterings", description: "Delicious food and drinks available to enhance your visit." },
      { url: "https://iili.io/q2MS4TJ.md.jpg", title: "Corporate Events", description: "Seamlessly integrate team building and play." },
      { url: "https://iili.io/q2MSPQR.md.jpg", title: "Special Nights", description: "Join us for exclusive themed events." },
      { url: "https://iili.io/q2MSsBp.md.jpg", title: "Team Dynamics", description: "Build coordination and enjoy friendly rivalries." },
      { url: "https://iili.io/q2MSLEN.md.jpg", title: "Tournaments", description: "Compete against the best in our regular tournaments." },
      { url: "https://iili.io/q2MSQ4I.md.jpg", title: "The Hall", description: "A spacious, beautifully designed hall awaits you." },
      { url: "https://iili.io/q2MSbvn.md.jpg", title: "Practice Mode", description: "Sharpen your skills during quiet hours." },
      { url: "https://iili.io/q2MSmps.md.jpg", title: "Efren Billiards Hall", description: "Your ultimate destination for billiards in Qatar." },
      { url: "https://iili.io/q2MU9jf.md.jpg", title: "The Legacy", description: "Experience the excellence of Efren Billiards." },
      { url: "https://iili.io/q2MUdCl.md.jpg", title: "Champion's Choice", description: "Where champions come to play and train." }
    ]
  });

  const [activeIndex, setActiveIndex] = useState(0);

  const images = data.images || [];

  if (loading) return null;
  if (!images || images.length === 0) return null;

  const currentImage = images[activeIndex] || images[0];

  const safeTitle = currentImage.title || "Gallery Showcase";
  const safeDesc = currentImage.description || "A glimpse into life at Efren's.";

  return (
    <div id="gallery-carousel" className="py-24 w-full bg-gradient-to-b from-dark-900 via-black to-dark-900 relative overflow-hidden flex flex-col items-center">
      {/* Ambient Lighting Behind Carousel */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-brand/10 blur-[120px] rounded-[100%] pointer-events-none" />

      <Reveal className="w-full max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Dynamic Text Area (Left Side) */}
          <div className="flex-1 lg:max-w-md w-full text-center lg:text-left z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="mb-6 lg:mb-12"
            >
              <h2 className="text-brand font-bold uppercase tracking-wider mb-2">Visual Tour</h2>
              <span className="text-white text-xs lg:text-sm font-bold uppercase tracking-[0.3em] font-mono">
                Life at Efren's
              </span>
            </motion.div>

            {/* AnimatePresence for smooth fading text updates */}
            <div className="relative min-h-[160px] lg:min-h-[200px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  <h3 className="text-3xl lg:text-5xl font-black text-white uppercase tracking-tight mb-6 leading-[1.1]">
                    {safeTitle}
                  </h3>
                  <p className="text-gray-400 text-sm lg:text-base leading-relaxed">
                    {safeDesc}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
            
            <div className="hidden lg:flex items-center gap-4 mt-8 opacity-50">
              <span className="text-white text-xs font-mono uppercase tracking-widest">{activeIndex + 1} / {images.length}</span>
              <div className="h-[1px] w-24 bg-white/20"></div>
            </div>
          </div>

          {/* 3D Coverflow Carousel (Right Side) */}
          <div className="w-full lg:w-[60%] lg:-mr-12 perspective-[1000px] z-10">
            <Swiper
              effect={'coverflow'}
              grabCursor={true}
              centeredSlides={true}
              slidesPerView={'auto'}
              initialSlide={0}
              mousewheel={{
                forceToAxis: true,
              }}
              keyboard={{
                enabled: true,
              }}
              coverflowEffect={{
                rotate: 20,       // Card rotation along Y-axis in degrees
                stretch: 0,       // Space between cards (negative to overlay more)
                depth: 250,       // How far pushed back in Z-axis
                modifier: 1,      // Multiply effect values
                slideShadows: true, // Swiper generates cool shadows automatically!
              }}
              pagination={{
                clickable: true,
                dynamicBullets: true
              }}
              modules={[EffectCoverflow, Mousewheel, Pagination, Keyboard]}
              onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
              className="w-full !pb-16"
            >
              {images.map((img: any, index: number) => {
                // Defensive fallback since older CMS entries might not have title
                const dynamicTitle = img.title || "Gallery Showcase";
                return (
                  <SwiperSlide 
                    key={index}
                    className="!w-[280px] md:!w-[400px] lg:!w-[450px]"
                  >
                    {({ isActive }) => (
                      <motion.div
                        animate={{ 
                          opacity: isActive ? 1 : 0.6,
                        }}
                        transition={{ duration: 0.4 }}
                        className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 group bg-dark-800"
                      >
                        <img
                          src={img.url}
                          alt={img.description}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          loading="lazy"
                        />
                        {/* Subtitle / Overlay on image */}
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-black/20 to-transparent flex items-end p-6">
                          <h4 className="text-white font-black uppercase tracking-widest text-lg md:text-xl drop-shadow-md lg:hidden">
                            {dynamicTitle}
                          </h4>
                        </div>
                      </motion.div>
                    )}
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>

        </div>
      </Reveal>

      {/* Global overrides for Swiper Pagination specifically in this component */}
      <style dangerouslySetInnerHTML={{__html: `
        .swiper-pagination-bullet {
          background: rgba(255,255,255,0.3) !important;
          transition: all 0.3s ease;
        }
        .swiper-pagination-bullet-active {
          background: #c5a059 !important; /* brand color */
          width: 24px !important;
          border-radius: 12px !important;
        }
      `}} />
    </div>
  );
};

export default ImageCarousel;