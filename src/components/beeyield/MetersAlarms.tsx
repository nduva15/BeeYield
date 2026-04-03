import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Bell, Clock, Activity, Loader2, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { meterService, MeterEvent, Meter, Building } from '@/services/meterService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { glass } from './GlassTheme';
import { BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';

const MetersAlarms: React.FC = () => {
    const [events, setEvents] = React.useState<MeterEvent[]>([]);
    const [meters, setMeters] = React.useState<Meter[]>([]);
    const [buildings, setBuildings] = React.useState<Building[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const loadAlarms = async () => {
            setLoading(true);
            try {
                const [eventData, meterData, buildingData] = await Promise.all([
                    meterService.getEvents(),
                    meterService.getMeters(),
                    meterService.getBuildings()
                ]);
                setEvents(eventData);
                setMeters(meterData);
                setBuildings(buildingData);
            } catch (error) {
                console.error('Failed to load alarms', error);
                toast.error('Failed to load alarm events');
            } finally {
                setLoading(false);
            }
        };
        loadAlarms();
    }, []);

    const getMeterInfo = (meterId: string) => {
        const meter = meters.find(m => m.id === meterId);
        if (!meter) return 'Unknown Sensor';
        const building = buildings.find(b => b.id === meter.building_id);
        return `${meter.meter_number} - ${building?.name || 'Unknown Apiary'}`;
    };

    const getSeverityStyles = (severity: string) => {
        switch (severity.toUpperCase()) {
            case 'Critical':
            case 'Alert':
                return 'text-red-600 border-red-200 bg-red-50';
            case 'Warning':
                return 'text-[#F4D03F] border-amber-200 bg-amber-50';
            default:
                return 'text-blue-600 border-blue-200 bg-blue-50';
        }
    };

    const getBadgeStyles = (severity: string) => {
        switch (severity.toUpperCase()) {
            case 'Critical':
            case 'Alert':
                return 'bg-red-100 text-red-700';
            case 'Warning':
                return 'bg-amber-100 text-[#F4D03F]';
            default:
                return 'bg-blue-100 text-blue-700';
        }
    };

    return (
        <BeeYieldPageShell className={cn(glass.page, "space-y-6")}>
        <div className="space-y-6 animate-in fade-in duration-500">
            <BeeYieldPageHeader
                icon={Bell}
                label="Alerts"
                title={<>System <span className="text-[#F4D03F]">Updates</span></>}
                subtitle="Active alerts and recent events."
            />

            {/* Top Notifications Section */}
            <div className={cn(glass.card, "p-0 overflow-hidden shadow-xl bg-white/40 border-white/20")}>
                <div className="p-5 border-b border-white/10 bg-white/20 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/50 flex items-center justify-center border border-white/40">
                        <Bell className="w-4 h-4 text-[#F4D03F]" />
                    </div>
                    <h3 className="text-[11px] font-black text-[#1A1A1A]">Active Incident Log</h3>
                </div>
                <div className="p-0">
                    <div className="divide-y divide-white/10">
                        {loading ? (
                            <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
                        ) : events.length === 0 ? (
                            <div className="p-12 text-center text-[10px] font-black text-gray-400">No Active Alarms Found</div>
                        ) : (
                            events.map((event) => (
                                <div key={event.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between hover:bg-white/50 transition-colors group">
                                    <div className="space-y-2 mb-4 md:mb-0">
                                        <div className="flex items-center gap-3">
                                            {event.is_resolved ? (
                                                <div className="w-6 h-6 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/20">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1B9157]" />
                                                </div>
                                            ) : (
                                                <div className="w-6 h-6 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                                    <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                                                </div>
                                            )}
                                            <h4 className="font-black text-[#1A1A1A] text-[11px]">{event.event_type}</h4>
                                        </div>
                                        <p className="text-[9px] font-bold text-gray-500">{event.message || event.reason}</p>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[8px] font-black text-gray-400">{getMeterInfo(event.meter_id)}</span>
                                            <span className="text-[8px] font-black text-[#1B9157]">ARCHIVE_TS: {new Date(event.timestamp).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={cn("px-2.5 py-1 rounded-md font-black text-[8px] shadow-sm",
                                                event.severity.toUpperCase() === 'Critical' ? "bg-red-500 text-white" :
                                                    event.severity.toUpperCase() === 'Warning' ? "bg-[#F4D03F] text-[#1A1A1A]" : "bg-blue-500 text-white"
                                            )}>
                                                {event.severity}
                                            </span>
                                            <span className={cn("px-2.5 py-1 rounded-md font-black text-[8px] flex items-center gap-1.5",
                                                event.is_resolved ? 'bg-green-500/10 text-[#1B9157] border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse'
                                            )}>
                                                {event.is_resolved ? 'Resolved' : 'Active Incident'}
                                            </span>
                                        </div>
                                        <button className={cn(glass.btnSecondary, "hidden md:flex bg-white/50 border-white/40 font-black text-[8px] h-8 px-4")}>Command Fix</button>
                                    </div>
                                </div>
                            ))
                        )}
                        <div className="p-5 bg-white/20 border-t border-white/10 text-center">
                            <span className="text-[9px] font-black text-gray-400 hover:text-[#1A1A1A] cursor-pointer transition-colors border-b border-transparent hover:border-[#1A1A1A]">
                                RETRIEVE_LEGACY_ARCHIVES
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Stats Card */}
                <div className={cn(glass.card, "p-0 overflow-hidden shadow-xl bg-white/40 border-white/20")}>
                    <div className="p-5 border-b border-white/10 bg-white/20">
                        <h3 className="text-[11px] font-black text-[#1A1A1A]">Incident Metrics</h3>
                        <p className="text-[9px] font-black text-gray-400 mt-1">Telemetry Stratification By Urgency</p>
                    </div>
                    <div className="p-5">
                        <div className="space-y-6">
                            {['Critical', 'Warning', 'Info'].map(s => {
                                const count = events.filter(e => e.severity.toLowerCase() === s.toLowerCase()).length;
                                const total = events.length || 1;
                                const pct = (count / total) * 100;
                                return (
                                    <div key={s} className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[9px] font-black text-gray-400">URGENCY_{s.toUpperCase()}</span>
                                            <span className="text-lg font-black text-[#1A1A1A] tracking-tighter tabular-nums">{count}</span>
                                        </div>
                                        <div className="h-2 w-full bg-white/50 rounded-full overflow-hidden border border-white/40">
                                            <div
                                                className={cn("h-full transition-all duration-1000",
                                                    s === 'Critical' ? "bg-red-500" : s === 'Warning' ? "bg-[#F4D03F]" : "bg-blue-500"
                                                )}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Info Card */}
                <div className={cn(glass.card, "p-0 overflow-hidden shadow-xl bg-[#1B9157]/10 border-[#1B9157]/20 flex flex-col justify-between")}>
                    <div className="p-5">
                        <h3 className="text-[11px] font-black text-[#1A1A1A]">System Integrity</h3>
                    </div>
                    <div className="p-5 pt-0 space-y-6 flex-1 flex flex-col justify-end">
                        <div className="p-5 rounded-2xl bg-white/50 border border-white/40 flex items-center justify-between shadow-sm">
                            <div>
                                <h4 className="text-[9px] font-black text-[#1A1A1A]">Protocol Nominal</h4>
                                <p className="text-[8px] font-bold text-gray-500 mt-1">Resolution Benchmarks Exceeding Targets</p>
                            </div>
                            <CheckCircle2 className="w-6 h-6 text-[#1B9157]" />
                        </div>
                        <button className={cn(glass.btnPrimary, "w-full h-10 rounded-xl font-black text-[9px] shadow-md")}>
                            INITIATE_SCAN
                        </button>
                    </div>
                </div>
            </div>
        </div>
        </BeeYieldPageShell>
    );
};

export default MetersAlarms;
