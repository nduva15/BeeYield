import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "./components/Layout";
import Home from "./pages/HoneyLanding";
import About from "./pages/About";
import Impact from "./pages/Impact";
import Shop from "./pages/Shop";
import Blogs from "./pages/Blogs";
import Contact from "./pages/Contact";
import Traceability from "./pages/Traceability";
import NotFound from "./pages/NotFound";
import PollinationServices from "./pages/PollinationServices";
import PollinationRequest from "./pages/PollinationRequest";
import CommitmentPage from "./pages/Commitment";
import OurStory from "./pages/OurStory";
import ESG from "./pages/ESG";
import Team from "./pages/Team";
import CropsWePollinate from "./pages/CropsWePollinate";
import InLandPollinationPlatform from "./pages/InLandPollinationPlatform";
import PollinationSolutions from "./pages/PollinationSolutions";
import PrecisionPollination from "./pages/PrecisionPollination";
import Careers from "./pages/Careers";
import Diseases from "./pages/Diseases";
import GlobalHiveNetwork from "./pages/GlobalHiveNetwork";
import Media from "./pages/Media";
import Notes from "./pages/Notes";
import BeeLearn from "./pages/BeeLearn";
import Checkout from "./pages/Checkout";
import AccountSettings from "./pages/AccountSettings";
import CartDrawer from "./components/CartDrawer";
import AdminDashboard from "./pages/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <CartDrawer />
            <Layout>
              <Routes>
                <Route path="/" element={<PollinationServices />} />
                <Route path="/honey" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/impact" element={<Impact />} />
                <Route path="/traceability" element={<Traceability />} />
                <Route path="/pollination-request" element={<PollinationRequest />} />
                <Route path="/crops-we-pollinate" element={<CropsWePollinate />} />
                <Route path="/pollination-solutions" element={<PollinationSolutions />} />
                <Route path="/precision-pollination" element={<PrecisionPollination />} />
                <Route path="/in-land-pollination" element={<InLandPollinationPlatform />} />
                <Route path="/diseases" element={<Diseases />} />
                <Route path="/about" element={<About />} />
                <Route path="/notes" element={<Notes />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/learn" element={<BeeLearn />} />
                <Route path="/global-hive-network" element={<GlobalHiveNetwork />} />
                <Route path="/blogs" element={<Blogs />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/ourstory" element={<OurStory />} />
                <Route path="/media" element={<Media />} />
                <Route path="/esg" element={<ESG />} />
                <Route path="/commitment" element={<CommitmentPage />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/team" element={<Team />} />
                <Route path="/account-settings" element={<AccountSettings />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);



export default App;
