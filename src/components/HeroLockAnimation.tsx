import { useEffect, useRef, useCallback, type ReactNode } from "react";

// Frames 1–19 and 31–46 (skip 20–30)
const FRAME_NUMBERS = [
  ...Array.from({ length: 19 }, (_, i) => i + 1),
  ...Array.from({ length: 16 }, (_, i) => i + 31),
];
const FRAME_COUNT = FRAME_NUMBERS.length; // 35
const FRAME_PATH = "/frames/ezgif-frame-";
const pad = (n: number) => String(n).padStart(3, "0");
const SCROLL_HEIGHT = 2000;

interface HeroLockAnimationProps {
  onProgress?: (p: number) => void;
  children?: ReactNode;
}

/**
 * Scroll-locked hero using stacked <img> elements (no canvas).
 * Browser renders images at full native resolution with GPU compositing.
 * Manual position:fixed for lock effect — zero vibration, zero blur.
 */
const HeroLockAnimation = ({ onProgress, children }: HeroLockAnimationProps) => {
  const spacerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const currentFrameRef = useRef(0);
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;
  const rafRef = useRef<number>(0);

  const showFrame = useCallback((index: number) => {
    const imgs = imgRefs.current;
    for (let i = 0; i < imgs.length; i++) {
      const img = imgs[i];
      if (img) {
        img.style.opacity = i === index ? "1" : "0";
      }
    }
  }, []);

  useEffect(() => {
    const spacer = spacerRef.current;
    const hero = heroRef.current;
    if (!spacer || !hero) return;

    // Show first frame initially
    showFrame(0);

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const spacerRect = spacer.getBoundingClientRect();
        const spacerTop = -spacerRect.top;
        const heroH = hero.offsetHeight;
        const scrollRange = spacer.offsetHeight - heroH;

        if (spacerTop < 0) {
          hero.style.position = "absolute";
          hero.style.top = "0px";
          hero.style.bottom = "";
          onProgressRef.current?.(0);
          if (currentFrameRef.current !== 0) {
            currentFrameRef.current = 0;
            showFrame(0);
          }
          return;
        }

        if (spacerTop >= scrollRange) {
          hero.style.position = "absolute";
          hero.style.top = "";
          hero.style.bottom = "0px";
          onProgressRef.current?.(1);
          if (currentFrameRef.current !== FRAME_COUNT - 1) {
            currentFrameRef.current = FRAME_COUNT - 1;
            showFrame(FRAME_COUNT - 1);
          }
          return;
        }

        hero.style.position = "fixed";
        hero.style.top = "0px";
        hero.style.bottom = "";

        const progress = spacerTop / scrollRange;
        onProgressRef.current?.(progress);

        const frameIndex = Math.min(
          FRAME_COUNT - 1,
          Math.max(0, Math.round(progress * (FRAME_COUNT - 1)))
        );
        if (frameIndex !== currentFrameRef.current) {
          currentFrameRef.current = frameIndex;
          showFrame(frameIndex);
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={spacerRef}
      className="relative"
      style={{ height: `calc(85vh + ${SCROLL_HEIGHT}px)` }}
    >
      <div
        ref={heroRef}
        className="left-0 w-full overflow-hidden z-10"
        style={{ position: "absolute", top: 0, height: "85vh" }}
      >
        {/* Cinematic dark background with vignette */}
        <div className="absolute inset-0 bg-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.7)_100%)] z-[1]" />

        {/* Frames displayed at native aspect ratio — no upscaling, pixel-perfect */}
        {FRAME_NUMBERS.map((frameNum, idx) => (
          <img
            key={frameNum}
            ref={(el) => { imgRefs.current[idx] = el; }}
            src={`${FRAME_PATH}${pad(frameNum)}.jpg`}
            alt=""
            loading={idx < 3 ? "eager" : "lazy"}
            decoding="async"
            className="absolute inset-0 w-full h-full object-contain"
            style={{ opacity: idx === 0 ? 1 : 0, imageRendering: "auto" }}
          />
        ))}
        {children}
      </div>
    </div>
  );
};
export default HeroLockAnimation;
