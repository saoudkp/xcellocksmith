import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Phone, CheckCircle2, ArrowRight } from "lucide-react";
import * as Icons from "lucide-react";

// Helper to reliably render any Lucide icon by string name
const Icon = ({ name, className }: { name: string; className?: string }) => {
  const LucideIcon = (Icons as any)[name] || Icons.HelpCircle;
  return <LucideIcon className={className} />;
};
import { Service } from "@/data/services";
import { getServiceDetail } from "@/data/serviceDetails";
import { defaultBrand } from "@/data/siteConfig";
import { motion } from "framer-motion";

interface Props {
  service: Service | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ServiceDetailDialog = ({ service, open, onOpenChange }: Props) => {
  if (!service) return null;
  const hardcoded = getServiceDetail(service.slug);

  // Prefer CMS data, fall back to hardcoded serviceDetails
  const longDescription = service.longDescription || hardcoded?.longDescription || service.shortDescription;
  const benefits = service.benefits || hardcoded?.benefits;
  const ctaText = service.ctaText || hardcoded?.ctaText || "Call Now";
  const heroImage = service.heroImageUrl || hardcoded?.categoryImage;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl neu-card border-0 p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Hero image */}
        {heroImage && (
          <div className="relative h-48 sm:h-56 w-full overflow-hidden">
            <img
              src={heroImage}
              alt={`${service.title} - Professional locksmith service in Cleveland, OH`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
            <div className="absolute bottom-4 left-6 right-6">
              <span className="skeu-badge rounded-full px-3 py-1 text-xs font-semibold text-accent capitalize">
                {service.category}
              </span>
            </div>
          </div>
        )}

        <div className="p-6 pt-3">
          <DialogHeader className="text-left mb-4">
            <DialogTitle className="font-display text-2xl sm:text-3xl font-bold leading-tight">
              {service.title}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-base mt-2 leading-relaxed">
              {longDescription}
            </DialogDescription>
          </DialogHeader>

          {/* Benefits */}
          {benefits && benefits.length > 0 && (
            <div className="mb-6">
              <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-accent mb-3">
                Why Choose Us
              </h4>
              <ul className="grid gap-2 sm:grid-cols-2">
                {benefits.map((b, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-2 text-sm text-foreground"
                  >
                    <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}

          {/* Price + CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Icon name={service.icon} className={`w-10 h-10 ${service.category === 'residential' ? 'text-blue' : service.category === 'commercial' ? 'text-accent' : 'text-cta-red'}`} />
            </div>
            <div className="flex gap-3 flex-1 sm:justify-end w-full sm:w-auto">
              <a
                href={defaultBrand.phoneNumber}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 skeu-cta-red text-white font-bold px-6 py-3 rounded-xl hover:scale-105 transition-transform text-sm"
              >
                <Phone className="w-4 h-4" />
                <span>{ctaText}</span>
              </a>
              <a
                href="#quote"
                onClick={() => onOpenChange(false)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 skeu-button text-white font-bold px-6 py-3 rounded-xl text-sm"
              >
                <span>Free Quote</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceDetailDialog;
