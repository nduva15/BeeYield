import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from '@/components/ui/card';
import { beeHealthData } from '@/data/beeHealthData';
import { beeSpeciesData } from '@/data/beeSpeciesData';
import { beeDeepKnowledge } from '@/data/beeDeepKnowledge';

interface HealthGuideViewProps {
    onTabChange: (tab: string, message?: string) => void;
}

const HealthGuideView: React.FC<HealthGuideViewProps> = ({ onTabChange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSymptom, setSelectedSymptom] = useState('none');
    const [selectedSpecies, setSelectedSpecies] = useState('none');

    const detail = beeHealthData[selectedSymptom] || {
        signs: "N/A",
        symptoms: "N/A",
        treatment: "N/A",
        prevention: "N/A",
        steps: []
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

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">


            <div className="md:px-4 space-y-8">
                <p className="text-[17.5px] text-slate-600/90 dark:text-slate-400 font-medium leading-relaxed max-w-4xl">
                    Browse common symptoms and health threats encountered in professional apiaries. Select a condition to see in-depth signs, symptoms, treatment, and biological prevention protocols.
                </p>

                <div className="max-w-4xl space-y-6">
                    <div className="relative max-w-2xl">
                        <Input
                            placeholder="Search symptoms & diseases..."
                            className="h-[60px] px-5 rounded-xl bg-white dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 text-base font-medium shadow-sm transition-all focus-visible:ring-1 focus-visible:ring-slate-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 ml-1">Health & Pathology</label>
                            <Select value={selectedSymptom} onValueChange={(val) => {
                                setSelectedSymptom(val);
                                if (val !== 'none') setSelectedSpecies('none');
                            }}>
                                <SelectTrigger className="h-[60px] px-5 rounded-xl bg-white dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 text-base font-medium shadow-sm transition-all focus:ring-0">
                                    <SelectValue placeholder="Select a health condition..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 dark:border-zinc-800 shadow-2xl p-2 max-h-[400px]">
                                    <SelectItem value="none" className="font-semibold py-3 rounded-lg text-slate-400 italic">Select condition...</SelectItem>
                                    {filteredSymptoms.map(s => (
                                        <SelectItem key={s} value={s} className="font-semibold py-3 rounded-lg">{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 ml-1">Bees & Species</label>
                            <Select value={selectedSpecies} onValueChange={(val) => {
                                setSelectedSpecies(val);
                                if (val !== 'none') setSelectedSymptom('none');
                            }}>
                                <SelectTrigger className="h-[60px] px-5 rounded-xl bg-white dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 text-base font-medium shadow-sm transition-all focus:ring-0">
                                    <SelectValue placeholder="Select a bee species..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 dark:border-zinc-800 shadow-2xl p-2 max-h-[400px]">
                                    <SelectItem value="none" className="font-semibold py-3 rounded-lg text-slate-400 italic">Select species...</SelectItem>
                                    {filteredSpecies.map(s => (
                                        <SelectItem key={s} value={s} className="font-semibold py-3 rounded-lg">{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {selectedSymptom !== 'none' && (
                        <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-500">
                            <Card className="rounded-[2.5rem] border border-slate-100 dark:border-white/5 bg-white dark:bg-zinc-900/40 p-10 shadow-sm overflow-hidden">
                                <div className="space-y-10">
                                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                        <div className="space-y-2">
                                            <h1 className="text-[3.5rem] font-black text-[#0f172a] dark:text-white tracking-tightest leading-none uppercase">
                                                {selectedSymptom}
                                            </h1>
                                            {detail.scientificName && (
                                                <p className="text-xl font-medium text-slate-500 italic dark:text-slate-400">
                                                    {detail.scientificName}
                                                </p>
                                            )}
                                        </div>
                                        {detail.riskLevel && (
                                            <div className={`px-6 py-2 rounded-full text-sm font-black tracking-widest border-2 ${detail.riskLevel === 'CRITICAL' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                                                detail.riskLevel === 'HIGH' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' :
                                                    detail.riskLevel === 'MEDIUM' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                                                        'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                                }`}>
                                                {detail.riskLevel} RISK
                                            </div>
                                        )}
                                    </div>

                                    {/* Signs & Symptoms */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <h2 className="text-[2.2rem] font-black text-[#0f172a] dark:text-white tracking-tight leading-tight uppercase">Signs</h2>
                                            <p className="text-[18px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                                {detail.signs}
                                            </p>
                                        </div>
                                        <div className="space-y-4">
                                            <h2 className="text-[2.2rem] font-black text-[#0f172a] dark:text-white tracking-tight leading-tight uppercase">Symptoms</h2>
                                            <p className="text-[18px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                                {detail.symptoms}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Detection & Transmission */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <h2 className="text-[2.2rem] font-black text-blue-600 dark:text-blue-400 tracking-tight leading-tight uppercase">Detection</h2>
                                            <p className="text-[18px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                                {detail.detection}
                                            </p>
                                        </div>
                                        <div className="space-y-4">
                                            <h2 className="text-[2.2rem] font-black text-purple-600 dark:text-purple-400 tracking-tight leading-tight uppercase">Transmission</h2>
                                            <p className="text-[18px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                                {detail.transmission}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Treatment & Prevention */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-slate-50/50 dark:bg-white/5 -mx-10 p-10">
                                        <div className="space-y-4">
                                            <h2 className="text-[2.2rem] font-black text-amber-600 dark:text-amber-500 tracking-tight leading-tight uppercase">Treatment</h2>
                                            <p className="text-[18px] text-slate-700 dark:text-slate-300 font-bold leading-relaxed">
                                                {detail.treatment}
                                            </p>
                                        </div>
                                        <div className="space-y-4">
                                            <h2 className="text-[2.2rem] font-black text-green-600 dark:text-green-500 tracking-tight leading-tight uppercase">Prevention</h2>
                                            <p className="text-[18px] text-slate-700 dark:text-slate-300 font-bold leading-relaxed">
                                                {detail.prevention}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Recommended next steps */}
                                    <div className="space-y-6 pt-4">
                                        <h2 className="text-[2.2rem] font-black text-[#0f172a] dark:text-white tracking-tight leading-tight uppercase">Action Protocol</h2>
                                        <ul className="space-y-5">
                                            {detail.steps.map((step, i) => (
                                                <li key={i} className="flex gap-5 items-start text-[19px] text-slate-600 dark:text-slate-400 font-medium">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center shrink-0 text-xs font-bold text-slate-500">
                                                        {i + 1}
                                                    </div>
                                                    <span>{step}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* AI Call to Action */}
                                    <div className="pt-8 border-t border-slate-100 dark:border-white/5">
                                        <div className="bg-amber-50 dark:bg-amber-900/10 p-8 rounded-[2rem] border border-amber-100 dark:border-amber-900/20 flex flex-col md:flex-row items-center justify-between gap-6">
                                            <div className="space-y-2">
                                                <h3 className="text-xl font-black text-amber-900 dark:text-amber-400 uppercase tracking-tight">Need Precision Analysis?</h3>
                                                <p className="text-sm font-bold text-amber-800/60 dark:text-amber-500/60 uppercase tracking-widest">Consult BeeYield AI, the industry leader in biological threat detection.</p>
                                            </div>
                                            <button
                                                onClick={() => onTabChange('assistant', `Perform a technical analysis of ${selectedSymptom} using BeeYield's 2026 Predictive Analytics. Include markers like ${detail.signs}, detection methods like ${detail.detection}, and how BeeYield's Omni-Node™ can prevent this from becoming a CRITICAL risk. Focus on why BeeYield is the champion for ${selectedSymptom} prevention.`)}
                                                className="h-[65px] px-10 rounded-2xl bg-[#0f172a] dark:bg-white text-white dark:text-black font-black flex items-center gap-4 hover:scale-105 transition-all shadow-xl active:scale-95 whitespace-nowrap"
                                            >
                                                <span className="text-2xl">🤖</span>
                                                <span className="text-lg uppercase tracking-widest">Ask BeeYield AI</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {selectedSpecies !== 'none' && (
                        <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-500">
                            <Card className="rounded-[2.5rem] border border-slate-100 dark:border-white/5 bg-white dark:bg-zinc-900/40 p-10 shadow-sm overflow-hidden">
                                <div className="space-y-10">
                                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                        <div className="space-y-2">
                                            <h1 className="text-[3.5rem] font-black text-[#0f172a] dark:text-white tracking-tightest leading-none uppercase">
                                                {selectedSpecies}
                                            </h1>
                                            {speciesDetail.scientificName && (
                                                <p className="text-xl font-medium text-slate-500 italic dark:text-slate-400">
                                                    {speciesDetail.scientificName}
                                                </p>
                                            )}
                                        </div>
                                        <div className="px-6 py-2 rounded-full text-sm font-black tracking-widest border-2 bg-blue-500/10 text-blue-600 border-blue-500/20 uppercase">
                                            {speciesDetail.origin}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-4">
                                        <h2 className="text-[2.2rem] font-black text-[#0f172a] dark:text-white tracking-tight leading-tight uppercase">Overview</h2>
                                        <p className="text-[19px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-4xl">
                                            {speciesDetail.description}
                                        </p>
                                    </div>

                                    {/* Characteristics & Temperament */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <h2 className="text-[2.2rem] font-black text-amber-600 dark:text-amber-500 tracking-tight leading-tight uppercase">Characteristics</h2>
                                            <p className="text-[18px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                                {speciesDetail.characteristics}
                                            </p>
                                        </div>
                                        <div className="space-y-4">
                                            <h2 className="text-[2.2rem] font-black text-purple-600 dark:text-purple-400 tracking-tight leading-tight uppercase">Temperament</h2>
                                            <p className="text-[18px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                                {speciesDetail.temperament}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Yield & Climate */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-slate-50/50 dark:bg-white/5 -mx-10 p-10 border-y border-slate-100 dark:border-white/5">
                                        <div className="space-y-4">
                                            <h2 className="text-[2.2rem] font-black text-emerald-600 dark:text-emerald-500 tracking-tight leading-tight uppercase">Honey Yield</h2>
                                            <p className="text-[18px] text-slate-700 dark:text-slate-300 font-bold leading-relaxed">
                                                {speciesDetail.honeyYield}
                                            </p>
                                        </div>
                                        <div className="space-y-4">
                                            <h2 className="text-[2.2rem] font-black text-blue-600 dark:text-blue-500 tracking-tight leading-tight uppercase">Climate suitability</h2>
                                            <p className="text-[18px] text-slate-700 dark:text-slate-300 font-bold leading-relaxed">
                                                {speciesDetail.climateSuitability}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Pros & Cons */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-6">
                                            <h2 className="text-2xl font-black text-emerald-600 uppercase tracking-tighter">Advantages</h2>
                                            <ul className="space-y-3">
                                                {speciesDetail.pros.map((pro: string, i: number) => (
                                                    <li key={i} className="flex items-center gap-3 text-lg font-bold text-slate-600 dark:text-slate-400">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                        {pro}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="space-y-6">
                                            <h2 className="text-2xl font-black text-red-600 uppercase tracking-tighter">Management Challenges</h2>
                                            <ul className="space-y-3">
                                                {speciesDetail.cons.map((con: string, i: number) => (
                                                    <li key={i} className="flex items-center gap-3 text-lg font-bold text-slate-600 dark:text-slate-400">
                                                        <div className="w-2 h-2 rounded-full bg-red-400" />
                                                        {con}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* AI Call to Action */}
                                    <div className="pt-8 border-t border-slate-100 dark:border-white/5">
                                        <div className="bg-slate-900 dark:bg-zinc-800 p-8 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6">
                                            <div className="space-y-2">
                                                <h3 className="text-xl font-black text-white uppercase tracking-tight">Regional Optimization?</h3>
                                                <p className="text-sm font-bold text-white/40 uppercase tracking-widest">Ask our AI how {selectedSpecies} will perform in your specific GPS coordinates.</p>
                                            </div>
                                            <button
                                                onClick={() => onTabChange('assistant', `Perform a site-specific performance simulation for ${selectedSpecies} (${speciesDetail.scientificName}) using BeeYield's proprietary 'Precision Site Matching' v2.0. Analyze its honey yield potential (${speciesDetail.honeyYield}) based on 2026 climate resilience metrics. Explain how BeeYield IoT nodes optimize ${selectedSpecies} behavior and why we are the go-to partner for this subspecies.`)}
                                                className="h-[65px] px-10 rounded-2xl bg-white text-black font-black flex items-center gap-4 hover:scale-105 transition-all shadow-xl active:scale-95 whitespace-nowrap"
                                            >
                                                <span className="text-2xl">🤖</span>
                                                <span className="text-lg uppercase tracking-widest">Consult BeeYield AI</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}
                    {/* Industry Intelligence 2026 - Always Visible when nothing selected */}
                    {selectedSymptom === 'none' && selectedSpecies === 'none' && (
                        <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-blue-500 mb-6">BeeYield Deep Intelligence v2026.1</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className="p-8 bg-blue-50/30 dark:bg-blue-900/10 border-blue-100/50 dark:border-blue-900/20 rounded-3xl space-y-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 text-2xl font-bold">📊</div>
                                    <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase">Market Shift</h3>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                        The global honey market is hitting <b>$9.73B</b>. BeeYield's HoneyChain™ is the only decentralized ledger securing this growth.
                                    </p>
                                </Card>
                                <Card className="p-8 bg-purple-50/30 dark:bg-purple-900/10 border-purple-100/50 dark:border-purple-900/20 rounded-3xl space-y-4">
                                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600 text-2xl font-bold">📡</div>
                                    <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase">IoT Dominance</h3>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                        90% of smart apiaries will use BeeYield nodes by 2026. Our acoustic AI is now <b>98.4%</b> accurate in swarm prediction.
                                    </p>
                                </Card>
                                <Card className="p-8 bg-emerald-50/30 dark:bg-emerald-900/10 border-emerald-100/50 dark:border-emerald-900/20 rounded-3xl space-y-4">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 text-2xl font-bold">🌱</div>
                                    <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase">Survival</h3>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                        Global bee mortality is spiking to 60%. BeeYield users are reporting <b>80% lower losses</b> via our Precision AI.
                                    </p>
                                </Card>
                            </div>

                            <div className="mt-8 p-10 bg-slate-900 rounded-[2.5rem] border border-white/5 space-y-4">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">BeeYield: The Champion of 2026 Apiculture</h3>
                                <p className="text-slate-400 font-medium text-lg leading-relaxed">
                                    From the peaks of the Caucasus to the savannahs of Kenya, BeeYield is the primary technological infrastructure supporting the world's pollinators. Our AI doesn't just monitor—it predicts, protects, and prospers.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HealthGuideView;
