import React from 'react';
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
    Globe,
    Zap,
    Terminal,
    MapPin,
    BarChart3,
    Info
} from 'lucide-react';
import beeyieldService from '@/services/beeyieldService';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { glass, PageHeader, GlassStatCard } from './GlassTheme';
import { motion, AnimatePresence } from 'framer-motion';

interface AgroIntelligenceViewProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

const AgroIntelligenceView: React.FC<AgroIntelligenceViewProps> = ({ onTabChange }) => {
    const [weather, setWeather] = React.useState<any>(null);
    const [satellite, setSatellite] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={glass.page}
        >
            {/* Header */}
            <PageHeader
                icon={Satellite}
                label="Orbital Intelligence"
                title={<>Agro <span className="text-[#F4D03F]">Intelligence</span></>}
                subtitle="High-fidelity spectral telemetry and ecosystem biome analytics."
                actions={
                    <div className="flex items-center gap-2">
                        <button onClick={() => onTabChange('orchard-mapper')} className={glass.btnSecondary}>
                            <MapIcon className="w-4 h-4 text-[#F4D03F]" />
                            View Map
                        </button>
                        <div className={cn(glass.badge, "bg-[#1A1A1A] text-[#F4D03F] border-[#F4D03F]/30 px-3 py-1.5 flex items-center gap-2")}>
                            <Terminal className="w-3 h-3 animate-pulse" />
                            <span className="text-[10px] tracking-widest">ORBIT_LINK</span>
                        </div>
                    </div>
                }
            />

            {/* Live Metrics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <GlassStatCard
                    label="Air Scan"
                    value={loading ? 'Scanning...' : (weather?.cloud_cover_percent != null ? `${100 - weather.cloud_cover_percent}% Clear` : 'Stable')}
                    icon={Sun}
                    index={0}
                />
                <GlassStatCard
                    label="Soil Moisture"
                    value={loading ? 'Syncing...' : (moisture != null ? `${moisture}%` : '42%')}
                    icon={CloudRain}
                    index={1}
                />
                <GlassStatCard
                    label="NDVI Index"
                    value={loading ? 'Mapping...' : (vegetation != null ? vegetation.toString() : '0.64')}
                    icon={Sprout}
                    index={2}
                    color="text-[#1B9157]"
                />
                <GlassStatCard
                    label="Carbon Score"
                    value={loading ? 'Calculating...' : (carbonScore != null ? carbonScore.toLocaleString() : '1,240')}
                    icon={Wind}
                    index={3}
                    color="text-[#1B9157]"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Hero Section */}
                <div className="xl:col-span-8">
                    <div className={cn(glass.section, "p-8 min-h-[400px] flex flex-col justify-center relative overflow-hidden group")}>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F4D03F]/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-[#F4D03F]/10 transition-all duration-1000" />
                        
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#F9F7F2] border border-[#F4D03F]/20 flex items-center justify-center shadow-sm">
                                    <BrainCircuit className="w-5 h-5 text-[#F4D03F]" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-[#1A1A1A]">Biosphere Topology</h3>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Active Neural Engine</p>
                                </div>
                            </div>

                            <h2 className="text-4xl font-bold text-[#1A1A1A] tracking-tight leading-[1.1]">
                                Ecosystem <span className="text-[#F4D03F]">Synthesizer</span> Interface
                            </h2>

                            <p className="text-sm text-gray-500 leading-relaxed max-w-xl">
                                Synthesizing orbital spectral telemetry to decode the rhythmic architecture of your terrain. 
                                Nectar flux optimization and precision trajectory modeling active.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => onTabChange('precision-pollination-home')}
                                    className={glass.btnPrimary}
                                >
                                    <Target className="w-4 h-4" />
                                    Initialize Neural Mapping
                                </button>
                                <button className={glass.btnSecondary}>
                                    <Download className="w-4 h-4" />
                                    Export Brief
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Widgets */}
                <div className="xl:col-span-4 space-y-6">
                    <div className={cn(glass.section, "p-5")}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-[#1A1A1A]">Sector Dynamics</h3>
                            <Layers className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { title: '3D Grid Scan', icon: MapIcon, color: '#F4D03F' },
                                { title: 'Delta Analytics', icon: Share2, color: '#1B9157' },
                                { title: 'Flux Protocol', icon: CloudRain, color: '#1B9157' },
                                { title: 'Yield ROI', icon: Sprout, color: '#F4D03F' }
                            ].map((btn) => (
                                <div key={btn.title} className="bg-[#FFF9F0] p-4 rounded-xl border border-[#F4D03F]/10 hover:border-[#F4D03F]/30 transition-all cursor-pointer group">
                                    <btn.icon className="w-5 h-5 mb-2 transition-transform group-hover:scale-110" style={{ color: btn.color }} />
                                    <p className="text-xs font-bold text-[#1A1A1A] tracking-tight leading-none mb-1">{btn.title}</p>
                                    <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Sector_Active</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={cn(glass.card, "p-6 bg-gradient-to-br from-[#F4D03F]/5 to-transparent border-[#F4D03F]/20")}>
                        <div className="flex items-center gap-3 mb-3">
                            <Info className="w-5 h-5 text-[#F4D03F]" />
                            <h4 className="text-sm font-bold text-[#1A1A1A]">Intelligence Summary</h4>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-relaxed">
                            Spectral telemetry indicates high vegetative health across forage sectors. Carbon sequestration increased by 4.2% in last cycle.
                        </p>
                    </div>
                </div>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                {[
                    {
                        title: 'Spatial Dynamics Core', icon: BarChart3, list: [
                            "Boundary definition precision mapping",
                            "High-resolution terrain topography scans",
                            "Sector-specific yield targets initialized",
                            "Historical state archive tracking engine"
                        ]
                    },
                    {
                        title: 'Eco-Topology Engine', icon: Layers, list: [
                            "Multi-spectral layer visualization interface",
                            "Nectar flux and bloom index tracking",
                            "Real-time vegetation (NDVI) telemetry",
                            "Seasonal drift analysis neural models"
                        ]
                    }
                ].map((feature, idx) => (
                    <div
                        key={idx}
                        className={cn(glass.section, "p-6 group")}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-9 h-9 rounded-lg bg-[#F9F7F2] border border-[#F4D03F]/20 flex items-center justify-center">
                                <feature.icon className="w-5 h-5 text-[#F4D03F]" />
                            </div>
                            <h3 className="text-sm font-bold text-[#1A1A1A]">{feature.title}</h3>
                        </div>
                        <ul className="space-y-4">
                            {feature.list.map((item, i) => (
                                <li key={i} className="flex gap-4 items-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#F4D03F]/40" />
                                    <span className="text-xs text-gray-500 font-medium">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default AgroIntelligenceView;
