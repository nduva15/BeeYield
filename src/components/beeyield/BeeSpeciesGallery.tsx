import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Info, ExternalLink, Filter, Grid, List as ListIcon, Heart, Share2, MapPin, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Asset paths (using the generated image IDs provided by the system previously)
const SPECIES_DATA = [
    {
        id: 'western-honey-bee',
        name: 'Western Honey Bee',
        scientificName: 'Apis mellifera',
        image: '/western_honey_bee_1773232169379.png',
        category: 'Honey Bee',
        conservationStatus: 'Stable',
        description: 'The most common bee species globally, known for honey production and large colonies.',
        traits: ['Social', 'Perennial', 'Generalist'],
        range: 'Global',
    },
    {
        id: 'bumblebee',
        name: 'Buff-tailed Bumblebee',
        scientificName: 'Bombus terrestris',
        image: '/bumblebee_1773232475571.png',
        category: 'Bumblebee',
        conservationStatus: 'Common',
        description: 'Large, fuzzy bees that are excellent pollinators for tomatoes and greenhouse crops.',
        traits: ['Social', 'Annual', 'Vibration Pollinator'],
        range: 'Europe, Northern Africa',
    },
    {
        id: 'orchard-bee',
        name: 'European Orchard Bee',
        scientificName: 'Osmia cornuta',
        image: '/orchard_bee_1773232490782.png',
        category: 'Solitary Bee',
        conservationStatus: 'Stable',
        description: 'Active in early spring, these bees are highly efficient pollinators of fruit trees.',
        traits: ['Solitary', 'Cavity Nesting', 'Metallic Sheen'],
        range: 'Europe',
    },
    {
        id: 'leafcutter-bee',
        name: 'Alfalfa Leafcutter Bee',
        scientificName: 'Megachile rotundata',
        image: '/leafcutter_bee_1773232508465.png',
        category: 'Solitary Bee',
        conservationStatus: 'Stable',
        description: 'Unique for cutting circular pieces of leaves to build their nest cells.',
        traits: ['Solitary', 'Specialist', 'Belly Scopa'],
        range: 'Global (Introduced)',
    },
    {
        id: 'carpenter-bee',
        name: 'Violet Carpenter Bee',
        scientificName: 'Xylocopa violacea',
        image: '/carpenter_bee_1773232526722.png',
        category: 'Solitary Bee',
        conservationStatus: 'Stable',
        description: 'One of the largest bees in Europe, known for boring holes into dead wood.',
        traits: ['Solitary', 'Large Size', 'Dark Wings'],
        range: 'Europe, Asia',
    }
];

export const BeeSpeciesGallery: React.FC = () => {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedBee, setSelectedBee] = useState<any | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const categories = ['All', ...Array.from(new Set(SPECIES_DATA.map(b => b.category)))];

    const filteredBees = SPECIES_DATA.filter(bee => {
        const matchesSearch = bee.name.toLowerCase().includes(search.toLowerCase()) || 
                             bee.scientificName.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || bee.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="flex flex-col h-full bg-[#F9F7F2] p-4 lg:p-6 space-y-6 max-w-7xl mx-auto w-full animate-in fade-in duration-500 overflow-y-auto custom-scroll">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tighter uppercase">
                        Species <span className="text-[#F4D03F]">Identification</span>
                    </h2>
                    <p className="text-[#1A1A1A]/40 font-bold uppercase tracking-widest text-[9px]">
                        Global Pollinator Taxonomy Database
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#1A1A1A]/30 group-focus-within:text-[#F4D03F] transition-colors" />
                        <Input 
                            placeholder="Search taxonomy..." 
                            className="pl-9 w-48 h-9 rounded-xl bg-[#FFF9F0] border-[#F4D03F]/10 text-xs focus:ring-[#F4D03F]/10 font-semibold"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex bg-[#FFF9F0] p-1 rounded-xl border border-[#F4D03F]/10 shadow-sm">
                        <Button 
                            variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                            size="sm" 
                            className={cn("h-7 px-3 rounded-lg text-[10px] font-bold", viewMode === 'grid' ? "bg-[#F4D03F] text-[#1A1A1A] hover:bg-[#F4D03F]" : "text-[#1A1A1A]/40")}
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                            variant={viewMode === 'list' ? 'default' : 'ghost'} 
                            size="sm" 
                            className={cn("h-7 px-3 rounded-lg text-[10px] font-bold", viewMode === 'list' ? "bg-[#F4D03F] text-[#1A1A1A] hover:bg-[#F4D03F]" : "text-[#1A1A1A]/40")}
                            onClick={() => setViewMode('list')}
                        >
                            <ListIcon className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-1.5">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={cn("px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-sm border",
                            selectedCategory === cat 
                            ? 'bg-[#F4D03F] text-[#1A1A1A] border-[#F4D03F]/20' 
                            : 'bg-[#FFF9F0] text-[#1A1A1A]/40 border-[#F4D03F]/5 hover:border-[#F4D03F]/20'
                        )}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Gallery Content */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredBees.map((bee, idx) => (
                        <motion.div
                            key={bee.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.03 }}
                            onClick={() => setSelectedBee(bee)}
                            className="group cursor-pointer bg-[#FFF9F0] rounded-2xl border border-[#F4D03F]/10 overflow-hidden hover:border-[#F4D03F]/30 transition-all duration-300 shadow-sm"
                        >
                            <div className="aspect-[4/5] overflow-hidden relative">
                                <img 
                                    src={bee.image} 
                                    alt={bee.name} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all">
                                    <div className="w-8 h-8 rounded-lg bg-[#FFF9F0]/90 backdrop-blur-md flex items-center justify-center text-[#F4D03F] shadow-sm">
                                        <Info className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="absolute bottom-2 left-2">
                                    <div className="bg-[#1A1A1A]/80 backdrop-blur-md text-[#FFF9F0] font-black text-[7px] uppercase tracking-widest px-2 py-0.5 rounded-md">
                                        {bee.category}
                                    </div>
                                </div>
                            </div>
                            <div className="p-3 space-y-0.5">
                                <h3 className="text-[13px] font-black tracking-tight text-[#1A1A1A] truncate">{bee.name}</h3>
                                <p className="text-[10px] font-bold italic text-[#1A1A1A]/30 truncate">{bee.scientificName}</p>
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
                            className="flex items-center gap-4 p-2 bg-[#FFF9F0] border border-[#F4D03F]/10 rounded-xl hover:border-[#F4D03F]/30 transition-all cursor-pointer group shadow-sm"
                        >
                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-[#F4D03F]/10">
                                <img src={bee.image} alt={bee.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-black text-[#1A1A1A] truncate">{bee.name}</h3>
                                    <span className="text-[7px] font-bold uppercase tracking-wider bg-[#F4D03F]/10 text-[#F4D03F] px-1.5 py-0.5 rounded">{bee.category}</span>
                                </div>
                                <p className="text-[10px] font-bold italic text-[#1A1A1A]/30 truncate">{bee.scientificName}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[#F4D03F] opacity-30 group-hover:opacity-100 transition-all mr-2" />
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedBee && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedBee(null)}
                            className="fixed inset-0 bg-[#FFF9F0]/90 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: 20 }}
                            className="relative w-full max-w-4xl bg-[#FFF9F0] rounded-[2.5rem] overflow-hidden shadow-3xl border border-[#F4D03F]/20 z-10 flex flex-col md:flex-row max-h-[90vh]"
                        >
                            <button 
                                onClick={() => setSelectedBee(null)}
                                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#1A1A1A]/5 hover:bg-[#F4D03F] transition-all flex items-center justify-center text-[#1A1A1A] z-20 group"
                            >
                                <X className="w-5 h-5 group-hover:scale-110" />
                            </button>

                            {/* Modal Left - Image */}
                            <div className="md:w-5/12 aspect-square md:aspect-auto relative">
                                <img src={selectedBee.image} alt={selectedBee.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent md:hidden" />
                            </div>

                            {/* Modal Right - Info */}
                            <div className="md:w-7/12 p-6 md:p-10 flex flex-col gap-6 h-full overflow-y-auto custom-scroll">
                                <div className="space-y-1">
                                    <div className="inline-block bg-[#F4D03F] text-[#1A1A1A] font-black uppercase text-[8px] tracking-[0.2em] px-3 py-1 rounded-md mb-2 shadow-sm">
                                        {selectedBee.category}
                                    </div>
                                    <h2 className="text-3xl font-black text-[#1A1A1A] tracking-tighter uppercase leading-none">{selectedBee.name}</h2>
                                    <p className="text-sm text-[#1A1A1A]/40 font-bold italic">{selectedBee.scientificName}</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-4 bg-[#F9F7F2] rounded-2xl border border-[#F4D03F]/10">
                                        <p className="text-[13px] font-semibold leading-relaxed text-[#1A1A1A]/70 italic">
                                            {selectedBee.description}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-[#F9F7F2] rounded-xl border border-[#F4D03F]/5">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-[#1A1A1A]/30 block mb-1">Conservation</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-[#1B9157] shadow-[0_0_8px_rgba(27,145,87,0.5)]" />
                                                <span className="text-xs font-black text-[#1A1A1A]">{selectedBee.conservationStatus}</span>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-[#F9F7F2] rounded-xl border border-[#F4D03F]/5">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-[#1A1A1A]/30 block mb-1">Distribution</span>
                                            <div className="flex items-center gap-2 text-[#1A1A1A]">
                                                <MapPin className="w-3 h-3 text-[#F4D03F]" />
                                                <span className="text-xs font-black truncate">{selectedBee.range}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-[#1A1A1A]/30 italic">Diagnostic Characteristics</span>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedBee.traits.map((trait: string) => (
                                                <span key={trait} className="px-3 py-1.5 bg-[#FFF9F0] text-[#1A1A1A] border border-[#F4D03F]/20 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm">
                                                    {trait}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto flex gap-3 pt-6 border-t border-[#F4D03F]/10">
                                    <Button className="flex-1 h-11 bg-[#F4D03F] hover:bg-[#F4D03F]/90 text-[#1A1A1A] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-[#F4D03F]/20">
                                        Open Research Case
                                    </Button>
                                    <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-[#F4D03F]/10 hover:bg-[#F4D03F]/5 text-[#1A1A1A]/40">
                                        <Share2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Empty State */}
            {filteredBees.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#FFF9F0] flex items-center justify-center border border-[#F4D03F]/10">
                        <Bug className="w-8 h-8 text-[#1A1A1A]/20" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-black uppercase tracking-tight text-[#1A1A1A]">No species found</h3>
                        <p className="text-[11px] font-semibold text-[#1A1A1A]/40 max-w-[200px] mx-auto">The requested taxonomy does not match the active database profiles.</p>
                    </div>
                    <Button variant="outline" onClick={() => { setSearch(''); setSelectedCategory('All'); }} className="rounded-lg font-black uppercase tracking-widest text-[9px] h-9 border-[#F4D03F]/20 text-[#1A1A1A]/60">
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

// Missing icon
const ChevronRight = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m9 18 6-6-6-6" />
    </svg>
);
