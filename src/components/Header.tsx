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



  return (
    <header className="sticky top-0 z-50 w-full border-b border-beeyield-gold/20 bg-white/80 backdrop-blur-xl shadow-sm">
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
            <DropdownMenuContent align="center" className="w-64 flex flex-col p-4 bg-gradient-to-br from-beeyield-gold to-beeyield-green border-none rounded-2xl shadow-2xl z-[100] gap-1">
              <div className="px-4 py-1.5 mb-1">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Services</span>
              </div>
              <DropdownMenuItem asChild className="focus:bg-white/20 focus:text-white rounded-xl transition-all">
                <Link to="/in-land-pollination" className="w-full cursor-pointer px-4 py-3 text-sm font-bold text-white hover:bg-white/20 rounded-xl transition-all">
                  In Land Pollination
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="focus:bg-white/20 focus:text-white rounded-xl transition-all">
                <Link to="/precision-pollination" className="w-full cursor-pointer px-4 py-3 text-sm font-bold text-white hover:bg-white/20 rounded-xl transition-all">
                  In Hive Pollination
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="focus:bg-white/20 focus:text-white rounded-xl transition-all">
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


        </div>

        {/* Right side - Traceability Button & Menu (all devices) */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Link
            to="/beeyield-dashboard"
            className="p-2 hover:bg-beeyield-gold/10 rounded-xl transition-all active:scale-95 group flex items-center justify-center"
            title="Beeeyield Dashboard"
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

          {/* Desktop Pages Dropdown */}
          <div className="hidden lg:block relative z-[200]">
            <DropdownMenu>
              <DropdownMenuTrigger className="p-2 hover:bg-beeyield-gold/10 rounded-xl transition-all active:scale-95 text-beeyield-green outline-none">
                <Menu className="h-6 w-6" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 flex flex-col p-4 bg-gradient-to-br from-beeyield-gold to-beeyield-green border-none rounded-2xl shadow-2xl z-[100] gap-1 max-h-[85vh] overflow-y-auto">
                <div className="px-4 py-1.5 mb-1">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Main Navigation</span>
                </div>
                <div className="flex flex-col gap-1">
                  {[
                    { label: 'Professional Pollination', to: '/crops-we-pollinate' },
                    { label: 'In Land Pollination', to: '/in-land-pollination' },
                    { label: 'In Hive Pollination', to: '/precision-pollination' },
                    { label: 'Diseases', to: '/diseases' },
                    { label: 'Beekeeping Network', to: '/pollination-solutions' },
                    { label: 'Shop', to: '/shop' },
                  ].map((item) => (
                    <DropdownMenuItem key={item.to} asChild className="focus:bg-white/20 focus:text-white rounded-xl transition-all">
                      <Link to={item.to} className="w-full cursor-pointer px-3 py-2.5 text-[13px] font-bold text-white hover:text-white transition-all">
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </div>

                <div className="px-4 py-1.5 mt-3 mb-1 border-t border-white/10 pt-4">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Company</span>
                </div>
                <div className="flex flex-col gap-1">
                  {[
                    { label: 'Our Story', to: '/about' },
                    { label: 'Bee Learn', to: '/learn' },
                    { label: 'Blogs', to: '/blogs' },
                    { label: 'Careers', to: '/careers' },
                    { label: 'Commitment', to: '/commitment' },
                    { label: 'Contact', to: '/contact' },
                    { label: 'ESG', to: '/esg' },
                    { label: 'Global Network', to: '/global-hive-network' },
                    { label: 'Impact', to: '/impact' },
                    { label: 'Media', to: '/media' },
                    { label: 'Team', to: '/team' },
                  ].map((item) => (
                    <DropdownMenuItem key={item.to} asChild className="focus:bg-white/20 focus:text-white rounded-xl transition-all">
                      <Link to={item.to} className="w-full cursor-pointer px-3 py-2 text-[12px] font-bold text-white/80 hover:text-white transition-all">
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            className="p-2 hover:bg-beeyield-gold/10 rounded-xl transition-all active:scale-95 lg:hidden"
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="fixed right-2 sm:right-4 top-14 sm:top-16 z-50 w-[calc(100%-1rem)] sm:w-80 max-h-[calc(100vh-4rem)] overflow-y-auto rounded-3xl bg-white/95 backdrop-blur-xl border border-beeyield-gold/20 p-4 sm:p-6 shadow-2xl animate-in fade-in slide-in-from-top-2 lg:hidden">
            {/* Main Navigation Section (Pages in Header) */}
            <div className="flex flex-col space-y-1 pb-4 border-b border-beeyield-gold/20">
              <span className="text-[10px] uppercase tracking-wider text-beeyield-green/60 px-3 py-1 font-black">Main Navigation</span>
              <Link
                to="/crops-we-pollinate"
                onClick={() => setIsMenuOpen(false)}
                className={`text-sm font-bold hover:bg-beeyield-gold/10 rounded-xl px-3 py-3 transition-all ${isActive("/crops-we-pollinate") ? "text-beeyield-gold bg-beeyield-gold/10" : "text-beeyield-green"}`}
              >
                Professional Pollination
              </Link>
              
              <div className="flex flex-col space-y-1 px-2 border-l-2 border-beeyield-gold/20 ml-4 my-1">
                <Link
                  to="/in-land-pollination"
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-sm font-bold hover:bg-beeyield-gold/10 rounded-xl px-3 py-2 transition-all ${isActive("/in-land-pollination") ? "text-beeyield-gold bg-beeyield-gold/10" : "text-beeyield-green/80"}`}
                >
                  In Land Pollination
                </Link>
                <Link
                  to="/precision-pollination"
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-sm font-bold hover:bg-beeyield-gold/10 rounded-xl px-3 py-2 transition-all ${isActive("/precision-pollination") ? "text-beeyield-gold bg-beeyield-gold/10" : "text-beeyield-green/80"}`}
                >
                  In Hive Pollination
                </Link>
                <Link
                  to="/diseases"
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-sm font-bold hover:bg-beeyield-gold/10 rounded-xl px-3 py-2 transition-all ${isActive("/diseases") ? "text-beeyield-gold bg-beeyield-gold/10" : "text-beeyield-green/80"}`}
                >
                  Diseases
                </Link>
              </div>

              <Link
                to="/pollination-solutions"
                onClick={() => setIsMenuOpen(false)}
                className={`text-sm font-bold hover:bg-beeyield-gold/10 rounded-xl px-3 py-3 transition-all ${isActive("/pollination-solutions") ? "text-beeyield-gold bg-beeyield-gold/10" : "text-beeyield-green"}`}
              >
                Beekeeping Network
              </Link>
              <Link
                to="/shop"
                onPrefetch={prefetchShop}
                onClick={() => setIsMenuOpen(false)}
                className={`text-sm font-bold hover:bg-beeyield-gold/10 rounded-xl px-3 py-3 transition-all ${isActive("/shop") ? "text-beeyield-gold bg-beeyield-gold/10" : "text-beeyield-green"}`}
              >
                Shop
              </Link>
            </div>

            {/* Dashboard Link */}
            <div className="flex flex-col space-y-1 py-4 border-b border-beeyield-gold/20">
              <span className="text-[10px] uppercase tracking-wider text-beeyield-green/60 px-3 py-1 font-black">Portal</span>
              <Link
                to="/beeyield-dashboard"
                onClick={() => setIsMenuOpen(false)}
                className={`text-sm font-black hover:bg-beeyield-gold/20 rounded-xl px-3 py-3 transition-all bg-gradient-to-r from-beeyield-gold/10 to-beeyield-green/10 text-beeyield-green border-2 border-beeyield-gold/30 flex items-center justify-between shadow-sm ${isActive("/beeyield-dashboard") ? "ring-2 ring-beeyield-gold" : ""}`}
              >
                Dashboard
                <Shield className="h-4 w-4" />
              </Link>
            </div>

            {/* Other Pages one per line */}
            <div className="flex flex-col space-y-1 pt-4">
              <span className="text-[10px] uppercase tracking-wider text-beeyield-green/60 px-3 py-1 font-black">Company</span>
              {[
                { label: 'Our Story', to: '/about' },
                { label: 'Bee Learn', to: '/learn' },
                { label: 'Impact', to: '/impact' },
                { label: 'ESG', to: '/esg' },
                { label: 'Commitment', to: '/commitment' },
                { label: 'Global Network', to: '/global-hive-network' },
                { label: 'Team', to: '/team' },
                { label: 'Careers', to: '/careers' },
                { label: 'Media', to: '/media' },
                { label: 'Blogs', to: '/blogs' },
                { label: 'Contact', to: '/contact' },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-sm font-bold hover:bg-beeyield-gold/10 rounded-lg px-3 py-2.5 transition-all ${isActive(item.to) ? "text-beeyield-gold bg-beeyield-gold/10" : "text-beeyield-green/80 hover:text-beeyield-green"}`}
                >
                  {item.label}
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
