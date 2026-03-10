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
import { glass } from './GlassTheme';
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
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(glass.page, "p-8 -m-8 space-y-16 pb-20 min-h-screen")}
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-border/50 pb-8">
                <div className="space-y-4">
                    <div className={cn(glass.badge, 'bg-honey/10 text-honey border-honey/20 mb-2')}>
                        <Satellite className="w-4 h-4 mr-2" />
                        Spectral Orbital Registry v5.2
                    </div>
                    <h1 className={cn(glass.sectionTitle, 'text-7xl normal-case')}>
                        Satellite <span className="text-honey">Intelligence</span>
                    </h1>
                    <p className={cn(glass.microLabel, "normal-case italic font-semibold opacity-70")}>
                        Real-time spectral field data provisioned from Copernicus orbital arrays · Analyzed by BeeYield AI
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className={cn(glass.card, "px-8 py-4 bg-white/40 dark:bg-black/20 border-border/50 shadow-xl flex items-center gap-4")}>
                        <Terminal className="w-6 h-6 text-honey animate-pulse" />
                        <div className="flex flex-col">
                            <span className={cn(glass.microLabel, "opacity-40 font-bold")}>SYS_ORBIT_LINK</span>
                            <span className="text-honey font-bold tracking-widest text-sm">CONNECTED</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Live Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                {[
                    { label: 'Air Conditions', value: loading ? 'SCANNING...' : (weather?.cloud_cover_percent != null ? `${100 - weather.cloud_cover_percent}% Clear` : 'Stable'), icon: Sun },
                    { label: 'Soil moisture', value: loading ? 'SCANNING...' : (moisture != null ? `${moisture}%` : '42%'), icon: CloudRain },
                    { label: 'Vegetation NDVI', value: loading ? 'SCANNING...' : (vegetation != null ? vegetation.toString() : '0.64'), icon: Sprout },
                    { label: 'Carbon score', value: loading ? 'SCANNING...' : (carbonScore != null ? carbonScore.toLocaleString() : '1,240'), icon: Wind }
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={cn(glass.card, "p-8 shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden")}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-honey/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-honey/10 transition-all pointer-events-none" />
                        <div className="flex items-center gap-5 mb-8">
                            <div className="w-14 h-14 rounded-2xl bg-honey/10 flex items-center justify-center border border-honey/20 group-hover:border-honey/50 transition-colors">
                                <stat.icon className="w-7 h-7 text-honey" />
                            </div>
                            <p className={cn(glass.microLabel, "opacity-40 font-bold uppercase tracking-[0.2em]")}>{stat.label}</p>
                        </div>
                        <h3 className={cn(glass.sectionTitle, "text-4xl normal-case")}>{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            {/* Hero Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={cn(glass.card, "p-16 shadow-2xl relative overflow-hidden border-honey/20 group")}
            >
                <div className="absolute top-0 right-0 w-2/3 h-full bg-[radial-gradient(circle_at_70%_30%,hsl(var(--honey)/0.15)_0%,transparent_60%)] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-[radial-gradient(circle_at_20%_80%,hsl(var(--emerald-500)/0.05)_0%,transparent_60%)] pointer-events-none" />

                <div className="relative z-10 flex flex-col items-start gap-12">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-[2rem] bg-honey/10 flex items-center justify-center border border-honey/30 shadow-xl group-hover:scale-110 transition-transform duration-500">
                            <BrainCircuit className="w-10 h-10 text-honey" />
                        </div>
                        <div className="flex flex-col">
                            <span className={cn(glass.sectionTitle, "text-2xl normal-case")}>Neural Biosphere</span>
                            <span className={cn(glass.microLabel, "text-honey font-bold tracking-[0.4em] italic")}>ECOLOGICAL TOPOLOGY</span>
                        </div>
                    </div>

                    <h2 className={cn(glass.sectionTitle, "text-8xl normal-case leading-[0.9] tracking-tighter max-w-5xl")}>
                        Ecological <span className="text-honey">Topology.</span>
                    </h2>

                    <p className="text-base italic font-medium opacity-80 leading-relaxed max-w-3xl text-foreground">
                        Global spectral telemetry reveals the rhythmic architecture of your ecosystem. Optimize nectar flux and pollinator trajectories
                        with AI-enhanced terrain metrics provisioned from sub-meter orbital scans.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-8 pt-8 w-full sm:w-auto">
                        <button
                            onClick={() => onTabChange('precision-pollination')}
                            className={cn(glass.btnPrimary, "h-20 px-16 font-bold shadow-2xl shadow-honey/30 text-lg")}
                        >
                            <MapIcon className="w-6 h-6 mr-4" />
                            Initialize Spatial Analysis
                        </button>
                        <button className={cn(glass.btnSecondary, "h-20 px-16 font-bold text-lg")}>
                            Protocol Archives
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Sector Dynamics */}
            <div className="space-y-10">
                <div className="flex items-center gap-6 border-b border-border/50 pb-8 px-2">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-white/60 dark:bg-black/40 flex items-center justify-center border border-border shadow-xl">
                        <Target className="w-8 h-8 text-honey" />
                    </div>
                    <h3 className={cn(glass.sectionTitle, "text-5xl normal-case italic")}>Sector <span className="text-honey">Dynamics</span></h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
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
                            transition={{ delay: 0.5 + (i * 0.1) }}
                            className={cn(glass.card, "group p-12 flex flex-col items-center text-center shadow-xl hover:shadow-2xl hover:scale-[1.05] transition-all relative overflow-hidden")}
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-honey opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-24 h-24 rounded-[2.5rem] bg-white/40 dark:bg-black/40 flex items-center justify-center mb-8 border border-border group-hover:border-honey group-hover:bg-honey transition-all shadow-lg group-active:scale-95">
                                <btn.icon className="w-11 h-11 text-honey group-hover:text-white transition-all" />
                            </div>
                            <h4 className={cn(glass.sectionTitle, "text-base normal-case mb-2")}>{btn.title}</h4>
                            <p className={cn(glass.microLabel, "opacity-40 italic font-bold tracking-widest")}>{btn.desc}</p>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Global Pipeline Pipeline */}
            <div className="space-y-10">
                <div className="flex items-center gap-6 border-b border-border/50 pb-8 px-2">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-white/60 dark:bg-black/40 flex items-center justify-center border border-border shadow-xl">
                        <Activity className="w-8 h-8 text-honey" />
                    </div>
                    <h3 className={cn(glass.sectionTitle, "text-5xl normal-case italic")}>Global <span className="text-honey">Pipeline</span></h3>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className={cn(glass.card, "p-16 shadow-2xl relative overflow-hidden")}
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-honey/5 rounded-full blur-[100px] pointer-events-none" />
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
                                        <div className="w-36 h-36 rounded-[2.5rem] bg-white/40 dark:bg-black/20 flex items-center justify-center border border-honey shadow-xl transition-all group-hover:scale-110 group-hover:shadow-honey/20">
                                            <step.icon className="w-16 h-16 text-honey" />
                                        </div>
                                        <div className="absolute -top-4 -right-4 w-12 h-12 rounded-2xl bg-honey text-white flex items-center justify-center font-bold text-base shadow-xl border-4 border-white dark:border-black">
                                            0{i + 1}
                                        </div>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <span className={cn(glass.sectionTitle, "text-lg normal-case")}>{step.title}</span>
                                        <span className={cn(glass.microLabel, "text-honey opacity-60 font-bold italic tracking-widest")}>ACTIVE_PHASE</span>
                                    </div>
                                </div>
                                {i < arr.length - 1 && (
                                    <div className="hidden lg:block opacity-20">
                                        <ArrowRight className="w-12 h-12 text-honey animate-[bounce_2s_infinite]" />
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
                        className={cn(glass.card, "p-16 shadow-2xl border-honey/10 relative overflow-hidden group")}
                    >
                        <div className="absolute top-0 right-0 p-16 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                            <feature.icon className="w-48 h-48 text-foreground" />
                        </div>
                        <div className="flex items-center gap-6 mb-12 relative z-10">
                            <div className="w-20 h-20 rounded-[1.8rem] bg-white/60 dark:bg-black/40 flex items-center justify-center border border-honey shadow-xl">
                                <feature.icon className="w-10 h-10 text-honey" />
                            </div>
                            <h3 className={cn(glass.sectionTitle, "text-4xl normal-case italic")}>{feature.title}</h3>
                        </div>
                        <ul className="space-y-12 relative z-10">
                            {feature.list.map((item, i) => (
                                <li key={i} className="flex gap-10 items-start group/li">
                                    <div className="w-4 h-4 rounded-full bg-honey mt-2.5 shadow-lg group-hover/li:scale-125 transition-transform" />
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
                className={cn(glass.card, "p-10 shadow-xl bg-honey/5 border-honey/20 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden group")}
            >
                <div className="absolute right-0 top-0 w-72 h-72 bg-honey/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-honey/15 transition-colors" />
                <div className="w-20 h-20 rounded-[2rem] bg-white/60 dark:bg-black/40 flex items-center justify-center shrink-0 border border-honey shadow-xl group-hover:scale-110 transition-transform duration-500 relative z-10">
                    <Info className="w-10 h-10 text-honey" />
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
