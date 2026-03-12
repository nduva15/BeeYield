import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Info, ExternalLink, Filter, Grid, List as ListIcon, Heart, Share2, MapPin, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

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
        <div className="flex flex-col h-full bg-background p-8 space-y-8 max-w-7xl mx-auto w-full animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase italic">
                        Species <span className="text-honey">Identification</span> Gallery
                    </h2>
                    <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">
                        Browse the world's most critical pollinators and their characteristics
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-honey transition-colors" />
                        <Input 
                            placeholder="Search species..." 
                            className="pl-12 w-64 rounded-2xl bg-muted/30 border-none focus:ring-honey/20"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex bg-muted/30 p-1 rounded-xl">
                        <Button 
                            variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                            size="sm" 
                            className="rounded-lg px-3"
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid className="w-4 h-4" />
                        </Button>
                        <Button 
                            variant={viewMode === 'list' ? 'default' : 'ghost'} 
                            size="sm" 
                            className="rounded-lg px-3"
                            onClick={() => setViewMode('list')}
                        >
                            <ListIcon className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                            selectedCategory === cat 
                            ? 'bg-honey text-black shadow-lg shadow-honey/20 scale-105' 
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Gallery Content */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredBees.map((bee, idx) => (
                        <motion.div
                            key={bee.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => setSelectedBee(bee)}
                            className="group cursor-pointer bg-white rounded-[2.5rem] border border-border overflow-hidden hover:border-honey/30 transition-all duration-500 hover:shadow-2xl hover:shadow-honey/5"
                        >
                            <div className="aspect-square overflow-hidden relative">
                                <img 
                                    src={bee.image} 
                                    alt={bee.name} 
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                                <div className="absolute top-4 right-4 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                                    <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-honey shadow-xl">
                                        <Info className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="absolute bottom-4 left-4">
                                    <Badge className="bg-honey/90 text-black hover:bg-honey border-none font-black text-[10px] uppercase tracking-widest px-3">
                                        {bee.category}
                                    </Badge>
                                </div>
                            </div>
                            <div className="p-6 space-y-1">
                                <h3 className="text-xl font-black tracking-tight text-foreground group-hover:text-honey transition-colors">{bee.name}</h3>
                                <p className="text-xs font-serif italic text-muted-foreground">{bee.scientificName}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredBees.map((bee, idx) => (
                        <motion.div
                            key={bee.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => setSelectedBee(bee)}
                            className="flex items-center gap-6 p-4 bg-white border border-border rounded-3xl hover:border-honey/30 transition-all cursor-pointer group"
                        >
                            <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                                <img src={bee.image} alt={bee.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-black text-foreground group-hover:text-honey transition-colors">{bee.name}</h3>
                                    <Badge variant="outline" className="text-[9px] uppercase tracking-widest">{bee.category}</Badge>
                                </div>
                                <p className="text-xs font-serif italic text-muted-foreground mb-1">{bee.scientificName}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">{bee.description}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="rounded-full group-hover:bg-honey/10 transition-colors">
                                <ChevronRight className="w-5 h-5 text-honey" />
                            </Button>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedBee && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-12 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedBee(null)}
                            className="fixed inset-0 bg-white/80 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 40 }}
                            className="relative w-full max-w-5xl bg-white rounded-[3.5rem] overflow-hidden shadow-3xl border border-border z-10 flex flex-col lg:flex-row"
                        >
                            <button 
                                onClick={() => setSelectedBee(null)}
                                className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-honey transition-all flex items-center justify-center text-white z-20 group"
                            >
                                <X className="w-6 h-6 group-hover:scale-110" />
                            </button>

                            {/* Modal Left - Image */}
                            <div className="lg:w-1/2 aspect-square lg:aspect-auto relative h-72 lg:h-auto">
                                <img src={selectedBee.image} alt={selectedBee.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />
                                <div className="absolute bottom-8 left-8 lg:hidden">
                                     <h2 className="text-3xl font-black text-gray-900 italic tracking-tighter uppercase">{selectedBee.name}</h2>
                                     <p className="text-white/60 font-serif italic">{selectedBee.scientificName}</p>
                                </div>
                            </div>

                            {/* Modal Right - Info */}
                            <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col gap-8 h-full overflow-y-auto max-h-[70vh] lg:max-h-none custom-scroll">
                                <div className="hidden lg:block space-y-1">
                                    <Badge className="bg-honey text-black font-black uppercase text-[10px] tracking-widest px-4 mb-4">
                                        {selectedBee.category}
                                    </Badge>
                                    <h2 className="text-5xl font-black text-foreground italic tracking-tighter uppercase leading-none">{selectedBee.name}</h2>
                                    <p className="text-xl text-muted-foreground font-serif italic">{selectedBee.scientificName}</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-6 bg-muted/30 rounded-[2rem] border border-border">
                                        <p className="text-sm font-medium leading-relaxed text-foreground/80 lowercase first-letter:uppercase italic">
                                            {selectedBee.description}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-muted/20 rounded-2xl border border-border/50">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Status</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-sm font-bold text-foreground">{selectedBee.conservationStatus}</span>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-muted/20 rounded-2xl border border-border/50">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Native Range</span>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-honey" />
                                                <span className="text-sm font-bold text-foreground">{selectedBee.range}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Key Characteristics</span>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedBee.traits.map((trait: string) => (
                                                <span key={trait} className="px-5 py-2.5 bg-honey/10 text-honey border border-honey/20 rounded-full text-[11px] font-black uppercase tracking-widest">
                                                    {trait}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto flex gap-4 pt-8 border-t border-border">
                                    <Button className="flex-1 h-14 bg-honey hover:bg-honey-deep text-black font-black uppercase tracking-widest italic rounded-2xl shadow-xl shadow-honey/20">
                                        Learn More
                                    </Button>
                                    <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-border hover:bg-muted text-muted-foreground">
                                        <Share2 className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Empty State */}
            {filteredBees.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center">
                        <Bug className="w-10 h-10 text-muted-foreground/30" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black uppercase tracking-tight italic">No species found</h3>
                        <p className="text-muted-foreground max-w-xs mx-auto">Try refining your search or category filter to discover more pollinators.</p>
                    </div>
                    <Button variant="outline" onClick={() => { setSearch(''); setSelectedCategory('All'); }} className="rounded-xl font-bold uppercase tracking-widest text-xs h-10">
                        Reset Filters
                    </Button>
                </div>
            )}

            <style>{`
                .custom-scroll::-webkit-scrollbar { width: 4px; }
                .custom-scroll::-webkit-scrollbar-track { background: transparent; }
                .custom-scroll::-webkit-scrollbar-thumb { background: rgba(251, 191, 36, 0.1); border-radius: 10px; }
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
