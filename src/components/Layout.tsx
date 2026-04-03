import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import { PartnersMarquee } from "./PartnersMarquee";


interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const pathname = location.pathname;

  // "Dashboard" routes should not inherit the marketing site chrome (header/footer/marquee/cart).
  // This keeps all BeeYield/Admin/Shop dashboards consistent with their own home view.
  const standaloneExactPaths = new Set([
    '/buyer-dashboard',
    '/shop-dashboard',
    '/my-account',
    '/login',
    '/signup',
    '/beeyield-dashboard',
    '/beeyield-login',
    '/measurements',
    '/account-settings',
    '/update-password',
  ]);

  const standalonePrefixes = [
    '/admin',
    '/ceba',
    '/receipt/',
    '/auth/callback',
    '/integrations/callback',
  ];

  const isStandalone =
    standaloneExactPaths.has(pathname) ||
    standalonePrefixes.some((prefix) => pathname.startsWith(prefix));

  if (isStandalone) {
    return (
      <>
        <div className="animate-in fade-in duration-300">
          {children}
        </div>
      </>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <CartDrawer />
      <Header />

      <main className="flex-1 overflow-x-hidden animate-in fade-in duration-500">
        {children}
      </main>
      <PartnersMarquee />
      <Footer />
    </div>
  );
};

export default Layout;
