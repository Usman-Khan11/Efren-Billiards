import React from 'react';

/**
 * Smoothly scrolls to an element with a specified offset (e.g., for fixed headers).
 * @param elementId The ID of the target element.
 * @param offset The offset from the top (default 80px for fixed header).
 */
export const scrollToElement = (elementId: string, offset: number = 80, retries: number = 10) => {
    const element = document.getElementById(elementId);
    
    if (!element) {
        if (retries > 0) {
            setTimeout(() => scrollToElement(elementId, offset, retries - 1), 200);
        } else {
            console.warn(`Element with id "${elementId}" not found after retries.`);
        }
        return;
    }

    // Execute with a small delay to ensure DOM is ready and layout is stable
    setTimeout(() => {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
        
        // Fallback for some browsers or if smooth scroll fails to reach target
        setTimeout(() => {
            const newPos = element.getBoundingClientRect().top;
            if (Math.abs(newPos - offset) > 10) {
                const finalPos = newPos + window.scrollY - offset;
                window.scrollTo({ top: finalPos, behavior: 'auto' });
            }
        }, 1000);
    }, 100);
};

/**
 * Handles clicks on hash links, ensuring smooth scroll even if the hash is already set.
 */
export const handleHashClick = (e: React.UIEvent | { preventDefault: () => void }, href: string) => {
    if (href.startsWith('#')) {
        const id = href.replace('#', '');
        const element = document.getElementById(id);
        
        if (element) {
            e.preventDefault();
            scrollToElement(id);
            // Update URL without triggering hashchange if possible, or just push state
            window.history.pushState(null, '', href);
        } else {
            // If element not found on current page, manually change hash to trigger App.tsx routing
            if (window.location.hash !== href) {
                window.location.hash = href;
            } else {
                // Force a hash change to trigger listeners
                window.location.hash = '#_';
                setTimeout(() => {
                    window.location.hash = href;
                }, 5);
            }
        }
    }
};
