import { Phone, MapPin, Clock, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/xcel-logo.jpeg";
import { useLocations, useContact } from "@/hooks/useCms";
import EditableText from "@/components/cms/EditableText";
import EditLink from "@/components/cms/EditLink";

const Footer = () => {
  const locations = useLocations();
  const contact = useContact();
  const cities = locations.filter(l => l.isActive).slice(0, 8);
  const totalCities = locations.filter(l => l.isActive).length;

  return (
    <footer className="border-t border-border py-16">
      <div className="container mx-auto px-4">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <img src={logo} alt="Xcel Locksmith" className="h-16 w-auto mb-4" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Cleveland's most trusted 24/7 locksmith. Licensed, insured, and committed to transparent pricing.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display text-lg font-bold mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/services/residential" className="text-muted-foreground hover:text-foreground transition-colors">Residential Locksmith</Link></li>
              <li><Link to="/services/commercial" className="text-muted-foreground hover:text-foreground transition-colors">Commercial Locksmith</Link></li>
              <li><Link to="/services/automotive" className="text-muted-foreground hover:text-foreground transition-colors">Automotive Locksmith</Link></li>
              <li><Link to="/services/residential/house-lockout-services" className="text-muted-foreground hover:text-foreground transition-colors">Emergency Lockouts</Link></li>
              <li><Link to="/services/residential/lock-rekeying" className="text-muted-foreground hover:text-foreground transition-colors">Lock Rekeying</Link></li>
              <li><Link to="/services/residential/key-duplication-spare-keys" className="text-muted-foreground hover:text-foreground transition-colors">Key Duplication</Link></li>
            </ul>
          </div>

          {/* Areas */}
          <div>
            <h4 className="font-display text-lg font-bold mb-4">Service Areas</h4>
            <ul className="space-y-2 text-sm">
              {cities.map(city => (
                <li key={city.id}>
                  <Link to={`/service-areas/${city.slug}`} className="text-muted-foreground hover:text-foreground transition-colors">
                    {city.cityName}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/service-areas" className="text-accent hover:text-accent/80 font-medium transition-colors">
                  View all {totalCities} cities →
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-bold mb-4">
              Contact Us 24/7
              <EditLink entityType="global" entitySlug="site-settings" className="ml-2 align-middle" />
            </h4>
            <div className="space-y-3 text-sm">
              <a href={contact.phone} className="flex items-center gap-2 text-accent font-semibold hover:text-blue-glow transition-colors">
                <Phone className="w-4 h-4" />
                <EditableText
                  value={contact.phoneDisplay}
                  field="phone"
                  entityType="global"
                  entitySlug="site-settings"
                  cacheKey={['cms', 'site-settings']}
                />
              </a>
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{contact.address}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" /> {contact.hours}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="w-4 h-4" /> Licensed & Insured
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Xcel Locksmith. All rights reserved. Licensed in the State of Ohio.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
