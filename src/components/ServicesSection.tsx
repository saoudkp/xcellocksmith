import { Home, Building2, Car, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import * as Icons from "lucide-react";

// Helper to reliably render any Lucide icon by string name
const Icon = ({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) => {
  const LucideIcon = (Icons as any)[name] || Icons.HelpCircle;
  return <LucideIcon className={className} style={style} />;
};
import { motion } from "framer-motion";
import { Service, ServiceCategory } from "@/data/services";
import { useServices, useServicesSettings, type ServicesCategoryConfig } from "@/hooks/useCms";
import EditLink from "@/components/cms/EditLink";
import EditableText from "@/components/cms/EditableText";
import RichTextHeading from "@/components/cms/RichTextHeading";
import ServiceDetailDialog from "@/components/ServiceDetailDialog";
import categoryResidentialImg from "@/assets/category-residential.jpg";
import categoryCommercialImg from "@/assets/category-commercial.jpg";
import categoryAutomotiveImg from "@/assets/category-automotive.jpg";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useState, useEffect } from "react";

const ServiceCarousel = ({ 
  category, 
  services, 
  onSelect,
  config,
  categoryImage,
}: { 
  category: ServiceCategory; 
  services: Service[]; 
  onSelect: (s: Service) => void;
  config: ServicesCategoryConfig;
  categoryImage: string;
}) => {
  const catServices = services.filter(s => s.category === category && s.isActive);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", slidesToScroll: 1 },
    [Autoplay({ delay: 5000, stopOnInteraction: true })]
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  return (
    <div id={category} className="scroll-mt-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="neu-card rounded-3xl overflow-hidden"
      >
        {/* Category header with image */}
        <div className="relative h-40 sm:h-48 overflow-hidden">
          <img
            src={categoryImage}
            alt={`${config.label} locksmith services in Cleveland`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-card/95 via-card/70 to-transparent" />
          <div className="absolute inset-0 flex items-center px-6 sm:px-10">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <div className="w-14 h-14 rounded-2xl glass-card-strong flex items-center justify-center shadow-lg border border-white/20">
                  <Icon name={config.icon} className="w-7 h-7 drop-shadow-md" style={{ color: config.color }} />
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                  <EditableText
                    value={config.label}
                    field={`${category}.label`}
                    fieldPath={`${category}.label`}
                    entityType="global"
                    entitySlug="sections-settings"
                    cacheKey={['cms', 'sections-settings']}
                  />
                </h3>
              </div>
              <p className="text-sm text-muted-foreground max-w-md">
                <EditableText
                  value={config.description}
                  field={`${category}.description`}
                  fieldPath={`${category}.description`}
                  entityType="global"
                  entitySlug="sections-settings"
                  cacheKey={['cms', 'sections-settings']}
                />
              </p>
            </div>
          </div>
        </div>

        {/* Carousel */}
        <div className="p-5 sm:p-8">
          <div className="relative">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-4">
                {catServices.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => onSelect(service)}
                    className={`flex-[0_0_80%] sm:flex-[0_0_44%] lg:flex-[0_0_30%] min-w-0 text-left`}
                    aria-label={`View details for ${service.title}`}
                  >
                    <div 
                      className="rounded-2xl p-5 h-full border-l-4 bg-background/50 hover:bg-background transition-all duration-300 group cursor-pointer relative overflow-hidden hover:shadow-lg"
                      style={{ borderLeftColor: config.color }}
                    >
                      <EditLink entityType="collection" entitySlug="services" entityId={service.id} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                        style={{ background: `linear-gradient(to bottom right, ${config.color}20, transparent)` }}
                      />
                      <div className="relative flex flex-col gap-3 h-full">
                        <h4 className="font-display font-semibold text-foreground group-hover:text-accent transition-colors leading-tight">
                          <EditableText
                            value={service.title}
                            field="title"
                            entityType="collection"
                            entitySlug="services"
                            entityId={service.id}
                            cacheKey={['cms', 'services']}
                          />
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed flex-1 line-clamp-2">
                          <EditableText
                            value={service.shortDescription}
                            field="shortDescription"
                            entityType="collection"
                            entitySlug="services"
                            entityId={service.id}
                            cacheKey={['cms', 'services']}
                            multiline
                          />
                        </p>
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center">
                            <Icon name={service.icon} className="w-8 h-8" style={{ color: config.color }} />
                          </div>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                            Details <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dots + Arrows */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex gap-1.5">
              {catServices.map((_, i) => (
                <button
                  key={i}
                  onClick={() => emblaApi?.scrollTo(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === selectedIndex ? "w-6 bg-accent" : "w-1.5 bg-muted-foreground/30"}`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={scrollPrev}
                className="p-2 rounded-full neu-card hover:bg-accent/10 transition-all"
                aria-label="Previous service"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={scrollNext}
                className="p-2 rounded-full neu-card hover:bg-accent/10 transition-all"
                aria-label="Next service"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ServicesSection = () => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const allServices = useServices();
  const servicesSettings = useServicesSettings();

  const handleSelect = (service: Service) => {
    setSelectedService(service);
    setDialogOpen(true);
  };

  const categoryImages = {
    residential: categoryResidentialImg,
    commercial: categoryCommercialImg,
    automotive: categoryAutomotiveImg,
  };

  return (
    <section id="services" className="py-20 relative" itemScope itemType="https://schema.org/OfferCatalog">
      <meta itemProp="name" content="Xcel Locksmith Services" />
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 relative"
        >
          <EditLink entityType="global" entitySlug="sections-settings" section="services" label="Edit Services" className="absolute -top-8 right-0" />
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            <RichTextHeading
              content={servicesSettings.sectionHeader.richHeading}
              fallbackText={`${servicesSettings.sectionHeader.heading} ${servicesSettings.sectionHeader.headingAccent}`}
            />
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            <RichTextHeading
              content={servicesSettings.sectionHeader.richDescription}
              fallbackText={servicesSettings.sectionHeader.description}
            />
          </p>
        </motion.div>

        <div className="space-y-10">
          {(["residential", "commercial", "automotive"] as ServiceCategory[]).map((cat) => (
            <ServiceCarousel 
              key={cat} 
              category={cat} 
              services={allServices} 
              onSelect={handleSelect}
              config={servicesSettings[cat]}
              categoryImage={categoryImages[cat]}
            />
          ))}
        </div>
      </div>

      <ServiceDetailDialog
        service={selectedService}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </section>
  );
};

export default ServicesSection;
