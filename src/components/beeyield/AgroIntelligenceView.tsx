import React, { useState, useEffect } from 'react';
import {
    Share2,
    Download,
    Maximize2,
    Loader2,
    Satellite,
    Sprout,
    CloudRain,
    Wind,
    Sun,
    Layers,
    Map as MapIcon,
    ArrowRight,
    BrainCircuit,
    Cpu,
    Target,
    Activity,
    Globe
} from 'lucide-react';
import { beeyieldService } from '@/services/beeyieldService';
import { cn } from '@/lib/utils';

interface AgroIntelligenceViewProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

const AgroIntelligenceView: React.FC<AgroIntelligenceViewProps> = ({ onTabChange }) => {
    const [weather, setWeather] = useState<any>(null);
    const [satellite, setSatellite] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [weatherData, satelliteData] = await Promise.all([
                    beeyieldService.getWeatherHistory().then(res => res && res.length > 0 ? res[0] : null),
                    beeyieldService.getSatelliteIndices().then(res => res && res.length > 0 ? res[0] : null)
                ]);
                setWeather(weatherData);
                setSatellite(satelliteData);
            } catch (err) {
                console.error('Error loading data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const moisture = satellite?.soil_moisture_index ? Math.round(satellite.soil_moisture_index * 100) : null;
    const vegetation = satellite?.ndvi ? Math.round(satellite.ndvi * 100) / 100 : null;
    const carbonScore = satellite?.ndvi ? Math.round(satellite.ndvi * 1000) : null;

    return (
        <div className="p-8 space-y-12 bg-white min-h-screen text-[#064e3b] antialiased pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b-4 border-[#064e3b] pb-10">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[#10b981] bg-[#064e3b] mb-2">
                        <Globe className="w-3.5 h-3.5 text-[#facc15]" />
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Orbital Intelligence Hub</span>
                    </div>
                    <h1 className="text-7xl font-black text-[#064e3b] tracking-tighter uppercase leading-none">
                        Satellite <span className="text-[#10b981]">Registry</span>
                    </h1>
                    <p className="text-[#064e3b]/30 font-black mt-3 text-xl uppercase tracking-tight">
                        Spectral field data from Copernicus orbital systems.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-6 py-3 border-4 border-[#064e3b] bg-[#064e3b] text-white font-black text-[10px] uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(16,185,129,1)]">
                        COPERNICUS_SENTINEL_2L
                    </div>
                </div>
            </div>

            {/* Live Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: 'Air Conditions', value: loading ? 'SCANNING...' : (weather?.cloud_cover_percent != null ? `${100 - weather.cloud_cover_percent}% Clear` : 'Stable'), icon: Sun },
                    { label: 'Soil moisture', value: loading ? 'SCANNING...' : (moisture != null ? `${moisture}%` : '42%'), icon: CloudRain },
                    { label: 'Vegetation ndvi', value: loading ? 'SCANNING...' : (vegetation != null ? vegetation : '0.64'), icon: Sprout },
                    { label: 'Carbon score', value: loading ? 'SCANNING...' : (carbonScore != null ? carbonScore : '1,240'), icon: Wind }
                ].map((stat, i) => (
                    <div key={stat.label} className="border-4 border-[#064e3b] bg-white p-8 shadow-[6px_6px_0px_0px_rgba(6,78,59,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 bg-[#064e3b] flex items-center justify-center border-2 border-[#10b981] group-hover:bg-[#10b981] transition-none">
                                <stat.icon className="w-5 h-5 text-[#facc15]" />
                            </div>
                            <p className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-[0.2em]">{stat.label}</p>
                        </div>
                        <h3 className="text-4xl font-black text-[#064e3b] tracking-tighter uppercase leading-none">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Hero / Promo Card */}
            <div className="border-4 border-[#064e3b] bg-[#064e3b] p-12 shadow-[12px_12px_0px_0px_rgba(250,204,21,1)] relative overflow-hidden group">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#10b981] flex items-center justify-center border-2 border-[#064e3b]">
                                <BrainCircuit className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-[10px] font-black text-[#10b981] uppercase tracking-[0.2em]">Environmental Data Subsystem</span>
                        </div>
                        <h2 className="text-6xl font-black text-white leading-none uppercase tracking-tighter">
                            Field <span className="text-[#facc15]">Dynamics.</span>
                        </h2>
                        <p className="text-white/40 text-xl font-black leading-relaxed uppercase tracking-tight max-w-2xl">
                            Satellite spectral data reveals the rhythms of your ecosystem. Optimize nectar flow windows and pollinator flight patterns with objective terrain metrics.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 pt-4">
                            <button
                                onClick={() => onTabChange('precision-pollination')}
                                className="h-16 px-10 border-4 border-white bg-white text-[#064e3b] hover:bg-[#10b981] hover:border-[#10b981] hover:text-white font-black text-xs uppercase tracking-widest transition-none shadow-[8px_8px_0px_0px_rgba(16,185,129,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                            >
                                INTERROGATE_ATLAS
                            </button>
                            <button className="h-16 px-10 border-4 border-white/20 bg-transparent text-white hover:bg-white/10 font-black text-xs uppercase tracking-widest transition-none">
                                PROTOCOL_DOCS
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="space-y-10">
                <div className="flex items-center gap-4 border-b-4 border-[#064e3b]/10 pb-6">
                    <Cpu className="w-8 h-8 text-[#064e3b]" />
                    <h3 className="text-4xl font-black uppercase tracking-tighter text-[#064e3b]">Diagnostic Nodes</h3>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { title: 'Status', icon: MapIcon, desc: 'Terrain scan' },
                        { title: 'Anomalies', icon: Share2, desc: 'Stress signal' },
                        { title: 'Hydration', icon: CloudRain, desc: 'Moisture logs' },
                        { title: 'Biomass', icon: Sprout, desc: 'Yield analysis' }
                    ].map((btn, i) => (
                        <button
                            key={btn.title}
                            className="p-10 flex flex-col items-center text-center bg-white border-4 border-[#064e3b] shadow-[6px_6px_0px_0px_rgba(6,78,59,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group"
                        >
                            <div className="w-16 h-16 bg-[#064e3b] flex items-center justify-center mb-8 border-2 border-[#10b981] group-hover:bg-[#10b981] transition-none">
                                <btn.icon className="w-8 h-8 text-[#facc15]" />
                            </div>
                            <h4 className="text-xs font-black text-[#064e3b] uppercase tracking-widest mb-2">{btn.title}</h4>
                            <p className="text-[10px] text-[#064e3b]/30 font-black uppercase tracking-widest">{btn.desc}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Workflow Section */}
            <div className="space-y-10">
                <div className="flex items-center gap-4 border-b-4 border-[#064e3b]/10 pb-6">
                    <Layers className="w-8 h-8 text-[#064e3b]" />
                    <h3 className="text-4xl font-black uppercase tracking-tighter text-[#064e3b]">Operational Pipeline</h3>
                </div>
                <div className="border-4 border-[#064e3b] bg-white p-12 shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                        {[
                            { title: "Ingestion", icon: Satellite },
                            { title: "Analysis", icon: Layers },
                            { title: "Correlation", icon: BrainCircuit },
                            { title: "Insights", icon: Target }
                        ].map((step, i, arr) => (
                            <React.Fragment key={step.title}>
                                <div className="flex flex-col items-center gap-6 flex-1">
                                    <div className="w-24 h-24 bg-[#064e3b] flex items-center justify-center border-4 border-[#10b981] shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]">
                                        <step.icon className="w-10 h-10 text-[#facc15]" />
                                    </div>
                                    <div className="text-center">
                                        <span className="block font-black text-[#064e3b] text-sm uppercase tracking-widest mb-1">{step.title}</span>
                                        <span className="text-[10px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em]">Phase 0{i + 1}</span>
                                    </div>
                                </div>
                                {i < arr.length - 1 && (
                                    <div className="hidden lg:block">
                                        <ArrowRight className="w-8 h-8 text-[#064e3b]/10" />
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            {/* Detailed Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="border-4 border-[#064e3b] bg-white p-12 shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]">
                    <div className="flex items-center gap-4 mb-10 border-b-4 border-[#064e3b]/10 pb-6">
                        <div className="w-12 h-12 bg-[#064e3b] flex items-center justify-center border-2 border-[#10b981]">
                            <MapIcon className="w-6 h-6 text-[#facc15]" />
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter text-[#064e3b]">Terrain Modeling</h3>
                    </div>
                    <ul className="space-y-8">
                        {[
                            "Boundary definition with precision",
                            "Terrain and slope mapping",
                            "Per-sector yield targets",
                            "Historical state archive"
                        ].map((item, i) => (
                            <li key={i} className="flex gap-6 items-start">
                                <div className="w-6 h-6 bg-[#064e3b] flex items-center justify-center shrink-0 mt-1 shadow-[2px_2px_0px_0px_rgba(16,185,129,1)]">
                                    <div className="w-2 h-2 bg-white" />
                                </div>
                                <span className="text-sm font-black text-[#064e3b] uppercase tracking-tight leading-snug">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="border-4 border-[#064e3b] bg-white p-12 shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]">
                    <div className="flex items-center gap-4 mb-10 border-b-4 border-[#064e3b]/10 pb-6">
                        <div className="w-12 h-12 bg-[#10b981] flex items-center justify-center border-2 border-[#064e3b]">
                            <Layers className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter text-[#064e3b]">Eco-Topology</h3>
                    </div>
                    <ul className="space-y-8">
                        {[
                            "Multi-spectral layer visualization",
                            "Nectar Flow and Diversity indexes",
                            "Vegetation Index tracking",
                            "Seasonal drift analysis"
                        ].map((item, i) => (
                            <li key={i} className="flex gap-6 items-start">
                                <div className="w-6 h-6 bg-[#10b981] flex items-center justify-center shrink-0 mt-1 shadow-[2px_2px_0px_0px_rgba(6,78,59,1)]">
                                    <div className="w-2 h-2 bg-[#064e3b]" />
                                </div>
                                <span className="text-sm font-black text-[#064e3b] uppercase tracking-tight leading-snug">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AgroIntelligenceView;
