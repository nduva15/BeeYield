
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminService, ActivityLog } from '@/services/adminService';
import { Loader2, Search, Filter, History, Eye, Download, FileText, CreditCard, Shield, Activity, Calendar, RefreshCw } from "lucide-react";
import { format } from 'date-fns';
import { glass, PageHeader, GlassStatCard } from '@/components/beeyield/GlassTheme';
import { cn } from '@/lib/utils';

export function ActivityLogTab() {
    const [loading, setLoading] = useState(true);
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [filters, setFilters] = useState({
        activity_type: 'all',
        days: '30'
    });
    const [stats, setStats] = useState<any>(null);

    const loadData = React.useCallback(async () => {
        setLoading(true);
        setActivities([]); // Show skeleton/empty during load
        try {
            const apiFilters: any = { days: parseInt(filters.days) };
            if (filters.activity_type !== 'all') {
                apiFilters.activity_type = filters.activity_type;
            }

            const [logsData, statsData] = await Promise.all([
                adminService.getActivityLogs(apiFilters),
                adminService.getActivityStats(parseInt(filters.days))
            ]);

            setActivities(logsData || []);
            setStats(statsData);
        } catch (error) {
            console.error("Failed to load activity logs:", error);
        } finally {
            setLoading(false);
        }
    }, [filters.days, filters.activity_type]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'trace': return <Search className="h-4 w-4 text-primary" />;
            case 'invoice': return <FileText className="h-4 w-4 text-[#F4D03F]" />;
            case 'payment': return <CreditCard className="h-4 w-4 text-emerald-500" />;
            case 'document': return <Download className="h-4 w-4 text-orange-500" />;
            default: return <History className="h-4 w-4 text-primary/60" />;
        }
    };

    const getActionBadge = (action: string) => {
        const styles: Record<string, string> = {
            created: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
            viewed: 'bg-primary/10 text-primary border-primary/20',
            downloaded: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
            generated: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
            deleted: 'bg-destructive/10 text-destructive border-destructive/20',
        };
        return (
            <Badge variant="outline" className={cn("font-black text-[9px] px-2 py-0.5 rounded-lg uppercase tracking-widest", styles[action] || 'bg-muted/50 text-muted-foreground')}>
                {action}
            </Badge>
        );
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
            <PageHeader
                icon={Activity}
                label="System Audit"
                title="Activity Monitoring"
                subtitle="End-to-end traceability and audit logs for all administrative actions."
                actions={
                    <div className="flex gap-3">
                        <Select
                            value={filters.activity_type}
                            onValueChange={(val) => setFilters({ ...filters, activity_type: val })}
                        >
                            <SelectTrigger className="w-[160px] h-10 rounded-xl bg-background/50 border-border/50 font-black text-[10px] uppercase tracking-tighter">
                                <SelectValue placeholder="EVENT CLASS" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl font-bold">
                                <SelectItem value="all">ALL ACTIVITIES</SelectItem>
                                <SelectItem value="trace">TRACEABILITY</SelectItem>
                                <SelectItem value="payment">PAYMENTS</SelectItem>
                                <SelectItem value="invoice">INVOICES</SelectItem>
                                <SelectItem value="document">DOCUMENTS</SelectItem>
                                <SelectItem value="export">EXPORTS</SelectItem>
                                <SelectItem value="account">ACCOUNTS</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.days}
                            onValueChange={(val) => setFilters({ ...filters, days: val })}
                        >
                            <SelectTrigger className="w-[140px] h-10 rounded-xl bg-background/50 border-border/50 font-black text-[10px] uppercase tracking-tighter">
                                <SelectValue placeholder="TIMEFRAME" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl font-bold">
                                <SelectItem value="1">TODAY</SelectItem>
                                <SelectItem value="7">7 DAYS</SelectItem>
                                <SelectItem value="30">30 DAYS</SelectItem>
                                <SelectItem value="90">90 DAYS</SelectItem>
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
                    label="Volume"
                    value={stats?.total_activities || 0}
                    icon={Activity}
                />
                {Object.entries(stats?.by_type || {}).slice(0, 3).map(([type, count]: any) => (
                    <GlassStatCard
                        key={type}
                        label={`${type.toUpperCase()}S`}
                        value={count}
                        icon={Shield}
                    />
                ))}
            </div>

            <div className={cn(glass.section, "p-0 overflow-hidden")}>
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-[#F4D03F]/10 bg-muted/20">
                            <TableHead className="py-4 px-6 font-black text-[10px] tracking-widest uppercase">Entity Class</TableHead>
                            <TableHead className="py-4 px-6 font-black text-[10px] tracking-widest uppercase text-center">Protocol</TableHead>
                            <TableHead className="py-4 px-6 font-black text-[10px] tracking-widest uppercase">Target Reference</TableHead>
                            <TableHead className="py-4 px-6 font-black text-[10px] tracking-widest uppercase text-center">Operator</TableHead>
                            <TableHead className="py-4 px-6 font-black text-[10px] tracking-widest uppercase text-right">Timestamp</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && activities.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="py-24 text-center">
                                    <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto opacity-50" />
                                    <p className="mt-4 font-black text-[10px] tracking-widest text-muted-foreground uppercase">Accessing secure logs...</p>
                                </TableCell>
                            </TableRow>
                        ) : activities.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="py-24 text-center">
                                    <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                                        <Shield className="h-8 w-8 text-muted-foreground/30" />
                                    </div>
                                    <p className="font-black text-[10px] tracking-widest text-muted-foreground uppercase">No administrative events recorded</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            activities.map((log) => (
                                <TableRow key={log.id} className="hover:bg-muted/10 transition-all border-b border-[#F4D03F]/10 group">
                                    <TableCell className="py-5 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-xl bg-background/50 border border-border/50 group-hover:border-primary/30 transition-colors">
                                                {getActivityIcon(log.activity_type)}
                                            </div>
                                            <div className="font-black text-[10px] tracking-tight uppercase text-primary/80">{log.activity_type}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-5 px-6 text-center">
                                        {getActionBadge(log.action)}
                                    </TableCell>
                                    <TableCell className="py-5 px-6">
                                        <div className="flex flex-col">
                                            <span className="font-black text-[11px] tracking-tighter uppercase">{log.entity_type}</span>
                                            <span className="font-mono text-[9px] opacity-40 uppercase tracking-widest line-clamp-1">{log.entity_reference || 'PROTOCOL_NULL'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-5 px-6 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="font-black text-[11px] tracking-tighter uppercase">{log.user_name || 'SYSTEM_DAEMON'}</span>
                                            <span className="font-mono text-[9px] opacity-40 uppercase tracking-widest">{log.user_email || 'ROOT_AUTH'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-5 px-6 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="font-black text-[11px] tracking-tighter">{format(new Date(log.created_at), 'MMM dd, yyyy')}</span>
                                            <span className="font-mono text-[9px] opacity-40 tracking-widest">{format(new Date(log.created_at), 'HH:mm:ss')} (UTC)</span>
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

