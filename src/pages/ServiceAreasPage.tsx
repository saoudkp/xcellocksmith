import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Phone, Clock, Shield, ChevronRight } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import { getActiveLocations } from "@/data/locations";
import { defaultBrand } from "@/data/siteConfig";
import StickyHeader from "@/components/StickyHeader";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import ServiceAreaMap from "@/components/ServiceAreaMap";

const ServiceAreasPage = () => {
  const locations = getActiveLocations();

  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: defaultBrand.name,
    telephone: defaultBrand.phoneNumber,
    areaServed: locations.map((loc) => ({
      "@type": "City",
      name: `${loc.cityName}, OH`,
    })),
  };

  return (
    <>
      <Helmet>
        <title>Service Areas | 24/7 Locksmith in Cleveland & Surrounding Cities</title>
        <meta
          name="description"
          content={`Xcel Locksmith serves ${locations.length} cities across the Cleveland metro area. 20-30 min response. Licensed & insured. Call 24/7!`}
        />
        <link rel="canonical" href="https://xcellocksmith.com/service-areas" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Service Areas | 24/7 Locksmith in Cleveland & Surrounding Cities" />
        <meta property="og:description" content={`Xcel Locksmith serves ${locations.length} cities across the Cleveland metro area. 20-30 min response. Licensed & insured. Call 24/7!`} />
        <meta property="og:url" content="https://xcellocksmith.com/service-areas" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Service Areas | 24/7 Locksmith in Cleveland & Surrounding Cities" />
        <meta name="twitter:description" content={`Xcel Locksmith serves ${locations.length} cities across the Cleveland metro area. 20-30 min response. Licensed & insured. Call 24/7!`} />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <StickyHeader />
      <ScrollToTop />

      <main className="min-h-screen bg-background pt-20">
        <Breadcrumb items={[
          { label: "Home", href: "/" },
          { label: "Service Areas" },
        ]} />

        {/* Hero */}
        <section className="py-12 md:py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsla(0,80%,45%,0.08)_0%,_transparent_60%)]" />
          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-accent/10 text-accent border border-accent/20 mb-6">
                {locations.length} Cities Served
              </span>
              <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
                Our <span className="font-serif-accent text-accent">Service Areas</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
                Fast, reliable locksmith services across the entire Cleveland metropolitan area. 
                We arrive in 20–30 minutes, 24/7.
              </p>
              <a
                href={`tel:${defaultBrand.phoneNumber}`}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-accent text-accent-foreground font-bold text-lg shadow-lg hover:shadow-accent/30 transition-all hover:scale-105"
              >
                <Phone className="w-5 h-5" />
                Call Now — {defaultBrand.phoneDisplay}
              </a>
            </motion.div>
          </div>
        </section>

        {/* Trust badges */}
        <section className="py-8 border-y border-border/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Clock, label: "20–30 Min Response" },
                { icon: Shield, label: "Licensed & Insured" },
                { icon: Phone, label: "24/7 Availability" },
                { icon: MapPin, label: `${locations.length} Cities Covered` },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-center justify-center gap-3 text-sm font-medium text-muted-foreground"
                >
                  <item.icon className="w-5 h-5 text-accent" />
                  {item.label}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Map */}
        <ServiceAreaMap />

        {/* Cities Grid */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                All <span className="font-serif-accent text-accent">Service Locations</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Click any city to see available services and local details.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {locations.map((loc, i) => (
                <motion.div
                  key={loc.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(i * 0.03, 0.5) }}
                >
                  <Link
                    to={`/service-areas/${loc.slug}`}
                    className="group block neu-card rounded-xl p-5 hover:border-accent/30 transition-all duration-300 hover:shadow-lg hover:shadow-accent/5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-accent" />
                          <h3 className="font-display font-bold text-foreground group-hover:text-accent transition-colors">
                            {loc.cityName}
                          </h3>
                        </div>
                        <p className="text-xs text-muted-foreground">Ohio</p>
                      </div>
                      <div className="text-xs font-medium text-accent/70 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        20–30 min
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-xs font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                      View services <ChevronRight className="w-3 h-3" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsla(0,80%,45%,0.1)_0%,_transparent_70%)]" />
          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Don't See Your City?
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto mb-8">
                We may still serve your area. Call us and we'll let you know our availability and estimated arrival time.
              </p>
              <a
                href={`tel:${defaultBrand.phoneNumber}`}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-accent text-accent-foreground font-bold text-lg shadow-lg hover:shadow-accent/30 transition-all hover:scale-105"
              >
                <Phone className="w-5 h-5" />
                {defaultBrand.phoneDisplay}
              </a>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default ServiceAreasPage;
