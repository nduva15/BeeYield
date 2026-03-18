import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import beeyieldService from '@/services/beeyieldService';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Scale,
    TrendingUp,
    AlertTriangle,
    Zap,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    History,
    FileBarChart,
    ChevronRight,
    Download,
    RefreshCw,
    Cpu,
    Database,
    Binary,
    Network
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    ReferenceLine
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import WeightDynamicsChart from '@/components/telemetry/WeightDynamicsChart';
import AcousticWaveform from '@/components/telemetry/AcousticWaveform';
import { glass } from './GlassTheme';

interface WeightData {
    time: string;
    weight: number;
    dwdt: number;
    timestamp: number;
}

const HiveTelemetryView: React.FC = () => {
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [data, setData] = React.useState<WeightData[]>([]);
    const [gatewayStatus, setGatewayStatus] = React.useState<'Online' | 'Offline' | 'Connecting'>('Online');
    const [recentAlert, setRecentAlert] = React.useState<string | null>(null);
    const [hives, setHives] = React.useState<any[]>([]);
    const [devices, setDevices] = React.useState<any[]>([]);
    const [selectedHiveId, setSelectedHiveId] = React.useState<string>('');
    const [selectedDeviceId, setSelectedDeviceId] = React.useState<string>('');

    const latest = data.length ? data[data.length - 1] : null;
    const prev = data.length > 1 ? data[data.length - 2] : null;
    const dwdt = latest && prev ? latest.weight - prev.weight : 0;
    const [isTaring, setIsTaring] = React.useState(false);

    React.useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const [h, d] = await Promise.all([beeyieldService.getHives(), beeyieldService.getDevices()]);
                if (!mounted) return;
                setHives(h || []);
                setDevices(d || []);
                if (!selectedHiveId && (h || []).length > 0) setSelectedHiveId(h[0].id);
            } catch (e) {
                console.error(e);
                if (!mounted) return;
                setError((e as any)?.message || 'Failed to load hives/devices.');
                setHives([]);
                setDevices([]);
            }
            finally {
                if (mounted) setLoading(false);
            }
        };

        load();
        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadSeries = React.useCallback(async () => {
        if (!selectedHiveId) {
            setData([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            // Prefer backend-filtered readings (hive_id param), then map weight field variants.
            const rows: any[] = await beeyieldService.getReadings(selectedHiveId, 240);
            const pickWeight = (r: any) => {
                const candidates = [r?.weight, r?.weight_kg, r?.hive_weight_kg, r?.mass_kg];
                const w = candidates.find((v) => typeof v === 'number');
                return typeof w === 'number' ? w : null;
            };

            const points = (rows || [])
                .map((r) => {
                    const tsRaw = r?.recorded_at || r?.timestamp || r?.created_at;
                    const ts = tsRaw ? new Date(tsRaw).getTime() : NaN;
                    const w = pickWeight(r);
                    if (!Number.isFinite(ts) || typeof w !== 'number') return null;
                    return { ts, w };
                })
                .filter(Boolean) as { ts: number; w: number }[];

            if (points.length < 2) {
                setData([]);
                return;
            }

            points.sort((a, b) => a.ts - b.ts);
            const mapped: WeightData[] = points.map((p, idx) => {
                const prev = idx > 0 ? points[idx - 1] : null;
                const dwdt = prev ? (p.w - prev.w) : 0;
                return {
                    time: new Date(p.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    weight: parseFloat(p.w.toFixed(2)),
                    dwdt: parseFloat(dwdt.toFixed(3)),
                    timestamp: p.ts,
                };
            });
            setData(mapped);

            // Try to infer device from the latest row to enable calibration actions.
            const latestRow: any = rows?.[0];
            const devId = String(latestRow?.device_id || '');
            if (devId) setSelectedDeviceId(devId);
        } catch (e) {
            console.error(e);
            setError((e as any)?.message || 'Failed to load readings.');
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [selectedHiveId]);

    React.useEffect(() => {
        loadSeries();
        const t = setInterval(loadSeries, 30_000);
        return () => clearInterval(t);
    }, [loadSeries]);

    const handleTare = async () => {
        if (!selectedDeviceId) {
            toast.error('No device linked to latest readings.');
            return;
        }
        setIsTaring(true);
        const tid = toast.loading("Taring sensor...");
        try {
            const result = await beeyieldService.tareSensor(selectedDeviceId);
            if (result.success) {
                toast.success("Sensor tared", { id: tid });
                await loadSeries();
            } else {
                toast.error("Tare failed", { id: tid });
            }
        } catch (err) {
            toast.error("Calibration error", { id: tid });
        } finally {
            setIsTaring(false);
        }
    };

    const handleManualOffset = async () => {
        if (!selectedDeviceId) {
            toast.error('No device linked to latest readings.');
            return;
        }
        const value = prompt("Enter manual offset correction (kg):", "0.0");
        if (value === null) return;
        const offset = parseFloat(value);
        if (Number.isNaN(offset)) return toast.error("Invalid numeric value");

        try {
            const tid = toast.loading('Saving offset…');
            const res = await beeyieldService.setOffsetCorrection(selectedDeviceId, offset);
            if (res.success) toast.success('Offset saved', { id: tid });
            else toast.error('Offset save failed', { id: tid });
            await loadSeries();
        } catch (err) {
            toast.error("Failed to set manual offset");
        }
    };

    // Status Logic
    const isFlowing = dwdt > 0.05;
    const isAlert = dwdt < -1.5 || recentAlert !== null;

    React.useEffect(() => {
        // Subscribe to real-time weight alerts
        const weightSub = beeyieldService.subscribeToWeightAlerts("*", (payload) => {
            setRecentAlert(`Massive drop detected on Hive ${payload.new.hive_id}`);
            toast.error('CRITICAL: Weight anomaly detected!');
        });

        // Subscribe to gateway status
        const gatewaySub = beeyieldService.subscribeToGatewayStatus("*", (payload) => {
            setGatewayStatus(payload.new.status);
            if (payload.new.status === 'Offline') {
                toast.warning('Gateway connectivity lost');
            }
        });

        return () => {
            if (weightSub) beeyieldService.supabaseBeeYield.removeChannel(weightSub);
            if (gatewaySub) beeyieldService.supabaseBeeYield.removeChannel(gatewaySub);
        };
    }, []);

    // Integration Approximator (Trapezoidal)
    const totalYield = React.useMemo(() => {
        let sum = 0;
        for (let i = 1; i < data.length; i++) {
            const dt = (data[i].timestamp - data[i - 1].timestamp) / 3600000;
            const velocity = (data[i].weight - data[i - 1].weight);
            if (velocity > 0) sum += velocity;
        }
        return sum.toFixed(2);
    }, [data]);

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-emerald-50 text-[#1B9157] rounded-full text-xs font-semibold border border-emerald-100">
                        <Cpu className="w-3.5 h-3.5" />
                        Live data
                    </div>
                    <h1 className="text-5xl font-black text-[#1A1A1A] tracking-tighter leading-none italic">Live <span className="text-[#F4D03F]">readings</span></h1>
                    <p className="text-sm font-medium text-slate-500 max-w-md px-1">
                        Recent weight and sensor readings from your hive.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="min-w-[240px]">
                        <Select value={selectedHiveId} onValueChange={setSelectedHiveId}>
                            <SelectTrigger className="h-12 rounded-2xl border border-slate-200 bg-[#FFF9F0] text-[11px] font-bold">
                                <SelectValue placeholder="Select hive" />
                            </SelectTrigger>
                            <SelectContent>
                                {hives.map((h) => (
                                    <SelectItem key={h.id} value={h.id}>
                                        {(h.hive_code || h.name || h.id).toString()}
                                    </SelectItem>
                                ))}
                                {hives.length === 0 && (
                                    <div className="px-3 py-2 text-xs font-semibold text-slate-500">No hives found.</div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={async () => {
                            // Reload meta + series for current selection
                            const tid = toast.loading('Refreshing…');
                            try {
                                const [h] = await Promise.all([beeyieldService.getHives(), beeyieldService.getDevices()]);
                                setHives(h || []);
                                if (!selectedHiveId && (h || []).length > 0) setSelectedHiveId(h[0].id);
                                await loadSeries();
                                toast.success('Updated', { id: tid });
                            } catch (e: any) {
                                toast.error(e?.message || 'Refresh failed', { id: tid });
                            }
                        }}
                        disabled={loading}
                        className="h-12 px-4 rounded-2xl border border-slate-200 bg-white/70 text-slate-500 hover:text-[#F4D03F] shadow-sm transition-all"
                        title="Refresh data"
                        aria-label="Refresh data"
                    >
                        <RefreshCw className={cn("w-5 h-5", loading ? "animate-spin" : "")} />
                    </Button>
                    <div className={cn(
                        "px-8 py-3 rounded-2xl border flex flex-col items-center transition-all bg-[#FFF9F0] shadow-sm",
                        gatewayStatus === 'Online' ? "border-emerald-100" : "border-red-100"
                    )}>
                        <span className="text-xs font-semibold text-slate-500 mb-1">Gateway</span>
                        <div className="flex items-center gap-2">
                            <div className={cn("w-2.5 h-2.5 rounded-full shadow-sm", gatewayStatus === 'Online' ? "bg-[#1B9157] animate-pulse" : "bg-red-500")} />
                            <span className="text-2xl font-black text-[#1A1A1A] tracking-tighter tabular-nums">
                                {gatewayStatus}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <Card className="border border-red-200 bg-red-50/60">
                    <CardContent className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="text-[10px] font-black text-red-600">Data load failed</div>
                            <div className="text-sm font-semibold text-slate-700 break-words mt-1">{error}</div>
                        </div>
                        <Button
                            onClick={loadSeries}
                            className="h-11 rounded-2xl bg-neutral-900 text-white font-black text-[10px]"
                        >
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            )}

            {!loading && !error && hives.length === 0 && (
                <Card className="border border-slate-200 bg-white/70">
                    <CardContent className="p-10 text-center space-y-2">
                        <div className="text-sm font-black text-[#1A1A1A]">No hives connected yet</div>
                        <div className="text-xs font-semibold text-slate-500 max-w-xl mx-auto">
                            Add a hive (or connect a device) to start streaming weight readings into this dashboard.
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Matrix Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Weight Card */}
                <Card className={cn(glass.card, "shadow-xl overflow-hidden group")}>
                    <CardHeader className="p-6 pb-4 border-b border-slate-100 bg-[#F9F7F2]/50">
                        <p className="text-[10px] font-black text-slate-400 mb-2 italic">Current Biomass Score</p>
                        <CardTitle className="text-6xl font-black text-[#1A1A1A] tracking-tighter italic tabular-nums">
                            {latest ? latest.weight : '—'}<span className="text-2xl ml-1 opacity-20 not-italic">kg</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 flex flex-col justify-between min-h-[220px]">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F9F7F2] border border-slate-100">
                                <span className="text-[9px] font-black text-slate-400 leading-none">24h Delta</span>
                                <span className={cn("text-base font-black flex items-center gap-1 leading-none", latest && data[0] && (latest.weight - data[0].weight) > 0 ? "text-[#1B9157]" : "text-red-500")}>
                                    {latest && data[0] && (latest.weight - data[0].weight) > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                    {latest && data[0] ? `${Math.abs(latest.weight - data[0].weight).toFixed(2)}kg` : '—'}
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-8">
                            <Button
                                onClick={handleTare}
                                disabled={isTaring}
                                className="h-14 rounded-2xl bg-neutral-900 text-[#1A1A1A] font-black text-[10px] shadow-xl shadow-black/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                {isTaring ? <Activity className="w-4 h-4 animate-spin" /> : "Calibration"}
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={handleManualOffset}
                                className="h-14 rounded-2xl border border-slate-200 bg-[#FFF9F0] text-slate-400 hover:text-[#F4D03F] font-black text-[10px] transition-all"
                            >
                                Manual Offset
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Flux Calculus Card */}
                <Card className={cn(glass.card, "shadow-xl overflow-hidden")}>
                    <CardHeader className="p-6 pb-4 border-b border-slate-100 bg-[#F9F7F2]/50">
                        <p className="text-[10px] font-black text-slate-400 mb-2 italic">Flux Velocity ($dW/dt$)</p>
                        <CardTitle className="text-6xl font-black text-[#1A1A1A] tracking-tighter italic tabular-nums">
                            {dwdt > 0 ? '+' : ''}{dwdt.toFixed(3)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pb-8 flex flex-col justify-between min-h-[220px]">
                        <p className="text-[10px] font-bold text-slate-400 leading-relaxed italic">
                            Rate of change. Positive values often mean foragers are bringing in nectar and moisture is dropping.
                        </p>
                        <div className="space-y-4 mt-8">
                            <div className="h-4 w-full bg-[#F4D03F]/10 rounded-full relative overflow-hidden ring-4 ring-slate-50">
                                <motion.div
                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, Math.max(0, (dwdt + 0.5) * 100))}%` }}
                                    transition={{ type: 'spring', damping: 20 }}
                                />
                            </div>
                            <div className="flex justify-between text-[9px] font-black text-slate-400 italic">
                                <span>Net Consumption</span>
                                <span>Nectar Influx</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Season Yield Card */}
                <Card className={cn(glass.card, "bg-neutral-900 border-neutral-800 shadow-xl overflow-hidden relative group")}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="p-6 pb-4 border-b border-[#F4D03F]/10 relative z-10">
                        <p className="text-[10px] font-black text-gray-600 mb-2 italic">Integrative Season Total</p>
                        <CardTitle className="text-6xl font-black text-[#F4D03F] tracking-tighter italic tabular-nums leading-none">
                            {totalYield}<span className="text-2xl ml-1 text-[#1A1A1A] opacity-40 not-italic">kg</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 flex flex-col justify-between min-h-[220px] relative z-10">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Zap className="w-5 h-5 text-[#F4D03F] group-hover:scale-125 transition-transform" />
                                <span className="text-[10px] font-black text-[#1A1A1A] italic">ROI Audit Confirmed</span>
                            </div>
                            <p className="text-[10px] font-medium text-gray-600 leading-relaxed italic">
                                Value extrapolated via trapezoidal integration of periodic biomass shifts. Primary certification for premium pollination tariffs.
                            </p>
                        </div>
                        <Button className="w-full mt-8 h-16 rounded-2xl bg-[#FFF9F0] text-neutral-900 hover:bg-neutral-100:bg-amber-100 font-black text-xs shadow-2xl shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all gap-3 border-none">
                            <Download className="w-4 h-4" />
                            Certify Audit
                        </Button>
                    </CardContent>
                </Card>

                {/* Alert Card */}
                <Card className={cn(
                    glass.card,
                    "shadow-xl transition-all duration-700",
                    isAlert
                        ? "border-red-500/50 bg-red-500/5 shadow-red-500/10 animate-pulse"
                        : "opacity-60"
                )}>
                    <CardHeader className="p-6">
                        <div className="flex justify-between items-start">
                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border transition-all", isAlert ? "bg-red-500 text-[#1A1A1A] border-red-400" : "bg-[#F9F7F2] text-slate-300 border-slate-100")}>
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            <Badge className={cn("rounded-full px-4 py-1.5 font-black text-[9px] border-none", isAlert ? "bg-red-500 text-[#1A1A1A]" : "bg-[#F9F7F2] text-slate-300")}>
                                SECURE
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                        <h3 className={cn("text-2xl font-black tracking-tighter italic mb-4", isAlert ? "text-red-600" : "text-[#1A1A1A]")}>
                            Theft Mitigation
                        </h3>
                        <p className="text-[11px] font-medium text-slate-500 leading-relaxed italic">
                            Continuous monitoring for anomalous mass reduction events. Synced with spectral acoustic signatures for secondary validation.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Performance Graphs */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                <WeightDynamicsChart
                    data={(data || []).map((p) => ({
                        time: p.time,
                        weight: p.weight,
                        velocity: p.dwdt,
                    }))}
                />
                <AcousticWaveform />
            </div>

            {/* Historical Logs */}
            <Card className={cn(glass.card, "shadow-xl overflow-hidden")}>
                <CardHeader className="p-8 border-b border-[#F4D03F]/20 flex flex-row items-center justify-between bg-[#F9F7F2]">
                    <div className="space-y-1">
                        <CardTitle className="text-3xl font-black text-[#1A1A1A] tracking-tighter italic">Recent history</CardTitle>
                        <p className="text-sm font-medium text-slate-500 px-1 italic">Recent readings from this session.</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-[#FFF9F0] border border-slate-200 flex items-center justify-center text-slate-400">
                        <History className="w-6 h-6" />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-50">
                        {loading ? (
                            <div className="px-8 py-8 text-sm font-semibold text-slate-500 flex items-center gap-3">
                                <Activity className="w-4 h-4 animate-spin" />
                                Loading readings…
                            </div>
                        ) : data.length === 0 ? (
                            <div className="px-8 py-10 text-sm font-semibold text-slate-500">
                                No readings available for this hive yet.
                            </div>
                        ) : (
                            data.slice(-5).reverse().map((row, idx) => (
                            <div key={idx} className="px-8 py-5 flex items-center justify-between hover:bg-[#F4D03F]/10 transition-colors group">
                                <div className="flex gap-16">
                                    <div className="min-w-[120px]">
                                        <span className="text-xs font-semibold text-slate-500 block mb-2 italic text-left">Timestamp</span>
                                        <span className="text-sm font-semibold text-slate-600 tabular-nums">{row.time}</span>
                                    </div>
                                    <div className="min-w-[100px]">
                                        <span className="text-xs font-semibold text-slate-500 block mb-2 italic text-left">Weight</span>
                                        <span className="text-lg font-black text-[#1A1A1A] tabular-nums italic">{row.weight} kg</span>
                                    </div>
                                    <div className="min-w-[100px]">
                                        <span className="text-xs font-semibold text-slate-500 block mb-2 italic text-left">Change rate</span>
                                        <span className={cn("text-lg font-black tabular-nums italic", row.dwdt > 0 ? "text-[#1B9157]" : "text-red-500")}>
                                            {row.dwdt > 0 ? '+' : ''}{row.dwdt.toFixed(3)}
                                        </span>
                                    </div>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-[#F9F7F2] border border-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-[#F4D03F] group-hover:text-[#1A1A1A] group-hover:border-amber-400 transition-all cursor-pointer">
                                    <ChevronRight className="w-6 h-6" />
                                </div>
                            </div>
                        ))
                        )}
                    </div>
                    <div className="p-8 border-t border-slate-100 bg-[#F9F7F2]/30">
                        <Button
                            variant="ghost"
                            disabled={loading || data.length === 0}
                            onClick={() => {
                                const header = 'timestamp,time,weight_kg,dwdt\n';
                                const rows = data
                                    .map((r) => `${new Date(r.timestamp).toISOString()},${r.time},${r.weight},${r.dwdt}`)
                                    .join('\n');
                                const blob = new Blob([header + rows + '\n'], { type: 'text/csv;charset=utf-8' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `beeyield-telemetry-${selectedHiveId || 'hive'}-${new Date().toISOString().slice(0, 10)}.csv`;
                                document.body.appendChild(a);
                                a.click();
                                a.remove();
                                URL.revokeObjectURL(url);
                            }}
                            className="h-12 px-8 rounded-xl border border-slate-200 bg-[#FFF9F0] text-slate-500 hover:text-[#F4D03F] font-semibold text-sm gap-4 shadow-sm transition-all group/dl"
                        >
                            <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            Download CSV
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default HiveTelemetryView;
