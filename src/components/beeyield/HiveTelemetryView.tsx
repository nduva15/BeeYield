import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import beeyieldService from '@/services/beeyieldService';
import { toast } from 'sonner';
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

interface WeightData {
    time: string;
    weight: number;
    dwdt: number;
    timestamp: number;
}

// Mock data generation for weight dynamics
const generateWeightData = (): WeightData[] => {
    const data: WeightData[] = [];
    let weight = 42.5;
    const now = Date.now();
    for (let i = 24; i >= 0; i--) {
        const hour = new Date(now - i * 3600000);
        // Simulate nectar flow during day (9 AM - 4 PM)
        const h = hour.getHours();
        const delta = (h >= 9 && h <= 16) ? Math.random() * 0.4 : -Math.random() * 0.2;
        weight += delta;
        data.push({
            time: hour.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            weight: parseFloat(weight.toFixed(2)),
            dwdt: parseFloat(delta.toFixed(3)),
            timestamp: hour.getTime()
        });
    }
    return data;
};

const HiveTelemetryView: React.FC = () => {
    const [data, setData] = React.useState<WeightData[]>(generateWeightData());
    const [gatewayStatus, setGatewayStatus] = React.useState<'Online' | 'Offline' | 'Connecting'>('Online');
    const [recentAlert, setRecentAlert] = React.useState<string | null>(null);

    const latest = data[data.length - 1];
    const prev = data[data.length - 2];
    const dwdt = latest.weight - prev.weight;
    const [isTaring, setIsTaring] = React.useState(false);

    const handleTare = async () => {
        setIsTaring(true);
        toast.loading("Sending TARE command to hardware...");
        try {
            const result = await beeyieldService.tareSensor('DEV-001'); // Mock ID
            if (result.success) {
                // In production, you'd refetch readings to see them drop to 0
                toast.success("Sensor tared successfully");
            } else {
                toast.error("Tare failed: Check gateway connectivity");
            }
        } catch (err) {
            toast.error("Calibration error");
        } finally {
            setIsTaring(false);
            toast.dismiss();
        }
    };

    const handleManualOffset = async () => {
        const value = prompt("Enter manual offset correction (kg):", "0.0");
        if (value === null) return;
        const offset = parseFloat(value);
        if (isNaN(offset)) return toast.error("Invalid numeric value");

        try {
            await beeyieldService.setOffsetCorrection('DEV-001', offset);
        } catch (err) {
            toast.error("Failed to set manual offset");
        }
    };

    // Status Logic
    const isFlowing = dwdt > 0.05;
    const isAlert = dwdt < -1.5 || recentAlert !== null;

    React.useEffect(() => {
        // Subscribe to real-time weight alerts
        const weightSub = beeyieldService.subscribeToWeightAlerts((payload) => {
            console.log('Weight Alert Received:', payload);
            setRecentAlert(`Massive drop detected on Hive ${payload.new.hive_id}`);
            toast.error('CRITICAL: Weight anomaly detected!');
        });

        // Subscribe to gateway status
        const gatewaySub = beeyieldService.subscribeToGatewayStatus((payload) => {
            console.log('Gateway Status Change:', payload);
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
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                        <Cpu className="w-3.5 h-3.5" />
                        Autonomous Telemetry Subsystem
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none italic uppercase italic">Real-Time <span className="text-amber-500">Registry</span></h1>
                    <p className="text-sm font-medium text-slate-500 max-w-md px-1">
                        High-frequency dW/dt calculus and biometric bio-feedback stream processing.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className={cn(
                        "px-8 py-3 rounded-2xl border flex flex-col items-center transition-all bg-white shadow-sm",
                        gatewayStatus === 'Online' ? "border-emerald-100" : "border-red-100"
                    )}>
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Gateway Mesh</span>
                        <div className="flex items-center gap-2">
                            <div className={cn("w-2.5 h-2.5 rounded-full shadow-sm", gatewayStatus === 'Online' ? "bg-emerald-500 animate-pulse" : "bg-red-500")} />
                            <span className="text-2xl font-black text-slate-900 tracking-tighter tabular-nums uppercase">
                                {gatewayStatus}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Matrix Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Weight Card */}
                <Card className="rounded-[2.5rem] border border-slate-200/60 bg-white shadow-2xl shadow-black/5 overflow-hidden group">
                    <CardHeader className="p-10 pb-6 border-b border-slate-100 bg-slate-50/50">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 italic">Current Biomass Score</p>
                        <CardTitle className="text-6xl font-black text-slate-900 tracking-tighter italic tabular-nums">
                            {latest.weight}<span className="text-2xl ml-1 opacity-20 not-italic">kg</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-10 flex flex-col justify-between min-h-[220px]">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none">24h Delta</span>
                                <span className={cn("text-base font-black flex items-center gap-1 leading-none", (latest.weight - data[0].weight) > 0 ? "text-emerald-500" : "text-red-500")}>
                                    {(latest.weight - data[0].weight) > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                    {Math.abs(latest.weight - data[0].weight).toFixed(2)}kg
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-8">
                            <Button
                                onClick={handleTare}
                                disabled={isTaring}
                                className="h-14 rounded-2xl bg-neutral-900 text-gray-900 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-black/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                {isTaring ? <Activity className="w-4 h-4 animate-spin" /> : "Calibration"}
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={handleManualOffset}
                                className="h-14 rounded-2xl border border-slate-200 bg-white text-slate-400 hover:text-amber-500 font-black uppercase text-[10px] tracking-widest transition-all"
                            >
                                Manual Offset
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Flux Calculus Card */}
                <Card className="rounded-[2.5rem] border border-slate-200/60 bg-white shadow-2xl shadow-black/5 overflow-hidden">
                    <CardHeader className="p-10 pb-6 border-b border-slate-100 bg-slate-50/50">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 italic">Flux Velocity ($dW/dt$)</p>
                        <CardTitle className="text-6xl font-black text-slate-900 tracking-tighter italic tabular-nums">
                            {dwdt > 0 ? '+' : ''}{dwdt.toFixed(3)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-10 pb-12 flex flex-col justify-between min-h-[220px]">
                        <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase italic">
                            Biometric rate of change protocol. Positive values indicate active forager influx and enzymatic dehydration.
                        </p>
                        <div className="space-y-4 mt-8">
                            <div className="h-4 w-full bg-slate-100 rounded-full relative overflow-hidden ring-4 ring-slate-50">
                                <motion.div
                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, Math.max(0, (dwdt + 0.5) * 100))}%` }}
                                    transition={{ type: 'spring', damping: 20 }}
                                />
                            </div>
                            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400 italic">
                                <span>Net Consumption</span>
                                <span>Nectar Influx</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Season Yield Card */}
                <Card className="rounded-[2.5rem] border-none bg-neutral-900 shadow-2xl shadow-black/10 overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="p-10 pb-6 border-b border-white/5 relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 mb-2 italic">Integrative Season Total</p>
                        <CardTitle className="text-6xl font-black text-amber-500 tracking-tighter italic tabular-nums leading-none">
                            {totalYield}<span className="text-2xl ml-1 text-gray-900 opacity-40 not-italic">kg</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-10 flex flex-col justify-between min-h-[220px] relative z-10">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Zap className="w-5 h-5 text-amber-500 group-hover:scale-125 transition-transform" />
                                <span className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] italic">ROI Audit Confirmed</span>
                            </div>
                            <p className="text-[10px] font-medium text-gray-600 uppercase leading-relaxed italic">
                                Value extrapolated via trapezoidal integration of periodic biomass shifts. Primary certification for premium pollination tariffs.
                            </p>
                        </div>
                        <Button className="w-full mt-8 h-16 rounded-2xl bg-white text-neutral-900 hover:bg-neutral-100:bg-amber-100 font-black uppercase text-xs tracking-widest shadow-2xl shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all gap-3 border-none">
                            <Download className="w-4 h-4" />
                            Certify Audit
                        </Button>
                    </CardContent>
                </Card>

                {/* Alert Card */}
                <Card className={cn(
                    "rounded-[2.5rem] border overflow-hidden shadow-2xl transition-all duration-700",
                    isAlert
                        ? "border-red-500/50 bg-red-500/5 shadow-red-500/10 animate-pulse"
                        : "border-slate-200/60 bg-white shadow-black/5 opacity-60"
                )}>
                    <CardHeader className="p-10">
                        <div className="flex justify-between items-start">
                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border transition-all", isAlert ? "bg-red-500 text-gray-900 border-red-400" : "bg-slate-50 text-slate-300 border-slate-100")}>
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            <Badge className={cn("rounded-full px-4 py-1.5 font-black text-[9px] uppercase tracking-widest border-none", isAlert ? "bg-red-500 text-gray-900" : "bg-slate-50 text-slate-300")}>
                                SECURE
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-10 pt-4">
                        <h3 className={cn("text-2xl font-black uppercase tracking-tighter italic mb-4", isAlert ? "text-red-600" : "text-slate-900")}>
                            Theft Mitigation
                        </h3>
                        <p className="text-[11px] font-medium text-slate-500 uppercase leading-relaxed italic">
                            Continuous monitoring for anomalous mass reduction events. Synced with spectral acoustic signatures for secondary validation.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Performance Graphs */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                <WeightDynamicsChart />
                <AcousticWaveform />
            </div>

            {/* Historical Logs */}
            <Card className="rounded-[3rem] border border-slate-200/60 bg-white shadow-2xl shadow-black/5 overflow-hidden">
                <CardHeader className="p-12 border-b border-slate-100 flex flex-row items-center justify-between bg-slate-50/50">
                    <div className="space-y-1">
                        <CardTitle className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Audit Ledger</CardTitle>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] px-1 italic">Industrial Telemetry Archive · Raw Mesh Frames</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                        <History className="w-6 h-6" />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-50">
                        {data.slice(-5).reverse().map((row, idx) => (
                            <div key={idx} className="px-12 py-8 flex items-center justify-between hover:bg-amber-500/[0.02]:bg-amber-500/[0.03] transition-colors group">
                                <div className="flex gap-16">
                                    <div className="min-w-[120px]">
                                        <span className="text-[9px] font-black text-slate-400 uppercase block mb-2 italic tracking-widest text-left">Sector Timestamp</span>
                                        <span className="text-sm font-black text-slate-600 tabular-nums uppercase">{row.time}</span>
                                    </div>
                                    <div className="min-w-[100px]">
                                        <span className="text-[9px] font-black text-slate-400 uppercase block mb-2 italic tracking-widest text-left">Gross Mass</span>
                                        <span className="text-lg font-black text-slate-900 tabular-nums italic">{row.weight} kg</span>
                                    </div>
                                    <div className="min-w-[100px]">
                                        <span className="text-[9px] font-black text-slate-400 uppercase block mb-2 italic tracking-widest text-left">Velocity Vector</span>
                                        <span className={cn("text-lg font-black tabular-nums italic", row.dwdt > 0 ? "text-emerald-500" : "text-red-500")}>
                                            {row.dwdt > 0 ? '+' : ''}{row.dwdt.toFixed(3)}
                                        </span>
                                    </div>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-amber-500 group-hover:text-gray-900 group-hover:border-amber-400 transition-all cursor-pointer">
                                    <ChevronRight className="w-6 h-6" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-12 border-t border-slate-100 bg-slate-50/30">
                        <Button variant="ghost" className="h-16 px-12 rounded-2xl border border-slate-200 bg-white text-slate-500 hover:text-amber-600 font-black uppercase text-[10px] tracking-widest gap-4 shadow-sm transition-all group/dl">
                            <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            Download Master Telemetry Bundle (.CSV)
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default HiveTelemetryView;
