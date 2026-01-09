import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
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
import GlobalHiveNetwork from "./pages/GlobalHiveNetwork";
import Media from "./pages/Media";
import Notes from "./pages/Notes";
import BeeLearn from "./pages/BeeLearn";
import Checkout from "./pages/Checkout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CartProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/impact" element={<Impact />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/traceability" element={<Traceability />} />
              <Route path="/PollinationServices" element={<PollinationServices />} />
              <Route path="/pollination-request" element={<PollinationRequest />} />
              <Route path="/Commitment" element={<CommitmentPage />} />
              <Route path="/ESG" element={<ESG />} />
              <Route path="/esg" element={<ESG />} />
              <Route path="/ourstory" element={<OurStory />} />
              <Route path="/crops-we-pollinate" element={<CropsWePollinate />} />
              <Route path="/team" element={<Team />} />
              <Route path="/in-land-pollination" element={<InLandPollinationPlatform />} />
              <Route path="/precision-pollination" element={<PrecisionPollination />} />
              <Route path="/pollination-solutions" element={<PollinationSolutions />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/GlobalHiveNetwork" element={<GlobalHiveNetwork />} />
              <Route path="/Media" element={<Media />} />
              <Route path="/global-hive-network" element={<GlobalHiveNetwork />} />
              <Route path="/media" element={<Media />} />
              <Route path="/commitment" element={<CommitmentPage />} />
              <Route path="/pollination-services" element={<PollinationServices />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/honey" element={<Home />} />
              <Route path="/learn" element={<BeeLearn />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </CartProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
