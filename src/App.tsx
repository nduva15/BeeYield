import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "./components/Layout";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import CartDrawer from "./components/CartDrawer";
import { Loader2 } from "lucide-react";

// Lazy load all page components for better performance
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Impact = lazy(() => import("./pages/Impact"));
const Shop = lazy(() => import("./pages/Shop"));
const Blogs = lazy(() => import("./pages/Blogs"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Contact = lazy(() => import("./pages/Contact"));
const Traceability = lazy(() => import("./pages/Traceability"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PollinationRequest = lazy(() => import("./pages/PollinationRequest"));
const CommitmentPage = lazy(() => import("./pages/Commitment"));
const OurStory = lazy(() => import("./pages/OurStory"));
const ESG = lazy(() => import("./pages/ESG"));
const Team = lazy(() => import("./pages/Team"));
const CropsWePollinate = lazy(() => import("./pages/CropsWePollinate"));
const InLandPollinationPlatform = lazy(() => import("./pages/InLandPollinationPlatform"));
const PollinationSolutions = lazy(() => import("./pages/PollinationSolutions"));
const PrecisionPollination = lazy(() => import("./pages/PrecisionPollination"));
const Careers = lazy(() => import("./pages/Careers"));
const PollinationServices = lazy(() => import("./pages/PollinationServices"));
const GlobalHiveNetwork = lazy(() => import("./pages/GlobalHiveNetwork"));
const Media = lazy(() => import("./pages/Media"));
const HoneyLanding = lazy(() => import("./pages/HoneyLanding"));
const Checkout = lazy(() => import("./pages/Checkout"));
const BeeLearn = lazy(() => import("./pages/BeeLearn"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const AccountSettings = lazy(() => import("@/pages/AccountSettings"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="h-10 w-10 animate-spin text-primary" />
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <>
              <CartDrawer />
              <Suspense fallback={<PageLoader />}>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/impact" element={<Impact />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/blogs" element={<Blogs />} />
                    <Route path="/blog/:slug" element={<BlogPost />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/traceability" element={<Traceability />} />
                    <Route path="/PollinationServices" element={<PollinationServices />} />
                    <Route path="/pollination-services" element={<PollinationServices />} />
                    <Route path="/PollinationRequest" element={<PollinationRequest />} />
                    <Route path="/pollination-request" element={<PollinationRequest />} />
                    <Route path="/Commitment" element={<CommitmentPage />} />
                    <Route path="/commitment" element={<CommitmentPage />} />
                    <Route path="/ESG" element={<ESG />} />
                    <Route path="/esg" element={<ESG />} />
                    <Route path="/ourstory" element={<OurStory />} />
                    <Route path="/our-story" element={<OurStory />} />
                    <Route path="/crops-we-pollinate" element={<CropsWePollinate />} />
                    <Route path="/team" element={<Team />} />
                    <Route path="/Team" element={<Team />} />
                    <Route path="/InLandPollinationPlatform" element={<InLandPollinationPlatform />} />
                    <Route path="/inland-pollination-platform" element={<InLandPollinationPlatform />} />
                    <Route path="/in-land-pollination" element={<InLandPollinationPlatform />} />
                    <Route path="/PrecisionPollination" element={<PrecisionPollination />} />
                    <Route path="/precision-pollination" element={<PrecisionPollination />} />
                    <Route path="/PollinationSolutions" element={<PollinationSolutions />} />
                    <Route path="/pollination-solutions" element={<PollinationSolutions />} />
                    <Route path="/careers" element={<Careers />} />
                    <Route path="/GlobalHiveNetwork" element={<GlobalHiveNetwork />} />
                    <Route path="/global-hive-network" element={<GlobalHiveNetwork />} />
                    <Route path="/Media" element={<Media />} />
                    <Route path="/media" element={<Media />} />
                    <Route path="/HoneyLanding" element={<HoneyLanding />} />
                    <Route path="/honey-landing" element={<HoneyLanding />} />
                    <Route path="/honey" element={<HoneyLanding />} />

                    {/* Learn Landing Page */}
                    <Route path="/BeeLearn" element={<BeeLearn />} />
                    <Route path="/bee-learn" element={<BeeLearn />} />
                    <Route path="/learn" element={<BeeLearn />} />
                    <Route path="/dashboard" element={<Dashboard />} />

                    {/* Auth Routes */}
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/account/settings" element={<AccountSettings />} />

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              </Suspense>
            </>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
