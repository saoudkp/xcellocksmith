import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, ShieldCheck, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { CertificationProof } from "@/data/team";

interface CertificateViewerProps {
  memberName: string;
  certifications: CertificationProof[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CertificateViewer = ({ memberName, certifications, open, onOpenChange }: CertificateViewerProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const cert = certifications[activeIndex];

  const prev = () => {
    setZoomed(false);
    setActiveIndex((i) => (i - 1 + certifications.length) % certifications.length);
  };
  const next = () => {
    setZoomed(false);
    setActiveIndex((i) => (i + 1) % certifications.length);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); setZoomed(false); setActiveIndex(0); }}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-card border-border">
        <DialogTitle className="sr-only">
          Certifications for {memberName}
        </DialogTitle>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-accent" />
            <h3 className="font-display font-bold text-foreground">
              {memberName}'s Certifications
            </h3>
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {activeIndex + 1} / {certifications.length}
          </span>
        </div>

        {/* Certificate display */}
        <div className="relative bg-muted/30 flex items-center justify-center min-h-[350px] md:min-h-[450px]">
          {/* Nav arrows */}
          {certifications.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 z-10 p-2 rounded-full bg-card/80 backdrop-blur hover:bg-card transition-colors border border-border"
                aria-label="Previous certificate"
              >
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>
              <button
                onClick={next}
                className="absolute right-2 z-10 p-2 rounded-full bg-card/80 backdrop-blur hover:bg-card transition-colors border border-border"
                aria-label="Next certificate"
              >
                <ChevronRight className="w-5 h-5 text-foreground" />
              </button>
            </>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="p-4 w-full flex justify-center"
            >
              {cert.fileType === "image" ? (
                <img
                  src={cert.fileUrl}
                  alt={`${cert.name} — ${memberName}`}
                  className={`max-w-full rounded-lg shadow-lg transition-transform duration-300 cursor-pointer ${
                    zoomed ? "scale-150 cursor-zoom-out" : "max-h-[400px] cursor-zoom-in"
                  }`}
                  onClick={() => setZoomed(!zoomed)}
                />
              ) : (
                <a
                  href={cert.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-3 p-8 rounded-xl bg-card border border-border hover:border-accent transition-colors"
                >
                  <FileText className="w-16 h-16 text-accent" />
                  <span className="text-sm font-medium text-foreground">View PDF Document</span>
                </a>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Zoom toggle */}
          {cert.fileType === "image" && (
            <button
              onClick={() => setZoomed(!zoomed)}
              className="absolute bottom-3 right-3 p-2 rounded-full bg-card/80 backdrop-blur border border-border hover:bg-card transition-colors"
              aria-label={zoomed ? "Zoom out" : "Zoom in"}
            >
              {zoomed ? <ZoomOut className="w-4 h-4 text-foreground" /> : <ZoomIn className="w-4 h-4 text-foreground" />}
            </button>
          )}
        </div>

        {/* Certificate name + dots */}
        <div className="px-5 pb-5 pt-3 space-y-3">
          <p className="text-sm font-semibold text-foreground text-center">{cert.name}</p>

          {/* Dot indicators */}
          {certifications.length > 1 && (
            <div className="flex justify-center gap-2">
              {certifications.map((c, i) => (
                <button
                  key={i}
                  onClick={() => { setActiveIndex(i); setZoomed(false); }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === activeIndex ? "bg-accent" : "bg-muted-foreground/30"
                  }`}
                  aria-label={`View ${c.name}`}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CertificateViewer;
