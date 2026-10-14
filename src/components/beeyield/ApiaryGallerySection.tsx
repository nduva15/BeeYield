import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera, 
  MapPin, 
  Tag, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Maximize2, 
  Sparkles,
  ShieldCheck,
  Layers,
  Trees,
  Cpu,
  BookOpen,
  Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ALL_APIARY_PHOTOS, ApiaryPhoto } from "@/data/apiaryPhotos";
import { cn } from "@/lib/utils";

interface ApiaryGallerySectionProps {
  initialCategory?: 'all' | 'team' | 'story' | 'media' | 'in_land' | 'in_hive' | 'diseases' | 'blogs';
  title?: string;
  subtitle?: string;
  badgeText?: string;
  limit?: number;
  showFilters?: boolean;
  className?: string;
}

export const ApiaryGallerySection: React.FC<ApiaryGallerySectionProps> = ({
  initialCategory = 'all',
  title = "BeeYield Real Apiary & Field Deployments",
  subtitle = "41 authentic field photographs from our Makueni & Kibwezi apiaries — showcasing traditional canopy log hives, yellow Langstroth stations, predator defenses, and active savanna pollination.",
  badgeText = "Authentic Apiary Archive · 41 Photos",
  limit,
  showFilters = true,
  className
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [activePhoto, setActivePhoto] = useState<ApiaryPhoto | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);

  const categories = [
    { id: 'all', label: 'All Photos (41)', icon: Camera },
    { id: 'team', label: 'Team & Gear', icon: Users },
    { id: 'story', label: 'Our Story & Roots', icon: Sparkles },
    { id: 'in_hive', label: 'In-Hive Architecture', icon: Cpu },
    { id: 'in_land', label: 'In-Land & Savanna Forage', icon: Trees },
    { id: 'diseases', label: 'Pest & Predator Defense', icon: ShieldCheck },
    { id: 'blogs', label: 'Field Science & Blogs', icon: BookOpen },
  ];

  const filteredPhotos = ALL_APIARY_PHOTOS.filter((photo) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'team') return photo.category === 'team' || photo.tags.includes('team');
    if (selectedCategory === 'story') return photo.category === 'story' || photo.tags.includes('story') || photo.tags.includes('heritage');
    if (selectedCategory === 'in_hive') return photo.category === 'in_hive' || photo.tags.includes('in_hive') || photo.tags.includes('langstroth');
    if (selectedCategory === 'in_land') return photo.category === 'in_land' || photo.tags.includes('in_land') || photo.tags.includes('forage');
    if (selectedCategory === 'diseases') return photo.category === 'diseases' || photo.tags.includes('diseases') || photo.tags.includes('predator_guard') || photo.tags.includes('biosecurity');
    if (selectedCategory === 'blogs') return photo.category === 'blogs' || photo.tags.includes('blogs');
    return true;
  });

  const displayedPhotos = limit ? filteredPhotos.slice(0, limit) : filteredPhotos;

  const openLightbox = (photo: ApiaryPhoto) => {
    const idx = filteredPhotos.findIndex((p) => p.id === photo.id);
    setLightboxIndex(idx >= 0 ? idx : 0);
    setActivePhoto(photo);
  };

  const nextPhoto = () => {
    const nextIdx = (lightboxIndex + 1) % filteredPhotos.length;
    setLightboxIndex(nextIdx);
    setActivePhoto(filteredPhotos[nextIdx]);
  };

  const prevPhoto = () => {
    const prevIdx = (lightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
    setLightboxIndex(prevIdx);
    setActivePhoto(filteredPhotos[prevIdx]);
  };

  return (
    <section className={cn("py-20 bg-neutral-900 text-white relative overflow-hidden", className)}>
      {/* Background glow effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <Badge className="bg-amber-400/20 text-amber-300 border-amber-400/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider mb-4">
            <Camera className="w-3.5 h-3.5 mr-1.5" />
            {badgeText}
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-4">
            {title}
          </h2>
          <p className="text-base sm:text-lg text-neutral-300 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Filter Pills */}
        {showFilters && (
          <div className="flex flex-wrap justify-center gap-2 mb-10 max-w-4xl mx-auto">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 border",
                    isActive
                      ? "bg-amber-500 text-neutral-950 border-amber-400 shadow-lg shadow-amber-500/20 scale-105"
                      : "bg-neutral-800/80 text-neutral-300 border-neutral-700/60 hover:bg-neutral-700/80 hover:text-white"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Photos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedPhotos.map((photo, i) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (i % 8) * 0.05 }}
              onClick={() => openLightbox(photo)}
              className="group relative rounded-2xl overflow-hidden bg-neutral-800 border border-neutral-700/60 shadow-xl cursor-pointer hover:border-amber-400/50 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col"
            >
              {/* Image Frame */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-950">
                <img
                  src={photo.src}
                  alt={photo.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                
                {/* Badge Top Left */}
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-black/60 text-amber-300 backdrop-blur-md border border-amber-400/30">
                    {photo.badge}
                  </span>
                </div>

                {/* Index Top Right */}
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-mono font-bold bg-black/60 text-white/80 backdrop-blur-md border border-white/10">
                    #{photo.index}
                  </span>
                </div>

                {/* Hover overlay hint */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-amber-500/90 text-neutral-950 flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                </div>

                {/* Location text above bottom info */}
                <div className="absolute bottom-3 left-3 right-3 text-xs text-amber-200/90 flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{photo.location}</span>
                </div>
              </div>

              {/* Bottom Card Content */}
              <div className="p-4 flex-1 flex flex-col justify-between bg-neutral-850">
                <div>
                  <h3 className="font-bold text-base text-white group-hover:text-amber-300 transition-colors line-clamp-1 mb-1">
                    {photo.title}
                  </h3>
                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {photo.subtitle}
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-neutral-700/50 flex items-center justify-between text-[11px] text-neutral-500">
                  <span className="capitalize font-medium text-neutral-400">
                    {photo.category.replace('_', ' ')}
                  </span>
                  <span className="text-amber-400/90 group-hover:translate-x-0.5 transition-transform font-bold">
                    View photo →
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Lightbox Dialog */}
        <Dialog open={!!activePhoto} onOpenChange={(open) => !open && setActivePhoto(null)}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden bg-neutral-950 border border-neutral-800 text-white rounded-2xl shadow-2xl">
            {activePhoto && (
              <div className="relative flex flex-col lg:flex-row max-h-[90vh]">
                {/* Image Section */}
                <div className="relative flex-1 bg-black flex items-center justify-center min-h-[350px] lg:min-h-[500px]">
                  <img
                    src={activePhoto.src}
                    alt={activePhoto.title}
                    className="max-h-[75vh] w-auto max-w-full object-contain p-2"
                  />
                  
                  {/* Prev / Next buttons */}
                  <button
                    onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all hover:scale-110"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all hover:scale-110"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Sidebar details */}
                <div className="w-full lg:w-80 p-6 flex flex-col justify-between bg-neutral-900 border-t lg:border-t-0 lg:border-l border-neutral-800 overflow-y-auto">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Badge className="bg-amber-400/20 text-amber-300 border-amber-400/30 text-[10px] font-bold uppercase">
                        {activePhoto.badge}
                      </Badge>
                      <span className="text-xs font-mono text-neutral-400">
                        {lightboxIndex + 1} of {filteredPhotos.length}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-white mb-2 leading-tight">
                      {activePhoto.title}
                    </h3>
                    <p className="text-xs font-medium text-amber-300 mb-4 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      {activePhoto.location}
                    </p>

                    <p className="text-xs text-neutral-300 leading-relaxed mb-4">
                      {activePhoto.description}
                    </p>

                    <div className="p-3 bg-neutral-950/70 rounded-xl border border-neutral-800 mb-4">
                      <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-1">
                        Apiary Context
                      </div>
                      <div className="text-xs text-neutral-300">
                        {activePhoto.subtitle}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {activePhoto.tags.map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded-md bg-neutral-800 text-[10px] text-neutral-400 border border-neutral-700">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between">
                    <span className="text-[10px] text-neutral-500 font-mono">
                      File: {activePhoto.src.split('/').pop()}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs border-neutral-700 hover:bg-neutral-800 text-white h-8"
                      onClick={() => window.open(activePhoto.src, '_blank')}
                    >
                      Full Res ↗
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};
