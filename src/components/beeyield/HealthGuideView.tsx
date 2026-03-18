import React from 'react';
import { Bug, Dna, Microscope, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { glass } from './GlassTheme';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import beeyieldService from '@/services/beeyieldService';
import { BeeSpeciesGallery } from './BeeSpeciesGallery';
import { BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';
import { motion, AnimatePresence } from 'framer-motion';

const HealthGuideView: React.FC<{ onTabChange: (tab: string, message?: string) => void }> = ({ onTabChange }) => {
    const [selectedItem, setSelectedItem] = React.useState<any>(null);
    const [activeTab, setActiveTab] = React.useState<'diseases' | 'species'>('diseases');
    const [diseaseData, setDiseaseData] = React.useState<any[]>([]);
    const [speciesData, setSpeciesData] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        beeyieldService.getHealthGuide('diseases').then(d => setDiseaseData(d || []));
        beeyieldService.getHealthGuide('species').then(s => {
            setSpeciesData(s || []);
            setLoading(false);
        });
    }, []);

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
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Pathology Database</label>
                            <Select onValueChange={(val) => { setActiveTab('diseases'); setSelectedItem(diseaseData.find(d => d.id === val)); }}>
                                <SelectTrigger className={cn(glass.input, "h-12")}>
                                    <SelectValue placeholder="Select Disease..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-white/20 bg-white/90 backdrop-blur-xl">
                                    {diseaseData.map(d => <SelectItem key={d.id} value={d.id} className="text-xs font-bold">{d.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Species Reference</label>
                            <Select onValueChange={(val) => { setActiveTab('species'); setSelectedItem(speciesData.find(s => s.id === val)); }}>
                                <SelectTrigger className={cn(glass.input, "h-12")}>
                                    <SelectValue placeholder="Select Bee Type..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-white/20 bg-white/90 backdrop-blur-xl">
                                    {speciesData.map(s => <SelectItem key={s.id} value={s.id} className="text-xs font-bold">{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {loading && (
                        <div className={cn(glass.card, "p-6 flex items-center gap-4")}>
                            <Activity className="w-5 h-5 animate-spin text-[#F4D03F]" />
                            <span className="text-[11px] font-bold text-gray-500">Syncing database...</span>
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
                                        <div className="w-16 h-16 rounded-2xl bg-[#FFF9F0] border border-[#F4D03F]/20 flex items-center justify-center text-[#F4D03F]">
                                            {activeTab === 'diseases' ? <Bug className="w-8 h-8" /> : <Dna className="w-8 h-8" />}
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-[#1A1A1A] tracking-tighter">{selectedItem.name}</h2>
                                            <p className="text-sm font-bold text-[#1B9157]">
                                                {activeTab === 'diseases' ? selectedItem.type : selectedItem.commonName}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-[#F4D03F]/10">
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <div className="w-1 h-3 bg-[#F4D03F]" />
                                                Analysis
                                            </h4>
                                            <p className="text-sm font-semibold text-[#1A1A1A]/80 leading-relaxed">
                                                {activeTab === 'diseases' ? selectedItem.causes : selectedItem.suitability}
                                            </p>
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <div className="w-1 h-3 bg-[#1B9157]" />
                                                Resolution
                                            </h4>
                                            <p className="text-sm font-semibold text-[#1A1A1A]/80 leading-relaxed">
                                                {activeTab === 'diseases' ? selectedItem.treatment : selectedItem.traits.join(', ')}
                                            </p>
                                        </div>
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
                                        <BeeSpeciesGallery />
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <div className={cn(glass.card, "h-[400px] flex flex-col items-center justify-center text-center p-12 opacity-60")}>
                                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6 border border-dashed border-gray-300">
                                    <Microscope className="w-10 h-10 text-gray-300" />
                                </div>
                                <h3 className="text-xl font-black text-[#1A1A1A] tracking-tight">Database Awaiting</h3>
                                <p className="text-[11px] font-bold text-gray-500 mt-2">Select an entry from the database to view detailed health protocols.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </BeeYieldPageShell>
    );
};

export default HealthGuideView;
