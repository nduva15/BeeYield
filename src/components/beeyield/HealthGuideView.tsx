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
    ChevronLeft,
    SearchX,
    Database,
    Binary,
    Globe,
    Cpu,
    Dna,
    Stethoscope
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { beeHealthData } from '@/data/beeHealthData';
import { beeSpeciesData } from '@/data/beeSpeciesData';
import beeyieldService from '@/services/beeyieldService';
import { motion, AnimatePresence } from 'framer-motion';
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
                console.error('Error fetching health knowledge base:', err);
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
            case 'CRITICAL': return 'bg-red-50 text-red-600 border-red-100';
            case 'HIGH': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'MEDIUM': return 'bg-amber-50 text-amber-600 border-amber-100';
            default: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-beeyield-forest/5 border border-beeyield-forest/10 mb-6">
                        <Database className="w-3.5 h-3.5 text-beeyield-forest" />
                        <span className="text-[10px] font-bold text-beeyield-forest uppercase tracking-[0.15em]">Global Biometric Lexicon</span>
                    </div>
                    <h1 className="text-5xl font-bold text-beeyield-charcoal tracking-tight">Health & Species</h1>
                    <p className="text-gray-500 font-medium mt-3 text-lg leading-relaxed max-w-3xl">
                        Technical repository of colony pathology and sub-species genetics.
                        Select a condition to access verified biological protocols.
                    </p>
                </div>
            </div>

            {/* Tactical Search & Selectors */}
            <div className="space-y-8">
                <Card className="rounded-[2.5rem] border-[#E0E0E0] bg-white shadow-sm overflow-hidden">
                    <CardContent className="p-10 space-y-10">
                        <div className="relative max-w-2xl">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="Search symptoms, diseases, or genetics..."
                                className="h-16 pl-14 pr-6 rounded-2xl border-[#E0E0E0] text-lg font-bold text-beeyield-charcoal focus:ring-beeyield-forest/20 focus:border-beeyield-forest/30 transition-all shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {loadingKB && (
                                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                                    <Loader2 className="w-6 h-6 text-beeyield-forest animate-spin" />
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-1">Colony Pathology</label>
                                <Select value={selectedSymptom} onValueChange={(val) => {
                                    setSelectedSymptom(val);
                                    if (val !== 'none') setSelectedSpecies('none');
                                }}>
                                    <SelectTrigger className="h-16 px-6 rounded-2xl border-[#E0E0E0] text-base font-bold text-beeyield-charcoal focus:ring-0 shadow-sm transition-all">
                                        <div className="flex items-center gap-3">
                                            <Bug className="w-5 h-5 text-beeyield-forest" />
                                            <SelectValue placeholder="Identify Health Condition" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-[#E0E0E0] shadow-2xl p-2 max-h-[400px]">
                                        <SelectItem value="none" className="font-bold py-3 px-4 rounded-xl text-gray-400">Select condition...</SelectItem>
                                        {filteredSymptoms.map(s => (
                                            <SelectItem key={s} value={s} className="font-bold py-3 px-4 rounded-xl">{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-1">Species Genetics</label>
                                <Select value={selectedSpecies} onValueChange={(val) => {
                                    setSelectedSpecies(val);
                                    if (val !== 'none') setSelectedSymptom('none');
                                }}>
                                    <SelectTrigger className="h-16 px-6 rounded-2xl border-[#E0E0E0] text-base font-bold text-beeyield-charcoal focus:ring-0 shadow-sm transition-all">
                                        <div className="flex items-center gap-3">
                                            <Dna className="w-5 h-5 text-beeyield-forest" />
                                            <SelectValue placeholder="Identify Bee Sub-species" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-[#E0E0E0] shadow-2xl p-2 max-h-[400px]">
                                        <SelectItem value="none" className="font-bold py-3 px-4 rounded-xl text-gray-400">Select species...</SelectItem>
                                        {filteredSpecies.map(s => (
                                            <SelectItem key={s} value={s} className="font-bold py-3 px-4 rounded-xl">{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Community Knowledge Results */}
                <AnimatePresence>
                    {communityKnowledge.length > 0 && searchTerm && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-3">
                                <h3 className="text-xs font-black uppercase tracking-[0.25em] text-gray-400 px-2">Knowledge Pulse</h3>
                                <div className="h-[1px] flex-1 bg-[#F5F5F5]" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {communityKnowledge.map((article: any) => (
                                    <Card key={article.id} className="p-8 border-[#F0F0F0] bg-beeyield-sand/10 hover:bg-white hover:border-beeyield-forest/20 hover:shadow-xl hover:shadow-beeyield-forest/5 transition-all cursor-pointer rounded-3xl group">
                                        <div className="flex justify-between items-start mb-4">
                                            <h4 className="font-bold text-beeyield-charcoal text-lg group-hover:text-beeyield-forest transition-colors">{article.title}</h4>
                                            <Badge variant="outline" className="text-[9px] uppercase font-black tracking-widest bg-white border-[#E0E0E0]">{article.category}</Badge>
                                        </div>
                                        <p className="text-sm font-medium text-gray-500 leading-relaxed line-clamp-2">{article.description}</p>
                                        <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-beeyield-forest opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                                            Access Protocol <ArrowRight className="w-3 h-3" />
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Condition/Species Details */}
            <AnimatePresence mode="wait">
                {selectedSymptom !== 'none' && (
                    <motion.div
                        key={`symptom-${selectedSymptom}`}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="animate-in fade-in slide-in-from-top-4 duration-500"
                    >
                        <Card className="rounded-[3rem] border-[#E0E0E0] bg-white shadow-xl shadow-beeyield-forest/5 overflow-hidden">
                            <div className="p-12 md:p-16 space-y-16">
                                {/* Header Detail */}
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                                    <div className="space-y-4">
                                        <h1 className="text-6xl md:text-7xl font-bold text-beeyield-charcoal tracking-tighter leading-none">
                                            {selectedSymptom}
                                        </h1>
                                        {detail.scientificName && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-beeyield-forest" />
                                                <p className="text-xl font-bold text-gray-400 italic">
                                                    {detail.scientificName}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    {detail.riskLevel && (
                                        <div className={cn("px-8 py-3 rounded-full text-[11px] font-black tracking-[0.2em] border-2 uppercase", getRiskStyles(detail.riskLevel))}>
                                            Security Risk: {detail.riskLevel}
                                        </div>
                                    )}
                                </div>

                                {/* Body Content */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                                    <div className="space-y-6">
                                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-beeyield-sand/30 border border-[#E8E0D5]">
                                            <Search className="w-3.5 h-3.5 text-beeyield-forest" />
                                            <span className="text-[10px] font-black text-beeyield-charcoal uppercase tracking-[0.15em]">Clinical Manifestations</span>
                                        </div>
                                        <h2 className="text-3xl font-bold text-beeyield-charcoal">Visual Markers</h2>
                                        <p className="text-lg text-gray-500 font-medium leading-relaxed">
                                            {detail.signs}
                                        </p>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-beeyield-sand/30 border border-[#E8E0D5]">
                                            <Stethoscope className="w-3.5 h-3.5 text-red-500" />
                                            <span className="text-[10px] font-black text-beeyield-charcoal uppercase tracking-[0.15em]">Systemic Effects</span>
                                        </div>
                                        <h2 className="text-3xl font-bold text-beeyield-charcoal">Physiological Symptoms</h2>
                                        <p className="text-lg text-gray-500 font-medium leading-relaxed">
                                            {detail.symptoms}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 p-12 rounded-[2.5rem] bg-beeyield-sand/10 border border-[#E8E0D5]">
                                    <div className="space-y-6">
                                        <h2 className="text-2xl font-bold text-amber-600 flex items-center gap-3 uppercase tracking-tighter">
                                            <Binary className="w-6 h-6" /> Detection Vector
                                        </h2>
                                        <p className="text-lg text-beeyield-charcoal font-bold leading-relaxed">
                                            {detail.detection}
                                        </p>
                                    </div>
                                    <div className="space-y-6">
                                        <h2 className="text-2xl font-bold text-purple-600 flex items-center gap-3 uppercase tracking-tighter">
                                            <Wind className="w-6 h-6" /> Pathogen Vector
                                        </h2>
                                        <p className="text-lg text-beeyield-charcoal font-bold leading-relaxed">
                                            {detail.transmission}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                                    <div className="space-y-6">
                                        <h2 className="text-3xl font-bold text-beeyield-forest uppercase tracking-tighter">Elimination Protocol</h2>
                                        <p className="text-lg text-gray-700 font-bold leading-relaxed bg-white p-8 rounded-3xl border border-beeyield-forest/10 shadow-sm">
                                            {detail.treatment}
                                        </p>
                                    </div>
                                    <div className="space-y-6">
                                        <h2 className="text-3xl font-bold text-emerald-600 uppercase tracking-tighter">Bioresilience Strategy</h2>
                                        <p className="text-lg text-gray-700 font-bold leading-relaxed bg-white p-8 rounded-3xl border border-emerald-100 shadow-sm">
                                            {detail.prevention}
                                        </p>
                                    </div>
                                </div>

                                {/* Protocol List */}
                                <div className="space-y-8 pt-8">
                                    <h2 className="text-3xl font-bold text-beeyield-charcoal uppercase tracking-tighter flex items-center gap-4">
                                        <Cpu className="w-8 h-8 text-beeyield-forest" /> Operational Action Steps
                                    </h2>
                                    <div className="grid grid-cols-1 gap-4">
                                        {detail.steps && detail.steps.map((step: string, i: number) => (
                                            <div key={i} className="flex gap-6 items-center p-6 rounded-2xl bg-white border border-[#F5F5F5] hover:border-beeyield-forest/20 transition-all group">
                                                <div className="w-10 h-10 rounded-xl bg-beeyield-forest text-white flex items-center justify-center font-black text-sm shrink-0 shadow-lg shadow-beeyield-forest/20">
                                                    {i + 1}
                                                </div>
                                                <span className="text-lg text-gray-500 font-bold">{step}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Ask assistant Call to Action */}
                                <div className="pt-12 border-t border-[#F5F5F5]">
                                    <Card className="bg-beeyield-forest border-none p-12 rounded-[3rem] relative overflow-hidden group shadow-2xl shadow-beeyield-forest/20">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700" />
                                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                                            <div className="space-y-4 max-w-xl text-center md:text-left">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 mb-2">
                                                    <Bot className="w-4 h-4" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Neural Copilot</span>
                                                </div>
                                                <h3 className="text-4xl font-bold text-white tracking-tight">Access Precision Simulation?</h3>
                                                <p className="text-lg font-medium text-emerald-100/70 leading-relaxed uppercase tracking-wider">
                                                    Initiate a site-specific pathology analysis for your exact GPS coordinates.
                                                </p>
                                            </div>
                                            <Button
                                                onClick={() => onTabChange('assistant', `Perform a technical analysis of ${selectedSymptom} using BeeYield's advanced analytics. Include markers like ${detail.signs}, detection methods like ${detail.detection}, and how BeeYield's sensors can prevent this from becoming a ${detail.riskLevel} risk.`)}
                                                className="h-20 px-12 rounded-2xl bg-white text-beeyield-forest font-bold text-xl flex items-center gap-4 hover:bg-emerald-50 transition-all shadow-2xl active:scale-95 whitespace-nowrap"
                                            >
                                                <Bot className="w-6 h-6" />
                                                Analyze with BeeYield
                                            </Button>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}

                {selectedSpecies !== 'none' && (
                    <motion.div
                        key={`species-${selectedSpecies}`}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="animate-in fade-in slide-in-from-top-4 duration-500"
                    >
                        <Card className="rounded-[3rem] border-[#E0E0E0] bg-white shadow-xl shadow-beeyield-forest/5 overflow-hidden">
                            <div className="p-12 md:p-16 space-y-16">
                                {/* Header Detail */}
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                                    <div className="space-y-4">
                                        <h1 className="text-6xl md:text-7xl font-bold text-beeyield-charcoal tracking-tighter leading-none">
                                            {selectedSpecies}
                                        </h1>
                                        {speciesDetail.scientificName && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-beeyield-forest" />
                                                <p className="text-xl font-bold text-gray-400 italic">
                                                    {speciesDetail.scientificName}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="px-8 py-3 rounded-full text-[11px] font-black tracking-[0.2em] border-2 border-emerald-100 bg-emerald-50 text-emerald-600 uppercase">
                                        Origin Hub: {speciesDetail.origin}
                                    </div>
                                </div>

                                {/* Body Content */}
                                <div className="space-y-8">
                                    <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-beeyield-sand/30 border border-[#E8E0D5]">
                                        <Globe className="w-3.5 h-3.5 text-beeyield-forest" />
                                        <span className="text-[10px] font-black text-beeyield-charcoal uppercase tracking-[0.15em]">Genetic Profile</span>
                                    </div>
                                    <h2 className="text-3xl font-bold text-beeyield-charcoal uppercase tracking-tighter">Varietal Identity</h2>
                                    <p className="text-2xl text-gray-500 font-medium leading-relaxed max-w-5xl">
                                        {speciesDetail.description}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                                    <div className="space-y-6">
                                        <h2 className="text-3xl font-bold text-amber-600 uppercase tracking-tighter">Genetic Traits</h2>
                                        <p className="text-lg text-gray-500 font-bold leading-relaxed bg-beeyield-sand/10 p-10 rounded-[2.5rem] border border-[#E8E0D5]">
                                            {speciesDetail.characteristics}
                                        </p>
                                    </div>
                                    <div className="space-y-6">
                                        <h2 className="text-3xl font-bold text-purple-600 uppercase tracking-tighter">Behavioral Profile</h2>
                                        <p className="text-lg text-gray-500 font-bold leading-relaxed bg-beeyield-sand/10 p-10 rounded-[2.5rem] border border-[#E8E0D5]">
                                            {speciesDetail.temperament}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 p-12 rounded-[2.5rem] bg-beeyield-forest text-white/90">
                                    <div className="space-y-6">
                                        <h2 className="text-2xl font-bold text-emerald-300 uppercase tracking-tighter flex items-center gap-3">
                                            <Zap className="w-6 h-6" /> Yield Potential
                                        </h2>
                                        <p className="text-xl font-bold leading-relaxed">
                                            {speciesDetail.honeyYield}
                                        </p>
                                    </div>
                                    <div className="space-y-6">
                                        <h2 className="text-2xl font-bold text-emerald-300 uppercase tracking-tighter flex items-center gap-3">
                                            <Globe className="w-6 h-6" /> Bioreman Resilience
                                        </h2>
                                        <p className="text-xl font-bold leading-relaxed">
                                            {speciesDetail.climateSuitability}
                                        </p>
                                    </div>
                                </div>

                                {/* Pros & Cons */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                                    <div className="space-y-8">
                                        <h2 className="text-2xl font-black text-emerald-600 uppercase tracking-widest border-b border-emerald-100 pb-4">Genetic Fortitude</h2>
                                        <div className="space-y-4">
                                            {speciesDetail.pros && speciesDetail.pros.map((pro: string, i: number) => (
                                                <div key={i} className="flex items-center gap-4 bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 group">
                                                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />
                                                    <span className="text-lg font-bold text-emerald-800">{pro}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-8">
                                        <h2 className="text-2xl font-black text-amber-600 uppercase tracking-widest border-b border-amber-100 pb-4">System Vulnerabilities</h2>
                                        <div className="space-y-4">
                                            {speciesDetail.cons && speciesDetail.cons.map((con: string, i: number) => (
                                                <div key={i} className="flex items-center gap-4 bg-amber-50/50 p-5 rounded-2xl border border-amber-100">
                                                    <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm" />
                                                    <span className="text-lg font-bold text-amber-800">{con}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* AI CTA */}
                                <div className="pt-12 border-t border-[#F5F5F5]">
                                    <Card className="bg-beeyield-charcoal border-none p-12 rounded-[3rem] relative overflow-hidden group shadow-2xl">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700" />
                                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                                            <div className="space-y-4 max-w-xl text-center md:text-left">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 mb-2">
                                                    <Bot className="w-4 h-4" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Neural Copilot</span>
                                                </div>
                                                <h3 className="text-4xl font-bold text-white tracking-tight">Predict Regional Performance?</h3>
                                                <p className="text-lg font-medium text-white/40 leading-relaxed uppercase tracking-wider">
                                                    Simulate how {selectedSpecies} will perform within your local environmental profile.
                                                </p>
                                            </div>
                                            <Button
                                                onClick={() => onTabChange('assistant', `Perform a site-specific performance simulation for ${selectedSpecies} (${speciesDetail.scientificName}) using BeeYield's site matching analysis.`)}
                                                className="h-20 px-12 rounded-2xl bg-white text-beeyield-charcoal font-bold text-xl flex items-center gap-4 hover:bg-gray-100 transition-all shadow-2xl active:scale-95 whitespace-nowrap"
                                            >
                                                <Bot className="w-6 h-6" />
                                                Run Simulation
                                            </Button>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hub Insights - Always visible when nothing selected */}
            {selectedSymptom === 'none' && selectedSpecies === 'none' && (
                <div className="space-y-10 py-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div className="flex items-center gap-3">
                        <h3 className="text-xs font-black uppercase tracking-[0.35em] text-beeyield-forest/60 px-2 underline decoration-beeyield-forest decoration-2 underline-offset-8">Mission Critical Intelligence</h3>
                        <div className="h-[1px] flex-1 bg-beeyield-sand/50" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            {
                                id: 'market',
                                title: 'Market Vector',
                                emoji: '📊',
                                color: 'bg-amber-50 border-amber-100',
                                text: 'The global honey market is hitting $9.73B. BeeYield is the only infrastructure securing this capital via HoneyChain™ ledger.'
                            },
                            {
                                id: 'iot',
                                title: 'Connectivity Edge',
                                emoji: '📡',
                                color: 'bg-beeyield-forest/5 border-beeyield-forest/10',
                                text: '90% of smart apiaries utilize BeeYield nodes. Our acoustic biosensors now hit 98.4% swarm precision.'
                            },
                            {
                                id: 'survival',
                                title: 'Biotype Resilience',
                                emoji: '🌱',
                                color: 'bg-emerald-50 border-emerald-100',
                                text: 'Global bee mortality spikes to 60%. BeeYield users report 80% lower losses via our Neural Health simulation.'
                            }
                        ].map((insight) => (
                            <Card key={insight.id} className={cn("p-10 rounded-[2.5rem] border shadow-sm transition-all hover:-translate-y-2 hover:shadow-xl", insight.color)}>
                                <div className="w-14 h-14 rounded-2xl bg-white/80 shadow-sm flex items-center justify-center text-3xl mb-8">
                                    {insight.emoji}
                                </div>
                                <h3 className="text-2xl font-bold text-beeyield-charcoal uppercase tracking-tighter mb-4">{insight.title}</h3>
                                <p className="text-sm font-bold text-gray-500 leading-relaxed uppercase tracking-widest">{insight.text}</p>
                            </Card>
                        ))}
                    </div>

                    <Card className="rounded-[4rem] border-none bg-beeyield-charcoal text-white p-16 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-beeyield-forest/40 to-transparent" />
                        <div className="relative z-10 space-y-8 max-w-5xl">
                            <h2 className="text-5xl md:text-6xl font-bold tracking-tight">BeeYield: The Champion of Next-Gen Apiculture.</h2>
                            <p className="text-xl md:text-2xl font-medium text-white/50 leading-relaxed">
                                Our tactical system provides the biological infrastructure supporting the world's pollinators. We don't just monitor—we protect the foundation of global food security.
                            </p>
                            <div className="pt-8 flex flex-wrap gap-8">
                                <div className="space-y-1">
                                    <p className="text-4xl font-black text-white">98.4%</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Hub Precision</p>
                                </div>
                                <div className="w-[1px] h-12 bg-white/10 hidden md:block" />
                                <div className="space-y-1">
                                    <p className="text-4xl font-black text-white">80%</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Yield Defense</p>
                                </div>
                                <div className="w-[1px] h-12 bg-white/10 hidden md:block" />
                                <div className="space-y-1">
                                    <p className="text-4xl font-black text-white">13.8k</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Node Population</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default HealthGuideView;
