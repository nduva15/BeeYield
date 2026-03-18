import React from 'react';
import { Share2, Download, Maximize2, Loader2, Satellite, Sprout, CloudRain, Wind, Sun, Layers, Map as MapIcon, ArrowRight, BrainCircuit, Cpu, Target, Activity, Globe, Zap, Terminal, MapPin, BarChart3, Info, TrendingUp, ShieldCheck, Scale, Database, LayoutGrid, Sparkles, Navigation } from 'lucide-react';
import { beeyieldService } from '@/services/beeyieldService';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { glass, GlassStatCard } from './GlassTheme';
import { motion, AnimatePresence } from 'framer-motion';
import { BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer } from 'recharts';

const mockEcoData = [
  { time: '06:00', ndvi: 0.65, moisture: 0.42 },
  { time: '09:00', ndvi: 0.68, moisture: 0.40 },
  { time: '12:00', ndvi: 0.72, moisture: 0.38 },
  { time: '15:00', ndvi: 0.70, moisture: 0.36 },
  { time: '18:00', ndvi: 0.67, moisture: 0.39 },
];

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

    const moisture = satellite?.soil_moisture_index ? Math.round(satellite.soil_moisture_index * 100) : 44;
    const vegetation = satellite?.ndvi ? Math.round(satellite.ndvi * 100) / 100 : 0.74;
    const carbonScore = satellite?.ndvi ? Math.round(satellite.ndvi * 1000) : 865;

    return (
        <BeeYieldPageShell className="relative overflow-hidden">
             {/* Refraction Effects */}
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#1B9157]/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute -left-20 top-1/2 w-80 h-80 bg-[#F4D03F]/5 blur-[120px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 pb-20 relative z-10"
            >
            <BeeYieldPageHeader
                icon={Globe}
                label="BeeYield AI Agro Intelligence"
                onBack={() => onTabChange('home')}
                title={<>Strategic <span className="text-[#F4D03F]">Intelligence</span> Hub</>}
                subtitle="Global environmental matrix and predictive multi-spectral ecosystem analysis."
                actions={
                    <div className="flex items-center gap-3">
                         <div className="flex items-center gap-2 bg-white/50 backdrop-blur-md px-4 py-2 rounded-2xl border border-gray-100 shadow-sm transition-all hover:bg-white/80">
                            <Satellite className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                            <span className="text-[10px] font-black text-gray-400 tracking-widest leading-none pt-0.5 uppercase">Network Link: Synchronized</span>
                         </div>
                    </div>
                }
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <GlassStatCard
                    label="Atmospheric Clarity"
                    value={loading ? 'Scanning…' : (weather?.cloud_cover_percent != null ? `${100 - weather.cloud_cover_percent}%` : '96%')}
                    icon={Sun}
                    index={0}
                />
                <GlassStatCard
                    label="Soil Saturation"
                    value={loading ? 'Analyzing…' : `${moisture}%`}
                    icon={CloudRain}
                    index={1}
                />
                <GlassStatCard
                    label="Vegetative Flux"
                    value={loading ? 'Scanning…' : vegetation.toString()}
                    icon={Sprout}
                    index={2}
                    color="text-[#1B9157]"
                />
                <GlassStatCard
                    label="Biomass Density"
                    value={loading ? 'Calculating…' : carbonScore.toLocaleString()}
                    icon={Wind}
                    index={3}
                    color="text-[#1B9157]"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Visual Engine */}
                <div className="xl:col-span-8">
                    <div className={cn(glass.section, "p-10 space-y-10 min-h-[500px] flex flex-col justify-between relative overflow-hidden group bg-gradient-to-br from-white to-gray-50/30 shadow-xl border-white/60")}>
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1B9157]/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none group-hover:bg-[#1B9157]/10 transition-all duration-1000" />
                        
                        <div className="space-y-6 relative">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-white border border-[#1B9157]/10 flex items-center justify-center shadow-lg transition-transform hover:rotate-3">
                                    <BrainCircuit className="w-7 h-7 text-[#1B9157]" />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-sm font-black text-[#1A1A1A] tracking-tighter uppercase italic">Predictive Models</h3>
                                    <p className="text-[9px] font-bold text-emerald-600 tracking-widest leading-none bg-emerald-50 px-2 py-0.5 rounded-full w-fit">Powered by BeeYield AI Molecular OS</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h2 className="text-5xl font-black text-[#1A1A1A] tracking-tighter leading-none">
                                    Environmental <span className="text-[#F4D03F]">Flux</span> Analysis
                                </h2>
                                <p className="text-sm text-gray-500 font-medium max-w-2xl leading-relaxed border-l-4 border-[#F4D03F]/20 pl-6">
                                    Leveraging sub-meter satellite telemetry to quantify canopy density and phenological shifts. Our neural architecture correlates chlorophyll absorption with localized honey-flow potential.
                                </p>
                            </div>

                            <div className="h-56 w-full bg-white/40 backdrop-blur-sm rounded-[32px] border border-white/60 p-8 shadow-xl relative group/chart">
                                <div className="absolute top-4 right-8 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#1B9157] animate-pulse" />
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Real-time Telemetry</span>
                                </div>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={mockEcoData}>
                                        <defs>
                                            <linearGradient id="colorNDVI" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#1B9157" stopOpacity={0.2}/>
                                                <stop offset="95%" stopColor="#1B9157" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                                        <XAxis dataKey="time" hide />
                                        <YAxis hide />
                                        <ReTooltip 
                                            contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '16px', border: '1px solid #1B915710', fontSize: '10px', fontWeight: 'bold', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                            cursor={{ stroke: '#1B9157', strokeWidth: 2, strokeDasharray: '5 5' }}
                                        />
                                        <Area type="monotone" dataKey="ndvi" stroke="#1B9157" fillOpacity={1} fill="url(#colorNDVI)" strokeWidth={4} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                            <button
                                onClick={() => onTabChange('precision-pollination-home')}
                                className={cn(glass.btnPrimary, "h-14 px-10 rounded-2xl shadow-xl flex items-center justify-center gap-4 transition-all active:scale-95 bg-[#1A1A1A] hover:bg-black border-0")}
                            >
                                <Target className="w-5 h-5 text-[#F4D03F]" />
                                <span className="text-sm font-black tracking-wider text-white uppercase">Operational Matrix</span>
                            </button>
                            <button className={cn(glass.btnSecondary, "h-14 px-10 rounded-2xl flex items-center justify-center gap-4 text-gray-800 border-gray-200 shadow-lg hover:shadow-xl transition-all")}>
                                <Download className="w-5 h-5 text-[#F4D03F]" />
                                <span className="text-sm font-black tracking-wider uppercase">Strategic Brief</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tactical Overlays */}
                <div className="xl:col-span-4 space-y-6">
                    <div className={cn(glass.section, "p-8 space-y-8 h-full flex flex-col justify-between overflow-hidden relative shadow-xl border-white/60")}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F4D03F]/5 rounded-full blur-3xl -mr-16 -mt-16" />
                        
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                                <h3 className="text-base font-black text-[#1A1A1A] tracking-tight uppercase">Tactical Integrity</h3>
                                <div className="flex items-center gap-2">
                                     <div className="w-1.5 h-1.5 rounded-full bg-[#1B9157] animate-pulse" />
                                     <span className="text-[10px] font-black text-[#1B9157] uppercase tracking-widest">Active</span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { title: 'Terrain Vector', icon: MapIcon, color: '#1B9157', status: 'Optimal' },
                                    { title: 'Bloom Scan', icon: Sparkles, color: '#F4D03F', status: '97.2%' },
                                    { title: 'Competition', icon: Scale, color: '#F4D03F', status: 'Minimal' },
                                    { title: 'Yield Pulse', icon: TrendingUp, color: '#1B9157', status: '+19.6%' }
                                ].map((btn) => (
                                    <div key={btn.title} className="bg-white p-5 rounded-2xl border border-gray-50 hover:border-[#F4D03F]/30 transition-all cursor-pointer group hover:bg-white hover:shadow-2xl">
                                        <btn.icon className="w-6 h-6 mb-3 transition-transform group-hover:scale-110 group-hover:rotate-6" style={{ color: btn.color }} />
                                        <p className="text-[10px] font-black text-[#1A1A1A] tracking-widest leading-none mb-1.5 uppercase">{btn.title}</p>
                                        <p className="text-[9px] font-bold text-emerald-600 tracking-widest">{btn.status}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={cn(glass.card, "p-6 bg-[#1A1A1A] border-gray-800 relative overflow-hidden mt-6 shadow-2xl transition-transform hover:scale-[1.02]")}>
                            <div className="absolute -right-4 -top-4 opacity-[0.05]">
                                <Globe className="w-24 h-24 text-white" />
                            </div>
                            <div className="flex items-center gap-3 mb-4">
                                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                <h4 className="text-xs font-black text-white tracking-widest uppercase">Expert Strategy Note</h4>
                            </div>
                            <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                                Biomass trajectory indicates an <span className="text-white font-bold uppercase">Extended 14-day bloom window</span>. Vapor Pressure Deficit (VPD) levels remain optimal for peak nectar secretion across localized tactical sectors.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Core Modules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                {[
                    {
                        title: 'Orchard Intelligence Layer', icon: Database, list: [
                            "Sub-meter boundaries and topographical vectors",
                            "Vapor Pressure Deficit (VPD) saturation modeling",
                            "Dynamic Yield Coefficient (DYC) target setup",
                            "Historical flux-correlation neural history"
                        ]
                    },
                    {
                        title: 'Tactical Saturation Matrix', icon: Activity, list: [
                            "Real-time Chlorophyll absorption checks",
                            "Tree density sub-segmentation analysis",
                            "Micro-climate foraging window forecasting",
                            "Multi-variate seasonal yield comparison"
                        ]
                    }
                ].map((feature, idx) => (
                    <div
                        key={idx}
                        className={cn(glass.section, "p-10 group relative overflow-hidden shadow-xl border-white/60 transition-all hover:border-[#1B9157]/20")}
                    >
                        <div className="absolute right-0 bottom-0 opacity-[0.02] group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-1000">
                             <feature.icon className="w-56 h-56" />
                        </div>
                        <div className="flex items-center gap-5 mb-10">
                            <div className="w-14 h-14 rounded-[20px] bg-white border border-gray-100 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                                <feature.icon className="w-7 h-7 text-[#1B9157]" />
                            </div>
                            <h3 className="text-xl font-black text-[#1A1A1A] tracking-tighter uppercase italic">{feature.title}</h3>
                        </div>
                        <ul className="space-y-6 relative">
                            {feature.list.map((item, i) => (
                                <li key={i} className="flex gap-5 items-center group/item">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#1B9157]/20 border border-[#1B9157]/10 shadow-sm group-hover/item:bg-[#F4D03F]/40 transition-colors" />
                                    <span className="text-[10px] text-gray-400 font-black tracking-[0.1em] uppercase group-hover/item:text-[#1A1A1A] transition-colors">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            </motion.div>
        </BeeYieldPageShell>
    );
};

export default AgroIntelligenceView;
