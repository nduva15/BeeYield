/**
 * BeeYield Analytics Utility
 * Interface for Google Analytics 4 (GA4) via Google Tag Manager (GTM).
 */

declare global {
  interface Window {
    dataLayer: any[];
  }
}

/**
 * Push an event to the GTM dataLayer
 */
export const trackEvent = (eventName: string, params: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...params,
      timestamp: new Date().toISOString(),
    });
    
    if (import.meta.env.DEV) {
      console.log(`[Analytics] Event tracked: ${eventName}`, params);
    }
  } else if (import.meta.env.DEV) {
    console.warn(`[Analytics] dataLayer not found. Event "${eventName}" not tracked.`);
  }
};

/**
 * Track page views manually if needed (GTM usually handles history changes, but explicit is safer)
 */
export const trackPageView = (path: string, title?: string) => {
  trackEvent('page_view', {
    page_path: path,
    page_title: title || document.title,
  });
};

/**
 * Track specific high-value conversions
 */
export const trackConversion = (type: 'purchase' | 'signup' | 'lead', value?: number, currency: string = 'KSH') => {
  trackEvent('conversion', {
    conversion_type: type,
    value,
    currency,
  });
};

export const analytics = {
  trackEvent,
  trackPageView,
  trackConversion,
};
