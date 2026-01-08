import { useState } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Linkedin, ChevronDown } from "lucide-react";
import Logo from "@/assets/Logo.png";

const Footer = () => {
  const [pollinationOpen, setPollinationOpen] = useState(false);

  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 lg:py-12">
        <div className="grid gap-8 sm:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {/* Logo & Tagline */}
          <div className="space-y-4 text-center sm:text-left">
            <div className="flex items-center space-x-2 justify-center sm:justify-start">
              <img
                src={Logo}
                alt="BeeYield logo"
                className="h-8 w-8 object-contain"
              />
              <span className="text-xl font-bold text-foreground">BeeYield</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto sm:mx-0">
              Your partner in pollination.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h3 className="mb-4 text-sm font-semibold text-foreground uppercase tracking-wider">Solutions</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/HoneyLanding" className="text-muted-foreground hover:text-primary transition-colors">
                  Honey
                </Link>
              </li>
              <li>
                <Link to="/BeeLearn" className="text-muted-foreground hover:text-primary transition-colors">
                  Learn
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-muted-foreground hover:text-primary transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/traceability" className="text-muted-foreground hover:text-primary transition-colors">
                  Traceability
                </Link>
              </li>
            </ul>
          </div>

          {/* Pollination with Dropdown */}
          <div className="text-center sm:text-left">
            <button
              onClick={() => setPollinationOpen(!pollinationOpen)}
              className="mb-4 text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5 mx-auto sm:mx-0 hover:text-primary transition-colors"
            >
              Pollination Solutions
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${pollinationOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${pollinationOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/crops-we-pollinate" className="text-muted-foreground hover:text-primary transition-colors">
                    Professional Pollination
                  </Link>
                </li>
                <li>
                  <Link to="/PollinationSolutions" className="text-muted-foreground hover:text-primary transition-colors">
                    Pollination Solutions
                  </Link>
                </li>
                <li>
                  <Link to="/PrecisionPollination" className="text-muted-foreground hover:text-primary transition-colors">
                    Precision Pollination
                  </Link>
                </li>
                <li>
                  <Link to="/InLandPollinationPlatform" className="text-muted-foreground hover:text-primary transition-colors">
                    InLand Pollination
                  </Link>
                </li>
                <li>
                  <Link to="/GlobalHiveNetwork" className="text-muted-foreground hover:text-primary transition-colors">
                    Global Hive Network
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Connect */}
          <div className="text-center sm:text-left">
            <h3 className="mb-4 text-sm font-semibold text-foreground uppercase tracking-wider">Connect</h3>
            <div className="flex space-x-4 justify-center sm:justify-start">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" title="Facebook" className="text-muted-foreground hover:text-primary transition-colors p-2 -m-2">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" title="Instagram" className="text-muted-foreground hover:text-primary transition-colors p-2 -m-2">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" title="Twitter" className="text-muted-foreground hover:text-primary transition-colors p-2 -m-2">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/company/beeyield/" title="LinkedIn" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors p-2 -m-2">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border/40 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} BeeYield. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
