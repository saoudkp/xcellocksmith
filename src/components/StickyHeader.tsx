import { Phone, Menu, X, Sun, Moon, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/xcel-logo-new.png";
import { useBrand, useNavigation } from "@/hooks/useCms";
import EditLink from "@/components/cms/EditLink";

const StickyHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("xcel-theme");
      if (stored) return stored === "dark";
    }
    return true; // default to dark
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("xcel-theme", dark ? "dark" : "light");
  }, [dark]);

  const brand = useBrand();
  const navItems = useNavigation();
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const PHONE_NUMBER = brand.phoneNumber;
  const navLinks = navItems
    .filter(n => n.isActive)
    .sort((a, b) => a.order - b.order)
    .map(n => ({
      // Prefix anchor-only hrefs with "/" when not on homepage so they navigate correctly
      href: !isHome && n.href.startsWith("#") ? `/${n.href}` : n.href,
      label: n.label,
    }));

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Emergency banner - mobile */}
      <div className="skeu-cta-red text-white text-center py-1.5 px-4 text-sm font-semibold flex items-center justify-center gap-2 md:hidden">
        <Zap className="w-4 h-4" />
        <span>We Arrive in 20–30 Minutes!</span>
      </div>

      {/* Main header with glass */}
      <div className="glass-header">
        <div className="container mx-auto px-4 flex items-center justify-between h-20 md:h-24">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <img src={logo} alt="Xcel Locksmith" className="h-16 md:h-20 w-auto transition-transform duration-300 group-hover:scale-105" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-all duration-300 rounded-lg hover:bg-foreground/5"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA + Theme */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setDark(!dark)}
              className="p-2 rounded-lg neu-card hover:bg-foreground/5 transition-colors"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-foreground" />}
            </button>
            <motion.a
              href={PHONE_NUMBER}
              className="touch-target flex items-center gap-2 skeu-cta-red text-white font-bold px-6 py-3 rounded-xl"
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Phone className="w-5 h-5" />
              <span>Call Now</span>
            </motion.a>
          </div>

          {/* Mobile CTA + Theme + Menu */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setDark(!dark)}
              className="p-2 rounded-lg neu-card"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-foreground" />}
            </button>
            <a
              href={PHONE_NUMBER}
              className="touch-target flex items-center gap-2 skeu-cta-red text-white font-bold px-4 py-3 rounded-xl text-sm"
            >
              <Phone className="w-5 h-5" />
              <span>Call Now</span>
            </a>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="touch-target flex items-center justify-center p-2 text-foreground neu-card rounded-lg"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden glass-card-strong border-t border-border"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="touch-target flex items-center px-4 py-3 text-foreground font-medium hover:bg-foreground/5 rounded-xl transition-colors"
                >
                  {link.label}
                </motion.a>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default StickyHeader;
