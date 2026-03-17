import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, ArrowRight, Shield, Clock, Star, BadgeCheck, MapPin } from "lucide-react";
import { Helmet } from "react-helmet-async";
import StickyHeader from "@/components/StickyHeader";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import ScrollReveal from "@/components/ScrollReveal";
import Breadcrumb from "@/components/Breadcrumb";
import { getServicesByCategory, type ServiceCategory } from "@/data/services";
import { getServiceDetail } from "@/data/serviceDetails";
import { getActiveLocations } from "@/data/locations";
import { useBrand } from "@/hooks/useCms";
import * as Icons from "lucide-react";

// Helper to reliably render any Lucide icon by string name
const Icon = ({ name, className }: { name: string; className?: string }) => {
  const LucideIcon = (Icons as any)[name] || Icons.HelpCircle;
  return <LucideIcon className={className} />;
};

import residentialImg from "@/assets/category-residential.jpg";
import commercialImg from "@/assets/category-commercial.jpg";
import automotiveImg from "@/assets/category-automotive.jpg";

const categoryMeta: Record<ServiceCategory, {
  label: string;
  headline: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  image: string;
  color: string;
}> = {
  residential: {
    label: "Residential",
    headline: "Home Locksmith Services",
    description: "From lockouts to smart lock installation — we keep your family safe with professional residential locksmith services across Greater Cleveland.",
    seoTitle: "Residential Locksmith Services Cleveland | Xcel Locksmith",
    seoDescription: "Professional home locksmith in Cleveland, OH. Lock installation, rekeying, smart locks, deadbolts & emergency lockouts. Licensed, 24/7, no hidden fees.",
    image: residentialImg,
    color: "text-blue",
  },
  commercial: {
    label: "Commercial",
    headline: "Business Locksmith Services",
    description: "Grade-1 commercial locks, master key systems, access control, and emergency lockout services for Cleveland businesses.",
    seoTitle: "Commercial Locksmith Services Cleveland | Xcel Locksmith",
    seoDescription: "Expert commercial locksmith in Cleveland, OH. Access control, master key systems, panic bars, high-security locks. Licensed & insured. Call 24/7.",
    image: commercialImg,
    color: "text-accent",
  },
  automotive: {
    label: "Automotive",
    headline: "Auto Locksmith Services",
    description: "Car lockouts, key replacement, transponder programming, and ignition repair — all on-site at a fraction of dealer prices.",
    seoTitle: "Automotive Locksmith Services Cleveland | Xcel Locksmith",
    seoDescription: "Mobile auto locksmith in Cleveland, OH. Car lockouts, key replacement, fob programming, ignition repair. Faster & cheaper than the dealer. Call 24/7.",
    image: automotiveImg,
    color: "text-cta-red",
  },
};

const CategoryLandingPage = () => {
  const { category } = useParams<{ category: string }>();
  const cat = category as ServiceCategory;
  const meta = categoryMeta[cat];
  const brand = useBrand();

  if (!meta) {
    return (
      <div className="min-h-screen bg-gradient-page">
        <StickyHeader />
        <main className="pt-32 pb-20 text-center container mx-auto px-4">
          <h1 className="font-display text-4xl font-bold mb-4">Category Not Found</h1>
          <p className="text-muted-foreground mb-8">The category you're looking for doesn't exist.</p>
          <Link to="/" className="skeu-cta-red text-white font-bold px-6 py-3 rounded-xl inline-flex items-center gap-2">
            Back to Home <ArrowRight className="w-4 h-4" />
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const services = getServicesByCategory(cat);
  const activeCities = getActiveLocations();

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: `${meta.label} Locksmith`,
    provider: {
      "@type": "Locksmith",
      name: "Xcel Locksmith",
      url: "https://xcellocksmith.com",
    },
    areaServed: { "@type": "City", name: "Cleveland" },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${meta.label} Services`,
      itemListElement: services.map(s => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: s.title, description: s.shortDescription },

      })),
    },
  };

  return (
    <div className="min-h-screen bg-gradient-page">
      <Helmet>
        <title>{meta.seoTitle}</title>
        <meta name="description" content={meta.seoDescription} />
        <link rel="canonical" href={`https://xcellocksmith.com/services/${cat}`} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={meta.seoTitle} />
        <meta property="og:description" content={meta.seoDescription} />
        <meta property="og:url" content={`https://xcellocksmith.com/services/${cat}`} />
        <meta property="og:image" content={meta.image} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={meta.seoTitle} />
        <meta name="twitter:description" content={meta.seoDescription} />
        <meta name="twitter:image" content={meta.image} />
      </Helmet>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <StickyHeader />

      <main>
        <Breadcrumb items={[
          { label: "Home", href: "/" },
          { label: `${meta.label} Services` },
        ]} />

        {/* Hero */}
        <section className="relative overflow-hidden pb-16">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider neu-card ${meta.color} mb-4`}>
                  <BadgeCheck className="w-3.5 h-3.5" />
                  {meta.label}
                </span>

                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  {meta.headline}
                  <span className="block font-serif-accent text-accent mt-2">in Cleveland, OH</span>
                </h1>

                <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl">{meta.description}</p>

                <div className="flex flex-wrap gap-4">
                  <motion.a
                    href={brand.phoneNumber}
                    className="glass-cta-red text-white font-bold px-8 py-4 rounded-2xl inline-flex items-center gap-3 text-lg"
                    animate={{ scale: [1, 1.03, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Phone className="w-5 h-5" />
                    Call Now — 24/7
                  </motion.a>
                  <a href="/#quote" className="neu-card px-8 py-4 rounded-2xl inline-flex items-center gap-3 text-lg font-semibold text-foreground hover:bg-foreground/5 transition-colors border border-border">
                    Get a Free Quote <ArrowRight className="w-5 h-5" />
                  </a>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative">
                <div className="rounded-3xl overflow-hidden neu-card">
                  <img src={meta.image} alt={`${meta.label} locksmith services in Cleveland`} className="w-full h-[350px] md:h-[450px] object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/60 via-transparent to-transparent rounded-3xl" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* All Services Grid */}
        <ScrollReveal variant="fadeUp">
          <section className="py-20">
            <div className="container mx-auto px-4">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">
                All <span className="font-serif-accent text-accent">{meta.label}</span> Services
              </h2>
              <p className="text-muted-foreground text-center max-w-xl mx-auto mb-12">
                {services.length} professional {meta.label.toLowerCase()} locksmith services — all backed by transparent pricing.
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((s, i) => {
                  const detail = getServiceDetail(s.slug);
                  return (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        to={`/services/${s.category}/${s.slug}`}
                        className="block neu-card rounded-2xl overflow-hidden group hover:shadow-lg transition-all duration-300 h-full"
                      >
                        {detail && (
                          <img src={detail.categoryImage} alt={s.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                        )}
                        <div className="p-6">
                          <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-accent transition-colors mb-2">{s.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{s.shortDescription}</p>
                          <div className="flex items-center">
                            <Icon name={s.icon} className={`w-6 h-6 ${meta.color}`} />
                            <span className="text-xs text-muted-foreground group-hover:text-accent transition-colors flex items-center gap-1 ml-auto">
                              Learn more <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Trust Badges */}
        <ScrollReveal variant="fadeIn">
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap items-center justify-center gap-6">
                {[
                  { icon: Shield, label: "Licensed & Insured" },
                  { icon: Clock, label: "24/7/365 Availability" },
                  { icon: Star, label: "5-Star Rated" },
                  { icon: BadgeCheck, label: "No Hidden Fees" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 px-5 py-3 rounded-full neu-card text-sm text-muted-foreground">
                    <Icon className="w-4 h-4 text-accent" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Service Areas */}
        <ScrollReveal variant="fadeUp">
          <section className="py-20">
            <div className="container mx-auto px-4">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">
                {meta.label} Services <span className="font-serif-accent text-accent">Near You</span>
              </h2>
              <p className="text-muted-foreground text-center max-w-xl mx-auto mb-10">
                Available across {activeCities.length} cities in the Greater Cleveland metro area.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {activeCities.map(city => (
                  <Link
                    key={city.id}
                    to={`/service-areas/${city.slug}`}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full neu-card text-sm hover:bg-foreground/5 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-accent" />
                    <span className="text-foreground font-medium">{city.cityName}</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal variant="scale">
          <section className="py-20">
            <div className="container mx-auto px-4 text-center">
              <div className="neu-card rounded-3xl p-10 md:p-16 max-w-3xl mx-auto">
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                  Need a <span className="font-serif-accent text-accent">{meta.label}</span> Locksmith?
                </h2>
                <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                  We arrive in {brand.responseTime}, quote a fair price upfront, and get the job done right. No hidden fees. Ever.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <motion.a
                    href={brand.phoneNumber}
                    className="glass-cta-red text-white font-bold px-8 py-4 rounded-2xl inline-flex items-center gap-3 text-lg"
                    animate={{ scale: [1, 1.03, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Phone className="w-5 h-5" />
                    Call Now — {brand.phoneDisplay}
                  </motion.a>
                  <a href="/#quote" className="neu-card px-8 py-4 rounded-2xl inline-flex items-center gap-3 text-lg font-semibold text-foreground hover:bg-foreground/5 transition-colors border border-border">
                    Request a Quote <ArrowRight className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default CategoryLandingPage;
