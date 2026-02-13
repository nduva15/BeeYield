import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const standalonePaths = ['/beeyield-dashboard', '/buyer-dashboard', '/shop-dashboard', '/my-account', '/ceba', '/ceba/login', '/admin', '/login', '/signup', '/beeyield-login'];
  const isStandalone = standalonePaths.includes(location.pathname) || location.pathname.startsWith('/admin');

  const pageVariants = {
    initial: {
      opacity: 0,
    },
    enter: {
      opacity: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut" as any,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.1,
      },
    },
  };

  if (isStandalone) {
    return (
      <>
        <CartDrawer />
        <AnimatePresence>
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="enter"
            exit="exit"
            variants={pageVariants}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <CartDrawer />
      <Header />
      <main className="flex-1 overflow-x-hidden">
        <AnimatePresence>
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="enter"
            exit="exit"
            variants={pageVariants}
            className="w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
