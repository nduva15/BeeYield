import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Info, Grid, List as ListIcon, Share2, MapPin, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getGuideFallbackImage, getGuideImage } from '@/lib/beeGuideImages';

type BeeSpeciesRecord = {
    id: string;
    name: string;
    commonName?: string;
    scientificName?: string;
    location?: string;
    suitability?: string;
    healthProfile?: string;
    traits?: string[];
    is_extinct?: boolean;
    [key: string]: unknown;
};

type GallerySpecies = {
    id: string;
    name: string;
    scientificName: string;
    image: string | null;
    category: string;
    conservationStatus: string;
    description: string;
    traits: string[];
    range: string;
    raw: BeeSpeciesRecord;
};

const DEFAULT_DESCRIPTION = 'Live bee profile from the health guide database.';

const inferCategory = (bee: BeeSpeciesRecord) => {
    const haystack = `${bee.name} ${bee.commonName || ''}`.toLowerCase();
    if (haystack.includes('bumble')) return 'Bumblebee';
    if (haystack.includes('stingless')) return 'Stingless Bee';
    if (haystack.includes('carpenter')) return 'Carpenter Bee';
    if (haystack.includes('leafcutter')) return 'Leafcutter Bee';
    if (haystack.includes('mason') || haystack.includes('orchard')) return 'Mason Bee';
    if (haystack.includes('mining')) return 'Mining Bee';
    if (haystack.includes('sweat')) return 'Sweat Bee';
    if (haystack.includes('honey bee') || haystack.includes('apis ')) return 'Honey Bee';
    return 'Bee Species';
};

const mapSpeciesRecord = (bee: BeeSpeciesRecord): GallerySpecies => ({
    id: bee.id,
    name: bee.commonName || bee.name,
    scientificName: bee.scientificName || bee.name,
    image: getGuideImage(bee),
    category: inferCategory(bee),
    conservationStatus: bee.is_extinct ? 'Extinct' : 'Active record',
    description: bee.healthProfile || bee.suitability || DEFAULT_DESCRIPTION,
    traits: Array.isArray(bee.traits) ? bee.traits : [],
    range: bee.location || 'Unknown',
    raw: bee,
});

const renderSpeciesImage = (
    bee: GallerySpecies,
    className: string,
) => {
    const fallbackImage = getGuideFallbackImage(bee.raw);
    const placeholderImage = '/placeholder.svg';

    return (
        <img
            src={bee.image || fallbackImage || placeholderImage}
            alt={bee.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(event) => {
                const img = event.currentTarget;
                if (img.dataset.fallbackApplied) {
                    img.src = placeholderImage;
                    return;
                }

                img.dataset.fallbackApplied = '1';
                img.src = fallbackImage && img.src !== fallbackImage ? fallbackImage : placeholderImage;
            }}
            className={className}
        />
    );
};

export const BeeSpeciesGallery: React.FC<{ species?: BeeSpeciesRecord[] }> = ({ species = [] }) => {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedBee, setSelectedBee] = useState<GallerySpecies | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const gallerySpecies = useMemo(
        () => species.map(mapSpeciesRecord).filter((bee) => bee.image || bee.name || bee.scientificName),
        [species],
    );

    const categories = useMemo(
        () => ['All', ...Array.from(new Set(gallerySpecies.map((bee) => bee.category)))],
        [gallerySpecies],
    );

    const filteredBees = useMemo(() => (
        gallerySpecies.filter((bee) => {
            const needle = search.toLowerCase();
            const matchesSearch = bee.name.toLowerCase().includes(needle)
                || bee.scientificName.toLowerCase().includes(needle);
            const matchesCategory = selectedCategory === 'All' || bee.category === selectedCategory;
            return matchesSearch && matchesCategory;
        })
    ), [gallerySpecies, search, selectedCategory]);

    return (
        <div className="flex flex-col h-full bg-muted/20 p-4 lg:p-6 space-y-6 max-w-7xl mx-auto w-full animate-in fade-in duration-500 overflow-y-auto custom-scroll">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black text-foreground tracking-tighter">
                        Species <span className="text-[#F4D03F]">Identification</span>
                    </h2>
                    <p className="text-foreground/40 font-bold text-[9px]">
                        Live photo records from the health guide database
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/30 group-focus-within:text-[#F4D03F] transition-colors" />
                        <Input
                            placeholder="Search taxonomy..."
                            className="pl-9 w-48 h-9 rounded-xl bg-card border-border/ text-xs focus:ring-[#F4D03F]/10 font-semibold"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex bg-card p-1 rounded-xl border border-border/ shadow-sm">
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                            size="sm"
                            className={cn('h-7 px-3 rounded-lg text-[10px] font-bold', viewMode === 'grid' ? 'bg-[#F4D03F] text-foreground hover:bg-[#F4D03F]' : 'text-foreground/40')}
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                            size="sm"
                            className={cn('h-7 px-3 rounded-lg text-[10px] font-bold', viewMode === 'list' ? 'bg-[#F4D03F] text-foreground hover:bg-[#F4D03F]' : 'text-foreground/40')}
                            onClick={() => setViewMode('list')}
                        >
                            <ListIcon className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={cn(
                            'px-4 py-1.5 rounded-lg text-[9px] font-black transition-all shadow-sm border',
                            selectedCategory === category
                                ? 'bg-[#F4D03F] text-foreground border-border/'
                                : 'bg-card text-foreground/40 border-border/ hover:border-border/',
                        )}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredBees.map((bee, idx) => (
                        <motion.div
                            key={bee.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.03 }}
                            onClick={() => setSelectedBee(bee)}
                            className="group cursor-pointer bg-card rounded-2xl border border-border/ overflow-hidden hover:border-border/ transition-all duration-300 shadow-sm"
                        >
                            <div className="aspect-[4/5] overflow-hidden relative">
                                {renderSpeciesImage(bee, 'w-full h-full object-cover transition-transform duration-700 group-hover:scale-105')}
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all">
                                    <div className="w-8 h-8 rounded-lg bg-card/ backdrop-blur-md flex items-center justify-center text-[#F4D03F] shadow-sm">
                                        <Info className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="absolute bottom-2 left-2">
                                    <div className="bg-[#1A1A1A]/80 backdrop-blur-md text-[#FFF9F0] font-black text-[7px] px-2 py-0.5 rounded-md">
                                        {bee.category}
                                    </div>
                                </div>
                            </div>
                            <div className="p-3 space-y-0.5">
                                <h3 className="text-[13px] font-black tracking-tight text-foreground truncate">{bee.name}</h3>
                                <p className="text-[10px] font-bold italic text-foreground/30 truncate">{bee.scientificName}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredBees.map((bee, idx) => (
                        <motion.div
                            key={bee.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            onClick={() => setSelectedBee(bee)}
                            className="flex items-center gap-4 p-2 bg-card border border-border/ rounded-xl hover:border-border/ transition-all cursor-pointer group shadow-sm"
                        >
                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-border/">
                                {renderSpeciesImage(bee, 'w-full h-full object-cover')}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-black text-foreground truncate">{bee.name}</h3>
                                    <span className="text-[7px] font-bold uppercase tracking-wider bg-[#F4D03F]/10 text-[#F4D03F] px-1.5 py-0.5 rounded">{bee.category}</span>
                                </div>
                                <p className="text-[10px] font-bold italic text-foreground/30 truncate">{bee.scientificName}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[#F4D03F] opacity-30 group-hover:opacity-100 transition-all mr-2" />
                        </motion.div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {selectedBee && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedBee(null)}
                            className="fixed inset-0 bg-card/ backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: 20 }}
                            className="relative w-full max-w-4xl bg-card rounded-[2.5rem] overflow-hidden shadow-3xl border border-border/ z-10 flex flex-col md:flex-row max-h-[90vh]"
                        >
                            <button
                                onClick={() => setSelectedBee(null)}
                                aria-label="Close species details"
                                title="Close"
                                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#1A1A1A]/5 hover:bg-[#F4D03F] transition-all flex items-center justify-center text-foreground z-20 group"
                            >
                                <X className="w-5 h-5 group-hover:scale-110" />
                            </button>

                            <div className="md:w-5/12 aspect-square md:aspect-auto relative">
                                {renderSpeciesImage(selectedBee, 'w-full h-full object-cover')}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent md:hidden" />
                            </div>

                            <div className="md:w-7/12 p-6 md:p-10 flex flex-col gap-6 h-full overflow-y-auto custom-scroll">
                                <div className="space-y-1">
                                    <div className="inline-block bg-[#F4D03F] text-foreground font-black text-[8px] px-3 py-1 rounded-md mb-2 shadow-sm">
                                        {selectedBee.category}
                                    </div>
                                    <h2 className="text-3xl font-black text-foreground tracking-tighter leading-none">{selectedBee.name}</h2>
                                    <p className="text-sm text-foreground/40 font-bold italic">{selectedBee.scientificName}</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-4 bg-muted/20 rounded-2xl border border-border/">
                                        <p className="text-[13px] font-semibold leading-relaxed text-foreground/70 italic">
                                            {selectedBee.description}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-muted/20 rounded-xl border border-border/">
                                            <span className="text-[8px] font-black text-foreground/30 block mb-1">Conservation</span>
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    'w-2 h-2 rounded-full shadow-[0_0_8px_rgba(27,145,87,0.5)]',
                                                    selectedBee.conservationStatus === 'Extinct' ? 'bg-red-500 shadow-[0_0_8px_rgba(220,38,38,0.4)]' : 'bg-[#1B9157]',
                                                )} />
                                                <span className="text-xs font-black text-foreground">{selectedBee.conservationStatus}</span>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-muted/20 rounded-xl border border-border/">
                                            <span className="text-[8px] font-black text-foreground/30 block mb-1">Distribution</span>
                                            <div className="flex items-center gap-2 text-foreground">
                                                <MapPin className="w-3 h-3 text-[#F4D03F]" />
                                                <span className="text-xs font-black truncate">{selectedBee.range}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <span className="text-[8px] font-black text-foreground/30 italic">Diagnostic Characteristics</span>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedBee.traits.length > 0 ? selectedBee.traits.map((trait) => (
                                                <span key={trait} className="px-3 py-1.5 bg-card text-foreground border border-border/ rounded-lg text-[9px] font-black shadow-sm">
                                                    {trait}
                                                </span>
                                            )) : (
                                                <span className="text-[11px] font-semibold text-foreground/50">No diagnostic traits stored for this profile yet.</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto flex gap-3 pt-6 border-t border-border/">
                                    <Button className="flex-1 h-11 bg-[#F4D03F] hover:bg-[#F4D03F]/90 text-foreground font-black rounded-xl shadow-lg shadow-[#F4D03F]/20">
                                        Open Research Case
                                    </Button>
                                    <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-border/ hover:bg-[#F4D03F]/5 text-foreground/40">
                                        <Share2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {filteredBees.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-card flex items-center justify-center border border-border/">
                        <Bug className="w-8 h-8 text-foreground/20" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-black tracking-tight text-foreground">No species found</h3>
                        <p className="text-[11px] font-semibold text-foreground/40 max-w-[220px] mx-auto">The requested taxonomy does not match the active live photo records.</p>
                    </div>
                    <Button variant="outline" onClick={() => { setSearch(''); setSelectedCategory('All'); }} className="rounded-lg font-black text-[9px] h-9 border-border/ text-foreground/60">
                        Reset Hive Intelligence
                    </Button>
                </div>
            )}

            <style>{`
                .custom-scroll::-webkit-scrollbar { width: 3px; }
                .custom-scroll::-webkit-scrollbar-track { background: transparent; }
                .custom-scroll::-webkit-scrollbar-thumb { background: rgba(244, 208, 63, 0.2); border-radius: 10px; }
            `}</style>
        </div>
    );
};

const ChevronRight = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m9 18 6-6-6-6" />
    </svg>
);

