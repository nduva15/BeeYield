import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import Logo from "@/assets/Logo.png";

const Footer = () => {
  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 lg:py-12">
        <div className="grid gap-8 sm:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
              Sustainable honey from ethical beekeeping practices. Pure, natural, traceable.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/About" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/impact" className="text-muted-foreground hover:text-primary transition-colors">
                  Our Impact
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-muted-foreground hover:text-primary transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/HoneyLanding" className="text-muted-foreground hover:text-primary transition-colors">
                  Honey
                </Link>
              </li>
              <li>
                <Link to="/blogs" className="text-muted-foreground hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="text-center sm:text-left">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/traceability" className="text-muted-foreground hover:text-primary transition-colors">
                  Traceability
                </Link>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Shipping
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="text-center sm:text-left">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Connect</h3>
            <div className="flex space-x-4 justify-center sm:justify-start">
              <a href="#" title="Facebook" className="text-muted-foreground hover:text-primary transition-colors p-2 -m-2">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" title="Instagram" className="text-muted-foreground hover:text-primary transition-colors p-2 -m-2">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" title="Twitter" className="text-muted-foreground hover:text-primary transition-colors p-2 -m-2">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" title="LinkedIn" className="text-muted-foreground hover:text-primary transition-colors p-2 -m-2">
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