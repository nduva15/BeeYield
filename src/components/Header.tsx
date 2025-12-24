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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left side - Navigation Links */}
        <div className="hidden items-center space-x-8 md:flex">
          <Link
            to="/Crops-We-Pollinate"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/Crops-We-Pollinate") ? "text-primary" : "text-foreground"
            }`}
          >
            Crops We Pollinate
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary">
              Pollination Solutions
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72 flex flex-col p-4 bg-primary border-none rounded-2xl shadow-xl">
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
            to="BeekeepingSolutions"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/about") ? "text-primary" : "text-foreground"
            }`}
          >
            Beekeeping Solutions
          </Link>
        </div>

        {/* Center - Logo (hidden on mobile, shown on desktop) */}
        <Link to="/" className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent" />
          <span className="text-xl font-bold text-foreground">BeeYield</span>
        </Link>

        {/* Mobile Logo */}
        <Link to="/" className="flex items-center space-x-2 md:hidden">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent" />
          <span className="text-xl font-bold text-foreground">BeeYield</span>
        </Link>

        {/* Right side - Traceability Button & Menu */}
        <div className="hidden items-center space-x-4 md:flex">
          <Button 
            variant="default" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6"
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
            <Menu className="h-6 w-6 text-foreground" />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <Button 
            variant="default" 
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            asChild
          >
            <Link to="/traceability">
              Traceability
            </Link>
          </Button>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>
      </nav>

      {/* Expanded Menu (Desktop & Mobile) */}
      {isMenuOpen && (
        <div className="absolute right-4 top-16 z-50 w-64 rounded-2xl bg-primary p-6 shadow-xl">
          <div className="flex flex-col space-y-4">
            <Link
              to="/GlobalHiveNetwork"
              onClick={() => setIsMenuOpen(false)}
              className="text-base font-semibold text-primary-foreground hover:opacity-80 transition-opacity"
            >
              Global Hive Network
            </Link>
            <Link
              to="/crops-we-pollinate"
              onClick={() => setIsMenuOpen(false)}
              className="text-base font-semibold text-primary-foreground hover:opacity-80 transition-opacity"
            >
              Crops We Pollinate
            </Link>
            <Link
              to="/About"
              onClick={() => setIsMenuOpen(false)}
              className="text-base font-semibold text-primary-foreground hover:opacity-80 transition-opacity"
            >
              About Us
            </Link>
            <Link
              to="/impact"
              onClick={() => setIsMenuOpen(false)}
              className="text-base font-semibold text-primary-foreground hover:opacity-80 transition-opacity"
            >
              Our Impact
            </Link>
            <Link
              to="/PollinationServices"
              onClick={() => setIsMenuOpen(false)}
              className="text-base font-semibold text-primary-foreground hover:opacity-80 transition-opacity"
            >
              Pollination Services
            </Link>
            <Link
              to="/PollinationRequest"
              onClick={() => setIsMenuOpen(false)}
              className="text-base font-semibold text-primary-foreground hover:opacity-80 transition-opacity"
            >
              Pollination Request
            </Link>
            <Link
              to="/careers"
              onClick={() => setIsMenuOpen(false)}
              className="text-base font-semibold text-primary-foreground hover:opacity-80 transition-opacity"
            >
              Careers
            </Link>
            <Link
              to="/shop"
              onClick={() => setIsMenuOpen(false)}
              className="text-base font-semibold text-primary-foreground hover:opacity-80 transition-opacity"
            >
              Our Products
            </Link>
            <Link
              to="/blogs"
              onClick={() => setIsMenuOpen(false)}
              className="text-base font-semibold text-primary-foreground hover:opacity-80 transition-opacity"
            >
              Blog
            </Link>
            <Link
              to="/contact"
              onClick={() => setIsMenuOpen(false)}
              className="text-base font-semibold text-primary-foreground hover:opacity-80 transition-opacity"
            >
              Contact Us
            </Link>
            <Link
              to="/OurStory"
              onClick={() => setIsMenuOpen(false)}
              className="text-base font-semibold text-primary-foreground hover:opacity-80 transition-opacity"
            >
              Our Story
            </Link>
            <Link
              to="/esg"
              onClick={() => setIsMenuOpen(false)}
              className="text-base font-semibold text-primary-foreground hover:opacity-80 transition-opacity"
            >
              ESG
            </Link>
            <Link
              to="/commitment"
              onClick={() => setIsMenuOpen(false)}
              className="text-base font-semibold text-primary-foreground hover:opacity-80 transition-opacity"
            >
              Commitment
            </Link>
            <Link
              to="/Team"
              onClick={() => setIsMenuOpen(false)}
              className="text-base font-semibold text-primary-foreground hover:opacity-80 transition-opacity"
            >
              Team
            </Link>
            <Link
              to="/traceability"
              onClick={() => setIsMenuOpen(false)}
              className="text-base font-semibold text-primary-foreground hover:opacity-80 transition-opacity"
            >
              Trace Your Honey
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;