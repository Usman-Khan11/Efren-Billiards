import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, LogIn, LogOut, User } from 'lucide-react';
import Button from './ui/Button';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './auth/AuthModal';
import { scrollToElement, handleHashClick } from '../lib/scroll';
import { useCMSContent } from '../hooks/useCMSContent';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const { data: siteImages } = useCMSContent('site-images', { 'site-logo': 'https://iili.io/q2fcFYN.png' });


  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Tournaments', href: '#tournaments' },
    { name: 'Membership', href: '#membership-packages' },
    { name: 'Contact', href: '#contact' },
  ];

  const serviceLinks = [
    { name: 'Billiards', href: '#billiards-service' },
    { name: 'Darts', href: '#darts' },
    { name: 'Chess', href: '#chess' },
    { name: 'Sports Cafe', href: '#coffee-menu' },
    { name: 'Premium Event Place', href: '#event-place' },
    { name: 'Private Karaoke', href: '#karaoke' }
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setIsOpen(false);
    
    // Only handle smooth scroll if it's an anchor on the current page
    if (href.startsWith('#') && !href.includes('/')) {
      handleHashClick(e, href);
      
      // If element doesn't exist (e.g., on a different page), let the hash change happen
      const id = href.replace('#', '');
      if (!document.getElementById(id)) {
        window.location.hash = href;
      }
    }
  };

  return (
    <>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-dark-900/90 backdrop-blur-md py-4 shadow-lg border-b border-maroon' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center">

          {/* Logo */}
          <a href="#home" className="flex items-center gap-3 z-50 group" onClick={(e) => handleNavClick(e, '#home')}>
            <img
              src={siteImages['site-logo'] || 'https://iili.io/q2fcFYN.png'}
              alt="Efren Billiards Logo"
              className="h-10 w-auto md:h-12 object-contain"
            />
            <span className="text-xl font-bold tracking-tight uppercase text-white hidden md:block">
              Efren <span className="text-brand">Billiards</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            <a href="#home" onClick={(e) => handleNavClick(e, '#home')} className="text-sm font-semibold uppercase tracking-wide text-gray-300 hover:text-brand transition-colors">
              Home
            </a>
            <a href="#tournaments" onClick={(e) => handleNavClick(e, '#tournaments')} className="text-sm font-semibold uppercase tracking-wide text-gray-300 hover:text-brand transition-colors">
              Tournaments
            </a>

            {/* Services Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1 text-sm font-semibold uppercase tracking-wide text-gray-300 hover:text-brand transition-colors py-2 outline-none">
                Services <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
              </button>
              <div className="absolute top-full left-0 mt-0 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top scale-95 group-hover:scale-100 z-50 pt-2">
                <div className="bg-dark-800 border border-white/10 rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl">
                  {serviceLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      className="block px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white hover:bg-brand transition-colors"
                    >
                      {link.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <a href="#membership-packages" onClick={(e) => handleNavClick(e, '#membership-packages')} className="text-sm font-semibold uppercase tracking-wide text-gray-300 hover:text-brand transition-colors">
              Membership
            </a>

            <a href="#contact" onClick={(e) => handleNavClick(e, '#contact')} className="text-sm font-semibold uppercase tracking-wide text-gray-300 hover:text-brand transition-colors">
              Contact
            </a>

            {profile?.tier === 'Admin' && (
              <a href="#admin-cms" onClick={(e) => handleNavClick(e, '#admin-cms')} className="text-sm font-black uppercase tracking-widest text-brand hover:text-white transition-all bg-brand/10 px-3 py-1.5 rounded-lg border border-brand/20">
                Admin Settings
              </a>
            )}
            

          </div>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4 border-l border-white/10 pl-4">
                <a 
                  href="#profile" 
                  onClick={(e) => handleNavClick(e, '#profile')}
                  className="flex items-center gap-2 group"
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/20 group-hover:border-brand transition-colors">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User size={14} className="text-gray-400 group-hover:text-brand transition-colors" />
                    )}
                  </div>
                  <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">
                    {profile?.full_name || 'Player'}
                  </span>
                </a>
                <button 
                  onClick={signOut}
                  className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                  title="Sign Out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsAuthModalOpen(true)} className="px-4 py-2 text-xs border-white/20 text-white hover:bg-white/10 flex items-center gap-2">
                  <LogIn size={14} />
                  Sign In
                </Button>
                <Button variant="primary" onClick={() => window.location.hash = '#membership-packages'} className="px-4 py-2 text-xs">
                  Become A Member
                </Button>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="lg:hidden flex items-center gap-4 z-50">
            {!user && (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="px-3 py-1.5 bg-brand text-black text-xs font-bold uppercase rounded-lg hover:bg-brand/90 transition-colors"
              >
                Sign In
              </button>
            )}
            <button
              className="text-white focus:outline-none"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

        </div>

        {/* Mobile Menu Overlay - Moved outside the inner container to avoid clipping/centering issues */}
        <div className={`fixed inset-0 bg-dark-900 z-[60] flex flex-col items-center justify-center gap-6 transition-transform duration-500 ease-in-out lg:hidden overflow-y-auto pt-24 pb-12 h-screen w-screen ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          {user && (
            <div className="flex flex-col items-center gap-2 mb-4 pb-6 border-b border-white/10 w-64">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/20">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User size={24} className="text-gray-400" />
                )}
              </div>
              <span className="text-lg font-bold text-white">
                {profile?.full_name || 'Player'}
              </span>
              <a 
                href="#profile" 
                onClick={(e) => { handleNavClick(e, '#profile'); setIsOpen(false); }}
                className="text-sm text-brand hover:text-brand/80 font-bold uppercase tracking-wider mt-2"
              >
                View Profile
              </a>
            </div>
          )}

          <a href="#home" onClick={(e) => handleNavClick(e, '#home')} className="text-xl font-bold uppercase text-white hover:text-brand">Home</a>
          <a href="#tournaments" onClick={(e) => handleNavClick(e, '#tournaments')} className="text-xl font-bold uppercase text-white hover:text-brand">Tournaments</a>

          <div className="flex flex-col items-center w-full">
            <button
              onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
              className="flex items-center gap-2 text-xl font-bold uppercase text-white hover:text-brand mb-2"
            >
              Services <ChevronDown size={20} className={`transition-transform duration-300 ${mobileServicesOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`flex flex-col items-center gap-4 overflow-hidden transition-all duration-300 w-full ${mobileServicesOpen ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
              {serviceLinks.map(link => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => { handleNavClick(e, link.href); setMobileServicesOpen(false); }}
                  className="text-lg font-bold uppercase tracking-wider text-gray-400 hover:text-brand"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          <a href="#membership-packages" onClick={(e) => handleNavClick(e, '#membership-packages')} className="text-xl font-bold uppercase text-white hover:text-brand">Membership</a>
          <a href="#contact" onClick={(e) => handleNavClick(e, '#contact')} className="text-xl font-bold uppercase text-white hover:text-brand">Contact</a>
          
          {profile?.tier === 'Admin' && (
            <a href="#admin-cms" onClick={(e) => { handleNavClick(e, '#admin-cms'); setIsOpen(false); }} className="text-xl font-black uppercase text-brand border-2 border-brand px-6 py-2 rounded-xl bg-brand/10">Admin Settings</a>
          )}
          


          <div className="flex flex-col gap-4 mt-8 w-64">
            {!user ? (
              <>
                <Button variant="primary" fullWidth onClick={() => { setIsOpen(false); window.location.hash = '#membership-packages'; }}>
                  Join Club
                </Button>
                <Button variant="outline" fullWidth onClick={() => { setIsOpen(false); setIsAuthModalOpen(true); }}>
                  Sign In
                </Button>
              </>
            ) : (
              <Button variant="outline" fullWidth onClick={() => { signOut(); setIsOpen(false); }} className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;