
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminService, TracingHistory as HistoryItem } from '@/services/adminService';
import { Loader2, QrCode, Globe, Smartphone, Monitor, MapPin, Search, RefreshCw, Database } from "lucide-react";
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { glass, PageHeader, GlassStatCard } from '@/components/beeyield/GlassTheme';
import { cn } from '@/lib/utils';

export function TracingHistoryTab() {
    const [loading, setLoading] = useState(true);
    const [traces, setTraces] = useState<HistoryItem[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [filters, setFilters] = useState({ days: '30' });

    const loadData = React.useCallback(async () => {
        setLoading(true);
        try {
            const [tracesData, statsData] = await Promise.all([
                adminService.getHistory({ days: parseInt(filters.days) }),
                adminService.getHistoryStats(parseInt(filters.days))
            ]);
            setTraces(tracesData || []);
            setStats(statsData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [filters.days]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const getSourceIcon = (source: string) => {
        switch (source) {
            case 'qr_scan': return <QrCode className="h-4 w-4 text-primary" />;
            case 'website_search': return <Globe className="h-4 w-4 text-primary" />;
            default: return <Globe className="h-4 w-4 text-primary/60" />;
        }
    };

    const getDeviceIcon = (device?: string) => {
        if (!device) return null;
        if (device.includes('mobile')) return <Smartphone className="h-4 w-4 text-[#F4D03F]" />;
        return <Monitor className="h-4 w-4 text-primary/60" />;
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
            <PageHeader
                icon={Search}
                label="Traceability"
                title="Tracing History"
                subtitle="Real-time log of product authentications and batch lookups."
                actions={
                    <div className="flex gap-3">
                        <Select value={filters.days} onValueChange={(v) => setFilters({ days: v })}>
                            <SelectTrigger className="w-[180px] h-10 rounded-xl bg-background/50 border-border/50 font-black text-[10px] uppercase tracking-tighter">
                                <SelectValue placeholder="TIMEFRAME" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl font-bold">
                                <SelectItem value="7">LAST 7 DAYS</SelectItem>
                                <SelectItem value="30">LAST 30 DAYS</SelectItem>
                                <SelectItem value="90">LAST 3 MONTHS</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-border/50 hover:bg-primary/10 transition-all active:scale-95" onClick={loadData}>
                            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                        </Button>
                    </div>
                }
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <GlassStatCard
                    label="Lookups"
                    value={stats?.total_traces || 0}
                    icon={Search}
                />
                <GlassStatCard
                    label="QR Scans"
                    value={stats?.by_source?.qr_scan || 0}
                    icon={QrCode}
                />
                <GlassStatCard
                    label="Batches"
                    value={stats?.unique_batches || 0}
                    icon={Database}
                />
                <GlassStatCard
                    label="Authed"
                    value={stats?.authenticated_traces || 0}
                    icon={Globe}
                />
            </div>

            <div className={cn(glass.section, "p-0 overflow-hidden")}>
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-[#F4D03F]/10 bg-muted/20">
                            <TableHead className="py-4 px-6 font-black text-[10px] tracking-widest uppercase">Batch ID</TableHead>
                            <TableHead className="py-4 px-6 font-black text-[10px] tracking-widest uppercase">Resource Info</TableHead>
                            <TableHead className="py-4 px-6 font-black text-[10px] tracking-widest uppercase text-center">Protocol</TableHead>
                            <TableHead className="py-4 px-6 font-black text-[10px] tracking-widest uppercase">Operator Environment</TableHead>
                            <TableHead className="py-4 px-6 font-black text-[10px] tracking-widest uppercase text-right">Timestamp</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && traces.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="py-24 text-center">
                                    <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto opacity-50" />
                                    <p className="mt-4 font-black text-[10px] tracking-widest text-muted-foreground uppercase">Accessing tracing data...</p>
                                </TableCell>
                            </TableRow>
                        ) : traces.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="py-24 text-center">
                                    <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                                        <Search className="h-8 w-8 text-muted-foreground/30" />
                                    </div>
                                    <p className="font-black text-[10px] tracking-widest text-muted-foreground uppercase">No tracing events recorded</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            traces.map((trace) => (
                                <TableRow key={trace.id} className="hover:bg-muted/10 transition-all border-b border-[#F4D03F]/10 group">
                                    <TableCell className="px-6 py-5">
                                        <Badge variant="outline" className="font-mono text-[10px] font-black tracking-widest bg-primary/5 text-primary border-primary/20 rounded-lg px-2 py-1">
                                            {trace.batch_code}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-black text-[11px] tracking-tighter uppercase">{trace.honey_type || 'Unknown Resource'}</span>
                                            <span className="font-mono text-[9px] opacity-40 uppercase tracking-widest line-clamp-1">
                                                {trace.farmer_name ? `ORIGIN: ${trace.farmer_name}` : 'ORIGIN_NULL'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-5 text-center">
                                        <div className="inline-flex items-center gap-2 bg-background/50 border border-border/50 rounded-lg px-2 py-1">
                                            {getSourceIcon(trace.trace_source)}
                                            <span className="font-black text-[9px] uppercase tracking-widest opacity-60">{trace.trace_source.replace('_', ' ')}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                {getDeviceIcon(trace.device_type)}
                                                <span className="font-black text-[10px] uppercase tracking-tighter">{trace.device_type || 'REMOTE_STATION'}</span>
                                            </div>
                                            {trace.is_authenticated && (
                                                <span className="font-black text-[8px] text-emerald-500 uppercase tracking-widest mt-0.5">AUTH_SECURE</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-5 text-right font-black text-[11px] tracking-tighter">
                                        <div className="flex flex-col items-end">
                                            <span>{format(new Date(trace.created_at), 'MMM dd, yyyy')}</span>
                                            <span className="font-mono text-[9px] opacity-40 tracking-widest">{format(new Date(trace.created_at), 'HH:mm')}</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

