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
            { title: 'BeeYield - Your Partner in Pollination' },
            { name: 'description', content: 'BeeYield - Precision pollination services, sustainable beekeeping, and traceable honey from Africa and the World.' },
            { name: 'keywords', content: 'pollination, beekeeping, honey, sustainable agriculture, precision pollination, Kenya, Africa' },
            { property: 'og:title', content: 'BeeYield - Your Partner in Pollination' },
            { property: 'og:description', content: 'Precision pollination services, sustainable beekeeping, and traceable honey. Your Partner in Pollination across Africa and the World.' },
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
