import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, ArrowRight, Shield, Clock, Star, BadgeCheck } from "lucide-react";
import { Helmet } from "react-helmet-async";
import StickyHeader from "@/components/StickyHeader";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import ScrollReveal from "@/components/ScrollReveal";
import Breadcrumb from "@/components/Breadcrumb";
import { getServicesByCategory, type ServiceCategory } from "@/data/services";
import { useBrand } from "@/hooks/useCms";
import residentialImg from "@/assets/category-residential.jpg";
import commercialImg from "@/assets/category-commercial.jpg";
import automotiveImg from "@/assets/category-automotive.jpg";

const categories: { slug: ServiceCategory; label: string; headline: string; description: string; image: string; color: string }[] = [
  {
    slug: "residential",
    label: "Residential",
    headline: "Home Locksmith Services",
    description: "From lockouts to smart lock installation — we keep your family safe with professional residential locksmith services across Greater Cleveland.",
    image: residentialImg,
    color: "text-blue-400",
  },
  {
    slug: "commercial",
    label: "Commercial",
    headline: "Business Locksmith Services",
    description: "Grade-1 commercial locks, master key systems, access control, and emergency lockout services for Cleveland businesses.",
    image: commercialImg,
    color: "text-accent",
  },
  {
    slug: "automotive",
    label: "Automotive",
    headline: "Auto Locksmith Services",
    description: "Car lockouts, key replacement, transponder programming, and ignition repair — all on-site at a fraction of dealer prices.",
    image: automotiveImg,
    color: "text-red-500",
  },
];

export default function ServicesPage() {
  const brand = useBrand();
  return (
    <div className="min-h-screen bg-gradient-page">
      <Helmet>
        <title>All Locksmith Services Cleveland | Xcel Locksmith</title>
        <meta name="description" content="Browse all residential, commercial, and automotive locksmith services in Cleveland, OH. Licensed, insured, available 24/7 with 20–30 min response." />
        <link rel="canonical" href="https://xcellocksmith.com/services" />
      </Helmet>

      <StickyHeader />

      <main>
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Services" }]} />

        {/* Page Hero */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <motion.h1
              className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Our <span className="font-serif-accent text-accent">Locksmith Services</span>
            </motion.h1>
            <motion.p
              className="text-lg text-muted-foreground max-w-xl mx-auto mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Residential, commercial, and automotive — all backed by transparent pricing and 24/7 availability.
            </motion.p>
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
        </section>

        {/* Category Cards */}
        <ScrollReveal variant="fadeUp">
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-3 gap-8">
                {categories.map((cat, i) => {
                  const services = getServicesByCategory(cat.slug);
                  return (
                    <motion.div
                      key={cat.slug}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Link
                        to={`/services/${cat.slug}`}
                        className="block neu-card rounded-3xl overflow-hidden group hover:shadow-xl transition-all duration-300 h-full"
                      >
                        <div className="relative overflow-hidden">
                          <img
                            src={cat.image}
                            alt={cat.label}
                            className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-card/70 via-transparent to-transparent" />
                          <span className={`absolute bottom-4 left-4 font-display font-bold text-xl text-white`}>
                            {cat.label}
                          </span>
                        </div>
                        <div className="p-6">
                          <p className="text-sm text-muted-foreground mb-4">{cat.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{services.length} services</span>
                            <span className={`text-sm font-semibold flex items-center gap-1 ${cat.color} group-hover:gap-2 transition-all`}>
                              View all <ArrowRight className="w-4 h-4" />
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

        {/* CTA */}
        <ScrollReveal variant="scale">
          <section className="py-20">
            <div className="container mx-auto px-4 text-center">
              <div className="neu-card rounded-3xl p-10 md:p-16 max-w-3xl mx-auto">
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                  Need a <span className="font-serif-accent text-accent">Locksmith</span> Now?
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
}
