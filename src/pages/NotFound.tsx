import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-muted/50 to-accent/5 p-4 text-center">
      <div className="relative mb-8">
        <h1 className="text-[12rem] font-black leading-none tracking-tighter text-primary/10 select-none">404</h1>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black tracking-tightest">Lost in the <br /><span className="text-primary italic">Hive?</span></span>
        </div>
      </div>

      <p className="mb-8 max-w-md text-lg text-muted-foreground font-medium">
        It looks like the path you're tracking doesn't exist. Let's get you back to the main colony.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button size="lg" asChild className="rounded-full px-8 shadow-glow">
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <Button size="lg" variant="outline" onClick={() => window.history.back()} className="rounded-full px-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
