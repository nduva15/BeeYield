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
            to="/impact"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/impact") ? "text-primary" : "text-foreground"
            }`}
          >
            Crops We Pollinate
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary">
              Pollination Solutions
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem asChild>
                <Link to="/pollination-services" className="w-full cursor-pointer">
                  Our Services
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/pollination-request" className="w-full cursor-pointer">
                  Request Service
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            to="/about"
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
          <span className="text-xl font-bold text-foreground">PureHoney</span>
        </Link>

        {/* Mobile Logo */}
        <Link to="/" className="flex items-center space-x-2 md:hidden">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent" />
          <span className="text-xl font-bold text-foreground">PureHoney</span>
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
        <div className="border-t bg-background">
          <div className="container mx-auto grid gap-4 px-4 py-6 md:grid-cols-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Explore</h3>
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Home
              </Link>
              <Link
                to="/about"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                About Us
              </Link>
              <Link
                to="/impact"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Our Impact
              </Link>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Services</h3>
              <Link
                to="/pollination-services"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Pollination Services
              </Link>
              <Link
                to="/pollination-request"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Request Service
              </Link>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Shop</h3>
              <Link
                to="/shop"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Our Products
              </Link>
              <Link
                to="/blogs"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Blog
              </Link>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Connect</h3>
              <Link
                to="/contact"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Contact Us
              </Link>
              <Link
                to="/traceability"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Trace Your Honey
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;