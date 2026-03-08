import { useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, ShoppingBag, User, Shield, LogIn, UserPlus, MapPin, Cpu, ShieldCheck, Leaf, ArrowRight } from "lucide-react";
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
    { to: "/careers", label: "Careers" },
    { to: "/team", label: "Team" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
      <nav className="container mx-auto flex h-20 items-center justify-between px-6 lg:px-12">
        {/* Left side - Logo (all devices) */}
        <Link to="/" className="flex items-center space-x-3 flex-shrink-0 transition-all hover:scale-105 active:scale-95 group" aria-label="BeeYield home">
          <div className="relative">
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-beeyield-gold/20 blur-xl rounded-full group-hover:bg-beeyield-gold/40 transition-colors" />
            <img
              src={Logo}
              alt="BeeYield logo"
              className="h-10 w-10 lg:h-12 lg:w-12 object-contain relative z-10 filter drop-shadow-md"
            />
          </div>
          <div className="flex flex-col -space-y-1">
            <span className="text-xl lg:text-2xl font-black text-beeyield-green tracking-tighter uppercase italic leading-none">BeeYield</span>
            <span className="text-[8px] font-black tracking-[0.3em] text-neutral-400 uppercase leading-none">Precision Core</span>
          </div>
        </Link>

        {/* Center - Navigation Links (Desktop only) */}
        <div className="hidden lg:flex items-center space-x-2">
          <Link
            to="/crops-we-pollinate"
            className={`text-[11px] font-black uppercase tracking-widest transition-all px-4 py-2 rounded-xl hover:bg-neutral-50 ${isActive("/crops-we-pollinate") ? "text-beeyield-gold bg-neutral-50 shadow-sm" : "text-neutral-500 hover:text-neutral-900"
              }`}
          >
            Pollination
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all px-4 py-2 rounded-xl hover:bg-neutral-50 text-neutral-500 hover:text-neutral-900 outline-none">
              Solutions
              <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-80 p-4 bg-white/95 backdrop-blur-xl border border-neutral-100 rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] z-[100] animate-in slide-in-from-top-2 duration-300">
              <div className="grid gap-2">
                <DropdownMenuItem asChild>
                  <Link to="/in-land-pollination" className="flex items-center gap-3 p-4 rounded-2xl hover:bg-neutral-50 transition-colors group">
                    <div className="h-10 w-10 rounded-xl bg-beeyield-green/10 flex items-center justify-center text-beeyield-green group-hover:bg-beeyield-green group-hover:text-white transition-all">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-tight text-neutral-900">In Land</p>
                      <p className="text-[10px] text-neutral-400 font-medium">Field Distribution Metrics</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/precision-pollination" className="flex items-center gap-3 p-4 rounded-2xl hover:bg-neutral-50 transition-colors group">
                    <div className="h-10 w-10 rounded-xl bg-beeyield-gold/10 flex items-center justify-center text-beeyield-gold group-hover:bg-beeyield-gold group-hover:text-white transition-all">
                      <Cpu className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-tight text-neutral-900">In Hive</p>
                      <p className="text-[10px] text-neutral-400 font-medium">IoT Colony Health Monitoring</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/diseases" className="flex items-center gap-3 p-4 rounded-2xl hover:bg-neutral-50 transition-colors group">
                    <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-tight text-neutral-900">Pathogens</p>
                      <p className="text-[10px] text-neutral-400 font-medium">Early Disease Detection Core</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            to="/pollination-solutions"
            className={`text-[11px] font-black uppercase tracking-widest transition-all px-4 py-2 rounded-xl hover:bg-neutral-50 ${isActive("/pollination-solutions") ? "text-beeyield-gold bg-neutral-50 shadow-sm" : "text-neutral-500 hover:text-neutral-900"
              }`}
          >
            Network
          </Link>
          <Link
            to="/shop"
            onPrefetch={prefetchShop}
            className={`text-[11px] font-black uppercase tracking-widest transition-all px-4 py-3 rounded-xl hover:bg-neutral-900 hover:text-white ${isActive("/shop") ? "text-white bg-neutral-900 shadow-xl" : "text-neutral-500"
              }`}
          >
            The Shop
          </Link>
        </div>

        {/* Right side - Traceability Button & Menu (all devices) */}
        <div className="flex items-center space-x-3">
          <Link
            to="/beeyield-dashboard"
            className="p-3 hover:bg-neutral-50 rounded-2xl transition-all active:scale-95 group relative flex items-center justify-center bg-white/50 border border-neutral-100 shadow-sm"
            title="BeeYield Dashboard"
          >
            <Shield className="h-5 w-5 text-neutral-700 group-hover:text-beeyield-green transition-colors" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
            </span>
          </Link>

          <button
            onClick={toggleCart}
            className="p-3 hover:bg-neutral-50 rounded-2xl transition-all active:scale-95 group relative bg-white/50 border border-neutral-100 shadow-sm"
            aria-label="View shopping cart"
          >
            <ShoppingBag className="h-5 w-5 text-neutral-700 group-hover:text-beeyield-gold transition-colors" />
            {getTotalItems() > 0 && (
              <span className="absolute -top-2 -right-2 bg-neutral-900 text-white text-[9px] font-black h-5 w-5 flex items-center justify-center rounded-full shadow-lg border-2 border-white">
                {getTotalItems()}
              </span>
            )}
          </button>

          <Button
            variant="default"
            size="sm"
            className="bg-neutral-900 hover:bg-beeyield-green text-white font-black px-6 h-12 transition-all active:scale-95 rounded-2xl shadow-xl hover:shadow-neutral-900/10 uppercase tracking-widest text-[10px] hidden sm:flex"
            asChild
          >
            <Link to="/traceability">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Verify Jar
            </Link>
          </Button>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            className="p-3 bg-white hover:bg-neutral-50 border border-neutral-100 rounded-2xl shadow-sm transition-all active:scale-95 text-neutral-900"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            ) : (
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Expanded Menu (All devices) */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-neutral-900/20 backdrop-blur-md z-40 animate-in fade-in duration-500"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="fixed right-4 top-24 z-50 w-80 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-[3rem] bg-white border border-neutral-100 p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] animate-in slide-in-from-top-4 duration-500 group">
            <div className="flex flex-col space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-4 px-2">Navigation</p>

              <Link to="/crops-we-pollinate" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-neutral-50 transition-all font-bold text-neutral-900">
                <Leaf className="h-5 w-5 text-beeyield-green" />
                Pollination Services
              </Link>

              <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-neutral-50 transition-all font-bold text-neutral-900">
                <ShoppingBag className="h-5 w-5 text-beeyield-gold" />
                The Honey Shop
              </Link>

              <Link to="/traceability" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-neutral-50 transition-all font-bold text-neutral-900">
                <ShieldCheck className="h-5 w-5 text-neutral-400" />
                Traceability Report
              </Link>

              <Separator className="my-6 opacity-50" />

              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-4 px-2">Company</p>

              {menuLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className="p-4 rounded-2xl hover:bg-neutral-50 transition-all font-bold text-neutral-500 hover:text-neutral-900"
                >
                  {link.label}
                </Link>
              ))}

              <Link
                to="/beeyield-dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="mt-6 flex items-center justify-between p-6 bg-neutral-900 rounded-[2rem] text-white shadow-xl hover:scale-[1.02] transition-all group/dash"
              >
                <div>
                  <p className="text-xs font-black uppercase tracking-tight">BeeYield Dashboard</p>
                  <p className="text-[10px] text-neutral-400 font-medium">Live Monitoring Platform</p>
                </div>
                <ArrowRight className="h-5 w-5 group-hover/dash:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
