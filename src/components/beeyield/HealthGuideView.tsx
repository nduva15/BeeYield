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
import beeyieldService from '@/services/beeyieldService';

interface HealthGuideViewProps {
    onTabChange?: (tab: string, message?: string, action?: string) => void;
}

const HealthGuideView: React.FC<HealthGuideViewProps> = ({ onTabChange }) => {
    const [selectedItem, setSelectedItem] = React.useState<any>(null);
    const [activeTab, setActiveTab] = React.useState<'diseases' | 'species'>('diseases');
    const [showSpeciesGallery, setShowSpeciesGallery] = React.useState(false);
    const [diseaseData, setDiseaseData] = React.useState<any[]>([]);
    const [speciesData, setSpeciesData] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [loadError, setLoadError] = React.useState<string | null>(null);

    React.useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            setLoadError(null);
            try {
                const [d, s] = await Promise.all([
                    beeyieldService.getHealthGuide('diseases'),
                    beeyieldService.getHealthGuide('species'),
                ]);
                if (!mounted) return;
                setDiseaseData(d || []);
                setSpeciesData(s || []);
            } catch (e: any) {
                if (!mounted) return;
                setLoadError(e?.message || 'Could not load health guide content.');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

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
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#064e3b]/60">
                            Pathology DB ({diseaseData.length} entries)
                        </span>
                        <Select
                            onValueChange={(val) => {
                                setActiveTab('diseases');
                                setSelectedItem(diseaseData.find(d => d.id === val));
                            }}
                            disabled={loading || diseaseData.length === 0}
                        >
                            <SelectTrigger className="w-full h-14 border-4 border-[#064e3b] bg-[#FFF9F0] rounded-none font-black text-xs uppercase text-[#064e3b] shadow-[4px_4px_0px_0px_rgba(6,78,59,1)]">
                                <SelectValue placeholder={loading ? "Loading…" : "Select Disease..."} />
                            </SelectTrigger>
                            <SelectContent className="border-4 border-[#064e3b] rounded-none shadow-[6px_6px_0px_0px_rgba(6,78,59,1)]">
                                {diseaseData.map(d => (
                                    <SelectItem key={d.id} value={d.id} className="font-bold text-xs uppercase focus:bg-[#facc15]/20 focus:text-[#064e3b]">{d.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-2 w-full md:w-80 relative z-40">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#064e3b]/60">
                            Species DB ({speciesData.length} entries)
                        </span>
                        <Select
                            onValueChange={(val) => {
                                setActiveTab('species');
                                setSelectedItem(speciesData.find(s => s.id === val));
                            }}
                            disabled={loading || speciesData.length === 0}
                        >
                            <SelectTrigger className="w-full h-14 border-4 border-[#064e3b] bg-[#FFF9F0] rounded-none font-black text-xs uppercase text-[#064e3b] shadow-[4px_4px_0px_0px_rgba(6,78,59,1)]">
                                <SelectValue placeholder={loading ? "Loading…" : "Select Bee Type..."} />
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
                    {loadError && (
                        <div className="border-4 border-[#064e3b] bg-white p-6 shadow-[6px_6px_0px_0px_rgba(6,78,59,1)] mb-10">
                            <p className="text-sm font-black uppercase tracking-widest text-red-600">Load error</p>
                            <p className="text-sm font-bold mt-2 text-[#064e3b]">{loadError}</p>
                        </div>
                    )}

                    {loading && (
                        <div className="border-4 border-[#064e3b] bg-white p-10 shadow-[6px_6px_0px_0px_rgba(6,78,59,1)] mb-10 flex items-center gap-4">
                            <Activity className="w-6 h-6 animate-spin text-[#10b981]" />
                            <div>
                                <p className="text-sm font-black uppercase tracking-widest">Loading health guide…</p>
                                <p className="text-xs font-bold text-[#064e3b]/70 mt-1">Fetching curated content from the BeeYield backend.</p>
                            </div>
                        </div>
                    )}

                    {!loading && !selectedItem && diseaseData.length === 0 && speciesData.length === 0 && (
                        <div className="border-4 border-[#064e3b] bg-white p-10 shadow-[6px_6px_0px_0px_rgba(6,78,59,1)] mb-10">
                            <p className="text-sm font-black uppercase tracking-widest">No entries yet</p>
                            <p className="text-xs font-bold text-[#064e3b]/70 mt-2">
                                The Health Guide dataset is empty. Add entries to `backend/app/data/health_guide.json`.
                            </p>
                        </div>
                    )}

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
