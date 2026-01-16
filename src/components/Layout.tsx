import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const standalonePaths = ['/beeyield-dashboard', '/buyer-dashboard', '/my-account', '/ceba', '/login', '/signup'];
  const isStandalone = standalonePaths.includes(location.pathname);

  if (isStandalone) {
    return (
      <>
        <CartDrawer />
        {children}
      </>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <CartDrawer />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
