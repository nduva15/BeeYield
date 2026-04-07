// Route Prefetching Logic & Registry
// This registry allows us to trigger the lazy dynamic imports on-demand (e.g. on link hover)

export const routeMap: Record<string, () => Promise<any>> = {
    '/honey': () => import('@/pages/HoneyLanding'),
    '/shop': () => import('@/pages/Shop'),
    '/contact': () => import('@/pages/Contact'),
    '/traceability': () => import('@/pages/Traceability'),
    '/checkout': () => import('@/pages/Checkout'),
    '/learn': () => import('@/pages/BeeLearn'),
    '/blogs': () => import('@/pages/Blogs'),
    '/team': () => import('@/pages/Team'),
    '/careers': () => import('@/pages/Careers'),
    '/impact': () => import('@/pages/Impact'),
    '/esg': () => import('@/pages/ESG'),
    '/commitment': () => import('@/pages/Commitment'),
    '/ourstory': () => import('@/pages/OurStory'),

    '/precision-pollination': () => import('@/pages/PrecisionPollination'),
    '/pollination-solutions': () => import('@/pages/PollinationSolutions'),
    '/in-land-pollination': () => import('@/pages/InLandPollinationPlatform'),
    '/crops-we-pollinate': () => import('@/pages/CropsWePollinate'),
    '/pollination-request': () => import('@/pages/PollinationRequest'),
    '/diseases': () => import('@/pages/Diseases'),
    '/media': () => import('@/pages/Media'),
};

export function initPrefetch() {
    if (typeof window === 'undefined') return;

    // Listen for custom prefetch events from QuickLink component
    window.addEventListener('prefetch-route', (e: any) => {
        const path = e.detail?.path;
        if (path && routeMap[path]) {
            routeMap[path]().catch(() => { }); // Fire and forget
        }
    });

    // Strategy: Early pre-warmup for critical pages after initial load
    window.addEventListener('load', () => {
        setTimeout(() => {
            // Pre-warm the most likely first clicks
            ['/', '/shop', '/contact'].forEach(path => {
                if (routeMap[path]) routeMap[path]().catch(() => { });
            });
        }, 2000);
    });
}
