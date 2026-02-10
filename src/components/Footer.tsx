import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Linkedin, MessageSquare } from "lucide-react";
import Logo from "@/assets/Logo.png";
import { Newsletter } from "@/components/Newsletter";

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
              Your partner in pollination.
            </p>
            <div className="flex space-x-4 justify-center sm:justify-start pt-4">
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

          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h3 className="mb-4 text-sm font-semibold text-foreground uppercase tracking-wider">Solutions</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/honey" className="text-muted-foreground hover:text-primary transition-colors">
                  Honey
                </Link>
              </li>
              <li>
                <Link to="/learn" className="text-muted-foreground hover:text-primary transition-colors">
                  Learn
                </Link>
              </li>
              <li>
                <Link to="/traceability" className="text-muted-foreground hover:text-primary transition-colors">
                  Traceability
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-muted-foreground hover:text-primary transition-colors">
                  Shop
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Location */}
          <div className="text-center sm:text-left">
            <h3 className="mb-4 text-sm font-semibold text-foreground uppercase tracking-wider">Contact & Location</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground">
                <MessageSquare className="h-4 w-4 shrink-0 text-primary" />
                <span>support@beeyield.com</span>
              </li>
            </ul>
          </div>

          {/* Stay Connected / Newsletter */}
          <div className="text-center sm:text-left">
            <h3 className="mb-4 text-sm font-semibold text-foreground uppercase tracking-wider">Stay Updated</h3>
            <Newsletter />
          </div>
        </div>

        <div className="mt-8 border-t border-border/40 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} BeeYield. Dynamic Optimization & Honey Trail. Secure Intelligence Interface.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
