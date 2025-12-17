import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/HoneyLanding";
import About from "./pages/About";
import Impact from "./pages/Impact";
import Shop from "./pages/Shop";
import Blogs from "./pages/Blogs";
import Contact from "./pages/Contact";
import Traceability from "./pages/Traceability";
import NotFound from "./pages/NotFound";
import PollinationServices from "./pages/Home";
import PollinationRequest from "./pages/PollinationRequest";
import CommitmentPage from "./pages/Commitment";
import OurStory from "./pages/OurStory";
import ESG from "./pages/ESG";
import Team from "./Team";
import CropsWePollinate from "./pages/CropsWePollinate";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
            <Route path="/PollinationRequest" element={<PollinationRequest />} />
            <Route path="/Commitment" element={<CommitmentPage />} />
            <Route path="/ESG" element={<ESG />} />
            <Route path="/esg" element={<ESG />} />
            <Route path="/ourstory" element={<OurStory />} />
            <Route path="/crops-we-pollinate" element={<CropsWePollinate />} />
            <Route path="/team" element={<Team />} />



            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
