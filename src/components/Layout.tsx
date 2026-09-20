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

  // Frontend marketing pages that have their own inline placement for PandaMitiSection
  // (e.g. Home page has it placed directly above the FAQ section)
  const pagesWithCustomPandaMiti = new Set([
    '/',
    '/pollination-services',
    '/commitment',
    '/sdg',
    '/crops-we-pollinate',
    '/honey',
    '/pollination-solutions',
    '/team',
  ]);

  // Pages where Panda Miti Initiative should NOT be displayed
  // (Shop, In Land Pollination, In Hive Pollination, Contact, Careers, Checkout)
  const isExcludedFromPandaMiti =
    pathname === '/shop' ||
    pathname.startsWith('/shop/') ||
    pathname === '/checkout' ||
    pathname === '/in-land-pollination' ||
    pathname.startsWith('/in-land') ||
    pathname.startsWith('/inland') ||
    pathname === '/precision-pollination' ||
    pathname.startsWith('/precision-pollination') ||
    pathname.includes('hive') ||
    pathname === '/contact' ||
    pathname.startsWith('/contact') ||
    pathname === '/careers' ||
    pathname.startsWith('/career');

  const shouldRenderPandaMitiInLayout =
    !pagesWithCustomPandaMiti.has(pathname) && !isExcludedFromPandaMiti;

  return (
    <div className="flex min-h-screen flex-col">
      <CartDrawer />
      <Header />

      <main className="flex-1 overflow-x-hidden animate-in fade-in duration-500">
        {children}
      </main>

      {shouldRenderPandaMitiInLayout && (
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
