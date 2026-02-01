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
        if (!meter) return 'Unknown Meter';
        const building = buildings.find(b => b.id === meter.building_id);
        return `${meter.meter_number} - ${building?.name || 'Unknown Building'}`;
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
            <h1 className="text-[2.5rem] font-bold text-[#1B9157] dark:text-[#F4D03F] tracking-tight">Alarms & events</h1>

            {/* Top Notifications Section */}
            <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm overflow-hidden border-t-4 border-t-[#F4D03F]">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Bell className="w-5 h-5 text-[#1B9157] dark:text-[#F4D03F]" fill="currentColor" />
                        <CardTitle className="text-lg font-bold text-[#1B9157] dark:text-[#F4D03F]">Real-time system notifications</CardTitle>
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
                                <div key={event.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-all cursor-default">
                                    <div className="space-y-1 mb-4 md:mb-0">
                                        <div className="flex items-center gap-2">
                                            {event.is_resolved ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <AlertTriangle className="w-4 h-4 text-red-500" />}
                                            <h4 className="font-bold text-gray-900 dark:text-gray-100 uppercase tracking-tight">{event.event_type}</h4>
                                        </div>
                                        <p className="text-sm text-gray-500">{event.message || event.reason}</p>
                                        <p className="text-[10px] text-gray-400 font-medium">{getMeterInfo(event.meter_id)} • {new Date(event.timestamp).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex gap-3">
                                            <Badge variant="outline" className={cn("px-3 py-1 font-bold", getSeverityStyles(event.severity))}>
                                                {event.severity}
                                            </Badge>
                                            <Badge className={cn("px-3 py-1 font-bold items-center gap-1.5 border-none shadow-none", getBadgeStyles(event.severity))}>
                                                <div className={cn("w-1.5 h-1.5 rounded-full", event.is_resolved ? "bg-green-500" : "bg-red-500")}></div>
                                                {event.is_resolved ? 'RESOLVED' : 'ACTIVE'}
                                            </Badge>
                                        </div>
                                        <Button variant="ghost" size="sm" className="hidden md:flex text-xs font-bold text-[#1B9157]">Assign ticket</Button>
                                    </div>
                                </div>
                            ))
                        )}
                        <div className="p-4 bg-gray-50/50 dark:bg-gray-900/20 text-center">
                            <span className="text-xs font-bold text-[#1B9157] hover:text-[#1B9157]/80 uppercase tracking-widest cursor-pointer transition-colors">
                                Archive
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Stats Card */}
                <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-[#1B9157]">Statistics</CardTitle>
                        <CardDescription>Event distribution by severity</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {['Critical', 'Warning', 'Info'].map(s => {
                                const count = events.filter(e => e.severity.toLowerCase() === s.toLowerCase()).length;
                                const total = events.length || 1;
                                const pct = (count / total) * 100;
                                return (
                                    <div key={s} className="space-y-1.5">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span>{s}</span>
                                            <span>{count}</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className={cn("h-full transition-all duration-1000",
                                                    s === 'Critical' ? "bg-red-500" : s === 'Warning' ? "bg-amber-500" : "bg-blue-500"
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
                <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-[#1B9157]">Workflow Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded-xl bg-green-50/50 border border-green-100 flex items-center justify-between">
                            <div>
                                <h4 className="text-xs font-bold text-green-700">All Critical Resolved</h4>
                                <p className="text-[10px] text-green-600 mt-1">Excellent response time in last 24h.</p>
                            </div>
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                        </div>
                        <Button className="w-full h-11 rounded-xl bg-gray-900 text-white font-bold text-xs">Run Diagnostic</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default MetersAlarms;
