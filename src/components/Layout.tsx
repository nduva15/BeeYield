import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import { PartnersMarquee } from "./PartnersMarquee";
import { PandaMitiSection } from "./beeyield/PandaMitiSection";

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
    '/auth',
    '/oauth/consent',
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
    '/shared-run/',
    '/shared/',
    '/.lovable',
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

  // Frontend pages that should NOT have Panda Miti per user specification:
  // "not shop, contact, team, media, in land in hive diseases verify pages"
  const excludedPandaMitiPaths = [
    '/shop',
    '/products',
    '/product',
    '/cart',
    '/checkout',
    '/contact',
    '/team',
    '/media',
    '/in-land-pollination',
    '/in-land-pollination-platform',
    '/land',
    '/landing',
    '/hive',
    '/hives',
    '/diseases',
    '/bee-diseases',
    '/verify',
    '/traceability',
    '/panda-miti', // already the dedicated Panda Miti page
  ];

  const shouldRenderPandaMiti =
    !isStandalone &&
    !excludedPandaMitiPaths.some(
      (excluded) => pathname === excluded || pathname.startsWith(`${excluded}/`)
    );

  return (
    <div className="flex min-h-screen flex-col">
      <CartDrawer />
      <Header />

      <main className="flex-1 overflow-x-hidden animate-in fade-in duration-500">
        {children}
      </main>

      {shouldRenderPandaMiti && (
        <section id="panda-miti" className="border-t border-border/40">
          <PandaMitiSection />
        </section>
      )}

      <PartnersMarquee />
      <Footer />
    </div>
  );
};

export default Layout;
