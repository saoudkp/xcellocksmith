/**
 * Live Preview hook — listens for real-time data from Payload CMS admin panel.
 *
 * When the frontend is loaded inside the Payload admin iframe, this hook
 * receives draft data via postMessage and invalidates React Query caches
 * so every component re-renders with the latest CMS edits instantly.
 */
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/** Check if we're inside the Payload admin iframe */
function isInsideIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

/**
 * Maps Payload's serverURL + collection/global info to React Query cache keys.
 */
function getCacheKeysForPayloadData(data: Record<string, unknown>): string[][] {
  const keys: string[][] = [];

  // Global edits — Payload sends the global slug
  if (data._globalSlug) {
    const slug = data._globalSlug as string;
    const keyMap: Record<string, string> = {
      'site-settings': 'site-settings',
      'homepage-layout': 'homepage-layout',
      'navigation': 'navigation',
      'sections-settings': 'sections-settings',
    };
    if (keyMap[slug]) {
      keys.push(['cms', keyMap[slug]]);
    }
  }

  // Collection edits — Payload sends the collection slug
  if (data._collectionSlug) {
    const slug = data._collectionSlug as string;
    const keyMap: Record<string, string> = {
      'services': 'services',
      'service-categories': 'service-categories',
      'service-areas': 'service-areas',
      'reviews': 'reviews',
      'faqs': 'faqs',
      'gallery-items': 'gallery-items',
      'team-members': 'team-members',
      'vehicle-makes': 'vehicle-makes',
    };
    if (keyMap[slug]) {
      keys.push(['cms', keyMap[slug]]);
    }
  }

  return keys;
}

export function useLivePreview() {
  const queryClient = useQueryClient();
  const isIframe = useRef(isInsideIframe());

  useEffect(() => {
    if (!isIframe.current) return;

    const handleMessage = (event: MessageEvent) => {
      // Only accept messages that look like Payload live preview data
      if (!event.data || typeof event.data !== 'object') return;

      const { type, data } = event.data as { type?: string; data?: Record<string, unknown> };

      // Payload sends 'payload-live-preview' type messages
      if (type === 'payload-live-preview' && data) {
        const cacheKeys = getCacheKeysForPayloadData(data);

        if (cacheKeys.length > 0) {
          // Invalidate specific caches so hooks refetch
          cacheKeys.forEach((key) => {
            queryClient.invalidateQueries({ queryKey: key });
          });
        } else {
          // Fallback: invalidate all CMS queries
          queryClient.invalidateQueries({ queryKey: ['cms'] });
        }
      }

      // Also handle the simpler 'payload-update' messages
      if (type === 'payload-update') {
        queryClient.invalidateQueries({ queryKey: ['cms'] });
      }
    };

    window.addEventListener('message', handleMessage);

    // Tell the parent (Payload admin) we're ready
    try {
      window.parent.postMessage({ type: 'payload-live-preview-ready' }, '*');
    } catch {
      // Silently fail if cross-origin
    }

    return () => window.removeEventListener('message', handleMessage);
  }, [queryClient]);

  return isIframe.current;
}
