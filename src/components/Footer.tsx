import { Link as RouterLink } from "react-router-dom";
import { QuickLink as Link } from "./QuickLink";
import { MessageSquare } from "lucide-react";
import Logo from "@/assets/Logo.png";
import { Newsletter } from "@/components/Newsletter";

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);
const TwitterIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);
const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);

const Footer = () => {
  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-12 lg:py-14">
        <div className="grid gap-10 sm:gap-12 lg:gap-14 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
            <div className="flex flex-wrap justify-center sm:justify-start gap-5 pt-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" title="Facebook" className="text-muted-foreground hover:text-primary transition-colors p-2">
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" title="Instagram" className="text-muted-foreground hover:text-primary transition-colors p-2">
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" title="Twitter" className="text-muted-foreground hover:text-primary transition-colors p-2">
                <TwitterIcon className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/company/beeyield/" title="LinkedIn" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors p-2">
                <LinkedinIcon className="h-5 w-5" />
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

        <div className="mt-10 border-t border-border/40 pt-8 flex flex-col sm:flex-row justify-between items-center gap-6 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} BeeYield. All rights reserved.</p>
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
