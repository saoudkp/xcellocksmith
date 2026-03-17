import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, ArrowRight, Shield, Clock, Star, BadgeCheck, MapPin, Home, Building2, Car } from "lucide-react";
import { Helmet } from "react-helmet-async";
import StickyHeader from "@/components/StickyHeader";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import ScrollReveal from "@/components/ScrollReveal";
import Breadcrumb from "@/components/Breadcrumb";
import { getLocationBySlug, getActiveLocations } from "@/data/locations";
import { getServicesByCategory, type ServiceCategory } from "@/data/services";
import { getServiceDetail } from "@/data/serviceDetails";
import { useBrand } from "@/hooks/useCms";
import * as Icons from "lucide-react";

// Helper to reliably render any Lucide icon by string name
const Icon = ({ name, className }: { name: string; className?: string }) => {
  const LucideIcon = (Icons as any)[name] || Icons.HelpCircle;
  return <LucideIcon className={className} />;
};

const categoryInfo: Record<ServiceCategory, { icon: typeof Home; label: string; color: string }> = {
  residential: { icon: Home, label: "Residential", color: "text-blue" },
  commercial: { icon: Building2, label: "Commercial", color: "text-accent" },
  automotive: { icon: Car, label: "Automotive", color: "text-cta-red" },
};

const CityLandingPage = () => {
  const { citySlug } = useParams<{ citySlug: string }>();
  const location = citySlug ? getLocationBySlug(citySlug) : null;
  const brand = useBrand();

  if (!location) {
    return (
      <div className="min-h-screen bg-gradient-page">
        <StickyHeader />
        <main className="pt-32 pb-20 text-center container mx-auto px-4">
          <h1 className="font-display text-4xl font-bold mb-4">City Not Found</h1>
          <p className="text-muted-foreground mb-8">We don't have a page for this location yet.</p>
          <Link to="/" className="skeu-cta-red text-white font-bold px-6 py-3 rounded-xl inline-flex items-center gap-2">
            Back to Home <ArrowRight className="w-4 h-4" />
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const allCategories: ServiceCategory[] = ["residential", "commercial", "automotive"];
  const nearbyCities = getActiveLocations().filter(l => l.id !== location.id).slice(0, 8);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Locksmith",
    name: `Xcel Locksmith — ${location.cityName}`,
    url: `https://xcellocksmith.com/service-areas/${location.slug}`,
    telephone: "+12165551234",
    areaServed: { "@type": "City", name: location.cityName },
    address: { "@type": "PostalAddress", addressLocality: location.cityName, addressRegion: "OH", addressCountry: "US" },
    geo: { "@type": "GeoCoordinates", latitude: location.lat, longitude: location.lng },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "00:00", closes: "23:59",
    },
    aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "347", bestRating: "5" },
  };

  return (
    <div className="min-h-screen bg-gradient-page">
      <Helmet>
        <title>{location.seoMetaTitle}</title>
        <meta name="description" content={location.seoMetaDescription} />
        <link rel="canonical" href={`https://xcellocksmith.com/service-areas/${location.slug}`} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={location.seoMetaTitle} />
        <meta property="og:description" content={location.seoMetaDescription} />
        <meta property="og:url" content={`https://xcellocksmith.com/service-areas/${location.slug}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={location.seoMetaTitle} />
        <meta name="twitter:description" content={location.seoMetaDescription} />
      </Helmet>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <StickyHeader />

      <main>
        <Breadcrumb items={[
          { label: "Home", href: "/" },
          { label: "Service Areas", href: "/service-areas" },
          { label: location.cityName },
        ]} />

        {/* Hero */}
        <section className="relative overflow-hidden pb-16">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-3xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider neu-card text-accent">
                  <MapPin className="w-3.5 h-3.5" />
                  {location.cityName}, OH
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider neu-card text-accent">
                  <Clock className="w-3.5 h-3.5" />
                  {brand.responseTime} Response
                </span>
              </div>

              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                24/7 Emergency Locksmith
                <span className="block font-serif-accent text-accent mt-2">in {location.cityName}, OH</span>
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl mx-auto">
                Fast, reliable locksmith services for homes, businesses, and vehicles in {location.cityName}. Licensed, insured, and committed to transparent pricing.
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
                    Get a Free Quote <ArrowRight className="w-5 h-5" />
                  </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Services by Category */}
        {allCategories.map(cat => {
          const catServices = getServicesByCategory(cat);
          const info = categoryInfo[cat];
          const Icon = info.icon;

          return (
            <ScrollReveal key={cat} variant="fadeUp">
              <section className="py-16">
                <div className="container mx-auto px-4">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl skeu-badge flex items-center justify-center">
                      <Icon className={`w-5 h-5 ${info.color}`} />
                    </div>
                    <h2 className="font-display text-2xl md:text-3xl font-bold">
                      <span className={info.color}>{info.label}</span> Services in {location.cityName}
                    </h2>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {catServices.map((s, i) => {
                      const detail = getServiceDetail(s.slug);
                      return (
                        <motion.div
                          key={s.id}
                          initial={{ opacity: 0, y: 15 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.04 }}
                        >
                          <Link
                            to={`/services/${s.category}/${s.slug}/${location.slug}`}
                            className="block neu-card rounded-2xl overflow-hidden group hover:shadow-lg transition-all duration-300 h-full"
                          >
                            {detail && (
                              <img src={detail.categoryImage} alt={`${s.title} in ${location.cityName}`} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                            )}
                            <div className="p-5">
                              <h3 className="font-display font-semibold text-foreground group-hover:text-accent transition-colors mb-1">{s.title}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Icon name={s.icon} className="w-4 h-4 text-accent" />
                                <p className="line-clamp-2">{s.shortDescription}</p>
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
          );
        })}

        {/* Trust */}
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

        {/* Nearby Cities */}
        <ScrollReveal variant="fadeUp">
          <section className="py-20">
            <div className="container mx-auto px-4">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">
                Also Serving <span className="font-serif-accent text-accent">Nearby</span> Cities
              </h2>
              <p className="text-muted-foreground text-center max-w-xl mx-auto mb-10">
                We provide the same fast, reliable service across the Greater Cleveland metro area.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {nearbyCities.map(city => (
                  <Link
                    key={city.id}
                    to={`/service-areas/${city.slug}`}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full neu-card text-sm hover:bg-foreground/5 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-accent" />
                    <span className="text-foreground font-medium">{city.cityName}</span>
                  </Link>
                ))}
                {getActiveLocations().length - nearbyCities.length - 1 > 0 && (
                  <div className="px-4 py-2.5 rounded-full neu-card text-sm text-accent font-semibold">
                    + {getActiveLocations().length - nearbyCities.length - 1} more
                  </div>
                )}
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
                  Locked Out in <span className="font-serif-accent text-accent">{location.cityName}</span>?
                </h2>
                <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                  We arrive in {brand.responseTime} with upfront pricing. No hidden fees. Licensed & insured.
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

export default CityLandingPage;
