import React, { useState, useEffect } from 'react';
import {
    Search,
    Loader2,
    HeartPulse,
    ShieldCheck,
    Bug,
    Zap,
    Activity,
    Wind,
    ArrowRight,
    Bot,
    Database,
    Binary,
    Globe,
    Cpu,
    Dna,
    Stethoscope
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { beeHealthData } from '@/data/beeHealthData';
import { beeSpeciesData } from '@/data/beeSpeciesData';
import beeyieldService from '@/services/beeyieldService';
import { cn } from '@/lib/utils';

interface HealthGuideViewProps {
    onTabChange: (tab: string, message?: string) => void;
}

const HealthGuideView: React.FC<HealthGuideViewProps> = ({ onTabChange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSymptom, setSelectedSymptom] = useState('none');
    const [selectedSpecies, setSelectedSpecies] = useState('none');
    const [communityKnowledge, setCommunityKnowledge] = useState<any[]>([]);
    const [loadingKB, setLoadingKB] = useState(false);

    // Fetch dynamic knowledge base articles from backend
    useEffect(() => {
        const fetchKB = async () => {
            setLoadingKB(true);
            try {
                const results = await beeyieldService.getHealthKnowledgeBase(searchTerm || undefined);
                setCommunityKnowledge(results || []);
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoadingKB(false);
            }
        };
        // Debounce search
        const timeout = setTimeout(fetchKB, 500);
        return () => clearTimeout(timeout);
    }, [searchTerm]);

    const detail = beeHealthData[selectedSymptom] || {
        signs: "N/A",
        symptoms: "N/A",
        treatment: "N/A",
        prevention: "N/A",
        steps: [],
        riskLevel: "MEDIUM",
        detection: "Visual inspection",
        transmission: "Contact",
        scientificName: ""
    };

    const speciesDetail = beeSpeciesData[selectedSpecies] || {
        scientificName: "N/A",
        commonName: "N/A",
        origin: "N/A",
        characteristics: "N/A",
        honeyYield: "N/A",
        temperament: "N/A",
        climateSuitability: "N/A",
        pros: [],
        cons: [],
        description: "N/A"
    };

    const filteredSymptoms = Object.keys(beeHealthData).filter(s =>
        s.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredSpecies = Object.keys(beeSpeciesData).filter(s =>
        s.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRiskStyles = (risk?: string) => {
        switch (risk) {
            case 'CRITICAL': return 'bg-red-500 text-white border-black';
            case 'HIGH': return 'bg-[#FF4F00] text-white border-black';
            case 'MEDIUM': return 'bg-white text-black border-black';
            default: return 'bg-neutral-100 text-black border-black';
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header Section */}
            <div className="flex items-center gap-4 border-b-4 border-black pb-6">
                <div className="w-12 h-12 bg-black flex items-center justify-center border-2 border-black">
                    <Database className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-5xl font-black text-black uppercase tracking-tighter">
                    Health
                </h1>
            </div>

            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-1">
                Colony pathology and sub-species data.
            </p>

            {/* Tactical Search & Selectors */}
            <div className="space-y-8">
                <div className="border-4 border-black bg-white p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-10">
                    <div className="relative max-w-2xl">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />
                        <Input
                            placeholder="Search diseases or species..."
                            className="h-16 pl-14 pr-6 rounded-none border-4 border-black text-lg font-black text-black uppercase tracking-tight focus:ring-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {loadingKB && (
                            <div className="absolute right-6 top-1/2 -translate-y-1/2">
                                <Loader2 className="w-6 h-6 text-black animate-spin" />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Diseases</label>
                            <Select value={selectedSymptom} onValueChange={(val) => {
                                setSelectedSymptom(val);
                                if (val !== 'none') setSelectedSpecies('none');
                            }}>
                                <SelectTrigger className="h-16 px-6 rounded-none border-4 border-black text-base font-black text-black uppercase tracking-tight transition-none focus:ring-0">
                                    <div className="flex items-center gap-3">
                                        <Bug className="w-5 h-5 text-black" />
                                        <SelectValue placeholder="Condition" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-none border-4 border-black p-0 max-h-[400px]">
                                    <SelectItem value="none" className="font-black uppercase py-4 px-6 text-neutral-400">None</SelectItem>
                                    {filteredSymptoms.map(s => (
                                        <SelectItem key={s} value={s} className="font-black uppercase py-4 px-6">{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Species</label>
                            <Select value={selectedSpecies} onValueChange={(val) => {
                                setSelectedSpecies(val);
                                if (val !== 'none') setSelectedSymptom('none');
                            }}>
                                <SelectTrigger className="h-16 px-6 rounded-none border-4 border-black text-base font-black text-black uppercase tracking-tight transition-none focus:ring-0">
                                    <div className="flex items-center gap-3">
                                        <Dna className="w-5 h-5 text-black" />
                                        <SelectValue placeholder="Genetic Profile" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-none border-4 border-black p-0 max-h-[400px]">
                                    <SelectItem value="none" className="font-black uppercase py-4 px-6 text-neutral-400">None</SelectItem>
                                    {filteredSpecies.map(s => (
                                        <SelectItem key={s} value={s} className="font-black uppercase py-4 px-6">{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Community Knowledge Results */}
                <AnimatePresence>
                    {communityKnowledge.length > 0 && searchTerm && (
                        <div className="space-y-6 pt-4">
                            <div className="flex items-center gap-3 border-b-2 border-black pb-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-black">Articles</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {communityKnowledge.map((article: any) => (
                                    <div key={article.id} className="p-8 border-4 border-black bg-white hover:bg-neutral-50 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-none cursor-pointer group">
                                        <div className="flex justify-between items-start mb-4">
                                            <h4 className="font-black text-black text-lg uppercase tracking-tight group-hover:text-[#FF4F00]">{article.title}</h4>
                                            <div className="text-[10px] uppercase font-black tracking-widest bg-black text-white px-3 py-1 border-2 border-black">{article.category}</div>
                                        </div>
                                        <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-tight line-clamp-2">{article.description}</p>
                                        <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#FF4F00] opacity-0 group-hover:opacity-100 transition-none">
                                            Read <ArrowRight className="w-3 h-3" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Condition/Species Details */}
            <AnimatePresence mode="wait">
                {selectedSymptom !== 'none' && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500 border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                        <div className="p-12 md:p-16 space-y-16">
                            {/* Header Detail */}
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b-4 border-black pb-10">
                                <div className="space-y-4">
                                    <h1 className="text-6xl md:text-8xl font-black text-black tracking-tighter uppercase leading-none">
                                        {selectedSymptom}
                                    </h1>
                                    {detail.scientificName && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-[#FF4F00]" />
                                            <p className="text-xl font-black text-neutral-400 uppercase italic">
                                                {detail.scientificName}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                {detail.riskLevel && (
                                    <div className={cn("px-10 py-5 border-4 font-black tracking-widest uppercase text-lg", getRiskStyles(detail.riskLevel))}>
                                        Risk: {detail.riskLevel}
                                    </div>
                                )}
                            </div>

                            {/* Body Content */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                                <div className="space-y-6">
                                    <div className="inline-flex items-center gap-3 px-4 py-2 border-2 border-black bg-neutral-100">
                                        <Search className="w-4 h-4 text-black" />
                                        <span className="text-[10px] font-black text-black uppercase tracking-widest">Signs</span>
                                    </div>
                                    <h2 className="text-4xl font-black text-black uppercase tracking-tighter">Visual Markers</h2>
                                    <p className="text-lg text-neutral-500 font-bold leading-relaxed uppercase tracking-tight">
                                        {detail.signs}
                                    </p>
                                </div>
                                <div className="space-y-6">
                                    <div className="inline-flex items-center gap-3 px-4 py-2 border-2 border-black bg-neutral-100">
                                        <Stethoscope className="w-4 h-4 text-black" />
                                        <span className="text-[10px] font-black text-black uppercase tracking-widest">Symptoms</span>
                                    </div>
                                    <h2 className="text-4xl font-black text-black uppercase tracking-tighter">Physiological</h2>
                                    <p className="text-lg text-neutral-500 font-bold leading-relaxed uppercase tracking-tight">
                                        {detail.symptoms}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 p-12 border-4 border-black bg-neutral-50">
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-black text-black flex items-center gap-3 uppercase tracking-tighter">
                                        <Binary className="w-6 h-6" /> Detection
                                    </h2>
                                    <p className="text-lg text-black font-black uppercase tracking-tight leading-relaxed">
                                        {detail.detection}
                                    </p>
                                </div>
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-black text-black flex items-center gap-3 uppercase tracking-tighter">
                                        <Wind className="w-6 h-6" /> Vector
                                    </h2>
                                    <p className="text-lg text-black font-black uppercase tracking-tight leading-relaxed">
                                        {detail.transmission}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                                <div className="space-y-6">
                                    <h2 className="text-4xl font-black text-[#FF4F00] uppercase tracking-tighter border-b-2 border-black pb-2">Treatment</h2>
                                    <p className="text-lg text-black font-black uppercase tracking-tight leading-relaxed bg-white p-8 border-4 border-black">
                                        {detail.treatment}
                                    </p>
                                </div>
                                <div className="space-y-6">
                                    <h2 className="text-4xl font-black text-black uppercase tracking-tighter border-b-2 border-black pb-2">Prevention</h2>
                                    <p className="text-lg text-black font-black uppercase tracking-tight leading-relaxed bg-white p-8 border-4 border-black">
                                        {detail.prevention}
                                    </p>
                                </div>
                            </div>

                            {/* Protocol List */}
                            <div className="space-y-8 pt-8">
                                <h2 className="text-4xl font-black text-black uppercase tracking-tighter flex items-center gap-4 border-b-4 border-black pb-4">
                                    <Cpu className="w-10 h-10 text-black" /> Steps
                                </h2>
                                <div className="grid grid-cols-1 gap-4">
                                    {detail.steps && detail.steps.map((step: string, i: number) => (
                                        <div key={i} className="flex gap-8 items-center p-8 border-4 border-black bg-white hover:bg-neutral-50 transition-none group shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                            <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-black text-xl shrink-0">
                                                {i + 1}
                                            </div>
                                            <span className="text-xl text-black font-black uppercase tracking-tight">{step}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Ask assistant Call to Action */}
                            <div className="pt-12">
                                <div className="bg-[#FF4F00] p-12 border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
                                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                                        <div className="space-y-4 flex-1">
                                            <div className="inline-flex items-center gap-2 px-4 py-1 bg-black text-white border-2 border-black mb-2">
                                                <Bot className="w-4 h-4" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Assistant</span>
                                            </div>
                                            <h3 className="text-5xl font-black text-black tracking-tighter uppercase leading-none">Access Analysis</h3>
                                            <p className="text-[11px] font-black text-white/80 uppercase tracking-widest leading-relaxed">
                                                Initiate a site-specific pathology analysis for your exact coordinates.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => onTabChange('assistant', `Perform a technical analysis of ${selectedSymptom} using BeeYield's advanced analytics. Include markers like ${detail.signs}, detection methods like ${detail.detection}, and how BeeYield's sensors can prevent this from becoming a ${detail.riskLevel} risk.`)}
                                            className="h-24 px-12 bg-black text-white font-black text-2xl uppercase tracking-widest flex items-center gap-4 hover:bg-white hover:text-black transition-none shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] active:shadow-none"
                                        >
                                            <Bot className="w-8 h-8" />
                                            Analyze
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {selectedSpecies !== 'none' && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500 border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                        <div className="p-12 md:p-16 space-y-16">
                            {/* Header Detail */}
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b-4 border-black pb-10">
                                <div className="space-y-4">
                                    <h1 className="text-6xl md:text-8xl font-black text-black tracking-tighter uppercase leading-none">
                                        {selectedSpecies}
                                    </h1>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-[#FF4F00]" />
                                        <p className="text-xl font-black text-neutral-400 uppercase italic">
                                            {speciesDetail.scientificName}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Body Content */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                                <div className="space-y-6">
                                    <div className="inline-flex items-center gap-3 px-4 py-2 border-2 border-black bg-neutral-100">
                                        <Globe className="w-4 h-4 text-black" />
                                        <span className="text-[10px] font-black text-black uppercase tracking-widest">Origin</span>
                                    </div>
                                    <h2 className="text-4xl font-black text-black uppercase tracking-tighter">Native Habitat</h2>
                                    <p className="text-lg text-neutral-500 font-bold leading-relaxed uppercase tracking-tight">
                                        {speciesDetail.origin}
                                    </p>
                                </div>
                                <div className="space-y-6">
                                    <div className="inline-flex items-center gap-3 px-4 py-2 border-2 border-black bg-neutral-100">
                                        <Zap className="w-4 h-4 text-black" />
                                        <span className="text-[10px] font-black text-black uppercase tracking-widest">Traits</span>
                                    </div>
                                    <h2 className="text-4xl font-black text-black uppercase tracking-tighter">Behavioral</h2>
                                    <p className="text-lg text-neutral-500 font-bold leading-relaxed uppercase tracking-tight">
                                        {speciesDetail.characteristics}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 p-12 border-4 border-black bg-neutral-50">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Honey Yield</h4>
                                    <p className="text-2xl font-black text-black uppercase tracking-tight">{speciesDetail.honeyYield}</p>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Temperament</h4>
                                    <p className="text-2xl font-black text-black uppercase tracking-tight">{speciesDetail.temperament}</p>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Climate</h4>
                                    <p className="text-2xl font-black text-black uppercase tracking-tight">{speciesDetail.climateSuitability}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                                <div className="space-y-8">
                                    <h2 className="text-4xl font-black text-[#FF4F00] uppercase tracking-tighter border-b-2 border-black pb-2">Advantages</h2>
                                    <ul className="space-y-6">
                                        {speciesDetail.pros.map((pro: string, i: number) => (
                                            <li key={i} className="flex gap-4">
                                                <div className="w-6 h-6 bg-black text-white flex items-center justify-center font-black text-xs shrink-0">
                                                    +
                                                </div>
                                                <span className="text-lg font-black text-black uppercase tracking-tight">{pro}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="space-y-8">
                                    <h2 className="text-4xl font-black text-black uppercase tracking-tighter border-b-2 border-black pb-2">Challenges</h2>
                                    <ul className="space-y-6">
                                        {speciesDetail.cons.map((con: string, i: number) => (
                                            <li key={i} className="flex gap-4">
                                                <div className="w-6 h-6 border-2 border-black flex items-center justify-center font-black text-xs shrink-0">
                                                    -
                                                </div>
                                                <span className="text-lg font-black text-neutral-500 uppercase tracking-tight">{con}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Species CTA */}
                            <div className="pt-12">
                                <div className="bg-black p-12 border-4 border-black shadow-[12px_12px_0px_0px_rgba(255,79,0,1)] relative overflow-hidden group">
                                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                                        <div className="space-y-4 flex-1">
                                            <div className="inline-flex items-center gap-2 px-4 py-1 bg-[#FF4F00] text-black border-2 border-black mb-2">
                                                <Zap className="w-4 h-4" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Optimization</span>
                                            </div>
                                            <h3 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">Management Plan</h3>
                                            <p className="text-[11px] font-black text-neutral-400 uppercase tracking-widest leading-relaxed">
                                                Generate a sub-species specific deployment strategy for {selectedSpecies}.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => onTabChange('assistant', `Create a management strategy for ${selectedSpecies} colonies. Address their ${speciesDetail.temperament} temperament, optimize for ${speciesDetail.honeyYield} honey yield expectations, and mitigate challenges like ${speciesDetail.cons.join(', ')}.`)}
                                            className="h-24 px-12 bg-[#FF4F00] text-black font-black text-2xl uppercase tracking-widest flex items-center gap-4 hover:bg-white hover:text-black transition-none shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] active:shadow-none"
                                        >
                                            <ArrowRight className="w-8 h-8" />
                                            Request
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* Bottom Stats Grid */}
            <div className="space-y-8 pt-10">
                <div className="flex items-center gap-3 border-b-4 border-black pb-4">
                    <Activity className="w-8 h-8 text-black" />
                    <h3 className="text-3xl font-black text-black uppercase tracking-tighter">Stats</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Samples', value: '14,204', desc: 'Verified cases', icon: Database },
                        { label: 'Latency', value: '42ms', desc: 'Knowledge retrieval', icon: Zap },
                        { label: 'Sensors', value: '890', desc: 'Deployments', icon: HeartPulse },
                        { label: 'Accuracy', value: '99.4%', desc: 'Pathogen ID', icon: ShieldCheck }
                    ].map((stat, i) => (
                        <div key={i} className="border-4 border-black bg-white p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 bg-black flex items-center justify-center">
                                    <stat.icon className="w-5 h-5 text-white" />
                                </div>
                                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{stat.label}</p>
                            </div>
                            <h4 className="text-3xl font-black text-black tracking-tighter mb-1">{stat.value}</h4>
                            <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">{stat.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HealthGuideView;
