import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2 } from "lucide-react";
import ComparisonSlider from "./ComparisonSlider";
import { useGalleryItems, useSectionsSettings, type GalleryItem as CmsGalleryItem } from "@/hooks/useCms";
import SectionHeader from "@/components/SectionHeader";
import EditLink from "@/components/cms/EditLink";

import before1 from "@/assets/gallery/before-1.jpg";
import after1 from "@/assets/gallery/after-1.jpg";
import before2 from "@/assets/gallery/before-2.jpg";
import after2 from "@/assets/gallery/after-2.jpg";
import before3 from "@/assets/gallery/before-3.jpg";
import after3 from "@/assets/gallery/after-3.jpg";

interface GalleryItem {
  id: number | string;
  title: string;
  category: string;
  subcategory?: string;
  before: string;
  after: string;
}

const fallbackGalleryItems: GalleryItem[] = [
  { id: 1, title: "Deadbolt Replacement", category: "Residential", subcategory: "Deadbolt Replacement", before: before1, after: after1 },
  { id: 2, title: "Front Door Lock Rekey", category: "Residential", subcategory: "Lock Rekeying", before: before1, after: after1 },
  { id: 3, title: "Smart Lock Installation", category: "Residential", subcategory: "Smart Lock Installation", before: before1, after: after1 },
  { id: 4, title: "Car Lock Cylinder Repair", category: "Automotive", subcategory: "Lock Cylinder Repair", before: before2, after: after2 },
  { id: 5, title: "Transponder Key Programming", category: "Automotive", subcategory: "Transponder Key Programming", before: before2, after: after2 },
  { id: 6, title: "Ignition Lock Replacement", category: "Automotive", subcategory: "Ignition Lock Replacement", before: before2, after: after2 },
  { id: 7, title: "Access Control Upgrade", category: "Commercial", subcategory: "Access Control", before: before3, after: after3 },
  { id: 8, title: "Office Master Key System", category: "Commercial", subcategory: "Master Key System", before: before3, after: after3 },
  { id: 9, title: "Panic Bar Installation", category: "Commercial", subcategory: "Panic Bar Installation", before: before3, after: after3 },
];


const CategoryCard = ({
  category,
  items,
  onCategoryClick,
}: {
  category: string;
  items: GalleryItem[];
  onCategoryClick: (category: string) => void;
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (hovered) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [items.length, hovered]);

  const current = items[activeIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="neu-card rounded-xl overflow-hidden group cursor-pointer"
      onClick={() => onCategoryClick(category)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            <ComparisonSlider
              before={current.before}
              after={current.after}
              className="w-full h-full cursor-ew-resize"
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-3 right-3 z-30 p-2 rounded-full bg-background/60 backdrop-blur-sm text-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <Maximize2 className="w-4 h-4" />
        </div>
      </div>

      <div className="p-4">
        <span className="text-xs font-semibold text-accent uppercase tracking-wider">
          {category}
        </span>
        <AnimatePresence mode="wait">
          <motion.h3
            key={current.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="text-foreground font-display text-lg mt-1"
          >
            {current.title}
          </motion.h3>
        </AnimatePresence>
        <p className="text-muted-foreground text-sm mt-1">
          {items.length} projects · Click to view all
        </p>

        <div className="flex gap-1.5 mt-3">
          {items.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === activeIndex ? "w-6 bg-accent" : "w-2 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const BeforeAfterGallery = () => {
  const cmsItems = useGalleryItems();
  const sectionsSettings = useSectionsSettings();
  const galleryItems: GalleryItem[] = cmsItems && cmsItems.length > 0
    ? cmsItems.map((g) => ({ id: g.id, title: g.title, category: g.category, subcategory: g.subcategory, before: g.before, after: g.after }))
    : fallbackGalleryItems;
  const categories = [...new Set(galleryItems.map((i) => i.category))];
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [fullscreenItem, setFullscreenItem] = useState<GalleryItem | null>(null);

  const getItemsByCategory = (cat: string) =>
    galleryItems.filter((i) => i.category === cat);

  return (
    <section id="gallery" className="py-20 px-4" aria-label="Before & After Gallery">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <SectionHeader 
            heading={sectionsSettings.gallery.heading}
            subheading={sectionsSettings.gallery.subheading}
            sectionKey="gallery"
            richHeading={sectionsSettings.gallery.richHeading}
            richSubheading={sectionsSettings.gallery.richSubheading}
          />
        </motion.div>

        {/* Edit gallery items link */}
        <div className="flex justify-end mb-4">
          <EditLink
            entityType="collection"
            entitySlug="gallery-items"
            label="Edit Gallery Items"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <CategoryCard
              key={cat}
              category={cat}
              items={getItemsByCategory(cat)}
              onCategoryClick={setOpenCategory}
            />
          ))}
        </div>
      </div>

      {/* Category Collage Popup */}
      <AnimatePresence>
        {openCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 overflow-y-auto p-4 md:p-8"
            onClick={() => setOpenCategory(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="max-w-5xl mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-display text-2xl md:text-3xl">
                  {openCategory} <span className="text-accent">Projects</span>
                </h3>
                <button
                  onClick={() => setOpenCategory(null)}
                  className="text-white/70 hover:text-white transition-colors p-2"
                  aria-label="Close"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {getItemsByCategory(openCategory).map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="rounded-xl overflow-hidden bg-white/5 group cursor-pointer"
                    onClick={() => setFullscreenItem(item)}
                  >
                    <div className="relative aspect-[4/3]">
                      <ComparisonSlider
                        before={item.before}
                        after={item.after}
                        className="w-full h-full cursor-ew-resize"
                      />
                      <div className="absolute bottom-2 right-2 z-30 p-1.5 rounded-full bg-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <Maximize2 className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="p-3">
                      <h4 className="text-white font-semibold text-sm">{item.title}</h4>
                      {item.subcategory && (
                        <p className="text-accent text-xs mt-0.5">{item.subcategory}</p>
                      )}
                      <p className="text-white/50 text-xs mt-0.5">Drag slider to compare</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Single Item */}
      <AnimatePresence>
        {fullscreenItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setFullscreenItem(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setFullscreenItem(null)}
                className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors z-20"
                aria-label="Close fullscreen"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="rounded-xl overflow-hidden aspect-[16/9]">
                <ComparisonSlider
                  before={fullscreenItem.before}
                  after={fullscreenItem.after}
                  className="w-full h-full cursor-ew-resize"
                />
              </div>

              <div className="text-center mt-4">
                <h3 className="text-white font-display text-xl">{fullscreenItem.title}</h3>
                <p className="text-white/60 text-sm">
                  {fullscreenItem.category}
                  {fullscreenItem.subcategory && ` · ${fullscreenItem.subcategory}`}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default BeforeAfterGallery;
