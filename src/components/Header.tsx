import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Menu, X, ChevronDown, ShoppingBag, User, Shield, LogIn } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Logo from "@/assets/Logo.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const menuLinks = [
    { to: "/global-hive-network", label: "Global Hive Network" },
    { to: "/ourstory", label: "Our Story" },
    { to: "/media", label: "Media" },
    { to: "/notes", label: "Notes" },
    { to: "/blogs", label: "Blog" },
    { to: "/contact", label: "Contact Us" },
    { to: "/esg", label: "ESG" },
    { to: "/commitment", label: "Commitment" },
    { to: "/about", label: "About Us" },
    { to: "/careers", label: "Careers" },
    { to: "/team", label: "Team" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        {/* Left side - Logo (all devices) */}
        <Link to="/" className="flex items-center space-x-2 flex-shrink-0" aria-label="BeeYield home">
          <img
            src={Logo}
            alt="BeeYield logo"
            className="h-8 w-8 lg:h-9 lg:w-9 object-contain"
          />
          <span className="text-lg lg:text-xl font-bold text-foreground">BeeYield</span>
        </Link>

        {/* Center - Navigation Links (Desktop only) */}
        <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
          <Link
            to="/crops-we-pollinate"
            className={`text-sm font-medium transition-colors hover:text-primary ${isActive("/crops-we-pollinate") ? "text-primary" : "text-foreground"
              }`}
          >
            Professional Pollination
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary">
              Pollination Solutions
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-72 flex flex-col p-4 bg-primary border-none rounded-2xl shadow-xl z-[100]">
              <DropdownMenuItem asChild className="focus:bg-primary/80 focus:text-primary-foreground">
                <Link to="/precision-pollination" className="w-full cursor-pointer px-4 py-3 text-base font-medium text-primary-foreground hover:bg-primary/80 rounded-lg">
                  In-Hive Precision Pollination
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="focus:bg-primary/80 focus:text-primary-foreground">
                <Link to="/in-land-pollination" className="w-full cursor-pointer px-4 py-3 text-base font-medium text-primary-foreground hover:bg-primary/80 rounded-lg">
                  In-Land Pollination Insights Platform
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="focus:bg-primary/80 focus:text-primary-foreground">
                <Link to="/diseases" className="w-full cursor-pointer px-4 py-3 text-base font-medium text-primary-foreground hover:bg-primary/80 rounded-lg">
                  Diseases
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            to="/pollination-solutions"
            className={`text-sm font-medium transition-colors hover:text-primary ${isActive("/pollination-solutions") ? "text-primary" : "text-foreground"
              }`}
          >
            Beekeeping Network
          </Link>
          <Link
            to="/shop"
            className={`text-sm font-medium transition-colors hover:text-primary ${isActive("/shop") ? "text-primary" : "text-foreground"
              }`}
          >
            Shop
          </Link>
        </div>

        {/* Right side - Traceability Button & Menu (all devices) */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Link
            to="/beeyield-dashboard"
            className="p-2 hover:bg-muted rounded-full transition-all active:scale-90 group mr-1"
            aria-label={user?.user_metadata?.beeyield_active ? "BeeYield IoT Dashboard" : "Sign In / Sign Up to Pollination Dashboard"}
          >
            {user?.user_metadata?.beeyield_active ? (
              <User className="h-5 w-5 sm:h-6 sm:w-6 text-foreground group-hover:text-primary transition-colors" />
            ) : (
              <LogIn className="h-5 w-5 sm:h-6 sm:w-6 text-foreground group-hover:text-primary transition-colors" />
            )}
          </Link>

          <Button
            variant="default"
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-3 sm:px-6 text-xs sm:text-sm h-8 sm:h-9"
            asChild
          >
            <Link to="/traceability">
              Traceability
            </Link>
          </Button>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            className="p-2 hover:bg-muted rounded-md transition-colors"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
            ) : (
              <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
            )}
          </button>
        </div>
      </nav>

      {/* Expanded Menu (All devices) */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="fixed right-2 sm:right-4 top-14 sm:top-16 z-50 w-[calc(100%-1rem)] sm:w-80 max-h-[calc(100vh-4rem)] overflow-y-auto rounded-2xl bg-primary p-4 sm:p-6 shadow-xl animate-in fade-in slide-in-from-top-2">
            {/* Main Navigation Section */}
            <div className="flex flex-col space-y-1 pb-4 border-b border-primary-foreground/20">
              <span className="text-xs uppercase tracking-wider text-primary-foreground/60 px-3 py-1 font-medium">Main Navigation</span>
              <Link
                to="/crops-we-pollinate"
                onClick={() => setIsMenuOpen(false)}
                className={`text-sm sm:text-base font-semibold hover:bg-primary-foreground/10 rounded-lg px-3 py-2.5 sm:py-3 transition-colors ${isActive("/crops-we-pollinate") ? "text-yellow-300 bg-primary-foreground/10" : "text-primary-foreground"
                  }`}
              >
                Professional Pollination
              </Link>

              {/* Pollination Solutions Sub-menu */}
              <div className="flex flex-col">
                <span className="text-sm sm:text-base font-semibold text-primary-foreground px-3 py-2.5 sm:py-3 flex items-center gap-1">
                  Pollination Solutions
                  <ChevronDown className="h-4 w-4" />
                </span>
                <div className="pl-4 flex flex-col space-y-1">
                  <Link
                    to="/precision-pollination"
                    onClick={() => setIsMenuOpen(false)}
                    className={`text-sm font-medium hover:bg-primary-foreground/10 rounded-lg px-3 py-2 transition-colors ${isActive("/precision-pollination") ? "text-yellow-300 bg-primary-foreground/10" : "text-primary-foreground/90"
                      }`}
                  >
                    In-Hive Precision Pollination
                  </Link>
                  <Link
                    to="/in-land-pollination"
                    onClick={() => setIsMenuOpen(false)}
                    className={`text-sm font-medium hover:bg-primary-foreground/10 rounded-lg px-3 py-2 transition-colors ${isActive("/in-land-pollination") ? "text-yellow-300 bg-primary-foreground/10" : "text-primary-foreground/90"
                      }`}
                  >
                    In-Land Pollination Insights
                  </Link>
                  <Link
                    to="/diseases"
                    onClick={() => setIsMenuOpen(false)}
                    className={`text-sm font-medium hover:bg-primary-foreground/10 rounded-lg px-3 py-2 transition-colors ${isActive("/diseases") ? "text-yellow-300 bg-primary-foreground/10" : "text-primary-foreground/90"
                      }`}
                  >
                    Diseases
                  </Link>
                </div>
              </div>

              <Link
                to="/pollination-solutions"
                onClick={() => setIsMenuOpen(false)}
                className={`text-sm sm:text-base font-semibold hover:bg-primary-foreground/10 rounded-lg px-3 py-2.5 sm:py-3 transition-colors ${isActive("/pollination-solutions") ? "text-yellow-300 bg-primary-foreground/10" : "text-primary-foreground"
                  }`}
              >
                Beekeeping Network
              </Link>
              <Link
                to="/shop"
                onClick={() => setIsMenuOpen(false)}
                className={`text-sm sm:text-base font-semibold hover:bg-primary-foreground/10 rounded-lg px-3 py-2.5 sm:py-3 transition-colors ${isActive("/shop") ? "text-yellow-300 bg-primary-foreground/10" : "text-primary-foreground"
                  }`}
              >
                Shop
              </Link>
            </div>

            {/* Secondary Links Section */}
            <div className="flex flex-col space-y-1 pt-4">
              <span className="text-xs uppercase tracking-wider text-primary-foreground/60 px-3 py-1 font-medium mt-2">More</span>
              <Link
                to="/beeyield-dashboard"
                onClick={() => setIsMenuOpen(false)}
                className={`text-sm sm:text-base font-black hover:bg-white/20 rounded-lg px-3 py-2.5 sm:py-3 transition-colors bg-white/10 text-yellow-300 border border-yellow-300/30 flex items-center justify-between mb-2 ${isActive("/beeyield-dashboard") ? "ring-2 ring-yellow-300" : ""}`}
              >
                {user?.user_metadata?.beeyield_active ? "BeeYield Dashboard" : "Login"}
                {user?.user_metadata?.beeyield_active ? <User className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
              </Link>
              {user?.user_metadata?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-sm sm:text-base font-black hover:bg-white/20 rounded-lg px-3 py-2.5 sm:py-3 transition-colors bg-white/10 text-yellow-300 border border-yellow-300/30 flex items-center justify-between mb-2 ${isActive("/admin") ? "ring-2 ring-yellow-300" : ""}`}
                >
                  Admin Dashboard
                  <Shield className="h-4 w-4" />
                </Link>
              )}
              {menuLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-sm sm:text-base font-semibold hover:bg-primary-foreground/10 rounded-lg px-3 py-2.5 sm:py-3 transition-colors ${isActive(link.to) ? "text-yellow-300 bg-primary-foreground/10" : "text-primary-foreground"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
