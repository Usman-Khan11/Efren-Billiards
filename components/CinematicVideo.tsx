import React, { useState, useRef } from 'react';
import Reveal from './ui/Reveal';
import { Volume2, VolumeX } from 'lucide-react';
import { useCMSContent } from '../hooks/useCMSContent';

const CinematicVideo: React.FC = () => {
  const [isMuted, setIsMuted] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const { data: videoData } = useCMSContent('videos', {
    videos: [
      { title: 'Hero Background', url: 'https://www.youtube.com/embed/RfiLxYAGQYY' },
      { title: 'Cinematic Highlights', url: 'https://www.youtube.com/embed/KfPa315R4DI' }
    ]
  });

  const videoUrl = videoData.videos?.[1]?.url || videoData.videos?.[0]?.url || 'https://www.youtube.com/embed/KfPa315R4DI';
  const isYoutube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');

  let embedUrl = videoUrl;
  if (isYoutube) {
      let videoId = '';
      if (videoUrl.includes('v=')) {
          videoId = videoUrl.split('v=')[1]?.split('&')[0];
      } else if (videoUrl.includes('youtu.be/')) {
          videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
      } else if (videoUrl.includes('embed/')) {
          videoId = videoUrl.split('embed/')[1]?.split('?')[0];
      }
      
      if (videoId) {
          embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&enablejsapi=1&playsinline=1`;
      }
  }

  const toggleSound = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const action = isMuted ? 'unMute' : 'mute';
      iframeRef.current.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func: action,
        args: []
      }), '*');
      setIsMuted(!isMuted);
    }
  };

  return (
    <div id="cinematic-video" className="relative w-full bg-dark-900 -mt-1 z-0">
      <div className="relative h-[50vh] md:h-[70vh] w-full overflow-hidden">
        
        {/* Soft Edges / Vignette Effect */}
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-dark-900 via-dark-900/60 to-transparent z-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-dark-900 via-dark-900/60 to-transparent z-20 pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,#0F0F11_100%)] z-20 pointer-events-none opacity-80"></div>
        <div className="absolute inset-0 bg-brand/10 mix-blend-overlay z-10 pointer-events-none"></div>

        {/* YouTube Embed Container */}
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
            <iframe 
                ref={iframeRef}
                className="w-full h-full object-cover scale-[1.35] opacity-60 pointer-events-none"
                src={embedUrl}
                title="Cinematic Video" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen
            ></iframe>
        </div>

        {/* Sound Toggle Button */}
        <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 z-30">
          <button
            onClick={toggleSound}
            className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-full text-white hover:bg-brand hover:border-brand transition-all duration-300 group shadow-lg"
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
        </div>

        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <Reveal>
                <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-widest opacity-40 select-none drop-shadow-2xl">
                    Game On
                </h2>
            </Reveal>
        </div>
      </div>
    </div>
  );
};

export default CinematicVideo;