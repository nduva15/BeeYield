import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import { CartProvider } from "./contexts/CartContext";
import CartDrawer from "./components/CartDrawer";
// Google Tag Manager noscript
const GTMNoScript = () => (
  <noscript>
    <iframe
      src="https://www.googletagmanager.com/ns.html?id=GTM-KF284247"
      height="0"
      width="0"
      style={{ display: "none", visibility: "hidden" }}
      title="Google Tag Manager"
    ></iframe>
  </noscript>
);
import Home from "./pages/Home";
import About from "./pages/About";
import Impact from "./pages/Impact";
import Shop from "./pages/Shop";
import Blogs from "./pages/Blogs";
import Contact from "./pages/Contact";
import Traceability from "./pages/Traceability";
import NotFound from "./pages/NotFound";
// Legacy route still points to the home component
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
import GlobalHiveNetwork from "./pages/GlobalHiveNetwork";
import Media from "./pages/Media";
import HoneyLanding from "./pages/HoneyLanding";
import Checkout from "./pages/Checkout";

import BeeLearn from "./pages/BeeLearn";



const queryClient = new QueryClient();


const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <>
            <GTMNoScript />
            <CartDrawer />
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/impact" element={<Impact />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/blogs" element={<Blogs />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/traceability" element={<Traceability />} />
                <Route path="/PollinationServices" element={<Home />} />
                <Route path="/PollinationRequest" element={<PollinationRequest />} />
                <Route path="/pollination-request" element={<PollinationRequest />} />
                <Route path="/Commitment" element={<CommitmentPage />} />
                <Route path="/ESG" element={<ESG />} />
                <Route path="/esg" element={<ESG />} />
                <Route path="/ourstory" element={<OurStory />} />
                <Route path="/crops-we-pollinate" element={<CropsWePollinate />} />
                <Route path="/team" element={<Team />} />
                <Route path="/InLandPollinationPlatform" element={<InLandPollinationPlatform />} />
                <Route path="/PrecisionPollination" element={<PrecisionPollination />} />
                <Route path="/PollinationSolutions" element={<PollinationSolutions />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/GlobalHiveNetwork" element={<GlobalHiveNetwork />} />
                <Route path="/Media" element={<Media />} />
                <Route path="/HoneyLanding" element={<HoneyLanding />} />

                {/* Learn Landing Page */}
                <Route path="/BeeLearn" element={<BeeLearn />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
