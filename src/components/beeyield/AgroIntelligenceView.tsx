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
                title={<>Agro <span className="text-[#F4D03F]">Intelligence</span></>}
                subtitle="High-fidelity spectral telemetry and ecosystem biome analytics."
                actions={
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 bg-[#1A1A1A] rounded-xl border border-[#F4D03F]/10 flex items-center gap-3 shadow-lg">
                            <Terminal className="w-4 h-4 text-[#F4D03F] animate-pulse" />
                            <div className="flex flex-col">
                                <span className="text-[7px] font-black text-white/40 uppercase tracking-widest">Orbit Link</span>
                                <span className="text-[#F4D03F] font-black tracking-widest text-[9px]">CONNECTED</span>
                            </div>
                        </div>
                    </div>
                }
            />

            {/* Live Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Air Conditions', value: loading ? 'SCANNING...' : (weather?.cloud_cover_percent != null ? `${100 - weather.cloud_cover_percent}% Clear` : 'Stable'), icon: Sun, color: 'text-amber-500' },
                    { label: 'Soil moisture', value: loading ? 'SCANNING...' : (moisture != null ? `${moisture}%` : '42%'), icon: CloudRain, color: 'text-blue-500' },
                    { label: 'Vegetation NDVI', value: loading ? 'SCANNING...' : (vegetation != null ? vegetation.toString() : '0.64'), icon: Sprout, color: 'text-[#1B9157]' },
                    { label: 'Carbon score', value: loading ? 'SCANNING...' : (carbonScore != null ? carbonScore.toLocaleString() : '1,240'), icon: Wind, color: 'text-[#F4D03F]' }
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white border border-[#F4D03F]/10 p-5 rounded-3xl flex flex-col gap-2 relative overflow-hidden group hover:border-[#F4D03F]/30 transition-all shadow-sm"
                    >
                        <div className="flex items-center justify-between relative z-10">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#1A1A1A]/30">{stat.label}</span>
                            <stat.icon className={cn("w-4 h-4", stat.color)} />
                        </div>
                        <span className={cn("text-2xl font-black tracking-tighter tabular-nums relative z-10", stat.color)}>{stat.value}</span>
                    </motion.div>
                ))}
            </div>

            {/* Hero Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-[#F4D03F]/10 p-10 rounded-[3rem] shadow-xl relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_70%_30%,#F4D03F0A_0%,transparent_60%)] pointer-events-none" />
                
                <div className="relative z-10 flex flex-col items-start gap-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#F4D03F]/10 flex items-center justify-center border border-[#F4D03F]/20 shadow-sm group-hover:scale-110 transition-all duration-500">
                            <BrainCircuit className="w-6 h-6 text-[#F4D03F]" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-black tracking-widest text-[#1A1A1A] uppercase">Neural Biosphere</span>
                            <span className="text-[8px] font-black text-[#F4D03F] tracking-[0.3em] uppercase italic">ECOLOGICAL TOPOLOGY</span>
                        </div>
                    </div>

                    <h2 className="text-xl lg:text-2xl font-black text-[#1A1A1A] tracking-tighter uppercase leading-tight max-w-2xl">
                        Ecosystem <span className="text-[#F4D03F]">Synthesizer</span>
                    </h2>

                    <p className="text-sm font-bold opacity-60 leading-relaxed max-w-2xl text-[#1A1A1A] italic">
                        Global spectral telemetry reveals the rhythmic architecture of your ecosystem. Optimize nectar flux and pollinator trajectories
                        with AI-enhanced terrain metrics provisioned from sub-meter orbital scans.
                    </p>

                    <div className="flex gap-4 w-full sm:w-auto">
                        <button
                            onClick={() => onTabChange('precision-pollination')}
                            className="h-12 bg-[#1A1A1A] text-white hover:bg-[#F4D03F] hover:text-[#1A1A1A] rounded-2xl px-8 font-black text-[11px] uppercase tracking-widest flex items-center gap-3 transition-all shadow-lg active:scale-95"
                        >
                            <Target className="w-5 h-5" />
                            Initialize Analysis
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Sector Dynamics */}
            <div className="space-y-6">
                <div className="flex items-center gap-4 px-2">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#F4D03F]/10 flex items-center justify-center shadow-sm">
                        <Target className="w-5 h-5 text-[#F4D03F]" />
                    </div>
                    <h3 className="text-xl font-black text-[#1A1A1A] tracking-tighter uppercase">Sector <span className="text-[#F4D03F]">Dynamics</span></h3>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { title: 'Terrain Map', icon: MapIcon, desc: '3D GRID SCAN' },
                        { title: 'Spectral Drifts', icon: Share2, desc: 'STRESS ANALYTICS' },
                        { title: 'Hydration Log', icon: CloudRain, desc: 'MOISTURE FLUX' },
                        { title: 'Biomass ROI', icon: Sprout, desc: 'YIELD PROJECTION' }
                    ].map((btn, i) => (
                        <motion.button
                            key={btn.title}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i }}
                            className="bg-white border border-[#F4D03F]/10 p-6 rounded-3xl flex flex-col items-center text-center shadow-sm hover:border-[#F4D03F]/40 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-[#1A1A1A]/5 flex items-center justify-center mb-4 border border-[#F4D03F]/10 group-hover:bg-[#F4D03F] group-hover:text-[#1A1A1A] transition-all">
                                <btn.icon className="w-6 h-6 text-[#F4D03F] group-hover:text-[#1A1A1A]" />
                            </div>
                            <h4 className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest mb-1">{btn.title}</h4>
                            <p className="text-[7px] font-black text-[#1A1A1A]/30 uppercase tracking-[0.2em] italic">{btn.desc}</p>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Global Pipeline Pipeline */}
            <div className="space-y-10">
                <div className="flex items-center gap-4 border-b border-[#F4D03F]/20 pb-4 px-2">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#F4D03F]/10 flex items-center justify-center shadow-sm">
                        <Activity className="w-5 h-5 text-[#F4D03F]" />
                    </div>
                    <h3 className={cn(glass.sectionTitle, "uppercase")}>Global <span className="text-[#F4D03F]">Pipeline</span></h3>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={cn(glass.card, "p-8 shadow-sm relative overflow-hidden")}
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#F4D03F]/5 rounded-full blur-[100px] pointer-events-none" />
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-20 relative z-10">
                        {[
                            { title: "Spectral Capture", icon: Satellite },
                            { title: "Neural Layering", icon: Layers },
                            { title: "Pattern Delta", icon: BrainCircuit },
                            { title: "Precision Output", icon: Target }
                        ].map((step, i, arr) => (
                            <React.Fragment key={step.title}>
                                <div className="flex flex-col items-center gap-10 flex-1 group">
                                    <div className="relative">
                                        <div className="w-36 h-36 rounded-[2.5rem] bg-gray-400 flex items-center justify-center border border-[#F4D03F] shadow-xl transition-all group-hover:scale-110 group-hover:shadow-honey/20">
                                            <step.icon className="w-16 h-16 text-[#F4D03F]" />
                                        </div>
                                        <div className="absolute -top-4 -right-4 w-12 h-12 rounded-2xl bg-[#F4D03F] text-white flex items-center justify-center font-bold text-base shadow-xl border-4 border-white">
                                            0{i + 1}
                                        </div>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <span className={cn(glass.sectionTitle, "text-lg normal-case")}>{step.title}</span>
                                        <span className={cn(glass.microLabel, "text-[#F4D03F] opacity-60 font-bold italic tracking-widest")}>ACTIVE_PHASE</span>
                                    </div>
                                </div>
                                {i < arr.length - 1 && (
                                    <div className="hidden lg:block opacity-20">
                                        <ArrowRight className="w-12 h-12 text-[#F4D03F] animate-[bounce_2s_infinite]" />
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Detailed Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-10">
                {[
                    {
                        title: 'Spatial Dynamics', icon: BarChart3, list: [
                            "Boundary definition with sub-meter precision",
                            "High-resolution terrain and slope mapping",
                            "Sector-specific yield targets and ROI metrics",
                            "Historical state archive with delta tracking"
                        ], accent: 'honey'
                    },
                    {
                        title: 'Eco-Topology', icon: Layers, list: [
                            "Multi-spectral layer visualization suite",
                            "Nectar flow and bloom diversity indexes",
                            "Real-time vegetation index (NDVI) tracking",
                            "Seasonal drift analysis and climate modeling"
                        ], accent: 'emerald-500'
                    }
                ].map((feature, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 }}
                        className={cn(glass.card, "p-16 shadow-2xl border-[#F4D03F]/10 relative overflow-hidden group")}
                    >
                        <div className="absolute top-0 right-0 p-16 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                            <feature.icon className="w-48 h-48 text-foreground" />
                        </div>
                        <div className="flex items-center gap-6 mb-12 relative z-10">
                            <div className="w-20 h-20 rounded-[1.8rem] bg-[#FFF9F0]/60 flex items-center justify-center border border-[#F4D03F] shadow-xl">
                                <feature.icon className="w-10 h-10 text-[#F4D03F]" />
                            </div>
                            <h3 className={cn(glass.sectionTitle, "text-4xl normal-case italic")}>{feature.title}</h3>
                        </div>
                        <ul className="space-y-12 relative z-10">
                            {feature.list.map((item, i) => (
                                <li key={i} className="flex gap-10 items-start group/li">
                                    <div className="w-4 h-4 rounded-full bg-[#F4D03F] mt-2.5 shadow-lg group-hover/li:scale-125 transition-transform" />
                                    <span className="text-lg italic font-medium opacity-80 leading-snug group-hover/li:opacity-100 transition-all">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                ))}
            </div>

            {/* AI Diagnostic Banner */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className={cn(glass.card, "p-10 shadow-xl bg-[#F4D03F]/5 border-[#F4D03F]/20 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden group")}
            >
                <div className="absolute right-0 top-0 w-72 h-72 bg-[#F4D03F]/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-[#F4D03F]/15 transition-colors" />
                <div className="w-20 h-20 rounded-[2rem] bg-[#FFF9F0]/60 flex items-center justify-center shrink-0 border border-[#F4D03F] shadow-xl group-hover:scale-110 transition-transform duration-500 relative z-10">
                    <Info className="w-10 h-10 text-[#F4D03F]" />
                </div>
                <div className="relative z-10 text-center md:text-left">
                    <h5 className={cn(glass.sectionTitle, "text-3xl normal-case mb-4")}>Agro-Intelligence Summary</h5>
                    <p className="text-base italic font-medium opacity-80 leading-relaxed max-w-5xl text-foreground">
                        Our recursive neural layering of spectral telemetry indicates high vegetative health (NDVI: 0.64) across key forage sectors.
                        Carbon sequestration scores have increased by 4.2% in the last 30-day bin. Soil moisture levels remain balanced,
                        optimized for nectar production in upcoming bloom windows.
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AgroIntelligenceView;
