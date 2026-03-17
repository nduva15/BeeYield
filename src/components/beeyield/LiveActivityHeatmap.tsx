import React from 'react';
import { Activity, Layers } from 'lucide-react';
import beeyieldService, { SensorReading } from '@/services/beeyieldService';
import { cn } from '@/lib/utils';

interface LiveActivityHeatmapProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

const LiveActivityHeatmap: React.FC<LiveActivityHeatmapProps> = ({ onTabChange }) => {
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [matrix, setMatrix] = React.useState<number[][]>(() => Array.from({ length: 7 }, () => Array(24).fill(0)));
    const [maxVal, setMaxVal] = React.useState(1);

    React.useEffect(() => {
        let mounted = true;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const rows: SensorReading[] = await beeyieldService.getSensorReadings(undefined, 24 * 7);
                if (!mounted) return;

                const buckets = Array.from({ length: 7 }, () => Array(24).fill(0));
                const counts = Array.from({ length: 7 }, () => Array(24).fill(0));

                (rows || []).forEach((r: any) => {
                    const tsRaw = r?.recorded_at || r?.timestamp || r?.created_at;
                    const d = tsRaw ? new Date(tsRaw) : null;
                    if (!d || Number.isNaN(d.getTime())) return;
                    const dow = (d.getDay() + 6) % 7; // make Monday=0
                    const hour = d.getHours();
                    const v =
                        typeof r?.vpm === 'number'
                            ? r.vpm
                            : typeof r?.visits_per_minute === 'number'
                                ? r.visits_per_minute
                                : typeof r?.activity_vpm === 'number'
                                    ? r.activity_vpm
                                    : null;
                    if (typeof v !== 'number' || !Number.isFinite(v)) return;
                    buckets[dow][hour] += v;
                    counts[dow][hour] += 1;
                });

                let m = 1;
                for (let d = 0; d < 7; d++) {
                    for (let h = 0; h < 24; h++) {
                        if (counts[d][h] > 0) buckets[d][h] = buckets[d][h] / counts[d][h];
                        m = Math.max(m, buckets[d][h]);
                    }
                }

                setMatrix(buckets);
                setMaxVal(m);
            } catch (e: any) {
                if (!mounted) return;
                setError(e?.message || 'Failed to load activity telemetry.');
                setMatrix(Array.from({ length: 7 }, () => Array(24).fill(0)));
                setMaxVal(1);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
        <div className="p-8 space-y-8 bg-[#FFF9F0] min-h-screen text-[#064e3b] antialiased">
            <div className="flex items-center gap-4 border-b-4 border-[#064e3b] pb-6">
                <div className="w-10 h-10 bg-[#064e3b] border-4 border-[#064e3b] flex items-center justify-center shadow-[4px_4px_0px_0px_#facc15]">
                    <Layers className="w-6 h-6 text-[#facc15]" />
                </div>
                <div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase leading-[0.9]">
                        PIP <span className="text-[#10b981]">Heatmap</span>
                    </h1>
                    <p className="text-[#10b981] font-black uppercase text-[10px] tracking-[0.4em]">
                        Live activity (VPM) from the last 7 days.
                    </p>
                </div>
            </div>

            <div className="border-4 border-[#064e3b] bg-white p-8 shadow-[10px_10px_0px_0px_#10b981] space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Activity className="w-5 h-5 text-[#10b981]" />
                        <h2 className="text-xl font-black uppercase tracking-tight">Live activity heatmap</h2>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#064e3b]/60">
                        {loading ? 'LOADING' : error ? 'ERROR' : 'READY'}
                    </div>
                </div>

                {error && (
                    <div className="border-2 border-red-200 bg-red-50 p-4 text-red-700 font-bold text-sm">
                        {error}
                    </div>
                )}

                {!loading && !error && maxVal <= 1 && (
                    <div className="border-2 border-[#064e3b]/20 bg-[#064e3b]/5 p-4 text-[#064e3b] font-bold text-sm">
                        No recent activity telemetry found. Connect a device that reports VPM/activity and try again.
                    </div>
                )}

                <div className="overflow-x-auto">
                    <div className="min-w-[980px]">
                        <div className="grid" style={{ gridTemplateColumns: `80px repeat(24, 1fr)` }}>
                            <div />
                            {hours.map((h) => (
                                <div key={h} className="text-center text-[9px] font-black text-[#064e3b]/50 uppercase py-2">
                                    {String(h).padStart(2, '0')}
                                </div>
                            ))}
                            {days.map((d, di) => (
                                <React.Fragment key={d}>
                                    <div className="flex items-center justify-start text-[10px] font-black text-[#064e3b] uppercase tracking-widest pr-2">
                                        {d}
                                    </div>
                                    {hours.map((h) => {
                                        const v = matrix?.[di]?.[h] ?? 0;
                                        const intensity = Math.max(0, Math.min(1, v / Math.max(1, maxVal)));
                                        return (
                                            <div
                                                key={`${di}-${h}`}
                                                title={`${d} ${String(h).padStart(2, '0')}:00 — ${v.toFixed(1)} vpm`}
                                                className={cn("h-8 border border-[#064e3b]/10")}
                                                style={{
                                                    backgroundColor: `rgba(16, 185, 129, ${0.05 + intensity * 0.65})`,
                                                    boxShadow: intensity > 0.85 ? 'inset 0 0 0 2px rgba(250,204,21,0.7)' : undefined,
                                                }}
                                            />
                                        );
                                    })}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>

                <p className="text-[11px] font-bold text-[#064e3b]/70 leading-relaxed max-w-3xl">
                    Each cell shows average activity (VPM) by day-of-week and hour. Darker cells indicate higher activity.
                </p>
            </div>
        </div>
    );
};

export default LiveActivityHeatmap;
