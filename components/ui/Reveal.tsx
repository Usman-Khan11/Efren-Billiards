import React, { useEffect, useRef, useState } from 'react';

interface RevealProps {
  children: React.ReactNode;
  width?: "fit-content" | "100%";
  delay?: number;
  variant?: 'fade-up' | 'slide-left' | 'slide-right';
}

export const Reveal: React.FC<RevealProps> = ({ 
  children, 
  width = "100%", 
  delay = 0,
  variant = 'fade-up'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      // Update state based on intersection status to allow re-triggering
      if (entry.isIntersecting) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const delayStyle = delay ? { transitionDelay: `${delay}ms` } : {};

  // Define initial and final states based on variant
  let baseClass = "transition-all duration-1000 ease-out transform";
  let activeClass = "";
  let hiddenClass = "";

  if (variant === 'slide-left') {
    // Slides in from left (-translate-x) and starts rotated (-rotate-6deg)
    activeClass = "opacity-100 translate-x-0 rotate-0";
    hiddenClass = "opacity-0 -translate-x-12 -rotate-6";
  } else if (variant === 'slide-right') {
    // Slides in from right (translate-x) and starts rotated (rotate-6deg)
    activeClass = "opacity-100 translate-x-0 rotate-0";
    hiddenClass = "opacity-0 translate-x-12 rotate-6";
  } else {
    // Default fade up
    activeClass = "opacity-100 translate-y-0";
    hiddenClass = "opacity-0 translate-y-12";
  }

  return (
    <div 
      ref={ref} 
      style={{ width, ...delayStyle }} 
      className={`${baseClass} ${isVisible ? activeClass : hiddenClass}`}
    >
      {children}
    </div>
  );
};

export default Reveal;