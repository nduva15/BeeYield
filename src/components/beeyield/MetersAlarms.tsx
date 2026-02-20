import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Bell, Clock, Activity, Loader2, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { meterService, MeterEvent, Meter, Building } from '@/services/meterService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const MetersAlarms: React.FC = () => {
    const [events, setEvents] = useState<MeterEvent[]>([]);
    const [meters, setMeters] = useState<Meter[]>([]);
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
            case 'CRITICAL':
            case 'ALERT':
                return 'text-red-600 border-red-200 bg-red-50';
            case 'WARNING':
                return 'text-amber-600 border-amber-200 bg-amber-50';
            default:
                return 'text-blue-600 border-blue-200 bg-blue-50';
        }
    };

    const getBadgeStyles = (severity: string) => {
        switch (severity.toUpperCase()) {
            case 'CRITICAL':
            case 'ALERT':
                return 'bg-red-100 text-red-700';
            case 'WARNING':
                return 'bg-amber-100 text-amber-700';
            default:
                return 'bg-blue-100 text-blue-700';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[#10b981] bg-[#064e3b] mb-4">
                    <Bell className="w-3.5 h-3.5 text-[#facc15]" />
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Priority Protocol Feed</span>
                </div>
                <h1 className="text-5xl font-black text-[#064e3b] tracking-tighter uppercase leading-none">System <span className="text-[#10b981]">Updates</span></h1>
            </div>

            {/* Top Notifications Section */}
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
                        {loading ? (
                            <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>
                        ) : events.length === 0 ? (
                            <div className="p-12 text-center text-gray-400">No active alarms found.</div>
                        ) : (
                            events.map((event) => (
                                <div key={event.id} className="p-8 flex flex-col md:flex-row md:items-center justify-between hover:bg-[#facc15]/5 transition-none cursor-default group border-b-2 border-neutral-50 last:border-0">
                                    <div className="space-y-2 mb-6 md:mb-0">
                                        <div className="flex items-center gap-3">
                                            {event.is_resolved ? (
                                                <div className="w-6 h-6 rounded-none bg-[#10b981] flex items-center justify-center border-2 border-[#064e3b] shadow-[2px_2px_0px_0px_rgba(6,78,59,1)]">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                                </div>
                                            ) : (
                                                <div className="w-6 h-6 rounded-none bg-red-500 flex items-center justify-center border-2 border-[#064e3b] shadow-[2px_2px_0px_0px_rgba(6,78,59,1)]">
                                                    <AlertTriangle className="w-3.5 h-3.5 text-white" />
                                                </div>
                                            )}
                                            <h4 className="font-black text-[#064e3b] uppercase tracking-tighter text-lg">{event.event_type}</h4>
                                        </div>
                                        <p className="text-xs font-black text-[#064e3b]/60 uppercase tracking-tight">{event.message || event.reason}</p>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[9px] font-black text-[#064e3b]/30 uppercase tracking-[0.2em]">{getMeterInfo(event.meter_id)}</span>
                                            <span className="text-[9px] font-black text-[#10b981] uppercase tracking-[0.2em]">ARCHIVE_TS: {new Date(event.timestamp).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex gap-4">
                                            <Badge className={cn("rounded-none border-2 px-3 py-1 font-black text-[9px] uppercase tracking-[0.2em] shadow-[3px_3px_0px_0px_rgba(6,78,59,1)]",
                                                event.severity.toUpperCase() === 'CRITICAL' ? "bg-red-500 text-white border-[#064e3b]" :
                                                    event.severity.toUpperCase() === 'WARNING' ? "bg-[#facc15] text-[#064e3b] border-[#064e3b]" : "bg-[#064e3b] text-white border-[#10b981]"
                                            )}>
                                                {event.severity}
                                            </Badge>
                                            <Badge className={cn("rounded-none border-2 px-3 py-1 font-black text-[9px] uppercase tracking-[0.2em] items-center gap-2",
                                                event.is_resolved ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20' : 'bg-red-500 text-white border-[#064e3b] animate-pulse'
                                            )}>
                                                {event.is_resolved ? 'RESOLVED' : 'ACTIVE_INCIDENT'}
                                            </Badge>
                                        </div>
                                        <Button variant="ghost" size="sm" className="hidden md:flex rounded-none border-2 border-[#064e3b] bg-white text-[#064e3b] hover:bg-[#064e3b] hover:text-white font-black text-[10px] uppercase tracking-widest h-10 px-6 transition-none shadow-[4px_4px_0px_0px_rgba(6,78,59,1)] active:shadow-none active:translate-x-1 active:translate-y-1">COMMAND FIX</Button>
                                    </div>
                                </div>
                            ))
                        )}
                        <div className="p-6 bg-neutral-50/50 border-t-4 border-[#064e3b]/5 text-center">
                            <span className="text-[10px] font-black text-[#064e3b] hover:text-[#10b981] uppercase tracking-[0.3em] cursor-pointer transition-none border-b-2 border-transparent hover:border-[#10b981]">
                                RETRIEVE LEGACY ARCHIVES
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
                            {['Critical', 'Warning', 'Info'].map(s => {
                                const count = events.filter(e => e.severity.toLowerCase() === s.toLowerCase()).length;
                                const total = events.length || 1;
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
                                                    s === 'Critical' ? "bg-red-500 shadow-[2px_0px_0px_0px_rgba(6,78,59,1)]" : s === 'Warning' ? "bg-[#facc15] shadow-[2px_0px_0px_0px_rgba(6,78,59,1)]" : "bg-[#10b981] shadow-[2px_0px_0px_0px_rgba(6,78,59,1)]"
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
                        <CardTitle className="text-xl font-black text-white uppercase tracking-tighter italic">System Integrity</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 space-y-8">
                        <div className="p-6 rounded-none bg-white border-2 border-[#10b981] flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(16,185,129,0.2)]">
                            <div>
                                <h4 className="text-xs font-black text-[#064e3b] uppercase tracking-widest">Protocol Nominal</h4>
                                <p className="text-[10px] font-black text-[#064e3b]/40 uppercase tracking-tight mt-1">Resolution benchmarks exceeding targets.</p>
                            </div>
                            <CheckCircle2 className="w-8 h-8 text-[#10b981]" />
                        </div>
                        <Button className="w-full h-14 rounded-none bg-[#facc15] text-[#064e3b] hover:bg-white border-4 border-[#064e3b] font-black text-xs uppercase tracking-[0.2em] transition-none shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] active:shadow-none active:translate-x-1 active:translate-y-1">
                            INITIATE SCAN
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default MetersAlarms;
