import React from 'react';

interface SectionProps {
  id: string;
  className?: string;
  children: React.ReactNode;
  containerClass?: string;
}

const Section: React.FC<SectionProps> = ({ id, className = "", children, containerClass = "" }) => {
  return (
    <section id={id} className={`py-20 md:py-28 ${className}`}>
      <div className={`max-w-7xl mx-auto px-6 lg:px-8 ${containerClass}`}>
        {children}
      </div>
    </section>
  );
};

export default Section;