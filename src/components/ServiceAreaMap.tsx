import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useLocations, useBrand, useSectionsSettings } from "@/hooks/useCms";
import SectionHeader from "@/components/SectionHeader";
import "leaflet/dist/leaflet.css";

const ServiceAreaMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const activeLocations = useLocations();
  const brand = useBrand();
  const sectionsSettings = useSectionsSettings();

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    let cancelled = false;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      // If the effect was cleaned up while we were awaiting the import, bail out
      if (cancelled || mapInstance.current) return;

      delete (L.Icon.Default.prototype as any)._getIconUrl;

      const map = L.map(mapRef.current!, {
        center: [41.45, -81.75],
        zoom: 10,
        scrollWheelZoom: false,
        zoomControl: false,
      });

      // Add zoom control to bottom-right
      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Dark-themed tile layer
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      // Golden-red key SVG marker
      const keyIcon = L.divIcon({
        className: "custom-key-marker",
        html: `<div style="
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #D4A017 0%, #E31B23 100%);
          border-radius: 50%;
          border: 2px solid rgba(255,215,0,0.6);
          box-shadow: 0 0 12px rgba(212,160,23,0.5), 0 0 24px rgba(227,27,35,0.3), 0 2px 8px rgba(0,0,0,0.4);
          animation: marker-pulse 2.5s ease-in-out infinite;
        ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/>
          </svg>
        </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20],
      });

      // Enhanced popups
      activeLocations.forEach((loc) => {
        L.marker([loc.lat, loc.lng], { icon: keyIcon })
          .addTo(map)
          .bindPopup(
            `<div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width: 180px;">
              <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px; color: #1a1a2e;">${loc.cityName}</div>
              <div style="font-size: 12px; color: #555; margin-bottom: 8px;">Xcel Locksmith serves this area</div>
              <div style="display: flex; gap: 6px; align-items: center; font-size: 11px; color: #E31B23; font-weight: 600;">
                <span>⏱ 20–30 min response</span>
              </div>
              <div style="display: flex; gap: 6px; margin-top: 8px;">
                <a href="${brand.phoneNumber}" style="
                  flex: 1; text-align: center; padding: 6px 8px;
                  background: linear-gradient(135deg, #E31B23, #c41720); color: white;
                  border-radius: 8px; font-size: 11px; font-weight: 700; text-decoration: none;
                ">📞 Call Now</a>
                <a href="/service-areas/${loc.slug}" style="
                  flex: 1; text-align: center; padding: 6px 8px;
                  background: #f0f0f0; color: #1a1a2e;
                  border-radius: 8px; font-size: 11px; font-weight: 700; text-decoration: none;
                ">View Services →</a>
              </div>
            </div>`,
            { className: "custom-popup" }
          );
      });

      // Service area radius circle
      L.circle([41.4993, -81.6944], {
        radius: 35000,
        color: "rgba(212,160,23,0.4)",
        fillColor: "rgba(227,27,35,0.08)",
        fillOpacity: 0.3,
        weight: 1.5,
        dashArray: "8, 6",
      }).addTo(map);

      mapInstance.current = map;
    };

    initMap();

    return () => {
      cancelled = true;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [activeLocations, brand]);

  return (
    <section id="service-area" className="py-20 relative overflow-hidden">
      <style>{`
        @keyframes marker-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 12px rgba(212,160,23,0.5), 0 0 24px rgba(227,27,35,0.3); }
          50% { transform: scale(1.1); box-shadow: 0 0 18px rgba(212,160,23,0.7), 0 0 36px rgba(227,27,35,0.4); }
        }
        .custom-key-marker { background: none !important; border: none !important; }
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.2);
          border: 1px solid rgba(212,160,23,0.2);
        }
        .custom-popup .leaflet-popup-tip { box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
      `}</style>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_hsla(218,46%,20%,0.15)_0%,_transparent_70%)]" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <SectionHeader 
            heading={sectionsSettings.serviceArea.heading}
            subheading={sectionsSettings.serviceArea.subheading}
            sectionKey="serviceArea"
            className="mb-12"
            richHeading={sectionsSettings.serviceArea.richHeading}
            richSubheading={sectionsSettings.serviceArea.richSubheading}
          />
        </motion.div>

        <div className="neu-card rounded-2xl overflow-hidden relative">
          <div ref={mapRef} className="w-full h-[450px] md:h-[550px]" />
          {/* Map legend */}
          <div className="absolute bottom-4 left-4 z-[1000] glass-card rounded-xl px-4 py-3 flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#D4A017] to-[#E31B23] border border-yellow-500/50" />
              <span className="text-xs font-medium text-foreground/80">Service location</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-dashed border-[#D4A017]/50 bg-[#E31B23]/10" />
              <span className="text-xs font-medium text-foreground/80">Coverage area</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {activeLocations.map((loc) => (
            <Link
              key={loc.id}
              to={`/service-areas/${loc.slug}`}
              className="skeu-badge px-3 py-1.5 rounded-full text-xs text-foreground font-medium flex items-center gap-1 hover:bg-accent/10 transition-colors"
            >
              <MapPin className="w-3 h-3 text-accent" />
              {loc.cityName}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceAreaMap;
