import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { Buffer } from 'buffer';
import { Loader2 } from 'lucide-react'
import { initPrefetch } from './prefetch'

// Polyfill Buffer for browser environment
if (typeof window !== 'undefined') {
    globalThis.Buffer = Buffer;
    initPrefetch();
}

import ScrollToTop from './components/ScrollToTop'
import { BeeYieldQueryProvider } from './components/QueryClientProvider'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { CartProvider } from '@/contexts/CartContext'
import { WishlistProvider } from '@/contexts/WishlistContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import '@/index.css'

// All pages are lazy-loaded to keep the initial bundle small
const PollinationServices = lazy(() => import('@/pages/PollinationServices'))
const Honey = lazy(() => import('@/pages/HoneyLanding'))
const About = lazy(() => import('@/pages/About'))
const Shop = lazy(() => import('@/pages/Shop'))
const Contact = lazy(() => import('@/pages/Contact'))
const Traceability = lazy(() => import('@/pages/Traceability'))

// Secondary/Private pages remain lazy-loaded
const Checkout = lazy(() => import('@/pages/Checkout'))
const Learn = lazy(() => import('@/pages/BeeLearn'))
const Blogs = lazy(() => import('@/pages/Blogs'))
const BlogPost = lazy(() => import('@/pages/BlogPost'))
const Team = lazy(() => import('@/pages/Team'))
const Careers = lazy(() => import('@/pages/Careers'))
const Impact = lazy(() => import('@/pages/Impact'))
const ESG = lazy(() => import('@/pages/ESG'))
const Commitment = lazy(() => import('@/pages/Commitment'))
const OurStory = lazy(() => import('@/pages/OurStory'))
const GlobalHiveNetwork = lazy(() => import('@/pages/GlobalHiveNetwork'))
const PrecisionPollination = lazy(() => import('@/pages/PrecisionPollination'))
const PollinationSolutions = lazy(() => import('@/pages/PollinationSolutions'))
const InLandPollination = lazy(() => import('@/pages/InLandPollinationPlatform'))
const CropsWePollinate = lazy(() => import('@/pages/CropsWePollinate'))
const PollinationRequest = lazy(() => import('@/pages/PollinationRequest'))
const Diseases = lazy(() => import('@/pages/Diseases'))
const Media = lazy(() => import('@/pages/Media'))
const BeeYieldDashboard = lazy(() => import('@/pages/BeeYieldDashboard'))
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'))
const ContentEditor = lazy(() => import('@/components/beeyield/ContentEditor'))
const AdminLogin = lazy(() => import('@/pages/AdminAuth'))
const ShopDashboard = lazy(() => import('@/pages/ShopDashboard'))
const AccountSettings = lazy(() => import('@/pages/AccountSettings'))
const UpdatePassword = lazy(() => import('@/pages/UpdatePassword'))
const ShopAuth = lazy(() => import('@/pages/ShopAuth'))
const ProfessionalAuth = lazy(() => import('@/pages/ProfessionalAuth'))
const AuthCallback = lazy(() => import('@/pages/AuthCallback'))
const NotFound = lazy(() => import('@/pages/NotFound'))
const Receipt = lazy(() => import('@/pages/Receipt'))
const MeasurementData = lazy(() => import('@/pages/MeasurementData'))
const Privacy = lazy(() => import('@/pages/Privacy'))
const Terms = lazy(() => import('@/pages/Terms'))

// Pollination Professional Pages
const PollinationCalcs = lazy(() => import('@/pages/pollination/PollinationCalcs'))
const FlightMapping = lazy(() => import('@/pages/pollination/FlightMapping'))
const PollinationReports = lazy(() => import('@/pages/pollination/PollinationReports'))

const PageLoader = () => (
    <div className="flex flex-col items-center justify-center h-[50vh] w-full gap-4">
        <img src="/logo.png" alt="Loading..." className="h-12 w-auto animate-pulse" />
    </div>
)

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BeeYieldQueryProvider>
            <TooltipProvider>
                <BrowserRouter>
                    <AuthProvider>
                        <SettingsProvider>
                            <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
                                <LanguageProvider>
                                    <CartProvider>
                                        <WishlistProvider>
                                            <Toaster />
                                            <Sonner />
                                            <ScrollToTop />
                                            <Layout>
                                                <Suspense fallback={<PageLoader />}>
                                                    <Routes>
                                                        <Route path="/" element={<PollinationServices />} />
                                                        <Route path="/about" element={<About />} />
                                                        <Route path="/contact" element={<Contact />} />
                                                        <Route path="/honey" element={<Honey />} />
                                                        <Route path="/shop" element={<Shop />} />
                                                        <Route path="/checkout" element={<Checkout />} />
                                                        <Route path="/learn" element={<Learn />} />
                                                        <Route path="/blogs" element={<Blogs />} />
                                                        <Route path="/blogs/:slug" element={<BlogPost />} />
                                                        <Route path="/team" element={<Team />} />
                                                        <Route path="/careers" element={<Careers />} />
                                                        <Route path="/impact" element={<Impact />} />
                                                        <Route path="/esg" element={<ESG />} />
                                                        <Route path="/commitment" element={<Commitment />} />
                                                        <Route path="/ourstory" element={<OurStory />} />
                                                        <Route path="/global-hive-network" element={<GlobalHiveNetwork />} />
                                                        <Route path="/traceability" element={<Traceability />} />
                                                        <Route path="/precision-pollination" element={<PrecisionPollination />} />
                                                        <Route path="/pollination-solutions" element={<PollinationSolutions />} />
                                                        <Route path="/in-land-pollination" element={<InLandPollination />} />
                                                        <Route path="/crops-we-pollinate" element={<CropsWePollinate />} />
                                                        <Route path="/pollination-request" element={<PollinationRequest />} />
                                                        <Route path="/diseases" element={<Diseases />} />
                                                        <Route path="/media" element={<Media />} />

                                                        {/* Precision Pollination Professional Sub-routes */}
                                                        <Route path="/precision-pollination/calcs" element={<PollinationCalcs />} />
                                                        <Route path="/precision-pollination/map" element={<FlightMapping />} />
                                                        <Route path="/precision-pollination/reports" element={<PollinationReports />} />
                                                        <Route path="/beeyield-dashboard" element={<ProtectedRoute requireBeeYield={true}><BeeYieldDashboard /></ProtectedRoute>} />
                                                        <Route path="/measurements" element={<ProtectedRoute requireBeeYield={true}><MeasurementData /></ProtectedRoute>} />
                                                        <Route path="/ceba" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                                                        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                                                        <Route path="/ceba/content/editor/:id" element={<ProtectedRoute><ContentEditor /></ProtectedRoute>} />
                                                        <Route path="/admin/content/editor/:id" element={<ProtectedRoute><ContentEditor /></ProtectedRoute>} />
                                                        <Route path="/ceba/login" element={<AdminLogin />} />
                                                        <Route path="/admin/login" element={<AdminLogin />} />
                                                        <Route path="/my-account" element={<ProtectedRoute><ShopDashboard /></ProtectedRoute>} />
                                                        <Route path="/buyer-dashboard" element={<ProtectedRoute><ShopDashboard /></ProtectedRoute>} />
                                                        <Route path="/shop-dashboard" element={<ProtectedRoute><ShopDashboard /></ProtectedRoute>} />
                                                        <Route path="/account-settings" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
                                                        <Route path="/update-password" element={<ProtectedRoute><UpdatePassword /></ProtectedRoute>} />
                                                        <Route path="/login" element={<ShopAuth />} />
                                                        <Route path="/signup" element={<ShopAuth />} />
                                                        <Route path="/beeyield-login" element={<ProfessionalAuth />} />
                                                        <Route path="/auth/callback" element={<AuthCallback />} />
                                                        <Route path="/receipt/:orderId" element={<ProtectedRoute><Receipt /></ProtectedRoute>} />
                                                        <Route path="/privacy" element={<Privacy />} />
                                                        <Route path="/terms" element={<Terms />} />
                                                        <Route path="*" element={<NotFound />} />
                                                    </Routes>
                                                </Suspense>
                                            </Layout>
                                        </WishlistProvider>
                                    </CartProvider>
                                </LanguageProvider>
                            </ThemeProvider>
                        </SettingsProvider>
                    </AuthProvider>
                </BrowserRouter>
            </TooltipProvider>
        </BeeYieldQueryProvider>
    </React.StrictMode>
)
