import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";
import { useLivePreview } from "@/hooks/useLivePreview";
import { CmsAuthProvider } from "@/contexts/CmsAuthContext";
import AdminToolbar from "@/components/cms/AdminToolbar";
import Index from "./pages/Index";
import ServiceLandingPage from "./pages/ServiceLandingPage";
import CategoryLandingPage from "./pages/CategoryLandingPage";
import CityLandingPage from "./pages/CityLandingPage";
import ServiceAreasPage from "./pages/ServiceAreasPage";
import ServicesPage from "./pages/ServicesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

/** Activates Payload CMS live preview when loaded inside the admin iframe */
const LivePreviewBridge = ({ children }: { children: React.ReactNode }) => {
  useLivePreview();
  return <>{children}</>;
};

/** Scrolls to top on every route change (unless there's a hash) */
const ScrollToTopOnNav = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, hash]);
  return null;
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <CmsAuthProvider>
        <LivePreviewBridge>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTopOnNav />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/services/:category" element={<CategoryLandingPage />} />
                <Route path="/services/:category/:slug" element={<ServiceLandingPage />} />
                <Route path="/services/:category/:slug/:citySlug" element={<ServiceLandingPage />} />
                <Route path="/service-areas" element={<ServiceAreasPage />} />
                <Route path="/service-areas/:citySlug" element={<CityLandingPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            <AdminToolbar />
          </TooltipProvider>
        </LivePreviewBridge>
      </CmsAuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
