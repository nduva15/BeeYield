import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Bell, Clock, Activity, Loader2, AlertTriangle, CheckCircle2, ShieldAlert
} from 'lucide-react';
import beeyieldService, { SensorAlert, Hive, Apiary } from '@/services/beeyieldService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const SensorAlertsView: React.FC = () => {
    const [alerts, setAlerts] = React.useState<SensorAlert[]>([]);
    const [hives, setHives] = React.useState<Hive[]>([]);
    const [apiaries, setApiaries] = React.useState<Apiary[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [filter, setFilter] = React.useState<'active' | 'resolved' | 'all'>('active');

    const loadData = async () => {
        setLoading(true);
        try {
            const resolvedFilter = filter === 'all' ? undefined : (filter === 'resolved');
            const [alertData, hiveData, apiaryData] = await Promise.all([
                beeyieldService.getSensorAlerts(resolvedFilter),
                beeyieldService.getHives(),
                beeyieldService.getApiaries()
            ]);
            setAlerts(alertData);
            setHives(hiveData);
            setApiaries(apiaryData);
        } catch (error) {
            console.error('Failed to load sensor alerts', error);
            toast.error('Failed to load alert feed');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        loadData();
        // Set up interval for "real-time" updates every 30 seconds
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, [filter]);

    const getHiveName = (hiveId: string) => {
        const hive = hives.find(h => h.id === hiveId);
        return hive ? hive.hive_code : 'Unknown Hive';
    };

    const getApiaryName = (apiaryId: string) => {
        const apiary = apiaries.find(a => a.id === apiaryId);
        return apiary ? apiary.name : 'Unknown Apiary';
    };

    const handleResolve = async (alertId: string) => {
        const { success } = await beeyieldService.resolveSensorAlert(alertId, 'Resolved via Tactical Dashboard');
        if (success) {
            setAlerts(prev => prev.filter(a => a.id !== alertId));
            loadData();
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[#10b981] bg-[#064e3b] mb-4">
                        <ShieldAlert className="w-3.5 h-3.5 text-[#facc15]" />
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Priority Sensor Protocol</span>
                    </div>
                    <h1 className="text-5xl font-black text-[#064e3b] tracking-tighter uppercase leading-none">
                        Live <span className="text-[#10b981]">Alerts</span>
                    </h1>
                </div>

                <div className="flex bg-white border-4 border-[#064e3b] p-1 shadow-[4px_4px_0px_0px_rgba(6,78,59,1)]">
                    {(['active', 'resolved', 'all'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-none",
                                filter === f ? "bg-[#064e3b] text-white" : "text-[#064e3b] hover:bg-[#facc15]/10"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Alerts Log */}
            <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[12px_12px_0px_0px_rgba(6,78,59,1)] overflow-hidden">
                <CardHeader className="p-8 pb-4 border-b-4 border-[#064e3b]/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-none bg-[#064e3b] flex items-center justify-center border-2 border-[#10b981]">
                            <Bell className="w-5 h-5 text-[#facc15]" />
                        </div>
                        <CardTitle className="text-xl font-black text-[#064e3b] uppercase tracking-tighter">Active Incident Log</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {loading && alerts.length === 0 ? (
                            <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>
                        ) : alerts.length === 0 ? (
                            <div className="p-12 text-center text-gray-400 font-black uppercase tracking-widest text-xs py-20">
                                No {filter !== 'all' ? filter : ''} alerts detected in the field.
                            </div>
                        ) : (
                            alerts.map((alert) => (
                                <div key={alert.id} className="p-8 flex flex-col md:flex-row md:items-center justify-between hover:bg-[#facc15]/5 transition-none cursor-default group border-b-2 border-neutral-50 last:border-0">
                                    <div className="space-y-2 mb-6 md:mb-0">
                                        <div className="flex items-center gap-3">
                                            {alert.resolved ? (
                                                <div className="w-6 h-6 rounded-none bg-[#10b981] flex items-center justify-center border-2 border-[#064e3b] shadow-[2px_2px_0px_0px_rgba(6,78,59,1)]">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                                </div>
                                            ) : (
                                                <div className={cn(
                                                    "w-6 h-6 rounded-none flex items-center justify-center border-2 border-[#064e3b] shadow-[2px_2px_0px_0px_rgba(6,78,59,1)]",
                                                    alert.severity === 'critical' ? "bg-red-500" : "bg-amber-500"
                                                )}>
                                                    <AlertTriangle className="w-3.5 h-3.5 text-white" />
                                                </div>
                                            )}
                                            <h4 className="font-black text-[#064e3b] uppercase tracking-tighter text-lg">{alert.alert_type} Breach</h4>
                                        </div>
                                        <p className="text-xs font-black text-[#064e3b]/60 uppercase tracking-tight">{alert.message}</p>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                            <span className="text-[9px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em]">{getHiveName(alert.hive_id)} @ {getApiaryName(alert.apiary_id)}</span>
                                            <span className="text-[9px] font-black text-[#10b981] uppercase tracking-[0.2em]">TIMESTAMP: {new Date(alert.created_at).toLocaleString()}</span>
                                            {alert.reading_value !== undefined && (
                                                <span className="text-[9px] font-black text-[#064e3b] uppercase tracking-[0.2em]">Value: {alert.reading_value} (Target: {alert.threshold_value})</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex gap-4">
                                            <Badge className={cn("rounded-none border-2 px-3 py-1 font-black text-[9px] uppercase tracking-[0.2em] shadow-[3px_3px_0px_0px_rgba(6,78,59,1)]",
                                                alert.severity === 'critical' ? "bg-red-500 text-white border-[#064e3b]" :
                                                    alert.severity === 'warning' ? "bg-[#facc15] text-[#064e3b] border-[#064e3b]" : "bg-[#064e3b] text-white border-[#10b981]"
                                            )}>
                                                {alert.severity}
                                            </Badge>
                                            <Badge className={cn("rounded-none border-2 px-3 py-1 font-black text-[9px] uppercase tracking-[0.2em] items-center gap-2",
                                                alert.resolved ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20' : 'bg-red-500 text-white border-[#064e3b] animate-pulse'
                                            )}>
                                                {alert.resolved ? 'RESOLVED' : 'ACTIVE_INCIDENT'}
                                            </Badge>
                                        </div>
                                        {!alert.resolved && (
                                            <Button
                                                onClick={() => handleResolve(alert.id)}
                                                variant="ghost"
                                                size="sm"
                                                className="hidden md:flex rounded-none border-4 border-[#064e3b] bg-white text-[#064e3b] hover:bg-[#10b981] hover:text-white font-black text-[10px] uppercase tracking-widest h-12 px-6 transition-none shadow-[4px_4px_0px_0px_rgba(6,78,59,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                                            >
                                                COMMAND RESOLVE
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                        <div className="p-6 bg-neutral-50/50 border-t-4 border-[#064e3b]/5 text-center">
                            <span
                                onClick={loadData}
                                className="text-[10px] font-black text-[#064e3b] hover:text-[#10b981] uppercase tracking-[0.3em] cursor-pointer transition-none border-b-2 border-transparent hover:border-[#10b981]"
                            >
                                {loading ? 'SYNCING DATASTREAM...' : 'FORCE CLOUD SYNC'}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Stats Card */}
                <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[8px_8px_0px_0px_rgba(6,78,59,1)] overflow-hidden">
                    <CardHeader className="p-8 pb-4 border-b-4 border-[#064e3b]/10 bg-neutral-50/30">
                        <CardTitle className="text-xl font-black text-[#064e3b] uppercase tracking-tighter">Incident Metrics</CardTitle>
                        <CardDescription className="text-[10px] font-black text-[#064e3b]/30 uppercase tracking-widest mt-1">Telemetry stratification by urgency</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="space-y-6">
                            {(['critical', 'warning', 'info'] as const).map(s => {
                                const count = alerts.filter(e => e.severity === s).length;
                                const total = alerts.length || 1;
                                const pct = (count / total) * 100;
                                return (
                                    <div key={s} className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-black text-[#064e3b] uppercase tracking-widest">Urgency: {s}</span>
                                            <span className="text-2xl font-black text-[#064e3b] tracking-tighter">{count}</span>
                                        </div>
                                        <div className="h-4 w-full bg-neutral-100 rounded-none border-2 border-[#064e3b]/10 p-0.5">
                                            <div
                                                className={cn("h-full transition-all duration-1000",
                                                    s === 'critical' ? "bg-red-500" : s === 'warning' ? "bg-[#facc15]" : "bg-[#10b981]"
                                                )}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="rounded-none border-4 border-[#064e3b] bg-[#064e3b] shadow-[8px_8px_0px_0px_rgba(250,204,21,1)] overflow-hidden">
                    <CardHeader className="p-8">
                        <CardTitle className="text-xl font-black text-white uppercase tracking-tighter italic">Hive Integrity Status</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 space-y-8">
                        <div className="p-6 rounded-none bg-white border-4 border-[#10b981] flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(16,185,129,0.2)]">
                            <div>
                                <h4 className="text-xs font-black text-[#064e3b] uppercase tracking-widest">Protocol Nominal</h4>
                                <p className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-tight mt-1">Resolution benchmarks exceeding targets.</p>
                            </div>
                            <CheckCircle2 className="w-8 h-8 text-[#10b981]" />
                        </div>
                        <Button
                            onClick={loadData}
                            className="w-full h-14 rounded-none bg-[#facc15] text-[#064e3b] hover:bg-white border-4 border-[#064e3b] font-black text-xs uppercase tracking-[0.2em] transition-none shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] active:shadow-none active:translate-x-1 active:translate-y-1"
                        >
                            RE-SCAN TELEMETRY
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SensorAlertsView;
