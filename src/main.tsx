import React from 'react'
import ReactDOM from 'react-dom/client'
import ScrollToTop from './components/ScrollToTop'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
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
import NotFound from '@/pages/NotFound'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
        },
    },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
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
                                                <Route path="/beeyield-dashboard" element={<BeeYieldDashboard />} />
                                                <Route path="/ceba" element={<AdminDashboard />} />
                                                <Route path="/ceba/login" element={<AdminLogin />} />
                                                {/* Mapped my-account to BuyerDashboard based on routes/my-account.tsx */}
                                                <Route path="/my-account" element={<BuyerDashboard />} />
                                                <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
                                                <Route path="/account-settings" element={<AccountSettings />} />
                                                <Route path="/update-password" element={<UpdatePassword />} />
                                                <Route path="/login" element={<Authentication />} />
                                                <Route path="/signup" element={<Authentication />} />
                                                <Route path="/beeyield-login" element={<ProfessionalAuth />} />
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
        </QueryClientProvider>
    </React.StrictMode>
)
