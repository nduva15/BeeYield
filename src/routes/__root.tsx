import { Outlet, createRootRoute, HeadContent, Scripts } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '../components/ui/toaster'
import { Toaster as Sonner } from '../components/ui/sonner'
import { TooltipProvider } from '../components/ui/tooltip'
import { CartProvider } from '../contexts/CartContext'
import { AuthProvider } from '../contexts/AuthContext'
import Layout from '../components/Layout'
import CartDrawer from '../components/CartDrawer'
import appCss from '../index.css?url'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
        },
    },
})

export const Route = createRootRoute({
    head: () => ({
        meta: [
            { charSet: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
            { title: 'BeeYield | Precision Pollination & Honey Traceability in Makueni & Kibwezi' },
            { name: 'description', content: 'BeeYield provides precision pollination and sustainable beekeeping services in Kibwezi, Makueni County. Maximize your farm yield with IoT-enabled hive monitoring and traceable honey production.' },
            { name: 'keywords', content: 'precision pollination Makueni, beekeeping Kibwezi, honey traceability Kenya, IoT hive monitoring, pollination services Africa, BeeYield contact, bee farming Makueni' },
            { property: 'og:title', content: 'BeeYield | Precision Pollination & Honey Traceability in Makueni' },
            { property: 'og:description', content: 'Maximize crop yields with precision pollination. Sustainable beekeeping and traceable honey from Kibwezi to the world.' },
            { property: 'og:type', content: 'website' },
            { property: 'og:image', content: 'https://beeyield.com/logo.png' },
            { name: 'twitter:card', content: 'summary_large_image' },
            { name: 'twitter:site', content: '@beeyield' },
            { name: 'twitter:image', content: 'https://beeyield.com/logo.png' },
        ],
        links: [
            { rel: 'stylesheet', href: appCss },
            { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
            { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
            { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Outfit:wght@100..900&display=swap' },
        ],
    }),
    component: RootComponent,
})

function RootComponent() {
    return (
        <html lang="en">
            <head>
                <HeadContent />
                {/* Google Tag Manager */}
                <script dangerouslySetInnerHTML={{
                    __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-KF284247');`
                }} />
                {/* Structured Data / Schema.org */}
                <script type="application/ld+json" dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@graph": [
                            {
                                "@type": "Organization",
                                "@id": "https://beeyield.com/#organization",
                                "name": "BeeYield",
                                "url": "https://beeyield.com",
                                "logo": "https://beeyield.com/logo.png",
                                "sameAs": [
                                    "https://facebook.com/beeyield",
                                    "https://instagram.com/beeyield",
                                    "https://linkedin.com/company/beeyield"
                                ]
                            },
                            {
                                "@type": "LocalBusiness",
                                "@id": "https://beeyield.com/#localbusiness",
                                "name": "BeeYield Kibwezi",
                                "image": "https://beeyield.com/logo.png",
                                "address": {
                                    "@type": "PostalAddress",
                                    "streetAddress": "Off Mombasa Road",
                                    "addressLocality": "Kibwezi",
                                    "addressRegion": "Makueni County",
                                    "addressCountry": "Kenya"
                                },
                                "geo": {
                                    "@type": "GeoCoordinates",
                                    "latitude": -2.41,
                                    "longitude": 37.97
                                },
                                "url": "https://beeyield.com",
                                "telephone": "+254700000000",
                                "priceRange": "$$",
                                "servesCuisine": "Honey",
                                "description": "Precision pollination services and sustainable raw honey traceability in Kibwezi and Makueni."
                            }
                        ]
                    })
                }} />
            </head>
            <body>
                {/* GTM noscript */}
                <noscript>
                    <iframe
                        src="https://www.googletagmanager.com/ns.html?id=GTM-KF284247"
                        height="0"
                        width="0"
                        style={{ display: 'none', visibility: 'hidden' }}
                    />
                </noscript>

                <div id="root">
                    <QueryClientProvider client={queryClient}>
                        <TooltipProvider>
                            <AuthProvider>
                                <CartProvider>
                                    <Toaster />
                                    <Sonner />
                                    <CartDrawer />
                                    <Layout>
                                        <Outlet />
                                    </Layout>
                                </CartProvider>
                            </AuthProvider>
                        </TooltipProvider>
                    </QueryClientProvider>
                </div>

                <Scripts />
            </body>
        </html>
    )
}
