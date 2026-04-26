import React from 'react';
import { Bug, Dna, Microscope, Activity, ShieldCheck, Stethoscope } from 'lucide-react';
import { cn } from '@/lib/utils';
import { glass } from './GlassTheme';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import beeyieldService from '@/services/beeyieldService';
import { BeeSpeciesGallery } from './BeeSpeciesGallery';
import { BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';
import { motion, AnimatePresence } from 'framer-motion';
import { getGuideFallbackImage, getGuideImage } from '@/lib/beeGuideImages';

const HealthGuideView: React.FC<{ onTabChange: (tab: string, message?: string) => void }> = ({ onTabChange }) => {
    const [selectedItem, setSelectedItem] = React.useState<any>(null);
    const [activeTab, setActiveTab] = React.useState<'diseases' | 'species'>('diseases');
    const [diseaseData, setDiseaseData] = React.useState<any[]>([]);
    const [speciesData, setSpeciesData] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [search, setSearch] = React.useState('');
    const [diseaseTypeFilter, setDiseaseTypeFilter] = React.useState('all');
    const [speciesCategoryFilter, setSpeciesCategoryFilter] = React.useState('all');

    React.useEffect(() => {
        Promise.all([
            beeyieldService.getHealthGuide('diseases'),
            beeyieldService.getHealthGuide('species'),
        ]).then(([diseases, species]) => {
            setDiseaseData(diseases || []);
            setSpeciesData(species || []);
            setLoading(false);
        });
    }, []);

    const selectedItemImage = React.useMemo(() => getGuideImage(selectedItem), [selectedItem]);
    const selectedItemFallbackImage = React.useMemo(() => getGuideFallbackImage(selectedItem), [selectedItem]);
    const diseaseTypeOptions = React.useMemo(
        () => ['all', ...Array.from(new Set(diseaseData.map((entry) => entry.type).filter(Boolean)))],
        [diseaseData],
    );
    const speciesCategoryOptions = React.useMemo(
        () => ['all', ...Array.from(new Set(speciesData.map((entry) => entry.category).filter(Boolean)))],
        [speciesData],
    );

    const filteredDiseaseData = React.useMemo(() => {
        const needle = search.trim().toLowerCase();
        return diseaseData.filter((entry) => {
            const matchesSearch = !needle || [
                entry.name,
                entry.type,
                entry.riskLevel,
                entry.causes,
            ].some((value) => String(value || '').toLowerCase().includes(needle));
            const matchesType = diseaseTypeFilter === 'all' || entry.type === diseaseTypeFilter;
            return matchesSearch && matchesType;
        });
    }, [diseaseData, diseaseTypeFilter, search]);

    const filteredSpeciesData = React.useMemo(() => {
        const needle = search.trim().toLowerCase();
        return speciesData.filter((entry) => {
            const matchesSearch = !needle || [
                entry.name,
                entry.commonName,
                entry.scientificName,
                entry.category,
                entry.location,
            ].some((value) => String(value || '').toLowerCase().includes(needle));
            const matchesCategory = speciesCategoryFilter === 'all' || entry.category === speciesCategoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [search, speciesCategoryFilter, speciesData]);

    React.useEffect(() => {
        if (!selectedItem) return;
        const pool = activeTab === 'diseases' ? diseaseData : speciesData;
        if (!pool.some((entry) => entry.id === selectedItem.id)) {
            setSelectedItem(null);
        }
    }, [activeTab, diseaseData, selectedItem, speciesData]);

    return (
        <BeeYieldPageShell className={glass.page}>
            <BeeYieldPageHeader
                icon={Microscope}
                label="Health Guide"
                title={<>Health <span className="text-[#F4D03F]">Protocol</span></>}
                subtitle="Curated pathology database and species reference gallery."
                onBack={() => onTabChange('home')}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
                {/* Search & Filter */}
                <div className="lg:col-span-4 space-y-6">
                    <div className={cn(glass.section, "p-6 space-y-6")}>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider pl-1">Reference Mode</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('diseases')}
                                    className={cn(
                                        "rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-wider transition-colors",
                                        activeTab === 'diseases'
                                            ? "border-[#F4D03F] bg-[#F4D03F] text-foreground"
                                            : "border-border/ bg-card text-muted-foreground hover:text-foreground",
                                    )}
                                >
                                    Diseases
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('species')}
                                    className={cn(
                                        "rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-wider transition-colors",
                                        activeTab === 'species'
                                            ? "border-[#F4D03F] bg-[#F4D03F] text-foreground"
                                            : "border-border/ bg-card text-muted-foreground hover:text-foreground",
                                    )}
                                >
                                    Species
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider pl-1">Search Reference</label>
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder={activeTab === 'diseases' ? 'Search diseases, causes, risk...' : 'Search species, taxonomy, range...'}
                                className={cn(glass.input, "h-12 text-sm font-semibold")}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider pl-1">
                                {activeTab === 'diseases' ? 'Disease Type' : 'Species Category'}
                            </label>
                            <Select
                                value={activeTab === 'diseases' ? diseaseTypeFilter : speciesCategoryFilter}
                                onValueChange={(value) => {
                                    if (activeTab === 'diseases') {
                                        setDiseaseTypeFilter(value);
                                    } else {
                                        setSpeciesCategoryFilter(value);
                                    }
                                }}
                            >
                                <SelectTrigger className={cn(glass.input, "h-12")}>
                                    <SelectValue placeholder={activeTab === 'diseases' ? 'Filter disease types...' : 'Filter species categories...'} />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-border/ bg-muted/ backdrop-blur-xl">
                                    {(activeTab === 'diseases' ? diseaseTypeOptions : speciesCategoryOptions).map((option) => (
                                        <SelectItem key={option} value={option} className="text-xs font-bold">
                                            {option === 'all'
                                                ? (activeTab === 'diseases' ? 'All disease types' : 'All species categories')
                                                : option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider pl-1">
                                {activeTab === 'diseases' ? 'Pathology Database' : 'Species Reference'}
                            </label>
                            <Select onValueChange={(val) => {
                                const source = activeTab === 'diseases' ? filteredDiseaseData : filteredSpeciesData;
                                setSelectedItem(source.find((entry) => entry.id === val) || null);
                            }}>
                                <SelectTrigger className={cn(glass.input, "h-12")}>
                                    <SelectValue placeholder={activeTab === 'diseases' ? 'Select Disease...' : 'Select Bee Type...'} />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-border/ bg-muted/ backdrop-blur-xl">
                                    {(activeTab === 'diseases' ? filteredDiseaseData : filteredSpeciesData).map((entry) => (
                                        <SelectItem key={entry.id} value={entry.id} className="text-xs font-bold">
                                            {activeTab === 'diseases'
                                                ? `${entry.name}${entry.type ? ` • ${entry.type}` : ''}`
                                                : `${entry.commonName || entry.name}${entry.scientificName ? ` • ${entry.scientificName}` : ''}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-[11px] font-semibold text-muted-foreground">
                                {activeTab === 'diseases'
                                    ? `${filteredDiseaseData.length} disease records match the current filters.`
                                    : `${filteredSpeciesData.length} species records match the current filters.`}
                            </p>
                        </div>
                    </div>

                    {loading && (
                        <div className={cn(glass.card, "p-6 flex items-center gap-4")}>
                            <Activity className="w-5 h-5 animate-spin text-[#F4D03F]" />
                            <span className="text-[11px] font-bold text-muted-foreground">Syncing database...</span>
                        </div>
                    )}
                </div>

                {/* Content Area */}
                <div className="lg:col-span-8">
                    <AnimatePresence mode="wait">
                        {selectedItem ? (
                            <motion.div
                                key={selectedItem.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8"
                            >
                                <div className={cn(glass.section, "p-8 space-y-6 relative overflow-hidden")}>
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#F4D03F]/5 rounded-full blur-3xl -mr-32 -mt-32" />
                                    
                                    <div className="flex items-center gap-6 relative z-10">
                                        <div className="w-16 h-16 rounded-2xl bg-card border border-border/ flex items-center justify-center text-[#F4D03F]">
                                            {activeTab === 'diseases' ? <Bug className="w-8 h-8" /> : <Dna className="w-8 h-8" />}
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-foreground tracking-tighter">{selectedItem.name}</h2>
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <p className="text-sm font-bold text-[#1B9157]">
                                                    {activeTab === 'diseases' ? selectedItem.type : selectedItem.scientificName}
                                                </p>
                                                {activeTab === 'diseases' && selectedItem.riskLevel && (
                                                    <span className="px-2 py-0.5 rounded-full bg-card text-[10px] font-black text-foreground/70 uppercase tracking-wider border border-border/">
                                                        {selectedItem.riskLevel}
                                                    </span>
                                                )}
                                                {activeTab === 'species' && selectedItem.is_extinct && (
                                                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-[10px] font-black text-red-600 uppercase tracking-wider">
                                                        Extinct
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {selectedItemImage && (
                                        <div className="pt-6 border-t border-border/">
                                            <div className="relative overflow-hidden rounded-[2rem] border border-border/ bg-card">
                                                <img
                                                    src={selectedItemImage}
                                                    alt={selectedItem.commonName || selectedItem.name}
                                                    loading="lazy"
                                                    referrerPolicy="no-referrer"
                                                    onError={(event) => {
                                                        const img = event.currentTarget;
                                                        if (img.dataset.fallbackApplied) {
                                                            img.src = '/placeholder.svg';
                                                            return;
                                                        }

                                                        img.dataset.fallbackApplied = '1';
                                                        img.src = selectedItemFallbackImage && img.src !== selectedItemFallbackImage
                                                            ? selectedItemFallbackImage
                                                            : '/placeholder.svg';
                                                    }}
                                                    className="h-72 w-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/55 via-transparent to-transparent" />
                                                <div className="absolute left-5 bottom-5 right-5 flex items-end justify-between gap-4">
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/70">
                                                            {activeTab === 'species' ? 'Live species photo' : 'Live health reference'}
                                                        </p>
                                                        <p className="text-lg font-black text-white tracking-tight">
                                                            {selectedItem.commonName || selectedItem.name}
                                                        </p>
                                                    </div>
                                                    <span className="rounded-full bg-muted/ px-3 py-1 text-[10px] font-black uppercase tracking-wider text-foreground">
                                                        {activeTab === 'species' ? 'Exact photo' : 'Reference image'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className={cn(
                                        "grid grid-cols-1 md:grid-cols-2 gap-8",
                                        selectedItemImage ? "pt-2" : "pt-6 border-t border-border/",
                                    )}>
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-muted-foreground/70 uppercase tracking-widest flex items-center gap-2">
                                                <div className="w-1 h-3 bg-[#F4D03F]" />
                                                {activeTab === 'diseases' ? 'Causes & Signs' : 'Species Profile'}
                                            </h4>
                                            <p className="text-sm font-semibold text-foreground/80 leading-relaxed">
                                                {activeTab === 'diseases' ? selectedItem.causes : (selectedItem.suitability || selectedItem.description || 'No species profile is stored for this record yet.')}
                                            </p>
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-muted-foreground/70 uppercase tracking-widest flex items-center gap-2">
                                                <div className="w-1 h-3 bg-[#1B9157]" />
                                                {activeTab === 'diseases' ? 'Treatment & Management' : 'Health & Management'}
                                            </h4>
                                            <p className="text-sm font-semibold text-foreground/80 leading-relaxed">
                                                {activeTab === 'diseases' ? selectedItem.treatment : (selectedItem.healthProfile || selectedItem.notes || 'Health management notes are not available for this species yet.')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                        {activeTab === 'diseases' ? (
                                            <>
                                                <div className="rounded-2xl bg-card border border-border/ p-4 space-y-3">
                                                    <div className="flex items-center gap-2 text-foreground">
                                                        <Stethoscope className="w-4 h-4 text-[#F4D03F]" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Detection</span>
                                                    </div>
                                                    <p className="text-xs font-bold text-foreground/75 leading-relaxed">
                                                        {selectedItem.detection || (selectedItem.symptoms || []).join(', ') || 'Detection notes are not stored for this record yet.'}
                                                    </p>
                                                    <p className="text-[11px] font-semibold text-foreground/60 leading-relaxed">{selectedItem.cureStatus || selectedItem.prevention}</p>
                                                </div>
                                                <div className="rounded-2xl bg-card border border-border/ p-4 space-y-3">
                                                    <div className="flex items-center gap-2 text-foreground">
                                                        <Bug className="w-4 h-4 text-[#F4D03F]" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Hosts & Spread</span>
                                                    </div>
                                                    <p className="text-[11px] font-semibold text-foreground/65 leading-relaxed">{selectedItem.transmission || selectedItem.prevention || 'Transmission notes are not stored for this record yet.'}</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {(selectedItem.hostSpecies || []).map((host: string) => (
                                                            <span key={host} className="px-2 py-1 rounded-lg bg-amber-50 text-[10px] font-bold text-amber-700">
                                                                {host}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="rounded-2xl bg-card border border-border/ p-4 space-y-3">
                                                    <div className="flex items-center gap-2 text-foreground">
                                                        <ShieldCheck className="w-4 h-4 text-[#1B9157]" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Field Actions</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {(selectedItem.responseSteps || selectedItem.symptoms || []).map((step: string) => (
                                                            <span key={step} className="px-2 py-1 rounded-lg bg-emerald-50 text-[10px] font-bold text-emerald-700">
                                                                {step}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="rounded-2xl bg-card border border-border/ p-4 space-y-3">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Origin</span>
                                                    <p className="text-xs font-bold text-foreground/75">{selectedItem.location || 'Unknown'}</p>
                                                    <p className="text-[11px] font-semibold text-foreground/60 leading-relaxed">{selectedItem.idealUse || selectedItem.suitability}</p>
                                                </div>
                                                <div className="rounded-2xl bg-card border border-border/ p-4 space-y-3">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Common Pressures</span>
                                                    <div className="flex flex-wrap gap-1">
                                                        {(selectedItem.commonDiseases || []).map((risk: string) => (
                                                            <span key={risk} className="px-2 py-1 rounded-lg bg-rose-50 text-[10px] font-bold text-rose-700">
                                                                {risk}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="rounded-2xl bg-card border border-border/ p-4 space-y-3">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Traits & Watchouts</span>
                                                    <div className="flex flex-wrap gap-1">
                                                        {(selectedItem.traits || []).map((trait: string, i: number) => (
                                                            <span key={`${trait}-${i}`} className="px-2 py-1 rounded-lg bg-emerald-50 text-[10px] font-bold text-emerald-700">
                                                                {trait}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    
                                    <div className="flex justify-end pt-4">
                                        <button 
                                            onClick={() => onTabChange('assistant', `Tell me more about ${selectedItem.name}.`)}
                                            className={glass.btnPrimary}
                                        >
                                            Consult AI Assistant
                                        </button>
                                    </div>
                                </div>

                                {activeTab === 'species' && (
                                    <div className={cn(glass.card, "p-0 overflow-hidden rounded-[2.5rem]")}>
                                        <BeeSpeciesGallery species={speciesData} />
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <div className={cn(glass.card, "h-[400px] flex flex-col items-center justify-center text-center p-12 opacity-60")}>
                                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6 border border-dashed border-gray-300">
                                    <Microscope className="w-10 h-10 text-gray-300" />
                                </div>
                                <h3 className="text-xl font-black text-foreground tracking-tight">Database Awaiting</h3>
                                <p className="text-[11px] font-bold text-muted-foreground mt-2">Select an entry from the database to view detailed health protocols.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </BeeYieldPageShell>
    );
};

export default HealthGuideView;

