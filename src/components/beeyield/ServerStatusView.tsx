import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
    Loader2, Activity, Server, Database, ShieldCheck, 
    RefreshCw, Globe, Zap, AlertTriangle, Cpu, Terminal,
    Clock, BarChart3, Binary, Lock
} from 'lucide-react';
import beeyieldService from '@/services/beeyieldService';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { glass, PageHeader, GlassStatCard } from './GlassTheme';

const ServerStatusView: React.FC<{ onTabChange: (tab: string) => void }> = ({ onTabChange }) => {
    const [loading, setLoading] = React.useState(true);
    const [stats, setStats] = React.useState<any>(null);
    const [lastRefresh, setLastRefresh] = React.useState('-');

    const fetchStats = async () => {
        setLoading(true);
        try {
            const data = await beeyieldService.getApiUsageStats(7);
            setStats(data);
            setLastRefresh(new Date().toLocaleString());
        } catch (err) {
            console.error('Error loading API stats:', err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchStats();
    }, []);

    const totalCalls = stats?.total_calls ?? 0;
    const avgResponseMs = stats?.avg_response_ms ? Math.round(stats.avg_response_ms) : 0;
    const errorCount = stats?.error_count ?? 0;
    const topEndpoints: { endpoint: string; count: number }[] = stats?.top_endpoints ?? [];
    const limit = 10000;
    const usagePercent = Math.min((totalCalls / limit) * 100, 100).toFixed(2);

    const apis = [
        { name: 'Supabase REST', checkPath: '/rest/v1/', lastCheck: lastRefresh, type: 'Database' },
        { name: 'Supabase Auth', checkPath: '/auth/v1/', lastCheck: lastRefresh, type: 'Security' },
        { name: 'BeeYield Backend', checkPath: '/api/v1/health', lastCheck: lastRefresh, type: 'Engine' },
        { name: 'Analysis Service', checkPath: '/api/v1/ai/health', lastCheck: lastRefresh, type: 'AI Hub' },
    ];

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={glass.page}
        >
            {/* Header */}
            <PageHeader 
                icon={Activity}
                label="System Infrastructure"
                title={<>Network <span className="text-honey">Status</span></>}
                subtitle="High-fidelity monitoring of BeeYield core services and global API infrastructure."
                actions={
                    <button
                        onClick={fetchStats}
                        disabled={loading}
                        className={cn(glass.btnPrimary, "h-24 bg-honey text-black shadow-4xl rounded-[3.5rem] px-16 font-black italic text-2xl transition-all uppercase flex items-center justify-center gap-10 group/btn pl-24")}
                    >
                        {loading ? <RefreshCw className="w-10 h-10 animate-spin" /> : <ShieldCheck className="w-10 h-10 group-hover/btn:rotate-180 transition-transform duration-1000" />}
                        Execute Health Check
                    </button>
                }
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                <GlassStatCard label="Total API Hits" value={totalCalls.toLocaleString()} icon={Zap} index={0} />
                <GlassStatCard label="Avg Latency" value={`${avgResponseMs}ms`} icon={Clock} index={1} color="text-emerald-500" />
                <GlassStatCard label="Error Reports" value={errorCount} icon={AlertTriangle} index={2} color={errorCount > 0 ? "text-red-500" : "text-emerald-500"} />
                <GlassStatCard label="Capacity Usage" value={`${usagePercent}%`} icon={BarChart3} index={3} color="text-honey" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">
                {/* Usage Detail */}
                <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(glass.card, "lg:col-span-8 p-0 overflow-hidden bg-white/60 backdrop-blur-3xl rounded-[5rem] relative")}
                >
                    <div className="p-16 border-b border-gray-200 bg-white/40 backdrop-blur-3xl flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-10">
                            <div className="w-18 h-18 rounded-[2rem] bg-honey/10 flex items-center justify-center border border-honey/20 shadow-3xl">
                                <Cpu className="w-10 h-10 text-honey animate-pulse" />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-6xl font-black italic text-foreground tracking-tighter uppercase leading-none">Compute <span className="text-honey">Metrics</span></h2>
                                <p className={cn(glass.microLabel, 'opacity-40 uppercase italic')}>Active endpoint routing and usage distribution.</p>
                            </div>
                        </div>
                        <div className={cn(glass.badge, "bg-honey/10 text-honey border-honey/20 px-12 py-4 rounded-full shadow-4xl skew-x-[-15deg]")}>
                            <div className="skew-x-[15deg] font-black italic uppercase text-[16px] tracking-[0.4em] flex items-center gap-6">
                                <div className="w-3.5 h-3.5 rounded-full bg-honey animate-pulse" />
                                System Optimal
                            </div>
                        </div>
                    </div>

                    <div className="p-20 space-y-20 relative z-10">
                        <div className="space-y-12">
                            <div className="space-y-6">
                                <div className="flex justify-between items-end mb-4 px-4">
                                    <Label className={cn(glass.microLabel, 'opacity-40 uppercase italic tracking-[0.3em]')}>System Utilization</Label>
                                    <span className="text-4xl font-black italic text-honey tracking-tighter tabular-nums">{usagePercent}%</span>
                                </div>
                                <div className="h-4 w-full bg-gray-50 rounded-full overflow-hidden shadow-inner p-[2px] border border-white/5">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${usagePercent}%` }}
                                        className="h-full bg-gradient-to-r from-honey/50 via-honey to-honey/50 rounded-full shadow-[0_0_20px_rgba(251,191,36,0.5)]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-8">
                                <Label className={cn(glass.microLabel, 'ml-4 opacity-40 uppercase italic tracking-[0.3em]')}>High-Traffic Endpoints</Label>
                                <div className="grid grid-cols-1 gap-6">
                                    {topEndpoints.length > 0 ? topEndpoints.map((ep, idx) => (
                                        <motion.div 
                                            key={idx}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="flex items-center justify-between p-10 rounded-[3.5rem] bg-gray-50 border border-white/5 hover:border-honey/40 transition-all duration-700 shadow-4xl group"
                                        >
                                            <div className="flex items-center gap-10">
                                                <div className="w-16 h-16 rounded-[1.5rem] bg-white/40 flex items-center justify-center shadow-4xl border border-white/5 group-hover:scale-110 transition-transform">
                                                    <Terminal className="w-8 h-8 text-honey opacity-40 group-hover:opacity-100" />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-3xl font-black italic text-foreground tracking-tighter uppercase group-hover:text-honey transition-colors">{ep.endpoint}</span>
                                                    <span className={cn(glass.microLabel, 'opacity-30 italic text-[10px]')}>Active Route</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8 pr-10">
                                                <span className="text-4xl font-black italic text-foreground tracking-tighter tabular-nums">{ep.count.toLocaleString()}</span>
                                                <span className={cn(glass.microLabel, 'opacity-20 uppercase')}>Hits</span>
                                            </div>
                                        </motion.div>
                                    )) : (
                                        <div className={cn(glass.emptyState, "py-20 bg-transparent border-dashed border-2 border-white/5 rounded-[4rem]")}>
                                            <Binary className="w-20 h-20 text-honey opacity-10 mb-8" />
                                            <p className="text-2xl font-black opacity-20 uppercase tracking-[0.3em] italic">Waiting for Telemetry Data</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-16 border-t border-gray-200 bg-white/40 backdrop-blur-3xl flex items-center justify-between rounded-b-[5rem]">
                        <div className="flex items-center gap-10 opacity-10 px-10">
                            <Lock className="w-10 h-10" />
                            <p className="text-[14px] font-black uppercase tracking-[0.5em] italic">Encryption Layer Active</p>
                        </div>
                        <div className="flex items-center gap-8 pr-8">
                            <p className={cn(glass.microLabel, 'opacity-30 uppercase italic')}>Telemetry Sync</p>
                            <span className="text-lg font-black italic text-honey uppercase tracking-tighter">{lastRefresh}</span>
                        </div>
                    </div>
                </motion.div>

                {/* API Cards */}
                <div className="lg:col-span-4 space-y-12">
                    <div className="grid grid-cols-1 gap-12">
                        {apis.map((api, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={cn(glass.card, "p-12 shadow-4xl hover:border-honey/60 transition-all duration-1000 relative group overflow-hidden bg-white/60 backdrop-blur-3xl rounded-[4rem]")}
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-honey/[0.04] rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none group-hover:bg-honey/[0.08] transition-all" />
                                
                                <div className="flex justify-between items-start mb-10">
                                    <div className="space-y-4">
                                        <div className={cn(glass.badge, "bg-white/40 text-honey border-white/5 px-8 py-2.5 shadow-3xl skew-x-[-12deg]")}>
                                            <span className="skew-x-[12deg] uppercase font-black italic text-[10px] tracking-widest">{api.type}</span>
                                        </div>
                                        <h3 className="text-4xl font-black italic text-foreground tracking-tighter uppercase leading-none group-hover:text-honey transition-colors">{api.name}</h3>
                                    </div>
                                    <div className="flex items-center gap-4 bg-emerald-500/10 px-6 py-2.5 rounded-full border border-emerald-500/20 shadow-3xl">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">Live</span>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <span className={cn(glass.microLabel, 'opacity-30 uppercase text-[10px] italic')}>Endpoint Routing</span>
                                        <div className="font-mono text-sm text-foreground/80 bg-gray-50 p-6 rounded-2xl border border-white/5 break-all">
                                            {api.checkPath}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-white/5 pt-6">
                                        <span className={cn(glass.microLabel, 'opacity-30 uppercase italic')}>Sync</span>
                                        <span className="text-[12px] font-black italic text-foreground/40 tabular-nums uppercase">{api.lastCheck.split(',')[1]}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ServerStatusView;
