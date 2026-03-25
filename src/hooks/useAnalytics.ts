import { useCallback } from 'react';
import { analytics } from '@/lib/analytics';

export const useAnalytics = () => {
    /**
     * Track a custom event
     */
    const trackEvent = useCallback((eventName: string, params: Record<string, any> = {}) => {
        analytics.trackEvent(eventName, params);
    }, []);

    /**
     * Track a page view
     */
    const trackPageView = useCallback((path: string, title?: string) => {
        analytics.trackPageView(path, title);
    }, []);

    /**
     * Track a conversion
     */
    const trackConversion = useCallback((type: 'purchase' | 'signup' | 'lead', value?: number, currency: string = 'KSH') => {
        analytics.trackConversion(type, value, currency);
    }, []);

    return {
        trackEvent,
        trackPageView,
        trackConversion,
    };
};
