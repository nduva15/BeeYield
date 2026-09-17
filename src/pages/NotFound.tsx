import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <div className="text-center max-w-md bg-card border border-border rounded-2xl p-8 shadow-sm">
        <img src="/logo.png" alt="BeeYield Logo" className="h-12 w-auto mx-auto mb-6" />
        <h1 className="mb-2 text-4xl font-bold text-foreground">404</h1>
        <p className="mb-6 text-base text-muted-foreground">Oops! We couldn't find the page you were looking for.</p>
        <a href="/" className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all">
          Return to BeeYield Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
