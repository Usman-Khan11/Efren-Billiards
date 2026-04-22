import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';
import Hero from './Hero';
import CinematicVideo from './CinematicVideo';
import ImageCarousel from './ImageCarousel';
import Highlights from './Highlights';
import Facilities from './Facilities';
import Membership from './Membership';
import Timetable from './Timetable';
import Youth from './Youth';
import Events from './Events';
import Gallery from './Gallery';
import Contact from './Contact';
import Footer from './Footer';
import TournamentPage from './TournamentPage';
import CoffeeMenuPage from './CoffeeMenuPage';
import TermsAndConditions from './TermsAndConditions';
import MembershipLanding from './MembershipLanding';
import ServiceShowcase from './ServiceShowcase';
import BilliardsPage from './BilliardsPage';
import DartsPage from './DartsPage';
import ChessPage from './ChessPage';
import EventPlacePage from './EventPlacePage';
import KaraokePage from './KaraokePage';
import Loading from './ui/Loading';

// ─── Auth Pages ───
import ProfileDashboard from './ProfileDashboard';
import AdminCMS from './AdminCMS';
import { scrollToElement } from '../lib/scroll';

type AppRoute =
  | 'home'
  | 'tournaments'
  | 'coffee-menu'
  | 'terms'
  | 'membership-packages'
  | 'billiards-service'
  | 'darts'
  | 'chess'
  | 'event-place'
  | 'karaoke'
  // ─── New auth routes ───
  | 'profile'
  | 'admin-cms';

export const AppRoutes: React.FC = () => {
    const { loading } = useAuth();
    const [route, setRoute] = useState<AppRoute>('home');

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;

            // ─── Auth routes ───
            if (hash.startsWith('#profile')) {
                setRoute('profile');
                window.scrollTo(0, 0);
            } else if (hash.startsWith('#admin-cms')) {
                setRoute('admin-cms');
                window.scrollTo(0, 0);
            }
            // ─── Existing routes ───
            else if (hash.startsWith('#tournament')) {
                setRoute('tournaments');
                window.scrollTo(0, 0);
            } else if (hash === '#coffee-menu') {
                setRoute('coffee-menu');
                window.scrollTo(0, 0);
            } else if (hash === '#terms') {
                setRoute('terms');
                window.scrollTo(0, 0);
            } else if (hash === '#membership-packages') {
                setRoute('membership-packages');
                window.scrollTo(0, 0);
            } else if (hash === '#billiards-service') {
                setRoute('billiards-service');
                window.scrollTo(0, 0);
            } else if (hash === '#darts') {
                setRoute('darts');
                window.scrollTo(0, 0);
            } else if (hash === '#chess') {
                setRoute('chess');
                window.scrollTo(0, 0);
            } else if (hash === '#event-place') {
                setRoute('event-place');
                window.scrollTo(0, 0);
            } else if (hash === '#karaoke') {
                setRoute('karaoke');
                window.scrollTo(0, 0);
            } else {
                setRoute('home');
                // If we have a hash that isn't a route, it's likely a section ID
                if (hash && hash !== '#home' && hash !== '#') {
                    const id = hash.replace('#', '');
                    // We wait for the route change to render the home components
                    setTimeout(() => {
                        scrollToElement(id);
                    }, 400);
                } else if (hash === '#home' || !hash) {
                    window.scrollTo(0, 0);
                }
            }
        };

        handleHashChange();
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen bg-dark-900 text-white selection:bg-brand selection:text-white">
            <Navbar />
            <main>
                {route === 'home' && (
                    <>
                        <Hero />
                        <div className="relative z-20">
                            <Membership />
                        </div>
                        <ServiceShowcase />
                        <Highlights />
                        <div className="relative z-20">
                            <CinematicVideo />
                        </div>
                        <Facilities />
                        <ImageCarousel />
                        <Youth />
                        <Events />
                        <Timetable />
                        <Gallery />
                        <Contact />
                    </>
                )}
                {route === 'tournaments' && <TournamentPage />}
                {route === 'coffee-menu' && <CoffeeMenuPage />}
                {route === 'terms' && <TermsAndConditions />}
                {route === 'membership-packages' && <MembershipLanding />}
                {route === 'billiards-service' && <BilliardsPage />}
                {route === 'darts' && <DartsPage />}
                {route === 'chess' && <ChessPage />}
                {route === 'event-place' && <EventPlacePage />}
                {route === 'karaoke' && <KaraokePage />}

                {/* ─── Auth Routes ─── */}
                {route === 'profile' && <ProfileDashboard />}
                {route === 'admin-cms' && <AdminCMS />}
            </main>
            <Footer />
        </div>
    );
};
