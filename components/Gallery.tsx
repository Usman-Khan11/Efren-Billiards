import React, { useState } from 'react';
import Section from './ui/Section';
import Reveal from './ui/Reveal';
import { X, Loader2 } from 'lucide-react';
import { useCMSContent } from '../hooks/useCMSContent';

interface GalleryImage {
    url: string;
    description: string;
    category: string;
}

const Gallery: React.FC = () => {
  const [selectedImg, setSelectedImg] = useState<GalleryImage | null>(null);

  const { data, loading } = useCMSContent('gallery', {
    images: [
      { url: "https://iili.io/qfWIEss.jpg", description: "Billiards Balls", category: "billiards" },
      { url: "https://iili.io/qFN1vwb.jpg", description: "Darts", category: "darts" },
      { url: "https://iili.io/qFNV7xs.jpg", description: "Chess", category: "chess" },
      { url: "https://iili.io/q2fFdAP.jpg", description: "Action Shot", category: "general" },
      { url: "https://iili.io/qFNMwcN.jpg", description: "Darts 2", category: "darts" },
      { url: "https://iili.io/qfWIMqG.jpg", description: "Coffee/Vibe", category: "cafe" },
      { url: "https://iili.io/qFNMXPR.jpg", description: "Chess 2", category: "chess" },
      { url: "https://iili.io/qfWI1Xn.jpg", description: "Party/Event", category: "events" },
      { url: "https://iili.io/q2f3Qte.jpg", description: "Dark Vibe", category: "general" },
      { url: "https://iili.io/qfWIhdl.jpg", description: "Table Detail", category: "billiards" },
    ]
  });

  const images = data.images || [];

  return (
    <Section id="gallery" className="bg-dark-900 pt-0">
      <Reveal>
        <div className="mb-10 text-center md:text-left">
          <h2 className="text-brand font-bold uppercase tracking-wider mb-2">The Vibe</h2>
          <p className="text-gray-400">Billiards, Darts, Chess, and good times. A peek inside.</p>
        </div>
      </Reveal>
      <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center">
            <Loader2 size={32} className="animate-spin text-brand" />
          </div>
        ) : images.length > 0 ? (
          images.map((img: GalleryImage, idx: number) => (
            <Reveal key={idx} delay={idx * 50}>
              <div
                className="break-inside-avoid relative group cursor-pointer overflow-hidden rounded-lg mb-4"
                onClick={() => setSelectedImg(img)}
              >
                <img
                  src={img.url}
                  alt={img.description || "Club gallery"}
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-maroon/20 transition-colors"></div>
              </div>
            </Reveal>
          ))) : (
          <div className="col-span-full py-20 text-center text-gray-500">
            <p>No images in the gallery yet.</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedImg && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button
            className="absolute top-4 right-4 text-white hover:text-brand bg-black/50 rounded-full p-2"
            onClick={() => setSelectedImg(null)}
          >
            <X size={32} />
          </button>
          <div className="flex flex-col items-center max-w-full max-h-[90vh]">
            <img src={selectedImg.url} alt={selectedImg.description || "Enlarged view"} className="max-w-full max-h-[80vh] rounded-md shadow-2xl border-2 border-brand object-contain" />
            {selectedImg.description && (
                <p className="text-white mt-4 text-center font-medium bg-black/50 px-6 py-2 rounded-full backdrop-blur-sm">
                    {selectedImg.description}
                </p>
            )}
          </div>
        </div>
      )}
    </Section>
  );
};

export default Gallery;