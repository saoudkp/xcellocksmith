import StickyHeader from "@/components/StickyHeader";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import TeamSection from "@/components/TeamSection";
import ContactSection from "@/components/ContactSection";
import VehicleVerifier from "@/components/VehicleVerifier";
import QuoteTool from "@/components/QuoteTool";
import BeforeAfterGallery from "@/components/BeforeAfterGallery";
import ReviewsSection from "@/components/ReviewsSection";
import FAQSection from "@/components/FAQSection";
import ServiceAreaMap from "@/components/ServiceAreaMap";
import VisitorCounter from "@/components/VisitorCounter";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import ScrollToTop from "@/components/ScrollToTop";
import { LocalBusinessSchema, FAQSchema, TeamSchema } from "@/components/StructuredData";
import { useSections, useCmsReady } from "@/hooks/useCms";
import { useHashScroll } from "@/hooks/useHashScroll";
import { type SectionConfig } from "@/data/siteConfig";

/** Maps section type to its component — layout/theme stays constant */
const sectionComponents: Record<SectionConfig["type"], React.ComponentType> = {
  hero: HeroSection,
  services: ServicesSection,
  team: TeamSection,
  contact: ContactSection,
  "vehicle-verifier": VehicleVerifier,
  quote: QuoteTool,
  gallery: BeforeAfterGallery,
  reviews: ReviewsSection,
  map: ServiceAreaMap,
  faq: FAQSection,
  "visitor-counter": VisitorCounter,
};

/** Alternate scroll reveal variants for visual variety */
const revealVariants: Array<"fadeUp" | "fadeIn" | "scale"> = ["fadeUp", "fadeIn", "scale"];

const Index = () => {
  const activeSections = useSections();
  const cmsReady = useCmsReady();
  useHashScroll();

  if (!cmsReady) {
    return (
      <div className="min-h-screen bg-gradient-page flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm font-medium animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-page">
      <LocalBusinessSchema />
      <FAQSchema />
      <TeamSchema />

      <StickyHeader />

      <main>
        {activeSections?.map((section, i) => {
          const Component = sectionComponents[section.type];
          if (!Component) return null;

          // Hero doesn't need scroll reveal — it's above the fold
          if (section.type === "hero") {
            return <Component key={section.id} />;
          }

          return (
            <ScrollReveal
              key={section.id}
              variant={revealVariants[i % revealVariants.length]}
              delay={0.05}
            >
              <Component />
            </ScrollReveal>
          );
        })}
      </main>

      <ScrollReveal variant="fadeIn">
        <Footer />
      </ScrollReveal>

      <ScrollToTop />
    </div>
  );
};

export default Index;
