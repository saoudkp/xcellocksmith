import { useState, useCallback } from "react";
import { Phone, ChevronDown } from "lucide-react";
import * as Icons from "lucide-react";
import { motion } from "framer-motion";
import { useBrand, useHeroSettings, type HeroConfig } from "@/hooks/useCms";
import type { BrandConfig } from "@/data/siteConfig";
import HeroLockAnimation from "./HeroLockAnimation";
import EditableText from "@/components/cms/EditableText";
import EditLink from "@/components/cms/EditLink";

/** Render any Lucide icon by string name */
const DynIcon = ({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) => {
  const LucideIcon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>>)[name] || Icons.HelpCircle;
  return <LucideIcon className={className} style={style} />;
};

const HeroSection = () => {
  const [progress, setProgress] = useState(0);
  const brand = useBrand();
  const hero = useHeroSettings();
  const handleProgress = useCallback((p: number) => setProgress(p), []);

  return (
    <section className="relative overflow-hidden">
      <div className="md:hidden relative min-h-screen flex items-end pb-12 pt-28">
        <div className="absolute inset-0 bg-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.8)_100%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <HeroContentMobile brand={brand} hero={hero} />
        </div>
      </div>

      <div className="hidden md:block">
        <HeroLockAnimation onProgress={handleProgress}>
          <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black via-black/70 to-transparent pointer-events-none z-[1]" />
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 to-transparent pointer-events-none z-[1]" />
          <div className="absolute inset-0 flex flex-col justify-end z-[2]">
            <div className="container mx-auto px-4 pb-10">
              <HeroContentDesktop progress={progress} brand={brand} hero={hero} />
            </div>
          </div>
          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-[3]"
            style={{ opacity: Math.max(0, 1 - progress * 5), pointerEvents: "none" }}
          >
            <span className="text-xs font-medium text-white/50 tracking-widest uppercase">Scroll</span>
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
              <ChevronDown className="w-5 h-5 text-white/30" />
            </motion.div>
          </div>
        </HeroLockAnimation>
      </div>
    </section>
  );
};

interface HeroProps {
  brand: BrandConfig;
  hero: HeroConfig;
}

const HeroContentDesktop = ({ progress, brand, hero }: HeroProps & { progress: number }) => {
  const stagger = (index: number, total: number) => {
    const start = 0.15 + (index / total) * 0.35;
    const localP = Math.max(0, Math.min(1, (progress - start) / 0.2));
    const eased = localP * localP * (3 - 2 * localP);
    return { opacity: eased, transform: `translateY(${(1 - eased) * 30}px)`, transition: "none" };
  };

  return (
    <div className="max-w-7xl mx-auto relative">
      <EditLink entityType="global" entitySlug="hero-settings" label="Edit Hero" className="absolute -top-8 right-0" />
      <div className="flex items-end justify-between gap-8">
        <div className="max-w-2xl">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4" style={stagger(0, 6)}>
            {hero.badges.map((badge, i) => (
              <div key={i} className="px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase text-white/80 bg-white/[0.07] backdrop-blur-xl border border-white/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                <DynIcon name={badge.icon} className="w-3 h-3 text-accent" />
                <EditableText
                  value={badge.text}
                  field={`badges.${i}.text`}
                  fieldPath={`badges.${i}.text`}
                  entityType="global"
                  entitySlug="hero-settings"
                  cacheKey={['cms', 'hero-settings']}
                />
              </div>
            ))}
          </div>

          {/* Headline */}
          <h1
            style={{ ...stagger(1, 6), textShadow: "0 2px 20px rgba(0,0,0,0.6), 0 0 40px rgba(0,0,0,0.3)" }}
            className="font-extrabold tracking-tight leading-[1.05] text-4xl lg:text-5xl xl:text-6xl"
          >
            <EditableText
              value={hero.headlineLine1.text}
              field="headlineLine1.text"
              fieldPath="headlineLine1.text"
              entityType="global"
              entitySlug="hero-settings"
              cacheKey={['cms', 'hero-settings']}
              as="span"
              className={hero.headlineLine1.font}
              style={{ color: hero.headlineLine1.color }}
            />
            <br />
            <EditableText
              value={hero.headlineAccent.text}
              field="headlineAccent.text"
              fieldPath="headlineAccent.text"
              entityType="global"
              entitySlug="hero-settings"
              cacheKey={['cms', 'hero-settings']}
              as="span"
              className={hero.headlineAccent.font}
              style={{ color: hero.headlineAccent.color, textShadow: `0 0 30px ${hero.headlineAccent.color}50, 0 0 60px ${hero.headlineAccent.color}20` }}
            />{" "}
            <EditableText
              value={hero.headlineLine2.text}
              field="headlineLine2.text"
              fieldPath="headlineLine2.text"
              entityType="global"
              entitySlug="hero-settings"
              cacheKey={['cms', 'hero-settings']}
              as="span"
              className={hero.headlineLine2.font}
              style={{ color: hero.headlineLine2.color }}
            />
          </h1>

          {/* Subtitle */}
          <p
            className={`text-sm lg:text-base max-w-lg mt-4 leading-relaxed font-light tracking-wide ${hero.subtitle.font}`}
            style={{ ...stagger(2, 6), color: `${hero.subtitle.color}88`, textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}
          >
            <EditableText
              value={hero.subtitle.text}
              field="subtitle.text"
              fieldPath="subtitle.text"
              entityType="global"
              entitySlug="hero-settings"
              cacheKey={['cms', 'hero-settings']}
            />
            <strong className="font-semibold" style={{ color: hero.subtitleBold.color }}>
              {" "}
              <EditableText
                value={hero.subtitleBold.text}
                field="subtitleBold.text"
                fieldPath="subtitleBold.text"
                entityType="global"
                entitySlug="hero-settings"
                cacheKey={['cms', 'hero-settings']}
              />
            </strong>
          </p>
        </div>

        {/* Right column */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          {/* Response time */}
          <div className="flex items-center gap-3 bg-white/[0.06] backdrop-blur-xl px-4 py-2.5 rounded-xl border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.3)]" style={stagger(3, 6)}>
            <div className="w-9 h-9 rounded-full bg-accent/15 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <DynIcon name="Clock" className="w-4 h-4 text-accent" />
            </div>
            <div className="text-left">
              <p className="text-accent font-display text-lg font-bold" style={{ textShadow: "0 0 12px rgba(59,130,246,0.4)" }}>{brand.responseTime}</p>
              <p className="text-[10px] tracking-wider uppercase" style={{ color: `${hero.responseLabel.color}55` }}>
                <EditableText
                  value={hero.responseLabel.text}
                  field="responseLabel.text"
                  fieldPath="responseLabel.text"
                  entityType="global"
                  entitySlug="hero-settings"
                  cacheKey={['cms', 'hero-settings']}
                />
              </p>
            </div>
          </div>

          {/* CTAs */}
          <a href={brand.phoneNumber} className="touch-target flex items-center justify-center gap-3 glass-cta-red text-white font-bold text-base px-7 py-3.5 rounded-xl w-full" style={stagger(4, 6)}>
            <Phone className="w-5 h-5" />
            <EditableText
              value={hero.ctaPrimaryText}
              field="ctaPrimaryText"
              entityType="global"
              entitySlug="hero-settings"
              cacheKey={['cms', 'hero-settings']}
            />{" "}{brand.phoneDisplay}
          </a>
          <a href="#quote" className="touch-target flex items-center justify-center gap-2 bg-white/[0.1] backdrop-blur-xl hover:bg-white/[0.18] text-white font-semibold px-7 py-3 rounded-xl transition-all border border-white/[0.15] w-full text-center text-sm shadow-[0_2px_16px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.1)]" style={stagger(4, 6)}>
            <EditableText
              value={hero.ctaSecondaryText}
              field="ctaSecondaryText"
              entityType="global"
              entitySlug="hero-settings"
              cacheKey={['cms', 'hero-settings']}
            />
          </a>

          {/* Category links */}
          <div className="flex gap-2" style={stagger(5, 6)}>
            {hero.categoryLinks.map((item, i) => (
              <a href={item.href || `#${item.label.toLowerCase()}`} key={i} className="group bg-white/[0.05] hover:bg-white/[0.1] transition-all duration-300 backdrop-blur-xl rounded-lg px-4 py-2 text-center border border-white/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.25)] hover:shadow-[0_4px_15px_rgba(0,0,0,0.4)] flex flex-col items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer">
                <DynIcon name={item.icon} className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" style={{ color: item.color, filter: `drop-shadow(0 0 8px ${item.color}66)` }} />
                <p className="text-[9px] text-white/40 group-hover:text-white/70 transition-colors font-medium tracking-wider uppercase">{item.label}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const HeroContentMobile = ({ brand, hero }: HeroProps) => (
  <div className="max-w-lg mx-auto text-center">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-wrap justify-center gap-2 mb-6">
      {hero.badges.slice(0, 3).map((badge, i) => (
        <div key={i} className="px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold text-white/90 bg-white/10 backdrop-blur-md border border-white/15">
          <DynIcon name={badge.icon} className="w-3 h-3 text-accent" />
          {badge.text}
        </div>
      ))}
    </motion.div>

    <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="font-extrabold tracking-tight mb-4 leading-[1.1] text-3xl sm:text-4xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
      <span className={hero.headlineLine1.font} style={{ color: hero.headlineLine1.color }}>{hero.headlineLine1.text}</span>
      <br />
      <span className={hero.headlineAccent.font} style={{ color: hero.headlineAccent.color, filter: `drop-shadow(0 0 20px ${hero.headlineAccent.color}40)` }}>{hero.headlineAccent.text}</span>
      {" "}
      <span className={hero.headlineLine2.font} style={{ color: hero.headlineLine2.color }}>{hero.headlineLine2.text}</span>
    </motion.h1>

    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="text-sm max-w-sm mx-auto mb-6 leading-relaxed" style={{ color: `${hero.subtitle.color}80` }}>
      {hero.subtitle.text}
      <strong style={{ color: `${hero.subtitleBold.color}ee` }}> {hero.subtitleBold.text}</strong>
    </motion.p>

    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="flex flex-col gap-3">
      <a href={brand.phoneNumber} className="touch-target flex items-center justify-center gap-3 glass-cta-red text-white font-bold text-base px-6 py-4 rounded-xl">
        <Phone className="w-5 h-5" />{hero.ctaPrimaryText} {brand.phoneDisplay}
      </a>
      <a href="#quote" className="touch-target flex items-center justify-center gap-2 bg-white/[0.1] backdrop-blur-xl hover:bg-white/[0.18] text-white font-semibold px-6 py-3 rounded-xl transition-all border border-white/[0.15] shadow-[0_2px_16px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.1)]">
        {hero.ctaSecondaryText}
      </a>
    </motion.div>

    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.7 }} className="mt-8 grid grid-cols-3 gap-3">
      {hero.categoryLinks.map((item, i) => (
        <a href={item.href || `#${item.label.toLowerCase()}`} key={i} className="group glass-card hover:bg-white/15 transition-all duration-300 rounded-lg p-3 text-center border border-white/10 flex flex-col items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer">
          <DynIcon name={item.icon} className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" style={{ color: item.color, filter: `drop-shadow(0 0 8px ${item.color}66)` }} />
          <p className="text-[10px] text-white/50 group-hover:text-white/80 transition-colors font-medium tracking-wider uppercase">{item.label}</p>
        </a>
      ))}
    </motion.div>
  </div>
);

export default HeroSection;
