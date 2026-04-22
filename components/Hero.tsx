import React, { useState, useRef, useEffect } from 'react';
import Button from './ui/Button';
import { Timer, ArrowRight, Volume2, VolumeX, Trophy, Users, CheckCircle } from 'lucide-react';
import Reveal from './ui/Reveal';
import { supabase } from '../lib/supabase';
import { scrollToElement, handleHashClick } from '../lib/scroll';
import { useCMSContent } from '../hooks/useCMSContent';
import { useAuth } from '../contexts/AuthContext';
import TieredHeroBanner from './TieredHeroBanner';

const Hero: React.FC = () => {
  const { user, profile } = useAuth();
  const [isMuted, setIsMuted] = useState(true);
  const [recentMembers, setRecentMembers] = useState<string[]>([]);
  const [content, setContent] = useState({
    title: 'Become A Member Today',
    subtitle: 'Join our premium club and unlock exclusive discounts. Members save up to 20% on table rates, dining, and event bookings.',
    cta: 'Get Membership Now!'
  });
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [hasInteracted, setHasInteracted] = useState(false);

  const { data: siteImages } = useCMSContent('site-images', {
    'hero-background': 'https://www.youtube.com/embed/RfiLxYAGQYY'
  });

  const { data: videoData } = useCMSContent('videos', {
    videos: []
  });

  const cmsVideoUrl = videoData.videos?.[0]?.url;
  const bgUrl = cmsVideoUrl || siteImages['hero-background'] || 'https://www.youtube.com/embed/RfiLxYAGQYY';
  const isVideo = bgUrl.includes('youtube.com') || bgUrl.includes('youtu.be');

  // If it's a youtube link, ensure it has the right embed params
  let embedUrl = bgUrl;
  if (isVideo) {
    let videoId = '';
    if (bgUrl.includes('v=')) {
      videoId = bgUrl.split('v=')[1]?.split('&')[0];
    } else if (bgUrl.includes('youtu.be/')) {
      videoId = bgUrl.split('youtu.be/')[1]?.split('?')[0];
    } else if (bgUrl.includes('embed/')) {
      videoId = bgUrl.split('embed/')[1]?.split('?')[0];
    }

    if (videoId) {
      embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&enablejsapi=1&playsinline=1`;
    }
  }

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data, error } = await (supabase.from('cms_content') as any)
          .select('*')
          .eq('slug', 'homepage-hero')
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
          const body = JSON.parse(data.body);
          setContent({
            title: data.title,
            subtitle: body.subtitle || content.subtitle,
            cta: body.cta || content.cta
          });
        }
      } catch (err) {
        console.error('Error fetching hero content:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  useEffect(() => {
    const fetchRecentMembers = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('full_name')
          .order('created_at', { ascending: false })
          .limit(3);

        if (data) {
          setRecentMembers(data.map(d => d.full_name?.charAt(0) || '?'));
        }
      } catch (err) {
        console.error('Error fetching recent members:', err);
      }
    };
    fetchRecentMembers();
  }, []);

  useEffect(() => {
    if (hasInteracted || !isVideo) return;

    const handleFirstInteraction = () => {
      if (!hasInteracted && iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(JSON.stringify({
          event: 'command',
          func: 'unMute',
          args: []
        }), '*');
        setIsMuted(false);
        setHasInteracted(true);
      }
    };

    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [hasInteracted, isVideo]);

  const toggleSound = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // Prevent triggering the global listener if clicked directly
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const action = isMuted ? 'unMute' : 'mute';
      // Send postMessage command to YouTube iframe to avoid reloading the video src
      iframeRef.current.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func: action,
        args: []
      }), '*');
      setIsMuted(!isMuted);
      setHasInteracted(true);
    }
  };

  return (
    <div id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pb-48 pt-32 md:pt-40">

      {/* 
        Background Video Container with V-Shape Border 
        Strategy: 
        1. Outer Container (Maroon): Clipped to the full V shape.
        2. Inner Container (Video): Clipped to the same shape minus 4px from the bottom points.
        This reveals the maroon background of the outer container, creating a perfect border.
      */}
      <div
        className="absolute inset-0 z-0 select-none bg-maroon pointer-events-none overflow-hidden"
        style={{
          clipPath: 'polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)',
          WebkitClipPath: 'polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)'
        }}
      >
        <div
          className="absolute inset-0 bg-dark-900 w-full h-full"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 100% calc(85% - 4px), 50% calc(100% - 4px), 0 calc(85% - 4px))',
            WebkitClipPath: 'polygon(0 0, 100% 0, 100% calc(85% - 4px), 50% calc(100% - 4px), 0 calc(85% - 4px))'
          }}
        >
          {isVideo ? (
            <iframe
              ref={iframeRef}
              className="w-full h-full object-cover scale-[1.35] -translate-y-[15%] opacity-60 pointer-events-auto"
              src={embedUrl}
              title="Hero Background"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          ) : (
            <img
              src={bgUrl}
              alt="Hero Background"
              className="w-full h-full object-cover opacity-60"
            />
          )}
          {/* Dark overlay for text visibility */}
          <div className="absolute inset-0 bg-dark-900/60 pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-dark-900/20 pointer-events-none"></div>
        </div>
      </div>

      {/* Sound Toggle Button */}
      {isVideo && (
        <div className="absolute bottom-32 right-6 md:bottom-24 md:right-10 z-20">
          <button
            onClick={toggleSound}
            className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-full text-white hover:bg-brand hover:border-brand transition-all duration-300 group shadow-lg"
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 flex flex-col items-center text-center">

        {/* Tiered Member Banner System */}
        <TieredHeroBanner />

        {/* Heading */}
        <Reveal>
          <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-galio uppercase tracking-wider mb-6 leading-[1.1]">
            <div className="mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-400">
              {content.title.split(' ').slice(0, 2).join(' ')}
            </div>
            <div className="mb-2 text-[#FFD700] drop-shadow-[0_0_15px_rgba(255,215,0,0.5)] filter">
              {content.title.split(' ').slice(2, 3).join(' ')}
            </div>
            <div className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-400">
              {content.title.split(' ').slice(3).join(' ')}
            </div>
          </h1>
        </Reveal>

        {/* Subtext */}
        <Reveal delay={200}>
          <p className="text-base md:text-2xl text-gray-100 mb-10 max-w-3xl font-light leading-relaxed drop-shadow-md px-4">
            {content.subtitle}
          </p>
        </Reveal>

        {/* Call to Actions */}
        <Reveal delay={400}>
          <div className="flex flex-col items-center gap-6 w-full px-4 mb-12">
            <Button
              variant="primary"
              className="bg-gradient-to-r from-[#FFD700] via-[#C5A059] to-[#B8860B] text-black border-none shadow-[0_0_30px_rgba(197,160,89,0.4)] hover:bg-none hover:bg-white hover:text-black hover:shadow-[0_0_50px_rgba(255,255,255,0.6)] text-base md:text-lg px-8 md:px-12 py-4 md:py-5 uppercase font-black tracking-widest w-full md:w-auto transform transition-all hover:-translate-y-1"
              onClick={(e) => handleHashClick(e, '#membership-packages')}
            >
              {content.cta} <ArrowRight className="ml-2 w-5 h-5 md:w-6 md:h-6" />
            </Button>

            <button
              onClick={() => scrollToElement('services')}
              className="text-gray-400 hover:text-white font-bold uppercase tracking-widest text-xs md:text-sm border-b border-gray-500 hover:border-white pb-1 transition-all"
            >
              View Facilities!
            </button>
          </div>
        </Reveal>

        {/* Flash Sale Banner - Glassmorphism Red - Moved to Bottom */}
        <Reveal variant="fade-up" delay={600}>
          <div className="w-full max-w-4xl bg-red-900/40 backdrop-blur-md border border-red-500/40 rounded-xl shadow-[0_0_40px_rgba(220,38,38,0.3)] overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between px-4 py-3 gap-3 md:gap-0">
              <div className="flex items-center gap-4">
                <span className="bg-red-600 text-white font-extrabold px-3 py-1 text-xs uppercase rounded shadow-sm animate-pulse">Flash Sale</span>
                <span className="text-white font-bold uppercase tracking-wide text-xs md:text-base">20% Off Annual Membership</span>
              </div>

              {/* Divider */}
              <div className="hidden md:block w-px h-6 bg-white/20 mx-4"></div>

              <div className="flex items-center gap-3">
                <Timer size={18} className="text-white/80" />
                <span className="text-white font-mono font-bold text-sm tracking-widest">
                  Limited Time Offer
                </span>
              </div>
            </div>
          </div>
        </Reveal>

      </div>
    </div>
  );
};

export default Hero;