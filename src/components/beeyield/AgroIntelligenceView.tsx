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
import { beeyieldService } from '@/services/beeyieldService';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { glass, PageHeader } from './GlassTheme';
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
            className={cn(glass.page, "space-y-6 pb-20")}
        >
            {/* Header */}
            <PageHeader
                icon={Satellite}
                label="Orbital Intelligence Kernel"
                title="Agro Intelligence"
                subtitle="High-fidelity spectral telemetry and ecosystem biome analytics."
                actions={
                    <div className="flex items-center gap-3">
                        <div className={cn(glass.card, "px-4 py-2 flex items-center gap-3 shadow-lg bg-[#1A1A1A] border-[#F4D03F]/20")}>
                            <Terminal className="w-4 h-4 text-[#F4D03F] animate-pulse" />
                            <div className="flex flex-col">
                                <span className="text-[7px] font-black text-white/40 uppercase tracking-[0.3em]">ORBIT_LINK</span>
                                <span className="text-[#F4D03F] font-black tracking-[0.2em] text-[9px]">CONNECTED</span>
                            </div>
                        </div>
                    </div>
                }
            />

            {/* Live Metrics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'AIR_SCAN_PROTOCOL', value: loading ? 'SCANNING...' : (weather?.cloud_cover_percent != null ? `${100 - weather.cloud_cover_percent}% Clear` : 'Stable'), icon: Sun, color: 'text-amber-500' },
                    { label: 'SOIL_MOISTURE_INDEX', value: loading ? 'SYNCING...' : (moisture != null ? `${moisture}%` : '42%'), icon: CloudRain, color: 'text-blue-500' },
                    { label: 'VEGETATION_NDVI', value: loading ? 'MAPPING...' : (vegetation != null ? vegetation.toString() : '0.64'), icon: Sprout, color: 'text-[#1B9157]' },
                    { label: 'CARBON_SEQUESTRATION', value: loading ? 'CALC...' : (carbonScore != null ? carbonScore.toLocaleString() : '1,240'), icon: Wind, color: 'text-[#1A1A1A]' }
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className={cn(glass.card, "p-4 flex flex-col gap-1.5 border-white/40 shadow-sm group hover:border-[#F4D03F]/30 transition-all")}
                    >
                        <div className="flex items-center justify-between relative z-10">
                            <span className={glass.microLabel}>{stat.label}</span>
                            <stat.icon className={cn("w-3.5 h-3.5", stat.color)} />
                        </div>
                        <span className={cn("text-xl font-black tracking-tighter tabular-nums relative z-10", stat.color)}>{stat.value}</span>
                        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-[#F4D03F]/10 group-hover:bg-[#F4D03F]/30 transition-all" />
                    </motion.div>
                ))}
            </div>

            {/* Hero Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(glass.card, "p-8 lg:p-10 border-[#F4D03F]/20 shadow-xl relative overflow-hidden group")}
            >
                <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_70%_30%,#F4D03F05_0%,transparent_60%)] pointer-events-none" />
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#F4D03F 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                
                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                    <div className="space-y-6 max-w-2xl">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-white border border-[#F4D03F]/20 flex items-center justify-center shadow-sm group-hover:rotate-12 transition-all duration-500">
                                <BrainCircuit className="w-6 h-6 text-[#F4D03F]" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black tracking-[0.3em] text-[#1A1A1A] uppercase">Neural Biosphere</span>
                                <span className="text-[8px] font-black text-[#F4D03F] tracking-[0.2em] uppercase italic">BIOSPHERE_TOPOLOGY_CORE</span>
                            </div>
                        </div>

                        <h2 className="text-3xl font-black text-[#1A1A1A] tracking-tighter uppercase leading-[0.9] max-w-xl">
                            Ecosystem <span className="text-[#F4D03F]">Synthesizer</span> Interface
                        </h2>

                        <p className="text-[11px] font-black opacity-40 leading-relaxed max-w-xl text-[#1A1A1A] uppercase tracking-tighter">
                            Synthesizing orbital spectral telemetry to decode the rhythmic architecture of your terrain. 
                            Nectar flux optimization and precision trajectory modeling active.
                        </p>

                        <div className="flex gap-4">
                            <button
                                onClick={() => onTabChange('precision-pollination-home')}
                                className={cn(glass.btnPrimary, "h-11 px-8 rounded-xl flex items-center gap-3 transition-all shadow-xl shadow-black/10")}
                            >
                                <Target className="w-4 h-4" />
                                <span>INITIALIZE_NEURAL_MAPPING</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 w-full lg:w-auto">
                        {[
                            { label: 'NDVI_SIGNAL', value: 'High', color: 'text-[#1B9157]' },
                            { label: 'SPECTRUM_SYNC', value: 'Locked', color: 'text-[#F4D03F]' },
                            { label: 'BIOMASS_VAL', value: '0.84', color: 'text-[#1A1A1A]' },
                            { label: 'ORBIT_REF', value: 'V-2', color: 'text-gray-400' }
                        ].map((item, i) => (
                            <div key={i} className="bg-white/40 border border-[#F4D03F]/10 p-4 rounded-2xl flex flex-col gap-1 min-w-[120px] shadow-sm">
                                <span className={glass.microLabel}>{item.label}</span>
                                <span className={cn("text-xs font-black uppercase tracking-widest", item.color)}>{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Sector Dynamics */}
            <div className="space-y-6">
                <div className="flex items-center gap-4 px-2">
                    <div className="w-10 h-10 rounded-xl bg-white/40 border border-[#F4D03F]/20 flex items-center justify-center shadow-sm backdrop-blur-md">
                        <Target className="w-5 h-5 text-[#F4D03F]" />
                    </div>
                    <div className="space-y-0.5">
                        <h3 className={glass.sectionTitle}>SECTOR_DYNAMICS</h3>
                        <p className={glass.microLabel}>TERRAIN_INTERACTION_MODULES</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { title: 'Terrain Map', icon: MapIcon, desc: '3D_GRID_SCAN' },
                        { title: 'Spectral Drifts', icon: Share2, desc: 'DELTA_ANALYTICS' },
                        { title: 'Hydration Log', icon: CloudRain, desc: 'FLUX_PROTOCOL' },
                        { title: 'Biomass ROI', icon: Sprout, desc: 'YIELD_PROJECTION' }
                    ].map((btn, i) => (
                        <motion.button
                            key={btn.title}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i }}
                            className={cn(glass.card, "p-4 flex flex-col items-center text-center shadow-sm hover:border-[#F4D03F]/40 transition-all group relative overflow-hidden bg-white/40")}
                        >
                            <div className="w-11 h-11 rounded-xl bg-white border border-[#F4D03F]/10 flex items-center justify-center mb-4 group-hover:bg-[#F4D03F] transition-all shadow-sm">
                                <btn.icon className="w-4 h-4 text-[#F4D03F] group-hover:text-white transition-colors" />
                            </div>
                            <h4 className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-[0.2em] mb-1">{btn.title}</h4>
                            <p className="text-[7.5px] font-black text-[#F4D03F] uppercase tracking-widest italic">{btn.desc}</p>
                            
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#1B9157] animate-pulse" />
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Global Pipeline */}
            <div className="space-y-6">
                <div className="flex items-center gap-4 px-2">
                    <div className="w-10 h-10 rounded-xl bg-white/40 border border-[#F4D03F]/20 flex items-center justify-center shadow-sm backdrop-blur-md">
                        <Activity className="w-5 h-5 text-[#F4D03F]" />
                    </div>
                    <div className="space-y-0.5">
                        <h3 className={glass.sectionTitle}>GLOBAL_PIPELINE</h3>
                        <p className={glass.microLabel}>PROCESSING_LOGIC_SEQUENCE</p>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(glass.card, "p-8 border-[#F4D03F]/10 shadow-sm relative overflow-hidden bg-white/40")}
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#F4D03F]/5 rounded-full blur-[80px] pointer-events-none" />
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
                        {[
                            { title: "Spectral Capture", icon: Satellite, sub: "ORBITAL_SYNC" },
                            { title: "Neural Layering", icon: Layers, sub: "AI_PROCESSING" },
                            { title: "Pattern Delta", icon: BrainCircuit, sub: "ALGORITHMIC" },
                            { title: "Precision Output", icon: Target, sub: "READY_PROTOCOL" }
                        ].map((step, i, arr) => (
                            <React.Fragment key={step.title}>
                                <div className="flex flex-col lg:flex-row items-center gap-4 flex-1 group">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-2xl bg-white border border-[#F4D03F]/20 flex items-center justify-center shadow-md transition-all group-hover:scale-105 group-hover:border-[#F4D03F]/40">
                                            <step.icon className="w-7 h-7 text-[#F4D03F]" />
                                        </div>
                                        <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-lg bg-[#1A1A1A] text-white flex items-center justify-center font-black text-[8px] shadow-lg border-2 border-white">
                                            0{i + 1}
                                        </div>
                                    </div>
                                    <div className="text-center lg:text-left space-y-0.5">
                                        <span className="text-[9px] font-black uppercase tracking-tight block text-[#1A1A1A]">{step.title}</span>
                                        <span className="text-[7px] font-black text-[#F4D03F] tracking-widest uppercase italic">{step.sub}</span>
                                    </div>
                                </div>
                                {i < arr.length - 1 && (
                                    <div className="hidden lg:block opacity-10">
                                        <ArrowRight className="w-5 h-5 text-[#1A1A1A]" />
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Detailed Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            "Nectar flow and bloom index tracking",
                            "Real-time vegetation (NDVI) telemetry",
                            "Seasonal drift analysis neural models"
                        ]
                    }
                ].map((feature, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: idx === 0 ? -10 : 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(glass.card, "p-8 border-white/40 shadow-lg relative overflow-hidden group bg-white/40")}
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                            <feature.icon className="w-24 h-24 text-[#1A1A1A]" />
                        </div>
                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-white border border-[#F4D03F]/20 flex items-center justify-center shadow-sm">
                                <feature.icon className="w-4 h-4 text-[#F4D03F]" />
                            </div>
                            <h3 className={glass.sectionTitle}>{feature.title}</h3>
                        </div>
                        <ul className="space-y-4 relative z-10">
                            {feature.list.map((item, i) => (
                                <li key={i} className="flex gap-4 items-center group/li">
                                    <div className="w-1 h-1 rounded-full bg-[#F4D03F] shadow-sm" />
                                    <span className="text-[9px] font-black uppercase tracking-tighter opacity-40 group-hover/li:opacity-100 transition-opacity leading-none">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(glass.card, "p-6 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden group shadow-sm bg-[#F4D03F]/5 border-[#F4D03F]/20")}
            >
                <div className="absolute right-0 top-0 w-48 h-48 bg-[#F4D03F]/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 border border-[#F4D03F]/20 shadow-sm relative z-10">
                    <Info className="w-5 h-5 text-[#F4D03F]" />
                </div>
                <div className="relative z-10 text-center md:text-left space-y-1">
                    <h5 className={glass.sectionTitle}>AGRO_INTELLIGENCE_SUMMARY</h5>
                    <p className="text-[10px] font-black opacity-40 leading-relaxed text-[#1A1A1A] uppercase tracking-tighter">
                        Recursive neural layering of spectral telemetry indicates high vegetative health across forage sectors.
                        Carbon sequestration scores increased by 4.2% in the last 30-day epoch.
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AgroIntelligenceView;
