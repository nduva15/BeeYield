import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { motion } from 'framer-motion';

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
                console.error('Error loading agro intelligence data:', err);
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
        <div className="space-y-12 pb-20 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-beeyield-forest/5 border border-beeyield-forest/10 mb-6">
                        <Satellite className="w-3.5 h-3.5 text-beeyield-forest" />
                        <span className="text-[10px] font-bold text-beeyield-forest uppercase tracking-[0.15em]">Neural Terrain Analysis</span>
                    </div>
                    <h1 className="text-5xl font-bold text-beeyield-charcoal tracking-tight">Agro Intelligence</h1>
                    <p className="text-gray-500 font-medium mt-3 text-lg">
                        Copernicus satellite integration and bio-metric field modeling.
                    </p>
                </div>
                <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-emerald-50 border border-emerald-100">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">Active Data Feed</span>
                </div>
            </div>

            {/* Live Metrics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: 'Atmosphere', value: loading ? '...' : (weather?.cloud_cover_percent != null ? `${100 - weather.cloud_cover_percent}% Clear` : 'Stable'), icon: Sun, color: 'text-amber-500', bg: 'bg-amber-50' },
                    { label: 'Soil Moisture', value: loading ? '...' : (moisture != null ? `${moisture}%` : '42%'), icon: CloudRain, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { label: 'Veg Index', value: loading ? '...' : (vegetation != null ? vegetation : '0.64'), icon: Sprout, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Carbon Sink', value: loading ? '...' : (carbonScore != null ? carbonScore : '1,240'), icon: Wind, color: 'text-beeyield-forest', bg: 'bg-beeyield-forest/5' }
                ].map((stat, i) => (
                    <motion.div key={i} whileHover={{ y: -4, scale: 1.01 }}>
                        <Card className="rounded-[2rem] border-[#E0E0E0] bg-white shadow-sm overflow-hidden group">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:bg-beeyield-forest group-hover:border-beeyield-forest group-hover:text-white", stat.bg)}>
                                        <stat.icon className={cn("w-6 h-6 stroke-[2] transition-colors duration-500 group-hover:text-white", stat.color)} />
                                    </div>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">{stat.label}</p>
                                </div>
                                <h3 className="text-3xl font-bold text-beeyield-charcoal tracking-tight">{stat.value}</h3>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Hero / Promo Card */}
            <Card className="rounded-[3rem] border-none bg-beeyield-forest shadow-2xl overflow-hidden relative group">
                {/* Abstract Satellite Background Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-48 -mt-48 transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-2xl -ml-32 -mb-32" />

                <CardContent className="p-12 md:p-16 relative z-10 flex flex-col md:flex-row items-center gap-12">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 mb-8">
                            <BrainCircuit className="w-4 h-4 text-emerald-400" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Predictive Bio-Analysis</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
                            Beyond monitoring. <span className="text-emerald-400">Holistic eco-intelligence.</span>
                        </h2>
                        <p className="text-emerald-100/70 text-lg md:text-xl font-medium mb-10 leading-relaxed">
                            Intertwining satellite spectral data with local hive telemetry to reveal the unseen rhythms of your ecosystem. Optimize nectar flow windows and pollinator flight patterns.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                onClick={() => onTabChange('precision-pollination')}
                                className="h-16 px-10 rounded-2xl bg-white text-beeyield-forest hover:bg-emerald-50 font-bold text-base shadow-xl shadow-black/10"
                            >
                                Explorer Pollination Atlas
                            </Button>
                            <Button variant="outline" className="h-16 px-10 rounded-2xl text-white border-white/20 hover:bg-white/10 font-bold backdrop-blur-sm">
                                Read Protocol Documentation
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions Grid */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-beeyield-forest/5 border border-beeyield-forest/10 flex items-center justify-center">
                        <Cpu className="w-5 h-5 text-beeyield-forest" />
                    </div>
                    <h3 className="text-2xl font-bold text-beeyield-charcoal">Quick Analysis Tools</h3>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { title: 'Field Status', icon: MapIcon, desc: 'Real-time terrain scan' },
                        { title: 'Anomaly Map', icon: Share2, desc: 'Stress signal locator' },
                        { title: 'Hydration', icon: CloudRain, desc: 'Spectral moisture logs' },
                        { title: 'Biomass', icon: Sprout, desc: 'Trophy level analysis' }
                    ].map((btn, i) => (
                        <motion.button
                            key={i}
                            whileHover={{ y: -4, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="p-8 flex flex-col items-center text-center bg-white border border-[#E0E0E0] rounded-[2.5rem] shadow-sm hover:shadow-xl hover:shadow-beeyield-forest/5 transition-all group"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-beeyield-forest/5 border border-beeyield-forest/10 flex items-center justify-center mb-6 group-hover:bg-beeyield-forest transition-all duration-500">
                                <btn.icon className="w-7 h-7 text-beeyield-forest group-hover:text-white transition-colors duration-500" />
                            </div>
                            <h4 className="text-base font-bold text-beeyield-charcoal mb-1">{btn.title}</h4>
                            <p className="text-xs text-gray-400 font-medium">{btn.desc}</p>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Workflow Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-beeyield-forest/5 border border-beeyield-forest/10 flex items-center justify-center">
                        <Layers className="w-5 h-5 text-beeyield-forest" />
                    </div>
                    <h3 className="text-2xl font-bold text-beeyield-charcoal">Processing Workflow</h3>
                </div>
                <Card className="rounded-[3rem] border-[#E0E0E0] bg-white shadow-sm overflow-hidden">
                    <CardContent className="p-12">
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 text-center lg:text-left">
                            {[
                                { title: "Satellite Ingestion", icon: Satellite, color: "text-blue-500", bg: "bg-blue-50" },
                                { title: "Spectral Analysis", icon: Layers, color: "text-purple-500", bg: "bg-purple-50" },
                                { title: "Bio-Correlator", icon: BrainCircuit, color: "text-emerald-600", bg: "bg-emerald-50" },
                                { title: "Farming Insights", icon: Target, color: "text-beeyield-forest", bg: "bg-beeyield-forest/5" }
                            ].map((step, i, arr) => (
                                <React.Fragment key={i}>
                                    <div className="flex flex-col items-center gap-6 group transition-all duration-500 flex-1">
                                        <div className={cn("w-20 h-20 rounded-[2rem] border transition-all duration-500 flex items-center justify-center group-hover:shadow-lg", step.bg, "border-transparent group-hover:border-current")}>
                                            <step.icon className={cn("w-10 h-10 stroke-[1.5]", step.color)} />
                                        </div>
                                        <div>
                                            <span className="block font-bold text-beeyield-charcoal text-lg mb-1">{step.title}</span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phase 0{i + 1}</span>
                                        </div>
                                    </div>
                                    {i < arr.length - 1 && (
                                        <div className="hidden lg:block">
                                            <ArrowRight className="w-6 h-6 text-[#E0E0E0]" />
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="rounded-[2.5rem] border-[#E0E0E0] bg-white shadow-sm overflow-hidden group">
                    <CardHeader className="p-10 pb-0">
                        <CardTitle className="text-2xl font-bold text-beeyield-charcoal flex items-center gap-4">
                            <div className="p-3.5 rounded-2xl bg-beeyield-forest/5 text-beeyield-forest group-hover:bg-beeyield-forest group-hover:text-white transition-all">
                                <MapIcon className="w-6 h-6" />
                            </div>
                            Field Modeling
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-10">
                        <ul className="space-y-5">
                            {[
                                "N-S-E-W Boundary definition with sub-meter precision",
                                "Automated terrain contour and slope mapping",
                                "Per-sector assigned biomass and yield targets",
                                "Historical boundary state rollbacks and archive"
                            ].map((item, i) => (
                                <li key={i} className="flex gap-4">
                                    <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    </div>
                                    <span className="text-base font-medium text-gray-600 leading-snug">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                <Card className="rounded-[2.5rem] border-[#E0E0E0] bg-white shadow-sm overflow-hidden group">
                    <CardHeader className="p-10 pb-0">
                        <CardTitle className="text-2xl font-bold text-beeyield-charcoal flex items-center gap-4">
                            <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all">
                                <Layers className="w-6 h-6" />
                            </div>
                            Data Topology
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-10">
                        <ul className="space-y-5">
                            {[
                                "RGB / NIR multi-spectral layer visualization",
                                "Live Nectar Flow and Pollen Diversity indexes",
                                "Enhanced Vegetation Index (EVI) growth tracking",
                                "Dynamic temporal slider for seasonal drift analysis"
                            ].map((item, i) => (
                                <li key={i} className="flex gap-4">
                                    <div className="w-5 h-5 rounded-full bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    </div>
                                    <span className="text-base font-medium text-gray-600 leading-snug">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AgroIntelligenceView;
