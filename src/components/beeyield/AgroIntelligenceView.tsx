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
    Target
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
        <div className="space-y-10 pb-20 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex items-center gap-4 border-b-4 border-black pb-6">
                <div className="w-12 h-12 bg-black flex items-center justify-center border-2 border-black">
                    <Satellite className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-5xl font-black text-black uppercase tracking-tighter">
                    Satellite
                </h1>
            </div>

            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-1">
                Field data from Copernicus orbital systems.
            </p>

            {/* Live Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Air', value: loading ? '...' : (weather?.cloud_cover_percent != null ? `${100 - weather.cloud_cover_percent}% Clear` : 'Stable'), icon: Sun },
                    { label: 'Moisture', value: loading ? '...' : (moisture != null ? `${moisture}%` : '42%'), icon: CloudRain },
                    { label: 'Vegetation', value: loading ? '...' : (vegetation != null ? vegetation : '0.64'), icon: Sprout },
                    { label: 'Carbon', value: loading ? '...' : (carbonScore != null ? carbonScore : '1,240'), icon: Wind }
                ].map((stat, i) => (
                    <div key={stat.label} className="border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 bg-black flex items-center justify-center border-2 border-black">
                                <stat.icon className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{stat.label}</p>
                        </div>
                        <h3 className="text-3xl font-black text-black tracking-tighter">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Hero / Promo Card */}
            <div className="border-4 border-black bg-black p-12 shadow-[12px_12px_0px_0px_rgba(255,79,0,1)] relative overflow-hidden group">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#FF4F00] flex items-center justify-center border-2 border-[#FF4F00]">
                                <BrainCircuit className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-[10px] font-black text-[#FF4F00] uppercase tracking-widest">Environmental Data</span>
                        </div>
                        <h2 className="text-5xl font-black text-white leading-none uppercase tracking-tighter">
                            Field <span className="text-[#FF4F00]">Dynamics.</span>
                        </h2>
                        <p className="text-neutral-400 text-lg font-bold leading-relaxed uppercase tracking-tight max-w-2xl">
                            Satellite spectral data reveals the rhythms of your ecosystem. Optimize nectar flow windows and pollinator flight patterns with objective terrain metrics.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 pt-4">
                            <button
                                onClick={() => onTabChange('precision-pollination')}
                                className="h-16 px-10 border-4 border-white bg-white text-black hover:bg-[#FF4F00] hover:border-[#FF4F00] hover:text-white font-black text-[11px] uppercase tracking-widest transition-none shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] active:shadow-none translate-x-1 translate-y-1"
                            >
                                Explorer Atlas
                            </button>
                            <button className="h-16 px-10 border-4 border-neutral-800 bg-transparent text-white hover:bg-neutral-900 font-black text-[11px] uppercase tracking-widest transition-none">
                                Documentation
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 border-b-2 border-black pb-4">
                    <Cpu className="w-6 h-6 text-black" />
                    <h3 className="text-2xl font-black uppercase tracking-tight">Tools</h3>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { title: 'Status', icon: MapIcon, desc: 'Terrain scan' },
                        { title: 'Anomalies', icon: Share2, desc: 'Stress signal' },
                        { title: 'Hydration', icon: CloudRain, desc: 'Moisture logs' },
                        { title: 'Biomass', icon: Sprout, desc: 'Yield analysis' }
                    ].map((btn, i) => (
                        <button
                            key={btn.title}
                            className="p-8 flex flex-col items-center text-center bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-none group"
                        >
                            <div className="w-14 h-14 bg-black flex items-center justify-center mb-6 group-hover:bg-[#FF4F00] transition-none">
                                <btn.icon className="w-7 h-7 text-white" />
                            </div>
                            <h4 className="text-xs font-black text-black uppercase tracking-widest mb-1">{btn.title}</h4>
                            <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-tight">{btn.desc}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Workflow Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 border-b-2 border-black pb-4">
                    <Layers className="w-6 h-6 text-black" />
                    <h3 className="text-2xl font-black uppercase tracking-tight">Workflow</h3>
                </div>
                <div className="border-4 border-black bg-white p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-none">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                        {[
                            { title: "Ingestion", icon: Satellite },
                            { title: "Analysis", icon: Layers },
                            { title: "Correlation", icon: BrainCircuit },
                            { title: "Insights", icon: Target }
                        ].map((step, i, arr) => (
                            <React.Fragment key={step.title}>
                                <div className="flex flex-col items-center gap-4 flex-1">
                                    <div className="w-20 h-20 bg-black flex items-center justify-center border-4 border-black">
                                        <step.icon className="w-10 h-10 text-white" />
                                    </div>
                                    <div className="text-center">
                                        <span className="block font-black text-black text-xs uppercase tracking-widest mb-1">{step.title}</span>
                                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Phase 0{i + 1}</span>
                                    </div>
                                </div>
                                {i < arr.length - 1 && (
                                    <div className="hidden lg:block">
                                        <ArrowRight className="w-6 h-6 text-neutral-200" />
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            {/* Detailed Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="border-4 border-black bg-white p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center gap-4 mb-8 border-b-2 border-black pb-4">
                        <div className="w-10 h-10 bg-black flex items-center justify-center">
                            <MapIcon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight">Modeling</h3>
                    </div>
                    <ul className="space-y-6">
                        {[
                            "Boundary definition with precision",
                            "Terrain and slope mapping",
                            "Per-sector yield targets",
                            "Historical state archive"
                        ].map((item, i) => (
                            <li key={i} className="flex gap-4">
                                <div className="w-5 h-5 bg-black flex items-center justify-center shrink-0 mt-0.5">
                                    <div className="w-1.5 h-1.5 bg-white" />
                                </div>
                                <span className="text-[11px] font-bold text-black uppercase tracking-tight">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="border-4 border-black bg-white p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center gap-4 mb-8 border-b-2 border-black pb-4">
                        <div className="w-10 h-10 bg-[#FF4F00] flex items-center justify-center">
                            <Layers className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight">Topology</h3>
                    </div>
                    <ul className="space-y-6">
                        {[
                            "Multi-spectral layer visualization",
                            "Nectar Flow and Diversity indexes",
                            "Vegetation Index tracking",
                            "Seasonal drift analysis"
                        ].map((item, i) => (
                            <li key={i} className="flex gap-4">
                                <div className="w-5 h-5 bg-[#FF4F00] flex items-center justify-center shrink-0 mt-0.5">
                                    <div className="w-1.5 h-1.5 bg-white" />
                                </div>
                                <span className="text-[11px] font-bold text-black uppercase tracking-tight">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AgroIntelligenceView;
