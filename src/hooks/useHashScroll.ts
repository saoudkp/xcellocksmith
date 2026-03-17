import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolls to the element matching the URL hash after navigation.
 * Works for both direct hash links and cross-page navigation (e.g. /services → /#team).
 */
export function useHashScroll() {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (!hash) return;

    const id = hash.replace('#', '');

    // Try immediately first (element may already be in DOM)
    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return true;
      }
      return false;
    };

    if (tryScroll()) return;

    // Element not yet rendered — poll briefly to wait for it
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (tryScroll() || attempts > 20) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [hash, pathname]);
}
