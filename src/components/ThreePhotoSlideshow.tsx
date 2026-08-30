import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface SlideItem {
  image: string;
  title: string;
  subtitle?: string;
  badge?: string;
  description?: string;
}

interface ThreePhotoSlideshowProps {
  slides: [SlideItem, SlideItem, SlideItem] | SlideItem[];
  title?: string;
  subtitle?: string;
  badge?: string;
  dark?: boolean;
  className?: string;
  aspectRatio?: string;
  autoPlayInterval?: number;
}

export const ThreePhotoSlideshow: React.FC<ThreePhotoSlideshowProps> = ({
  slides: rawSlides,
  title,
  subtitle,
  badge,
  dark = true,
  className = "",
  aspectRatio = "aspect-[4/3]",
  autoPlayInterval = 4500,
}) => {
  // Guarantee exactly 3 slides
  const slides = rawSlides.slice(0, 3);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying || slides.length < 2) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % slides.length);
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [isPlaying, slides.length, autoPlayInterval]);

  const currentSlide = slides[activeIdx] || slides[0];

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % slides.length);
  };

  return (
    <div
      className={`rounded-[2.5rem] overflow-hidden border shadow-xl transition-all ${
        dark
          ? "bg-neutral-900 border-white/10 text-white"
          : "bg-white border-neutral-200 text-neutral-900"
      } ${className}`}
    >
      {/* Header if provided */}
      {(title || badge) && (
        <div className="p-6 md:p-8 pb-4 border-b border-neutral-800/50 flex flex-wrap items-center justify-between gap-4">
          <div>
            {badge && (
              <Badge
                className={`mb-2 font-bold text-[9px] uppercase tracking-wider ${
                  dark
                    ? "bg-beeyield-green/20 text-beeyield-green border-none"
                    : "bg-beeyield-green/10 text-beeyield-green border-none"
                }`}
              >
                {badge}
              </Badge>
            )}
            {title && (
              <h3 className="text-xl md:text-2xl font-bold tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                className={`text-xs mt-1 ${
                  dark ? "text-neutral-400" : "text-neutral-500"
                }`}
              >
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-mono font-bold ${
                dark ? "text-beeyield-green" : "text-emerald-600"
              }`}
            >
              {activeIdx + 1} / {slides.length}
            </span>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                dark
                  ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
                  : "bg-neutral-100 border-neutral-200 text-neutral-700 hover:bg-neutral-200"
              }`}
              aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}

      {/* Main Image Stage */}
      <div className={`relative ${aspectRatio} overflow-hidden bg-neutral-950 flex items-center justify-center group`}>
        <AnimatePresence mode="wait">
          <motion.img
            key={activeIdx}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.4 }}
            src={currentSlide.image}
            alt={currentSlide.title}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent pointer-events-none" />

        {/* Floating Slide Badge */}
        {currentSlide.badge && (
          <div className="absolute top-4 left-4">
            <Badge className="bg-beeyield-green text-neutral-950 font-bold px-3 py-1 text-[9px] uppercase tracking-wider shadow-lg">
              {currentSlide.badge}
            </Badge>
          </div>
        )}

        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center border border-white/20 hover:bg-beeyield-green hover:text-black transition-all shadow-lg"
          aria-label="Previous photo"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center border border-white/20 hover:bg-beeyield-green hover:text-black transition-all shadow-lg"
          aria-label="Next photo"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Active caption overlay on bottom of photo */}
        <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
          <h4 className="text-white font-bold text-sm md:text-base drop-shadow-md">
            {currentSlide.title}
          </h4>
          {currentSlide.subtitle && (
            <p className="text-neutral-300 text-xs mt-0.5 line-clamp-1 drop-shadow-md">
              {currentSlide.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Description & 3-Thumbnail Indicator */}
      <div className="p-6">
        {currentSlide.description && (
          <p
            className={`text-xs leading-relaxed mb-4 ${
              dark ? "text-neutral-400" : "text-neutral-600"
            }`}
          >
            {currentSlide.description}
          </p>
        )}

        {/* 3 Interactive Thumbnails Strip */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {slides.map((slide, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveIdx(idx);
                setIsPlaying(false);
              }}
              className={`relative aspect-[16/10] rounded-xl overflow-hidden border-2 transition-all group ${
                activeIdx === idx
                  ? "border-beeyield-green ring-2 ring-beeyield-green/40 scale-[1.02]"
                  : dark
                  ? "border-white/10 opacity-50 hover:opacity-90 hover:border-white/30"
                  : "border-neutral-200 opacity-60 hover:opacity-100 hover:border-neutral-300"
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors" />
              <div className="absolute bottom-1 left-1.5 text-[9px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm">
                0{idx + 1}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
