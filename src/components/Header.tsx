import { useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, ShoppingBag, User, Shield, LogIn, UserPlus } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import { useQueryClient } from "@tanstack/react-query";
import { getProducts } from "@/services/shopService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Separator } from "./ui/separator";
import Logo from "@/assets/Logo.png";
import { QuickLink as Link } from "./QuickLink";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { toggleCart, getTotalItems } = useCart();
  const queryClient = useQueryClient();

  const isActive = (path: string) => location.pathname === path;

  // Prefetch data helper
  const prefetchShop = () => {
    queryClient.prefetchQuery({
      queryKey: ['products'],
      queryFn: () => getProducts(),
      staleTime: 1000 * 60 * 5,
    });
  };

  const menuLinks = [
    { to: "/global-hive-network", label: "Global Hive Network" },
    { to: "/ourstory", label: "Our Story" },
    { to: "/media", label: "Media" },
    { to: "/blogs", label: "Blog" },
    { to: "/contact", label: "Contact Us" },
    { to: "/esg", label: "ESG" },
    { to: "/commitment", label: "Commitment" },
    { to: "/about", label: "About Us" },
    { to: "/careers", label: "Careers" },
    { to: "/team", label: "Team" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-beeyield-gold/20 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl shadow-sm">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        {/* Left side - Logo (all devices) */}
        <Link to="/" className="flex items-center space-x-2.5 flex-shrink-0 transition-all hover:scale-105 active:scale-95 group" aria-label="BeeYield home">
          <div className="relative">
            <div className="absolute inset-0 bg-beeyield-gold/20 blur-md rounded-full group-hover:bg-beeyield-gold/30 transition-colors" />
            <img
              src={Logo}
              alt="BeeYield logo"
              className="h-9 w-9 lg:h-10 lg:w-10 object-contain relative z-10"
            />
          </div>
          <span className="text-lg lg:text-xl font-black text-beeyield-green tracking-tight">BeeYield</span>
        </Link>

        {/* Center - Navigation Links (Desktop only) */}
        <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
          <Link
            to="/crops-we-pollinate"
            className={`text-sm font-bold transition-all px-3 py-2 rounded-lg hover:bg-beeyield-gold/10 ${isActive("/crops-we-pollinate") ? "text-beeyield-gold bg-beeyield-gold/10" : "text-beeyield-green/80 hover:text-beeyield-green"
              }`}
          >
            Professional Pollination
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-bold transition-all px-3 py-2 rounded-lg hover:bg-beeyield-gold/10 text-beeyield-green/80 hover:text-beeyield-green">
              Pollination Solutions
              <ChevronDown className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-72 flex flex-col p-3 bg-gradient-to-br from-beeyield-gold to-beeyield-green border-none rounded-2xl shadow-2xl z-[100]">
              <DropdownMenuItem asChild className="focus:bg-white/20 focus:text-white">
                <Link to="/in-land-pollination" className="w-full cursor-pointer px-4 py-3 text-sm font-bold text-white hover:bg-white/20 rounded-xl transition-all">
                  In Land Pollination
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="focus:bg-white/20 focus:text-white">
                <Link to="/precision-pollination" className="w-full cursor-pointer px-4 py-3 text-sm font-bold text-white hover:bg-white/20 rounded-xl transition-all">
                  In Hive Pollination
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="focus:bg-white/20 focus:text-white">
                <Link to="/diseases" className="w-full cursor-pointer px-4 py-3 text-sm font-bold text-white hover:bg-white/20 rounded-xl transition-all">
                  Diseases
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            to="/pollination-solutions"
            className={`text-sm font-bold transition-all px-3 py-2 rounded-lg hover:bg-beeyield-gold/10 ${isActive("/pollination-solutions") ? "text-beeyield-gold bg-beeyield-gold/10" : "text-beeyield-green/80 hover:text-beeyield-green"
              }`}
          >
            Beekeeping Network
          </Link>
          <Link
            to="/shop"
            onPrefetch={prefetchShop}
            className={`text-sm font-bold transition-all px-3 py-2 rounded-lg hover:bg-beeyield-gold/10 ${isActive("/shop") ? "text-beeyield-gold bg-beeyield-gold/10" : "text-beeyield-green/80 hover:text-beeyield-green"
              }`}
          >
            Shop
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-bold transition-all px-3 py-2 rounded-lg hover:bg-beeyield-gold/10 text-beeyield-green/80 hover:text-beeyield-green">
              Pages
              <ChevronDown className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-72 flex flex-col p-3 bg-gradient-to-br from-beeyield-gold to-beeyield-green border-none rounded-2xl shadow-2xl z-[100]">
              {menuLinks.map((link) => (
                <DropdownMenuItem key={link.to} asChild className="focus:bg-white/20 focus:text-white">
                  <Link to={link.to} className="w-full cursor-pointer px-4 py-3 text-sm font-bold text-white hover:bg-white/20 rounded-xl transition-all">
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right side - Traceability Button & Menu (all devices) */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Link
            to="/beeyield-dashboard"
            className="p-2 hover:bg-beeyield-gold/10 rounded-xl transition-all active:scale-95 group flex items-center justify-center"
            title="BeeYield Dashboard"
          >
            <Shield className="h-5 w-5 sm:h-5 sm:w-5 text-beeyield-green group-hover:text-beeyield-gold transition-colors" />
          </Link>

          <button
            onClick={toggleCart}
            className="p-2 hover:bg-beeyield-gold/10 rounded-xl transition-all active:scale-95 group relative"
            aria-label="View shopping cart"
          >
            <ShoppingBag className="h-5 w-5 sm:h-5 sm:w-5 text-beeyield-green group-hover:text-beeyield-gold transition-colors" />
            {getTotalItems() > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-br from-beeyield-orange to-beeyield-gold text-white text-[10px] font-black h-5 w-5 flex items-center justify-center rounded-full shadow-lg animate-pulse">
                {getTotalItems()}
              </span>
            )}
          </button>

          <Button
            variant="default"
            size="sm"
            className="bg-gradient-to-r from-beeyield-green to-beeyield-green-dark hover:from-beeyield-green-dark hover:to-beeyield-green text-white font-black px-4 sm:px-6 text-xs sm:text-sm h-9 sm:h-10 transition-all active:scale-95 rounded-xl shadow-md hover:shadow-lg uppercase tracking-wider"
            asChild
          >
            <Link to="/traceability">
              Verify
            </Link>
          </Button>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            className="p-2 hover:bg-beeyield-gold/10 rounded-xl transition-all active:scale-95"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5 sm:h-6 sm:w-6 text-beeyield-green" />
            ) : (
              <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-beeyield-green" />
            )}
          </button>
        </div>
      </nav>

      {/* Expanded Menu (All devices) */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="fixed right-2 sm:right-4 top-14 sm:top-16 z-50 w-[calc(100%-1rem)] sm:w-80 max-h-[calc(100vh-4rem)] overflow-y-auto rounded-3xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-beeyield-gold/20 p-4 sm:p-6 shadow-2xl animate-in fade-in slide-in-from-top-2">
            {/* Main Navigation Section */}
            <div className="flex flex-col space-y-1 pb-4 border-b border-beeyield-gold/20">
              <span className="text-xs uppercase tracking-wider text-beeyield-green/60 px-3 py-1 font-black">Main Navigation</span>
              <Link
                to="/crops-we-pollinate"
                onClick={() => setIsMenuOpen(false)}
                className={`text-sm sm:text-base font-bold hover:bg-beeyield-gold/10 rounded-xl px-3 py-2.5 sm:py-3 transition-all ${isActive("/crops-we-pollinate") ? "text-beeyield-gold bg-beeyield-gold/10" : "text-beeyield-green"
                  }`}
              >
                Professional Pollination
              </Link>

              {/* Pollination Solutions Sub-menu */}
              <div className="flex flex-col">
                <span className="text-sm sm:text-base font-bold text-beeyield-green px-3 py-2.5 sm:py-3 flex items-center gap-1">
                  Pollination Solutions
                  <ChevronDown className="h-4 w-4" />
                </span>
                <div className="pl-4 flex flex-col space-y-1">
                  <Link
                    to="/in-land-pollination"
                    onClick={() => setIsMenuOpen(false)}
                    className={`text-sm font-bold hover:bg-beeyield-gold/10 rounded-xl px-3 py-2 transition-all ${isActive("/in-land-pollination") ? "text-beeyield-gold bg-beeyield-gold/10" : "text-beeyield-green/80"
                      }`}
                  >
                    In Land Pollination
                  </Link>
                  <Link
                    to="/precision-pollination"
                    onClick={() => setIsMenuOpen(false)}
                    className={`text-sm font-bold hover:bg-beeyield-gold/10 rounded-xl px-3 py-2 transition-all ${isActive("/precision-pollination") ? "text-beeyield-gold bg-beeyield-gold/10" : "text-beeyield-green/80"
                      }`}
                  >
                    In Hive Pollination
                  </Link>
                  <Link
                    to="/diseases"
                    onClick={() => setIsMenuOpen(false)}
                    className={`text-sm font-bold hover:bg-beeyield-gold/10 rounded-xl px-3 py-2 transition-all ${isActive("/diseases") ? "text-beeyield-gold bg-beeyield-gold/10" : "text-beeyield-green/80"
                      }`}
                  >
                    Diseases
                  </Link>
                </div>
              </div>

              <Link
                to="/pollination-solutions"
                onClick={() => setIsMenuOpen(false)}
                className={`text-sm sm:text-base font-bold hover:bg-beeyield-gold/10 rounded-xl px-3 py-2.5 sm:py-3 transition-all ${isActive("/pollination-solutions") ? "text-beeyield-gold bg-beeyield-gold/10" : "text-beeyield-green"
                  }`}
              >
                Beekeeping Network
              </Link>
              <Link
                to="/shop"
                onPrefetch={prefetchShop}
                onClick={() => setIsMenuOpen(false)}
                className={`text-sm sm:text-base font-bold hover:bg-beeyield-gold/10 rounded-xl px-3 py-2.5 sm:py-3 transition-all ${isActive("/shop") ? "text-beeyield-gold bg-beeyield-gold/10" : "text-beeyield-green"
                  }`}
              >
                Shop
              </Link>
            </div>

            {/* Secondary Links Section */}
            <div className="flex flex-col space-y-1 pt-4">
              <span className="text-xs uppercase tracking-wider text-beeyield-green/60 px-3 py-1 font-black mt-2">My Dashboard</span>
              <Link
                to="/beeyield-dashboard"
                onClick={() => setIsMenuOpen(false)}
                className={`text-sm sm:text-base font-black hover:bg-beeyield-gold/20 rounded-xl px-3 py-2.5 sm:py-3 transition-all bg-gradient-to-r from-beeyield-gold/10 to-beeyield-green/10 text-beeyield-green border-2 border-beeyield-gold/30 flex items-center justify-between mb-2 shadow-sm ${isActive("/beeyield-dashboard") ? "ring-2 ring-beeyield-gold" : ""
                  }`}
              >
                Dashboard
                <Shield className="h-4 w-4" />
              </Link>

              <span className="text-xs uppercase tracking-wider text-beeyield-green/60 px-3 py-1 font-black mt-2">More</span>

              {menuLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-sm sm:text-base font-bold hover:bg-beeyield-gold/10 rounded-xl px-3 py-2.5 sm:py-3 transition-all ${isActive(link.to) ? "text-beeyield-gold bg-beeyield-gold/10" : "text-beeyield-green"
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
