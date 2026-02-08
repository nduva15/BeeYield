import React from 'react'
import ReactDOM from 'react-dom/client'
import { Buffer } from 'buffer';

// Polyfill Buffer for browser environment
if (typeof window !== 'undefined') {
    globalThis.Buffer = Buffer;
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
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import '@/index.css'

// Page imports
import PollinationServices from '@/pages/PollinationServices'
import About from '@/pages/About'
import Contact from '@/pages/Contact'
import Honey from '@/pages/HoneyLanding'
import Shop from '@/pages/Shop'
import Checkout from '@/pages/Checkout'
import Learn from '@/pages/BeeLearn'
import Blogs from '@/pages/Blogs'
import BlogPost from '@/pages/BlogPost'
import Team from '@/pages/Team'
import Careers from '@/pages/Careers'
import Impact from '@/pages/Impact'
import ESG from '@/pages/ESG'
import Commitment from '@/pages/Commitment'
import OurStory from '@/pages/OurStory'
import GlobalHiveNetwork from '@/pages/GlobalHiveNetwork'
import Traceability from '@/pages/Traceability'
import PrecisionPollination from '@/pages/PrecisionPollination'
import PollinationSolutions from '@/pages/PollinationSolutions'
import InLandPollination from '@/pages/InLandPollinationPlatform'
import CropsWePollinate from '@/pages/CropsWePollinate'
import PollinationRequest from '@/pages/PollinationRequest'
import Diseases from '@/pages/Diseases'
import Media from '@/pages/Media'
import BeeYieldDashboard from '@/pages/BeeYieldDashboard'
import AdminDashboard from '@/pages/AdminDashboard'
import AdminLogin from '@/pages/AdminAuth'
import BuyerDashboard from '@/pages/BuyerDashboard'
import AccountSettings from '@/pages/AccountSettings'
import UpdatePassword from '@/pages/UpdatePassword'
import Authentication from '@/pages/Authentication'
import ProfessionalAuth from '@/pages/ProfessionalAuth'
import AuthCallback from '@/pages/AuthCallback'
import NotFound from '@/pages/NotFound'
import Receipt from '@/pages/Receipt'
import MeasurementData from '@/pages/MeasurementData'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BeeYieldQueryProvider>
            <TooltipProvider>
                <AuthProvider>
                    <SettingsProvider>
                        <LanguageProvider>
                            <CartProvider>
                                <WishlistProvider>
                                    <Toaster />
                                    <Sonner />
                                    <BrowserRouter>
                                        <ScrollToTop />
                                        <Layout>
                                            <Routes>
                                                <Route path="/" element={<PollinationServices />} />
                                                <Route path="/about" element={<About />} />
                                                <Route path="/contact" element={<Contact />} />
                                                <Route path="/honey" element={<Honey />} />
                                                <Route path="/shop" element={<Shop />} />
                                                <Route path="/checkout" element={<Checkout />} />
                                                <Route path="/learn" element={<Learn />} />
                                                <Route path="/blogs" element={<Blogs />} />
                                                {/* Note: React Router v6 uses :slug for parameters */}
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
                                                <Route path="/beeyield-dashboard" element={<ProtectedRoute requireBeeYield={true}><BeeYieldDashboard /></ProtectedRoute>} />
                                                <Route path="/measurements" element={<ProtectedRoute requireBeeYield={true}><MeasurementData /></ProtectedRoute>} />
                                                <Route path="/ceba" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                                                <Route path="/ceba/login" element={<AdminLogin />} />
                                                {/* Mapped my-account to BuyerDashboard based on routes/my-account.tsx */}
                                                <Route path="/my-account" element={<ProtectedRoute><BuyerDashboard /></ProtectedRoute>} />
                                                <Route path="/buyer-dashboard" element={<ProtectedRoute><BuyerDashboard /></ProtectedRoute>} />
                                                <Route path="/account-settings" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
                                                <Route path="/update-password" element={<ProtectedRoute><UpdatePassword /></ProtectedRoute>} />
                                                <Route path="/login" element={<Authentication />} />
                                                <Route path="/signup" element={<Authentication />} />
                                                <Route path="/beeyield-login" element={<ProfessionalAuth />} />
                                                <Route path="/auth/callback" element={<AuthCallback />} />
                                                <Route path="/receipt/:orderId" element={<ProtectedRoute><Receipt /></ProtectedRoute>} />
                                                <Route path="*" element={<NotFound />} />
                                            </Routes>
                                        </Layout>
                                    </BrowserRouter>
                                </WishlistProvider>
                            </CartProvider>
                        </LanguageProvider>
                    </SettingsProvider>
                </AuthProvider>
            </TooltipProvider>
        </BeeYieldQueryProvider>
    </React.StrictMode>
)
