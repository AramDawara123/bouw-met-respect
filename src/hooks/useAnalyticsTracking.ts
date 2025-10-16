import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAnalyticsTracking = () => {
  const sessionIdRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // Only run once
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    // Get or create session ID
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    sessionIdRef.current = sessionId;

    // Detect device type
    const getDeviceType = () => {
      const ua = navigator.userAgent;
      if (/mobile/i.test(ua)) {
        return /android/i.test(ua) ? 'mobile-android' : 'mobile-ios';
      }
      return 'desktop';
    };

    // Track pageview
    const trackPageview = async () => {
      try {
        const { error } = await supabase
          .from('analytics_events')
          .insert({
            session_id: sessionId!,
            event_type: 'pageview',
            page_path: window.location.pathname,
            referrer: document.referrer || 'Direct',
            user_agent: navigator.userAgent,
            device_type: getDeviceType(),
          });

        if (error) {
          console.error('Error tracking pageview:', error);
        } else {
          console.log('Pageview tracked:', window.location.pathname);
        }
      } catch (error) {
        console.error('Error in analytics tracking:', error);
      }
    };

    // Track initial pageview
    trackPageview();

    // Track pageviews on route changes
    const handleRouteChange = () => {
      trackPageview();
    };

    // Listen for route changes (for client-side routing)
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return null;
};
