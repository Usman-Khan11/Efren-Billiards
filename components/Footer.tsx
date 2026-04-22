import React from 'react';
import { Instagram, Facebook, Linkedin, MapPin } from 'lucide-react';
import { handleHashClick } from '../lib/scroll';
import { useCMSContent } from '../hooks/useCMSContent';

const Footer: React.FC = () => {
  const { data: socialLinks } = useCMSContent('social-links', {
    facebook: 'https://www.facebook.com/share/1DZ7ux6Qmi/?mibextid=wwXIfr',
    instagram: 'https://www.instagram.com/efrenbilliards?igsh=YnQwdDI1MjJ0aDZm',
    tiktok: 'https://www.tiktok.com/@efren.billiards.m?_r=1&_t=ZS-93hdvwpNUdp',
    whatsapp: 'https://wa.me/97451622111',
    linkedin: '',
    googleBusinessProfile: ''
  });

  const { data: contactInfo } = useCMSContent('contact-info', {
    address: '5th Floor Capstone Bldg., Al Mansoura, Doha, Qatar',
    mapsUrl: 'https://maps.app.goo.gl/NAggUvmWoE7Vh7cA6?g_st=ic'
  });

  return (
    <footer className="bg-dark-900 border-t border-dark-800 pt-16 pb-8 text-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12 mb-16">

          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <span className="font-bold uppercase text-white text-lg">Efren <span className="text-brand">Billiards</span></span>
            </div>
            <p className="text-gray-500 mb-6">
              Qatar's premier destination for billiards, specialty coffee, and social events.
            </p>
            <div className="flex gap-4">
              {socialLinks.facebook && <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand transition-colors"><Facebook size={20} /></a>}
              {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand transition-colors"><Instagram size={20} /></a>}
              {socialLinks.tiktok && <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <svg viewBox="0 0 448 512" width="20" height="20">
                    <path fill="#ff0050" d="M380.9 97.1C339 97.1 305 63.1 305 21.2v-1.1l-102.1-1.1V352c0 40-32.3 72.3-72.3 72.3s-72.3-32.3-72.3-72.3c0-40 32.3-72.3 72.3-72.3c15.6 0 30 4.9 41.7 13.1l1.1-102.1c-13.8-2.6-28-4.1-42.8-4.1C63.1 190.9 0 254 0 331.4 0 408.8 63.1 471.9 140.5 471.9c67.3 0 123.5-47.5 136.1-110.8c.1 0 .2 0 .4 0c41.9 0 75.8 34 75.8 75.8v1.1l102.1 1.1V331.4c13.8 2.6 28 4.1 42.8 4.1c77.4 0 140.5-63.1 140.5-140.5s-63.1-140.5-140.5-140.5c-6.8 0-13.4.5-20 1.5v94c6.2-.8 12.5-1.5 19.3-1.5z" opacity=".2"/>
                    <path fill="#00f2ea" d="M380.9 97.1C339 97.1 305 63.1 305 21.2v-1.1l-102.1-1.1V352c0 40-32.3 72.3-72.3 72.3s-72.3-32.3-72.3-72.3c0-40 32.3-72.3 72.3-72.3c15.6 0 30 4.9 41.7 13.1l1.1-102.1c-13.8-2.6-28-4.1-42.8-4.1C63.1 190.9 0 254 0 331.4 0 408.8 63.1 471.9 140.5 471.9c67.3 0 123.5-47.5 136.1-110.8c.1 0 .2 0 .4 0c41.9 0 75.8 34 75.8 75.8v1.1l102.1 1.1V331.4c13.8 2.6 28 4.1 42.8 4.1c77.4 0 140.5-63.1 140.5-140.5s-63.1-140.5-140.5-140.5c-6.8 0-13.4.5-20 1.5v94c6.2-.8 12.5-1.5 19.3-1.5z" transform="translate(4 -4)" opacity=".8"/>
                    <path fill="#fff" d="M380.9 97.1C339 97.1 305 63.1 305 21.2v-1.1l-102.1-1.1V352c0 40-32.3 72.3-72.3 72.3s-72.3-32.3-72.3-72.3c0-40 32.3-72.3 72.3-72.3c15.6 0 30 4.9 41.7 13.1l1.1-102.1c-13.8-2.6-28-4.1-42.8-4.1C63.1 190.9 0 254 0 331.4 0 408.8 63.1 471.9 140.5 471.9c67.3 0 123.5-47.5 136.1-110.8c.1 0 .2 0 .4 0c41.9 0 75.8 34 75.8 75.8v1.1l102.1 1.1V331.4c13.8 2.6 28 4.1 42.8 4.1c77.4 0 140.5-63.1 140.5-140.5s-63.1-140.5-140.5-140.5c-6.8 0-13.4.5-20 1.5v94c6.2-.8 12.5-1.5 19.3-1.5z" transform="translate(2 -2)"/>
                </svg>
              </a>}
              {socialLinks.linkedin && <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn" className="text-gray-400 hover:text-brand transition-colors"><Linkedin size={20} /></a>}
              {socialLinks.googleBusinessProfile && <a href={socialLinks.googleBusinessProfile} target="_blank" rel="noopener noreferrer" title="Google Business Profile" className="text-gray-400 hover:text-brand transition-colors"><MapPin size={20} /></a>}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase mb-6">Explore</h4>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#home" onClick={(e) => handleHashClick(e, '#home')} className="hover:text-brand transition-colors">Home</a></li>
              <li><a href="#gallery" onClick={(e) => handleHashClick(e, '#gallery')} className="hover:text-brand transition-colors">Gallery</a></li>
              <li><a href="#contact" onClick={(e) => handleHashClick(e, '#contact')} className="hover:text-brand transition-colors">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase mb-6">Our Services</h4>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#billiards-service" onClick={(e) => handleHashClick(e, '#billiards-service')} className="hover:text-brand transition-colors">Billiards</a></li>
              <li><a href="#coffee-menu" onClick={(e) => handleHashClick(e, '#coffee-menu')} className="hover:text-brand transition-colors">Sports Cafe</a></li>
              <li><a href="#event-place" onClick={(e) => handleHashClick(e, '#event-place')} className="hover:text-brand transition-colors">Events Place</a></li>
              <li><a href="#tournaments" onClick={(e) => handleHashClick(e, '#tournaments')} className="hover:text-brand transition-colors">Tournaments</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase mb-6">Membership</h4>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#membership-packages" onClick={(e) => handleHashClick(e, '#membership-packages')} className="hover:text-brand transition-colors">View Plans</a></li>
              <li><a href="#terms" onClick={(e) => handleHashClick(e, '#terms')} className="hover:text-brand transition-colors">House Rules</a></li>
              <li><a href="#tournaments" onClick={(e) => handleHashClick(e, '#tournaments')} className="hover:text-brand transition-colors">League Signups</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase mb-6">Find Us</h4>
            {contactInfo.address && (
              <>
                {contactInfo.address.split(',').map((line: string, i: number) => (
                  <p key={i} className="text-gray-500 mb-1">{line.trim()}</p>
                ))}
              </>
            )}
            <div className="mt-4">
              <a href={contactInfo.mapsUrl || "https://maps.app.goo.gl/NAggUvmWoE7Vh7cA6?g_st=ic"} target="_blank" className="text-brand font-bold uppercase underline hover:text-white transition-colors">Get Directions</a>
            </div>
          </div>
        </div>

        <div className="border-t border-dark-800 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-600 gap-4">
          <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
            <p>© 2026 Efren Billiards and Events Place. All rights reserved.</p>
            <p className="text-[10px] text-gray-700 select-none">
              Developed by <a href="https://onesmartbiz.pro" target="_blank" rel="noopener noreferrer" className="hover:text-brand transition-colors">One SmartBiz Qatar</a>
            </p>
          </div>
          <div className="flex gap-6">
            <a href="#terms" onClick={(e) => handleHashClick(e, '#terms')} className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#terms" onClick={(e) => handleHashClick(e, '#terms')} className="hover:text-white transition-colors">Terms & Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;