import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Bug, Stethoscope, Microscope, Search as SearchIcon, Dna, Globe, AlertCircle, ShieldCheck, Info, Activity, ChevronRight, Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BeeSpeciesGallery } from './BeeSpeciesGallery';

// Expanding mock data to cover what the user requested
const diseaseData = [
    {
        id: 'afb',
        name: 'American Foulbrood (AFB)',
        type: 'Bacterial',
        severity: 'Critical',
        causes: 'Paenibacillus larvae bacteria spores',
        effects: 'Kills larvae in the pupal stage, destroys colony completely in severe cases.',
        symptoms: ['Sunken cappings', 'Ropiness test positive', 'Foul odor', 'Patchy brood pattern'],
        prevention: 'Hygienic queen selection, do not feed foreign honey, regular brood inspection',
        treatment: 'Burning of infected equipment, antibiotics (where legally allowed, e.g., Terramycin)',
        code: 'PAT-AFB-001'
    },
    {
        id: 'efb',
        name: 'European Foulbrood (EFB)',
        type: 'Bacterial',
        severity: 'High',
        causes: 'Melissococcus plutonius bacteria',
        effects: 'Kills larvae before they are capped, leading to severe population decline.',
        symptoms: ['Displaced larvae in cells', 'Yellowish discoloration', 'Sour smell', 'Uncapped dead larvae'],
        prevention: 'Maintain strong colonies, avoid nectar flow stress or nutritional stress',
        treatment: 'Requeening to break brood cycle, shook swarm technique, feed sugar syrup',
        code: 'PAT-EFB-002'
    },
    {
        id: 'varroa',
        name: 'Varroa Mites',
        type: 'Parasitic',
        severity: 'High',
        causes: 'Varroa destructor mite',
        effects: 'Weakens adult bees, vectors viruses (like Deformed Wing Virus), causes colony collapse.',
        symptoms: ['Mites visible on bees', 'Deformed wings (DWV)', 'Rapid population decline', 'Spotty brood'],
        prevention: 'Drone brood removal, screen bottom boards, genetic resistance (VSH bees)',
        treatment: 'Formic acid, Oxalic acid vapor/dribble, Amitraz, Apiguard',
        code: 'PAR-VAR-003'
    },
    {
        id: 'nosema',
        name: 'Nosema Disease',
        type: 'Microsporidian / Fungal',
        severity: 'Medium',
        causes: 'Nosema apis and Nosema ceranae',
        effects: 'Infects the gut of adult bees, reducing lifespan, affecting digestion and causing dysentery.',
        symptoms: ['Dysentery streaks on hive front', 'K-wing appearance', 'Crawling bees in front of hive', 'Poor spring buildup'],
        prevention: 'Ensure clean water source, adequate winter stores, good hive ventilation',
        treatment: 'Fumagillin (under vet guidance), strong nutrition, re-queening',
        code: 'FUN-NOS-004'
    },
    {
        id: 'ccdv',
        name: 'Colony Collapse Disorder',
        type: 'Syndrome',
        severity: 'Critical',
        causes: 'Multiple interacting stressors: pesticides, pathogens, poor nutrition, parasites.',
        effects: 'Sudden loss of adult bee population with no dead bees found around the hive.',
        symptoms: ['Absence of adult bees', 'Brood present but abandoned', 'Food stores untouched'],
        prevention: 'Integrative pest management, clean forage, limit chemical exposure',
        treatment: 'No direct cure; management focuses on reducing pathogens and stress',
        code: 'SYN-CCD-005'
    },
    {
        id: 'shb',
        name: 'Small Hive Beetle (SHB)',
        type: 'Pest',
        severity: 'Medium',
        causes: 'Aethina tumida beetle',
        effects: 'Larvae tunnel through comb, ruining honey and pollen. Slime causes honey fermentation.',
        symptoms: ['Slime on combs', 'Fermenting honey smell', 'Adult beetles visible in crevices'],
        prevention: 'Keep hives in direct sun, maintain strong colonies, avoid excess space',
        treatment: 'Oil traps, soil treatments around hive (nematodes), swiffer cloths',
        code: 'PST-SHB-006'
    }
];

const speciesData = [
    {
        id: 'apis_mellifera',
        name: 'Apis Mellifera',
        commonName: 'Western Honey Bee',
        traits: ['High productivity', 'Moderate temperament', 'Strong wintering capacity', 'Prolific breeders'],
        suitability: 'Global / Multi-climate',
        code: 'SP-AM-001'
    },
    {
        id: 'apis_cerana',
        name: 'Apis Cerana',
        commonName: 'Eastern Honey Bee',
        traits: ['Varroa resistance through grooming', 'Small colony size', 'Frequent swarming', 'Fast flight'],
        suitability: 'Tropical / Sub-tropical Asia',
        code: 'SP-AC-002'
    },
    {
        id: 'apis_dorsata',
        name: 'Apis Dorsata',
        commonName: 'Giant Honey Bee',
        traits: ['Open single-comb nesting', 'Highly defensive', 'High honey yield per nest', 'Migratory'],
        suitability: 'Wild / Jungle ecosystems in Asia',
        code: 'SP-AD-003'
    },
    {
        id: 'buckfast',
        name: 'Buckfast Bee',
        commonName: 'Buckfast Hybrid',
        traits: ['Extremely gentle', 'Low swarming tendency', 'High honey production', 'Good resistance to tracheal mites'],
        suitability: 'Temperate / European climates',
        code: 'HYB-BF-004'
    },
    {
        id: 'carniolan',
        name: 'Apis mellifera carnica',
        commonName: 'Carniolan Honey Bee',
        traits: ['Rapid spring buildup', 'Gentle', 'Excellent winter survival on small stores', 'High swarming urge'],
        suitability: 'Cool / Temperate climates / Mountains',
        code: 'SSP-AMC-005'
    },
    {
        id: 'italian',
        name: 'Apis mellifera ligustica',
        commonName: 'Italian Honey Bee',
        traits: ['Yellow-streaked', 'Gentle', 'Very prolific layers', 'High honey consumption in winter'],
        suitability: 'Warm / Mediterranean climates',
        code: 'SSP-AML-006'
    }
];

interface HealthGuideViewProps {
    onTabChange?: (tab: string, message?: string, action?: string) => void;
}

const HealthGuideView: React.FC<HealthGuideViewProps> = ({ onTabChange }) => {
    const [selectedItem, setSelectedItem] = React.useState<any>(null);
    const [activeTab, setActiveTab] = React.useState<'diseases' | 'species'>('diseases');
    const [showSpeciesGallery, setShowSpeciesGallery] = React.useState(false);

    return (
        <div className="flex flex-col min-h-screen bg-[#FFF9F0] text-[#064e3b] overflow-y-auto">
            {/* Top Command Bar */}
            <div className="border-b-4 border-[#064e3b] p-10 flex flex-col xl:flex-row gap-8 items-start xl:items-center justify-between shrink-0 bg-[#facc15]/5">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[#10b981] bg-[#064e3b]">
                        <Microscope className="w-3.5 h-3.5 text-[#facc15]" />
                        <span className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-[0.2em]">Health & Biology DB</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-[#064e3b] tracking-tighter uppercase leading-none">
                        Health <span className="text-[#10b981]">Guide</span>
                    </h1>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-6 w-full xl:w-auto">
                    <div className="flex flex-col gap-2 w-full md:w-80 relative z-50">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#064e3b]/60">Pathology DB (200+ Entries)</span>
                        <Select onValueChange={(val) => { setActiveTab('diseases'); setSelectedItem(diseaseData.find(d => d.id === val)); }}>
                            <SelectTrigger className="w-full h-14 border-4 border-[#064e3b] bg-[#FFF9F0] rounded-none font-black text-xs uppercase text-[#064e3b] shadow-[4px_4px_0px_0px_rgba(6,78,59,1)]">
                                <SelectValue placeholder="Select Disease..." />
                            </SelectTrigger>
                            <SelectContent className="border-4 border-[#064e3b] rounded-none shadow-[6px_6px_0px_0px_rgba(6,78,59,1)]">
                                {diseaseData.map(d => (
                                    <SelectItem key={d.id} value={d.id} className="font-bold text-xs uppercase focus:bg-[#facc15]/20 focus:text-[#064e3b]">{d.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-2 w-full md:w-80 relative z-40">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#064e3b]/60">Species DB (Global Register)</span>
                        <Select onValueChange={(val) => { setActiveTab('species'); setSelectedItem(speciesData.find(s => s.id === val)); }}>
                            <SelectTrigger className="w-full h-14 border-4 border-[#064e3b] bg-[#FFF9F0] rounded-none font-black text-xs uppercase text-[#064e3b] shadow-[4px_4px_0px_0px_rgba(6,78,59,1)]">
                                <SelectValue placeholder="Select Bee Type..." />
                            </SelectTrigger>
                            <SelectContent className="border-4 border-[#064e3b] rounded-none shadow-[6px_6px_0px_0px_rgba(6,78,59,1)]">
                                {speciesData.map(s => (
                                    <SelectItem key={s.id} value={s.id} className="font-bold text-xs uppercase focus:bg-[#facc15]/20 focus:text-[#064e3b]">{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex justify-center p-10 bg-[#FFF9F0]">
                <div className="w-full max-w-5xl">
                    {activeTab === 'species' && !selectedItem && (
                        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="space-y-1">
                                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-[#064e3b]">
                                        Bee <span className="text-[#10b981]">Species</span>
                                    </h2>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#064e3b]/60">
                                        Visual species reference gallery
                                    </p>
                                </div>
                                <Button
                                    onClick={() => setShowSpeciesGallery((v) => !v)}
                                    className="h-12 px-6 border-4 border-[#064e3b] bg-[#facc15] hover:bg-[#10b981] text-[#064e3b] hover:text-[#1A1A1A] transition-all shadow-[6px_6px_0px_0px_rgba(6,78,59,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 font-black uppercase tracking-widest"
                                >
                                    {showSpeciesGallery ? 'Hide Gallery' : 'Open Gallery'}
                                </Button>
                            </div>

                            {showSpeciesGallery ? (
                                <div className="border-4 border-[#064e3b] shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]">
                                    <BeeSpeciesGallery />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {speciesData.map((s) => (
                                        <Card
                                            key={s.id}
                                            className="border-4 border-[#064e3b] rounded-none shadow-[6px_6px_0px_0px_rgba(6,78,59,1)] bg-[#FFF9F0]"
                                        >
                                            <CardHeader className="border-b-4 border-[#064e3b] bg-[#facc15]/10">
                                                <CardTitle className="text-xl font-black uppercase tracking-tight text-[#064e3b] flex items-center justify-between gap-4">
                                                    <span>{s.commonName}</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#10b981]">{s.code}</span>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6 space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-[#064e3b] border-4 border-[#10b981] flex items-center justify-center text-[#facc15]">
                                                        <Dna className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black uppercase text-[#064e3b]">{s.name}</p>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#064e3b]/60">{s.suitability}</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#064e3b]/60">Traits</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {s.traits.slice(0, 6).map((t: string) => (
                                                            <span key={t} className="px-3 py-1 border-2 border-[#064e3b] bg-white text-[10px] font-black uppercase tracking-widest text-[#064e3b]">
                                                                {t}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t-4 border-[#064e3b] flex justify-end">
                                                    <Button
                                                        onClick={() => { setActiveTab('species'); setSelectedItem(s); }}
                                                        className="h-11 px-6 border-4 border-[#064e3b] bg-[#facc15] hover:bg-[#10b981] text-[#064e3b] hover:text-[#1A1A1A] transition-all shadow-[4px_4px_0px_0px_rgba(6,78,59,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 font-black uppercase tracking-widest"
                                                    >
                                                        View Details
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {selectedItem ? (
                        <div className="space-y-16 animate-in fade-in duration-500 pb-20">
                            {/* Detail Header */}
                            <div className="space-y-8">
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 bg-[#064e3b] border-4 border-[#10b981] flex items-center justify-center text-[#facc15] shrink-0">
                                            {activeTab === 'diseases' ? <Bug className="w-10 h-10" /> : <Dna className="w-10 h-10" />}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-[#064e3b] leading-tight">{selectedItem.name}</h2>
                                            </div>
                                            <p className="text-xl font-black text-[#10b981] uppercase tracking-tight">
                                                {activeTab === 'diseases' ? `Type: ${selectedItem.type}` : `Common Name: ${selectedItem.commonName}`}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => onTabChange?.('assistant', `Tell me more about ${selectedItem.name} from the Health Guide.`)}
                                        className="h-14 px-8 border-4 border-[#064e3b] bg-[#facc15] hover:bg-[#10b981] text-[#064e3b] hover:text-[#1A1A1A] transition-all shadow-[6px_6px_0px_0px_rgba(6,78,59,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 font-black uppercase tracking-widest shrink-0"
                                    >
                                        <Bot className="w-5 h-5 mr-3" />
                                        Ask BeeYield
                                    </Button>
                                </div>
                                <div className="h-1 bg-[#064e3b]/10 w-full" />
                            </div>

                            {activeTab === 'diseases' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-10">
                                        <section className="space-y-6">
                                            <div className="flex items-center gap-3 border-[#064e3b] border-l-8 pl-6">
                                                <AlertCircle className="w-6 h-6 text-[#064e3b]" />
                                                <h3 className="text-3xl font-black uppercase tracking-tighter">Causes & Effects</h3>
                                            </div>
                                            <div className="p-8 border-4 border-[#064e3b] bg-[#FFF9F0] shadow-[6px_6px_0px_0px_rgba(6,78,59,1)] space-y-6">
                                                <div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#10b981]">Primary Cause</span>
                                                    <p className="text-sm font-bold mt-2">{selectedItem.causes}</p>
                                                </div>
                                                <div className="h-0.5 bg-[#064e3b]/10" />
                                                <div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Known Effects</span>
                                                    <p className="text-sm font-bold mt-2">{selectedItem.effects}</p>
                                                </div>
                                            </div>
                                        </section>

                                        <section className="space-y-6">
                                            <div className="flex items-center gap-3 border-[#facc15] border-l-8 pl-6">
                                                <Stethoscope className="w-6 h-6 text-[#facc15]" />
                                                <h3 className="text-3xl font-black uppercase tracking-tighter">Signs & Symptoms</h3>
                                            </div>
                                            <ul className="space-y-4">
                                                {selectedItem.symptoms.map((symptom: string, i: number) => (
                                                    <li key={i} className="flex gap-4 items-center p-4 bg-neutral-50 border-4 border-[#064e3b] shadow-[4px_4px_0px_0px_rgba(6,78,59,1)]">
                                                        <div className="w-4 h-4 bg-[#facc15]" />
                                                        <span className="text-xs font-black uppercase tracking-widest">{symptom}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </section>
                                    </div>

                                    <div className="space-y-10">
                                        <section className="space-y-6">
                                            <div className="flex items-center gap-3 border-[#10b981] border-l-8 pl-6">
                                                <ShieldCheck className="w-6 h-6 text-[#10b981]" />
                                                <h3 className="text-3xl font-black uppercase tracking-tighter">Treatment & Management</h3>
                                            </div>
                                            <div className="p-8 border-4 border-[#064e3b] bg-[#064e3b] text-[#1A1A1A] shadow-[8px_8px_0px_0px_rgba(16,185,129,1)]">
                                                <p className="text-sm font-black uppercase tracking-loose leading-relaxed">{selectedItem.treatment}</p>
                                            </div>
                                        </section>

                                        <section className="space-y-6">
                                            <div className="flex items-center gap-3 border-[#064e3b] border-l-8 pl-6">
                                                <Info className="w-6 h-6 text-[#064e3b]" />
                                                <h3 className="text-3xl font-black uppercase tracking-tighter">Prevention Strategies</h3>
                                            </div>
                                            <div className="p-8 border-4 border-[#064e3b] bg-neutral-50 shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]">
                                                <p className="text-sm font-black text-[#064e3b] uppercase tracking-loose leading-relaxed">{selectedItem.prevention}</p>
                                            </div>
                                        </section>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <section className="space-y-8">
                                        <div className="flex items-center gap-3 border-[#064e3b] border-l-8 pl-6">
                                            <Dna className="w-6 h-6 text-[#064e3b]" />
                                            <h3 className="text-3xl font-black uppercase tracking-tighter">Characteristics & Traits</h3>
                                        </div>
                                        <ul className="space-y-4">
                                            {selectedItem.traits.map((trait: string, i: number) => (
                                                <li key={i} className="flex gap-4 items-center p-6 border-4 border-[#064e3b] bg-[#FFF9F0] shadow-[6px_6px_0px_0px_rgba(6,78,59,1)]">
                                                    <div className="w-4 h-4 bg-[#facc15]" />
                                                    <span className="text-sm font-black uppercase tracking-widest">{trait}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                    <section className="space-y-8">
                                        <div className="flex items-center gap-3 border-[#10b981] border-l-8 pl-6">
                                            <Globe className="w-6 h-6 text-[#10b981]" />
                                            <h3 className="text-3xl font-black uppercase tracking-tighter">Locations & Habitats</h3>
                                        </div>
                                        <div className="p-10 border-4 border-[#064e3b] bg-[#064e3b] text-[#1A1A1A] shadow-[10px_10px_0px_0px_rgba(16,185,129,1)]">
                                            <span className="block text-[10px] text-[#facc15] font-black uppercase tracking-widest mb-4">Natural / Adapted Domain</span>
                                            <p className="text-2xl font-black uppercase tracking-tighter">{selectedItem.suitability}</p>
                                        </div>
                                    </section>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center space-y-8 py-32 opacity-50">
                            <div className="w-32 h-32 bg-[#064e3b]/5 border-4 border-[#064e3b]/20 flex items-center justify-center">
                                <SearchIcon className="w-16 h-16 text-[#064e3b]/30" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-4xl font-black uppercase tracking-tighter text-[#064e3b]">Database Awaiting</h3>
                                <p className="text-[#064e3b]/50 font-black uppercase text-[10px] tracking-[0.3em]">Select an entry from the dropdowns above.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HealthGuideView;
