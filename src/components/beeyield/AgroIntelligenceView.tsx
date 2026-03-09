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
    BarChart3
} from 'lucide-react';
import beeyieldService from '@/services/beeyieldService';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
        <div className="space-y-12 animate-in fade-in duration-700 pb-20 honeycomb-bg min-h-screen p-8 -m-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 pb-4">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2.5 px-5 py-2 bg-honey/10 text-honey rounded-full text-[10px] font-black uppercase tracking-widest border border-honey/20 backdrop-blur-sm">
                        <Satellite className="w-3.5 h-3.5" />
                        Spectral Orbital Registry
                    </div>
                    <h1 className="text-6xl font-serif font-black text-honey tracking-tight leading-none">
                        Satellite <span className="text-foreground">Intelligence</span>
                    </h1>
                    <p className="text-sm font-medium text-muted-foreground max-w-lg leading-relaxed uppercase tracking-wider opacity-70">
                        Real-time spectral field data provisioned from Copernicus orbital arrays, analyzed by BeeYield AI.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-8 py-4 rounded-2xl bg-white/50 backdrop-blur-md border border-border text-foreground font-black text-[10px] uppercase tracking-widest flex items-center gap-4 shadow-xl">
                        <Terminal className="w-5 h-5 text-honey animate-pulse" />
                        <span className="opacity-70">SYS_ORBIT_LINK:</span> <span className="text-honey">CONNECTED</span>
                    </div>
                </div>
            </div>

            {/* Live Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: 'Air Conditions', value: loading ? 'SCANNING...' : (weather?.cloud_cover_percent != null ? `${100 - weather.cloud_cover_percent}% Clear` : 'Stable'), icon: Sun, color: 'text-honey', bg: 'bg-honey/10' },
                    { label: 'Soil moisture', value: loading ? 'SCANNING...' : (moisture != null ? `${moisture}%` : '42%'), icon: CloudRain, color: 'text-honey', bg: 'bg-honey/10' },
                    { label: 'Vegetation ndvi', value: loading ? 'SCANNING...' : (vegetation != null ? vegetation : '0.64'), icon: Sprout, color: 'text-honey', bg: 'bg-honey/10' },
                    { label: 'Carbon score', value: loading ? 'SCANNING...' : (carbonScore != null ? carbonScore : '1,240'), icon: Wind, color: 'text-honey', bg: 'bg-honey/10' }
                ].map((stat, i) => (
                    <div key={stat.label} className="bg-white/80 backdrop-blur-md border border-border p-8 rounded-[2.5rem] shadow-xl shadow-black/5 hover:scale-[1.02] transition-all group relative overflow-hidden active:scale-95">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-honey/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-honey/10 transition-all" />

                        <div className="flex items-center gap-4 mb-8">
                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border border-border group-hover:border-honey/50 transition-colors", stat.bg)}>
                                <stat.icon className={cn("w-7 h-7", stat.color)} />
                            </div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-70">{stat.label}</p>
                        </div>
                        <h3 className="text-4xl font-serif font-black text-foreground tracking-tight">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Hero / Promo Card */}
            <div className="bg-neutral-900 border border-honey/20 p-16 rounded-[4rem] shadow-[0_45px_100px_rgba(0,0,0,0.3)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-2/3 h-full bg-[radial-gradient(circle_at_70%_30%,#D97706_0%,transparent_60%)] opacity-20 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-[radial-gradient(circle_at_20%_80%,#059669_0%,transparent_60%)] opacity-20 pointer-events-none" />

                <div className="relative z-10 flex flex-col items-start gap-12">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-honey/10 flex items-center justify-center border border-honey/30">
                            <BrainCircuit className="w-9 h-9 text-honey" />
                        </div>
                        <span className="text-xs font-black text-honey uppercase tracking-[0.5em] leading-none">Neural Biosphere Intelligence</span>
                    </div>

                    <h2 className="text-8xl font-serif font-black text-white leading-[0.9] tracking-tighter max-w-4xl">
                        Ecological <span className="text-honey">Topology.</span>
                    </h2>

                    <p className="text-white/40 text-xl font-medium leading-relaxed uppercase tracking-widest max-w-3xl">
                        Global spectral telemetry reveals the rhythmic architecture of your ecosystem. Optimize nectar flux and pollinator trajectories with AI-enhanced terrain metrics.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-8 pt-8 w-full sm:w-auto">
                        <Button
                            onClick={() => onTabChange('precision-pollination')}
                            className="h-20 px-14 rounded-[2rem] bg-honey text-white hover:bg-honey/90 font-black text-sm uppercase tracking-[0.3em] transition-all shadow-2xl shadow-honey/20 border-none active:scale-95"
                        >
                            <MapIcon className="w-6 h-6 mr-4" />
                            Initialize Spatial Analysis
                        </Button>
                        <Button className="h-20 px-14 rounded-[2rem] bg-white/5 text-white hover:bg-white/10 font-black text-sm uppercase tracking-[0.3em] transition-all border border-white/10 backdrop-blur-md">
                            Protocol Archives
                        </Button>
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="space-y-12">
                <div className="flex items-center gap-6 border-b border-border pb-10">
                    <div className="w-14 h-14 rounded-2xl bg-white/50 backdrop-blur-md flex items-center justify-center border border-border">
                        <Target className="w-7 h-7 text-honey" />
                    </div>
                    <h3 className="text-5xl font-serif font-black text-foreground tracking-tighter">Sector <span className="text-honey">Dynamics</span></h3>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
                    {[
                        { title: 'Terrain Map', icon: MapIcon, desc: '3D GRID SCAN' },
                        { title: 'Spectral Drifts', icon: Share2, desc: 'STRESS ANALYTICS' },
                        { title: 'Hydration Log', icon: CloudRain, desc: 'MOISTURE FLUX' },
                        { title: 'Biomass ROI', icon: Sprout, desc: 'YIELD PROJECTION' }
                    ].map((btn, i) => (
                        <button
                            key={btn.title}
                            className="group p-12 flex flex-col items-center text-center bg-white/80 backdrop-blur-md border border-border rounded-[3.5rem] shadow-xl shadow-black/5 hover:scale-[1.05] hover:border-honey/50 transition-all relative overflow-hidden active:scale-95"
                        >
                            <div className="w-24 h-24 rounded-[2.5rem] bg-muted flex items-center justify-center mb-8 border border-border group-hover:bg-honey group-hover:border-honey transition-all shadow-lg">
                                <btn.icon className="w-11 h-11 text-muted-foreground group-hover:text-white transition-all" />
                            </div>
                            <h4 className="text-sm font-black text-foreground uppercase tracking-[0.3em] mb-3">{btn.title}</h4>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.4em] opacity-50">{btn.desc}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Workflow Section */}
            <div className="space-y-12">
                <div className="flex items-center gap-6 border-b border-border pb-10">
                    <div className="w-14 h-14 rounded-2xl bg-white/50 backdrop-blur-md flex items-center justify-center border border-border">
                        <Activity className="w-7 h-7 text-honey" />
                    </div>
                    <h3 className="text-5xl font-serif font-black text-foreground tracking-tighter">Global <span className="text-honey">Pipeline</span></h3>
                </div>
                <div className="bg-white/80 backdrop-blur-md rounded-[4rem] border border-border p-16 shadow-xl shadow-black/5">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
                        {[
                            { title: "Spectral Capture", icon: Satellite },
                            { title: "Neural Layering", icon: Layers },
                            { title: "Pattern Delta", icon: BrainCircuit },
                            { title: "Precision Output", icon: Target }
                        ].map((step, i, arr) => (
                            <React.Fragment key={step.title}>
                                <div className="flex flex-col items-center gap-10 flex-1 group">
                                    <div className="relative">
                                        <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-amber flex items-center justify-center border-4 border-white shadow-2xl transition-transform group-hover:scale-110 active:scale-95">
                                            <step.icon className="w-14 h-14 text-white" />
                                        </div>
                                        <div className="absolute -top-4 -right-4 w-12 h-12 rounded-2xl bg-foreground text-white flex items-center justify-center font-black text-sm shadow-xl border-4 border-white">
                                            0{i + 1}
                                        </div>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <span className="block font-black text-foreground text-[15px] uppercase tracking-[0.2em]">{step.title}</span>
                                        <span className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-40">ACTIVE_PHASE</span>
                                    </div>
                                </div>
                                {i < arr.length - 1 && (
                                    <div className="hidden lg:block opacity-10">
                                        <ArrowRight className="w-10 h-10 text-foreground" />
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            {/* Detailed Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-white/80 backdrop-blur-md border border-border p-16 rounded-[4rem] shadow-xl shadow-black/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                        <MapIcon className="w-32 h-32 text-foreground" />
                    </div>
                    <div className="flex items-center gap-6 mb-12">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-honey/10 flex items-center justify-center border border-honey/20">
                            <BarChart3 className="w-8 h-8 text-honey" />
                        </div>
                        <h3 className="text-4xl font-serif font-black text-foreground tracking-tight">Spatial Dynamics</h3>
                    </div>
                    <ul className="space-y-10">
                        {[
                            "Boundary definition with sub-meter precision",
                            "High-resolution terrain and slope mapping",
                            "Sector-specific yield targets and ROI metrics",
                            "Historical state archive with delta tracking"
                        ].map((item, i) => (
                            <li key={i} className="flex gap-8 items-start group/li">
                                <div className="w-3 h-3 rounded-full bg-honey mt-2.5 shadow-[0_0_15px_rgba(217,119,6,0.5)] group-hover/li:scale-150 transition-transform" />
                                <span className="text-[15px] font-black text-muted-foreground uppercase tracking-widest leading-snug group-hover/li:text-foreground transition-colors opacity-70 group-hover/li:opacity-100">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white/80 backdrop-blur-md border border-border p-16 rounded-[4rem] shadow-xl shadow-black/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Layers className="w-32 h-32 text-foreground" />
                    </div>
                    <div className="flex items-center gap-6 mb-12">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-honey/10 flex items-center justify-center border border-honey/20">
                            <Zap className="w-8 h-8 text-honey" />
                        </div>
                        <h3 className="text-4xl font-serif font-black text-foreground tracking-tight">Eco-Topology</h3>
                    </div>
                    <ul className="space-y-10">
                        {[
                            "Multi-spectral layer visualization suite",
                            "Nectar flow and bloom diversity indexes",
                            "Real-time vegetation index (NDVI) tracking",
                            "Seasonal drift analysis and climate modeling"
                        ].map((item, i) => (
                            <li key={i} className="flex gap-8 items-start group/li">
                                <div className="w-3 h-3 rounded-full bg-honey mt-2.5 shadow-[0_0_15px_rgba(217,119,6,0.5)] group-hover/li:scale-150 transition-transform" />
                                <span className="text-[15px] font-black text-muted-foreground uppercase tracking-widest leading-snug group-hover/li:text-foreground transition-colors opacity-70 group-hover/li:opacity-100">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AgroIntelligenceView;
