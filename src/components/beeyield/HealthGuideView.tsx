import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from "@/components/ui/badge";
import {
    Search,
    Stethoscope,
    Bug,
    ShieldAlert,
    BookOpen,
    Info,
    CheckCircle2,
    AlertCircle,
    Activity,
    Syringe,
    HeartPulse,
    Microscope,
    ShieldCheck,
    ChevronRight,
    Search as SearchIcon,
    Dna,
    Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data for health guide
const diseaseData = [
    {
        id: 'afb',
        name: 'American Foulbrood (AFB)',
        type: 'Bacterial',
        severity: 'Critical',
        symptoms: ['Sunken cappings', 'Ropiness test positive', 'Foul odor', 'Patchy brood pattern'],
        prevention: 'Hygienic queen selection, regular inspection',
        treatment: 'Burning of infected equipment, antibiotics (where allowed)',
        code: 'PAT-AFB-001'
    },
    {
        id: 'efb',
        name: 'European Foulbrood (EFB)',
        type: 'Bacterial',
        severity: 'High',
        symptoms: ['Displaced larvae', 'Yellowish discoloration', 'Sour smell'],
        prevention: 'Maintain strong colonies, avoid stress',
        treatment: 'Requeening, shook swarm technique',
        code: 'PAT-EFB-002'
    },
    {
        id: 'varroa',
        name: 'Varroa Mites',
        type: 'Parasitic',
        severity: 'High',
        symptoms: ['Mites visible on bees', 'Deformed Wing Virus', 'Rapid population decline'],
        prevention: 'Drone brood removal, screen bottom boards',
        treatment: 'Formic acid, Oxalic acid, Amitraz',
        code: 'PAR-VAR-003'
    },
    {
        id: 'nosema',
        name: 'Nosema Disease',
        type: 'Fungal',
        severity: 'Medium',
        symptoms: ['Dysentery streaks on hive', 'K-wing appearance', 'Poor spring buildup'],
        prevention: 'Clean water source, adequate winter stores',
        treatment: 'Fumagillin (under vet guidance)',
        code: 'FUN-NOS-004'
    },
    {
        id: 'shb',
        name: 'Small Hive Beetle (SHB)',
        type: 'Pest',
        severity: 'Medium',
        symptoms: ['Slime on combs', 'Fermenting honey', 'Beetles visible in crevices'],
        prevention: 'Keep hives in sun, maintain strong colonies',
        treatment: 'Oil traps, ground treatments',
        code: 'PST-SHB-005'
    }
];

const speciesData = [
    {
        id: 'apis_mellifera',
        name: 'Apis Mellifera',
        commonName: 'Western Honey Bee',
        traits: ['High productivity', 'Moderate temperament', 'Strong wintering capacity'],
        suitability: 'Global / Multi-climate',
        code: 'SP-AM-001'
    },
    {
        id: 'apis_cerana',
        name: 'Apis Cerana',
        commonName: 'Eastern Honey Bee',
        traits: ['Varroa resistance', 'Small colony size', 'Frequent swarming'],
        suitability: 'Tropical / Sub-tropical Asia',
        code: 'SP-AC-002'
    },
    {
        id: 'apis_dorsata',
        name: 'Apis Dorsata',
        commonName: 'Giant Honey Bee',
        traits: ['Open nesting', 'Highly defensive', 'High honey yield per nest'],
        suitability: 'Wild / Jungle ecosystems',
        code: 'SP-AD-003'
    },
    {
        id: 'apis_florea',
        name: 'Apis Florea',
        commonName: 'Dwarf Honey Bee',
        traits: ['Single comb nests', 'Low productivity', 'Gentle temperament'],
        suitability: 'Warm / Arid lowlands',
        code: 'SP-AF-004'
    }
];

const HealthGuideView: React.FC = () => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedItem, setSelectedItem] = React.useState<any>(null);
    const [activeTab, setActiveTab] = React.useState<'diseases' | 'species'>('diseases');

    const filteredItems = (activeTab === 'diseases' ? diseaseData : speciesData).filter((item: any) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-screen bg-white text-[#064e3b] overflow-hidden">
            {/* Top Command Bar */}
            <div className="h-32 border-b-4 border-[#064e3b] px-10 flex items-center justify-between shrink-0">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[#10b981] bg-[#064e3b] mb-1">
                        <Microscope className="w-3.5 h-3.5 text-[#facc15]" />
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Health Check</span>
                    </div>
                    <h1 className="text-5xl font-black text-[#064e3b] tracking-tighter uppercase leading-none">
                        Health <span className="text-[#10b981]">Guide</span>
                    </h1>
                </div>

                <div className="flex items-center gap-6">
                    <div className="relative w-96">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#064e3b]/30" />
                        <Input
                            placeholder="SEARCH HEALTH INFO..."
                            className="pl-12 h-14 rounded-none border-4 border-[#064e3b] bg-neutral-50 font-black uppercase text-xs tracking-widest placeholder:text-neutral-300 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:bg-[#facc15]/5 transition-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex border-4 border-[#064e3b] p-1.5 bg-neutral-50">
                        <button
                            onClick={() => { setActiveTab('diseases'); setSelectedItem(null); }}
                            className={cn(
                                "h-10 px-8 font-black text-[10px] uppercase tracking-widest transition-none",
                                activeTab === 'diseases' ? "bg-[#064e3b] text-white shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]" : "text-[#064e3b]/40 hover:text-[#064e3b]"
                            )}
                        >
                            Diseases
                        </button>
                        <button
                            onClick={() => { setActiveTab('species'); setSelectedItem(null); }}
                            className={cn(
                                "h-10 px-8 font-black text-[10px] uppercase tracking-widest transition-none",
                                activeTab === 'species' ? "bg-[#064e3b] text-white shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]" : "text-[#064e3b]/40 hover:text-[#064e3b]"
                            )}
                        >
                            Bee Types
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Protocol Selector Sidebar */}
                <div className="w-1/3 border-r-4 border-[#064e3b] overflow-y-auto bg-neutral-50/50 p-10">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b-4 border-[#064e3b]/10 pb-4">
                            <Activity className="w-5 h-5 text-[#064e3b]" />
                            <h3 className="text-xl font-black uppercase tracking-tighter">Health List</h3>
                        </div>
                        <div className="space-y-4">
                            {filteredItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setSelectedItem(item)}
                                    className={cn(
                                        "w-full p-6 text-left border-4 transition-all group flex flex-col gap-2",
                                        selectedItem?.id === item.id
                                            ? "bg-[#064e3b] border-[#064e3b] text-white shadow-[6px_6px_0px_0px_rgba(16,185,129,1)]"
                                            : "bg-white border-[#064e3b] text-[#064e3b] shadow-[4px_4px_0px_0px_rgba(6,78,59,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                                    )}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className={cn(
                                            "text-[9px] font-black uppercase tracking-widest",
                                            selectedItem?.id === item.id ? "text-[#facc15]" : "text-[#064e3b]/40"
                                        )}>
                                            {item.code}
                                        </span>
                                        {activeTab === 'diseases' && (
                                            <span className={cn(
                                                "text-[8px] px-2 py-0.5 border-2 font-black uppercase tracking-widest",
                                                (item as any).severity === 'Critical' ? "bg-red-500 text-white border-red-500" :
                                                    (item as any).severity === 'High' ? "bg-[#facc15] text-[#064e3b] border-[#facc15]" :
                                                        "bg-[#10b981] text-white border-[#10b981]"
                                            )}>
                                                {(item as any).severity}
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="text-xl font-black uppercase tracking-tighter leading-tight">{item.name}</h4>
                                    <div className="flex items-center gap-2 mt-2 opacity-40">
                                        <ChevronRight className="w-3 h-3" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">DETAILS</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Registry Detail Panel */}
                <div className="flex-1 overflow-y-auto bg-white p-20">
                    {selectedItem ? (
                        <div className="max-w-4xl space-y-16 animate-in fade-in duration-500">
                            {/* Detail Header */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 bg-[#064e3b] border-4 border-[#10b981] flex items-center justify-center text-[#facc15]">
                                        {activeTab === 'diseases' ? <Bug className="w-10 h-10" /> : <Dna className="w-10 h-10" />}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-6xl font-black uppercase tracking-tighter text-[#064e3b]">{selectedItem.name}</h2>
                                        </div>
                                        <p className="text-2xl font-black text-[#10b981] uppercase tracking-tight">
                                            {activeTab === 'diseases' ? `Type: ${selectedItem.type}` : `Common Name: ${selectedItem.commonName}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="h-1 bg-[#064e3b]/10 w-full" />
                            </div>

                            {activeTab === 'diseases' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-10">
                                        <section className="space-y-6">
                                            <div className="flex items-center gap-3 border-[#064e3b] border-l-8 pl-6">
                                                <AlertCircle className="w-6 h-6 text-[#064e3b]" />
                                                <h3 className="text-3xl font-black uppercase tracking-tighter">Symptoms</h3>
                                            </div>
                                            <ul className="space-y-4">
                                                {selectedItem.symptoms.map((symptom: string, i: number) => (
                                                    <li key={i} className="flex gap-4 items-center p-4 bg-neutral-50 border-4 border-[#064e3b] shadow-[4px_4px_0px_0px_rgba(6,78,59,1)]">
                                                        <div className="w-4 h-4 bg-[#10b981]" />
                                                        <span className="text-xs font-black uppercase tracking-widest">{symptom}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </section>
                                        <section className="space-y-6">
                                            <div className="flex items-center gap-3 border-[#10b981] border-l-8 pl-6">
                                                <ShieldCheck className="w-6 h-6 text-[#10b981]" />
                                                <h3 className="text-3xl font-black uppercase tracking-tighter">What to do</h3>
                                            </div>
                                            <div className="p-8 border-4 border-[#064e3b] bg-[#064e3b] text-white shadow-[8px_8px_0px_0px_rgba(16,185,129,1)]">
                                                <p className="text-sm font-black uppercase tracking-loose leading-relaxed">{selectedItem.treatment}</p>
                                            </div>
                                        </section>
                                    </div>

                                    <div className="space-y-10">
                                        <section className="space-y-6">
                                            <div className="flex items-center gap-3 border-[#facc15] border-l-8 pl-6">
                                                <Info className="w-6 h-6 text-[#facc15]" />
                                                <h3 className="text-3xl font-black uppercase tracking-tighter">How to prevent</h3>
                                            </div>
                                            <div className="p-8 border-4 border-[#064e3b] bg-white shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]">
                                                <p className="text-sm font-black text-[#064e3b] uppercase tracking-loose leading-relaxed">{selectedItem.prevention}</p>
                                            </div>
                                        </section>
                                        <section className="p-10 border-4 border-[#064e3b] bg-neutral-50 flex flex-col items-center text-center gap-6">
                                            <div className="w-16 h-16 bg-[#064e3b] flex items-center justify-center border-2 border-[#10b981] text-[#facc15]">
                                                <Activity className="w-8 h-8" />
                                            </div>
                                            <h4 className="text-xl font-black uppercase tracking-tighter">Check Hive</h4>
                                            <Button className="w-full h-14 bg-[#064e3b] text-white hover:bg-[#10b981] uppercase font-black tracking-widest transition-none shadow-[6px_6px_0px_0px_rgba(250,204,21,1)]">
                                                Check now
                                            </Button>
                                        </section>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <section className="space-y-8">
                                        <div className="flex items-center gap-3 border-[#064e3b] border-l-8 pl-6">
                                            <Dna className="w-6 h-6 text-[#064e3b]" />
                                            <h3 className="text-3xl font-black uppercase tracking-tighter">Genetic Markers</h3>
                                        </div>
                                        <ul className="space-y-4">
                                            {selectedItem.traits.map((trait: string, i: number) => (
                                                <li key={i} className="flex gap-4 items-center p-6 border-4 border-[#064e3b] bg-white shadow-[6px_6px_0px_0px_rgba(6,78,59,1)]">
                                                    <div className="w-4 h-4 bg-[#facc15]" />
                                                    <span className="text-sm font-black uppercase tracking-widest">{trait}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                    <section className="space-y-8">
                                        <div className="flex items-center gap-3 border-[#10b981] border-l-8 pl-6">
                                            <Globe className="w-6 h-6 text-[#10b981]" />
                                            <h3 className="text-3xl font-black uppercase tracking-tighter">Ecological Sector</h3>
                                        </div>
                                        <div className="p-10 border-4 border-[#064e3b] bg-[#064e3b] text-white shadow-[10px_10px_0px_0px_rgba(16,185,129,1)]">
                                            <span className="block text-[10px] text-white/40 font-black uppercase tracking-widest mb-4">Location</span>
                                            <p className="text-2xl font-black uppercase tracking-tighter">{selectedItem.suitability}</p>
                                        </div>
                                    </section>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-1000">
                            <div className="w-32 h-32 bg-[#064e3b] border-4 border-[#10b981] flex items-center justify-center shadow-[12px_12px_0px_0px_rgba(250,204,21,1)]">
                                <Search className="w-16 h-16 text-[#facc15]" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-4xl font-black uppercase tracking-tighter text-[#064e3b]">Select an item</h3>
                                <p className="text-[#064e3b]/30 font-black uppercase text-[10px] tracking-[0.3em]">Choose a disease or bee type from the list.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HealthGuideView;
