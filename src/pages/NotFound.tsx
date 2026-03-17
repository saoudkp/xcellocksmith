import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Phone, Home } from "lucide-react";
import StickyHeader from "@/components/StickyHeader";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-page">
      <StickyHeader />
      <div className="flex items-center justify-center min-h-screen pt-20">
        <div className="glass-card rounded-2xl p-12 text-center max-w-lg mx-4">
          <h1 className="font-display text-6xl font-bold text-accent mb-4">404</h1>
          <h2 className="font-display text-2xl font-bold mb-4">Page Not Found</h2>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist. But we're still here 24/7 to help with any locksmith emergency!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+12165551234"
              className="touch-target flex items-center justify-center gap-2 bg-accent text-accent-foreground font-bold px-6 py-3 rounded-xl animate-pulse-glow"
            >
              <Phone className="w-5 h-5" /> Call Now
            </a>
            <Link
              to="/"
              className="touch-target flex items-center justify-center gap-2 glass-card border border-border text-foreground font-semibold px-6 py-3 rounded-xl hover:bg-secondary transition-colors"
            >
              <Home className="w-5 h-5" /> Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
