import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const menuLinks = [
    { to: "/GlobalHiveNetwork", label: "Global Hive Network" },
    { to: "/About", label: "About Us" },
    { to: "/impact", label: "Our Impact" },
    { to: "/PollinationServices", label: "Pollination Services" },
    { to: "/PollinationRequest", label: "Pollination Request" },
    { to: "/careers", label: "Careers" },
    { to: "/Media", label: "Media" },
    { to: "/blogs", label: "Blog" },
    { to: "/contact", label: "Contact Us" },
    { to: "/OurStory", label: "Our Story" },
    { to: "/esg", label: "ESG" },
    { to: "/commitment", label: "Commitment" },
    { to: "/Team", label: "Team" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
        {/* Left side - Logo (all devices) */}
        <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-primary-foreground text-[10px] sm:text-xs font-bold">BY</span>
          </div>
          <span className="text-lg sm:text-xl font-bold text-foreground">BeeYield</span>
        </Link>

        {/* Center - Navigation Links (Desktop only) */}
        <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
          <Link
            to="/Crops-We-Pollinate"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/Crops-We-Pollinate") ? "text-primary" : "text-foreground"
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
                <Link to="/PrecisionPollination" className="w-full cursor-pointer px-4 py-3 text-base font-medium text-primary-foreground hover:bg-primary/80 rounded-lg">
                  In-Hive Precision Pollination
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="focus:bg-primary/80 focus:text-primary-foreground">
                <Link to="/InLandPollinationPlatform" className="w-full cursor-pointer px-4 py-3 text-base font-medium text-primary-foreground hover:bg-primary/80 rounded-lg">
                  In-Land Pollination Insights Platform
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            to="/pollinationsolutions"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/pollinationsolutions") ? "text-primary" : "text-foreground"
            }`}
          >
            Beekeeping Network         
        </Link>
        <Link
            to="/Shop"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/Shop") ? "text-primary" : "text-foreground"
            }`}
          >
            Shop         
        </Link>
        </div>

        {/* Right side - Traceability Button & Menu (all devices) */}
        <div className="flex items-center space-x-2 sm:space-x-4">
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
          <div className="fixed right-2 sm:right-4 top-14 sm:top-16 z-50 w-[calc(100%-1rem)] sm:w-72 max-h-[calc(100vh-4rem)] overflow-y-auto rounded-2xl bg-primary p-4 sm:p-6 shadow-xl animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-col space-y-1 sm:space-y-2">
              {menuLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-sm sm:text-base font-semibold text-primary-foreground hover:bg-primary-foreground/10 rounded-lg px-3 py-2.5 sm:py-3 transition-colors"
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
