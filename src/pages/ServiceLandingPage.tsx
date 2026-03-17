import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Phone, ArrowRight, ChevronRight, Shield, Clock, CheckCircle2, Star, MapPin, BadgeCheck } from "lucide-react";
import StickyHeader from "@/components/StickyHeader";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import ScrollReveal from "@/components/ScrollReveal";
import Breadcrumb from "@/components/Breadcrumb";
import { getServiceBySlug, services, type Service } from "@/data/services";
import { getServiceDetail } from "@/data/serviceDetails";
import { faqs } from "@/data/faqs";
import { getActiveLocations, getLocationBySlug } from "@/data/locations";
import * as Icons from "lucide-react";
import ComparisonSlider from "@/components/ComparisonSlider";
import { useBrand, useGalleryItems } from "@/hooks/useCms";

// Helper to reliably render any Lucide icon by string name
const Icon = ({ name, className }: { name: string; className?: string }) => {
  const LucideIcon = (Icons as any)[name] || Icons.HelpCircle;
  return <LucideIcon className={className} />;
};
import staticBeforeImg from "@/assets/gallery/before-1.jpg";
import staticAfterImg from "@/assets/gallery/after-1.jpg";

const ServiceLandingPage = () => {
  const { slug, citySlug } = useParams<{ slug: string; citySlug?: string }>();
  const service = slug ? getServiceBySlug(slug) : null;
  const detail = slug ? getServiceDetail(slug) : null;
  const brand = useBrand();
  const galleryItems = useGalleryItems();
  const galleryItem = galleryItems?.[0];
  const beforeImg = galleryItem?.before || staticBeforeImg;
  const afterImg = galleryItem?.after || staticAfterImg;

  const cityLocation = citySlug ? getLocationBySlug(citySlug) : null;
  const cityName = cityLocation?.cityName || "Cleveland";

  if (!service || !detail) {
    return (
      <div className="min-h-screen bg-gradient-page">
        <StickyHeader />
        <main className="pt-32 pb-20 text-center container mx-auto px-4">
          <h1 className="font-display text-4xl font-bold mb-4">Service Not Found</h1>
          <p className="text-muted-foreground mb-8">The service you're looking for doesn't exist.</p>
          <Link to="/" className="skeu-cta-red text-white font-bold px-6 py-3 rounded-xl inline-flex items-center gap-2">
            Back to Home <ArrowRight className="w-4 h-4" />
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const relatedServices = services
    .filter(s => s.category === service.category && s.slug !== service.slug && s.isActive)
    .slice(0, 3);

  const relevantFaqs = faqs.slice(0, 4);
  const activeCities = getActiveLocations().slice(0, 8);

  const categoryLabel = service.category === "residential" ? "Residential" : service.category === "commercial" ? "Commercial" : "Automotive";
  const categoryColor = service.category === "residential" ? "text-blue" : service.category === "commercial" ? "text-accent" : "text-cta-red";

  const pageTitle = `${service.title} in ${cityName} | Xcel Locksmith`;
  const pageDescription = `${detail.longDescription?.slice(0, 155) || service.shortDescription}`;
  const pageUrl = citySlug
    ? `https://xcellocksmith.com/services/${service.category}/${service.slug}/${citySlug}`
    : `https://xcellocksmith.com/services/${service.category}/${service.slug}`;
  const pageImage = detail.categoryImage || "";

  return (
    <div className="min-h-screen bg-gradient-page">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={pageImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={pageImage} />
      </Helmet>
      <StickyHeader />

      <main>
        <Breadcrumb items={[
          { label: "Home", href: "/" },
          ...(citySlug ? [{ label: cityName, href: `/service-areas/${citySlug}` }] : []),
          { label: `${categoryLabel} Services`, href: `/services/${service.category}` },
          { label: service.title },
        ]} />

        {/* ─── Hero Section ─── */}
        <section className="relative overflow-hidden pb-16">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              {/* Content */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider neu-card ${categoryColor}`}>
                    <BadgeCheck className="w-3.5 h-3.5" />
                    {categoryLabel}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider neu-card text-accent">
                    <Clock className="w-3.5 h-3.5" />
                    {brand.responseTime} Response
                  </span>
                </div>

                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  {service.title}
                  <span className="block font-serif-accent text-accent mt-2">in {cityName}, OH</span>
                </h1>

                <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl">
                  {detail.longDescription}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-4">
                  <motion.a
                    href={brand.phoneNumber}
                    className="glass-cta-red text-white font-bold px-8 py-4 rounded-2xl inline-flex items-center gap-3 text-lg"
                    animate={{ scale: [1, 1.03, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Phone className="w-5 h-5" />
                    {detail.ctaText} — {brand.phoneDisplay}
                  </motion.a>
                  <a
                    href="/#quote"
                    className="neu-card px-8 py-4 rounded-2xl inline-flex items-center gap-3 text-lg font-semibold text-foreground hover:bg-foreground/5 transition-colors border border-border"
                  >
                    Get a Free Quote
                    <ArrowRight className="w-5 h-5" />
                  </a>
                </div>
              </motion.div>

              {/* Hero Image */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="rounded-3xl overflow-hidden neu-card">
                  <img
                    src={detail.categoryImage}
                    alt={`${service.title} service in ${cityName}, OH`}
                    className="w-full h-[350px] md:h-[450px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/60 via-transparent to-transparent rounded-3xl" />
                </div>
                {/* Floating price badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -bottom-5 -left-5 neu-card rounded-2xl p-5 glass-card-strong"
                >
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Starting at</p>
                  <div className="flex items-center justify-center bg-background rounded-full p-3 shadow-neumorphic w-16 h-16 ml-auto">
                    <Icon name={service.icon} className={`w-8 h-8 ${categoryColor}`} />
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── Benefits Section ─── */}
        <ScrollReveal variant="fadeUp">
          <section className="py-20 relative">
            <div className="container mx-auto px-4">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">
                Why Choose <span className="font-serif-accent text-accent">Xcel</span>
              </h2>
              <p className="text-muted-foreground text-center max-w-xl mx-auto mb-12">
                Every job backed by transparent pricing, licensed technicians, and our satisfaction guarantee.
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {detail.benefits.map((benefit, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="neu-card rounded-2xl p-6 text-center group hover:shadow-lg transition-all duration-300"
                  >
                    <div className="w-12 h-12 mx-auto mb-4 rounded-xl skeu-badge flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-accent" />
                    </div>
                    <p className="font-display font-semibold text-foreground">{benefit}</p>
                  </motion.div>
                ))}
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center justify-center gap-6 mt-14">
                {[
                  { icon: Shield, label: "Licensed & Insured" },
                  { icon: Clock, label: "24/7/365 Availability" },
                  { icon: Star, label: "5-Star Rated" },
                  { icon: BadgeCheck, label: "No Hidden Fees" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full neu-card text-sm text-muted-foreground">
                    <Icon className="w-4 h-4 text-accent" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ─── Pricing Transparency ─── */}
        <ScrollReveal variant="fadeIn">
          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="neu-card rounded-3xl overflow-hidden">
                <div className="grid lg:grid-cols-2">
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                      Transparent <span className="font-serif-accent text-accent">Pricing</span>
                    </h2>
                    <p className="text-muted-foreground mb-8 leading-relaxed">
                      No bait-and-switch, no hidden fees. We quote a fair price before any work begins — and that's the price you pay. Period.
                    </p>

                    <div className="space-y-4 mb-8">
                      {[
                        { label: service.title, price: <Icon name={service.icon} className="w-4 h-4 text-accent" /> },
                        { label: "Emergency / After-hours", price: "No extra charge" },
                        { label: "Service call / trip fee", price: "Included" },
                        { label: "Estimate", price: "Free" },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between py-3 border-b border-border/50">
                          <span className="text-foreground font-medium">{item.label}</span>
                          <span className="font-display font-bold text-accent">{item.price}</span>
                        </div>
                      ))}
                    </div>

                    <a
                      href={brand.phoneNumber}
                      className="glass-cta-red text-white font-bold px-8 py-4 rounded-2xl inline-flex items-center gap-3 w-fit"
                    >
                      <Phone className="w-5 h-5" />
                      Get Your Exact Quote
                    </a>
                  </div>

                  <div className="relative h-64 lg:h-auto">
                    <img
                      src={detail.categoryImage}
                      alt={`${service.title} pricing`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-card via-card/50 to-transparent lg:block hidden" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ─── Before & After Gallery ─── */}
        <ScrollReveal variant="scale">
          <section className="py-20">
            <div className="container mx-auto px-4">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">
                Our <span className="font-serif-accent text-accent">Work</span>
              </h2>
              <p className="text-muted-foreground text-center max-w-xl mx-auto mb-12">
                See the quality of our craftsmanship — drag the slider to compare before and after.
              </p>

              <div className="max-w-2xl mx-auto neu-card rounded-3xl overflow-hidden">
                <ComparisonSlider
                  before={beforeImg}
                  after={afterImg}
                  beforeLabel="Before"
                  afterLabel="After"
                />
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ─── Service Area ─── */}
        <ScrollReveal variant="fadeUp">
          <section className="py-20">
            <div className="container mx-auto px-4">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">
                Serving <span className="font-serif-accent text-accent">{cityName}</span> & Beyond
              </h2>
              <p className="text-muted-foreground text-center max-w-xl mx-auto mb-10">
                  {service.title} available across 24 cities in the Greater {cityName} metro area.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                {activeCities.map((city) => (
                  <div key={city.id} className="flex items-center gap-2 px-4 py-2.5 rounded-full neu-card text-sm">
                    <MapPin className="w-3.5 h-3.5 text-accent" />
                    <span className="text-foreground font-medium">{city.cityName}</span>
                  </div>
                ))}
                <div className="px-4 py-2.5 rounded-full neu-card text-sm text-accent font-semibold">
                  + {getActiveLocations().length - 8} more cities
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ─── Related Services ─── */}
        <ScrollReveal variant="fadeIn">
          <section className="py-20">
            <div className="container mx-auto px-4">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">
                Related <span className="font-serif-accent text-accent">Services</span>
              </h2>
              <p className="text-muted-foreground text-center max-w-xl mx-auto mb-12">
                Other {categoryLabel.toLowerCase()} locksmith services you might need.
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedServices.map((rs, i) => {
                  const rsDetail = getServiceDetail(rs.slug);
                  return (
                    <motion.div
                      key={rs.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Link
                        to={`/services/${rs.category}/${rs.slug}`}
                        className="block neu-card rounded-2xl overflow-hidden group hover:shadow-lg transition-all duration-300"
                      >
                        {rsDetail && (
                          <img
                            src={rsDetail.categoryImage}
                            alt={rs.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        )}
                        <div className="p-6">
                          <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-accent transition-colors mb-2">
                            {rs.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{rs.shortDescription}</p>
                          <div className="flex items-center justify-between">
                            <Icon name={rs.icon} className={`w-5 h-5 ${categoryColor}`} />
                            <span className="text-xs text-muted-foreground group-hover:text-accent transition-colors flex items-center gap-1">
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

        {/* ─── FAQ Section ─── */}
        <ScrollReveal variant="fadeUp">
          <section className="py-20">
            <div className="container mx-auto px-4 max-w-3xl">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">
                Frequently Asked <span className="font-serif-accent text-accent">Questions</span>
              </h2>
              <p className="text-muted-foreground text-center mb-12">
                Common questions about {service.title.toLowerCase()} in {cityName}.
              </p>

              <div className="space-y-4">
                {relevantFaqs.map((faq) => (
                  <details key={faq.id} className="neu-card rounded-2xl group">
                    <summary className="cursor-pointer px-6 py-5 font-display font-semibold text-foreground flex items-center justify-between list-none">
                      {faq.question}
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-open:rotate-90 transition-transform" />
                    </summary>
                    <div className="px-6 pb-5 text-muted-foreground leading-relaxed border-t border-border/30 pt-4">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ─── Final CTA ─── */}
        <ScrollReveal variant="scale">
          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="neu-card rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-cta-red/5" />
                <div className="relative">
                  <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
                    Need {service.title}?
                  </h2>
                  <p className="font-serif-accent text-xl md:text-2xl text-accent mb-2">
                    {cityName}'s Fastest Response — {brand.responseTime}
                  </p>
                  <p className="text-muted-foreground max-w-xl mx-auto mb-10">
                    Licensed, insured, no hidden fees. Call now or get a free quote online.
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-4">
                    <motion.a
                      href={brand.phoneNumber}
                      className="glass-cta-red text-white font-bold px-10 py-5 rounded-2xl inline-flex items-center gap-3 text-lg"
                      animate={{ scale: [1, 1.04, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Phone className="w-6 h-6" />
                      Call {brand.phoneDisplay}
                    </motion.a>
                    <a
                      href="/#quote"
                      className="neu-card px-10 py-5 rounded-2xl inline-flex items-center gap-3 text-lg font-semibold text-foreground hover:bg-foreground/5 transition-colors border border-border"
                    >
                      Get a Free Quote
                      <ArrowRight className="w-5 h-5" />
                    </a>
                  </div>
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

export default ServiceLandingPage;
