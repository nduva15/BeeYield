
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminService, TracingHistory as HistoryItem } from '@/services/adminService';
import { Loader2, QrCode, Globe, Smartphone, Monitor, MapPin } from "lucide-react";
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function TracingHistoryTab() {
    const [loading, setLoading] = useState(true);
    const [traces, setTraces] = useState<HistoryItem[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [filters, setFilters] = useState({ days: '30' });

    useEffect(() => {
        loadData();
    }, [filters]);

    const loadData = async () => {
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
    };

    const getSourceIcon = (source: string) => {
        switch (source) {
            case 'qr_scan': return <QrCode className="h-4 w-4 text-purple-500" />;
            case 'website_search': return <Globe className="h-4 w-4 text-blue-500" />;
            default: return <Globe className="h-4 w-4 text-gray-500" />;
        }
    };

    const getDeviceIcon = (device?: string) => {
        if (!device) return null;
        if (device.includes('mobile')) return <Smartphone className="h-4 w-4 text-orange-500" />;
        return <Monitor className="h-4 w-4 text-gray-500" />;
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Traces</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.total_traces || 0}</div>
                        <p className="text-xs text-muted-foreground">Last {filters.days} days</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">QR Scans</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.by_source?.qr_scan || 0}</div>
                        <p className="text-xs text-muted-foreground">Direct product scans</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Unique Batches</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.unique_batches || 0}</div>
                        <p className="text-xs text-muted-foreground">Products looked up</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Authenticated</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.authenticated_traces || 0}</div>
                        <p className="text-xs text-muted-foreground">Logged-in users</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-t-4 border-t-teal-500">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>History</CardTitle>
                            <CardDescription>Log of all batch lookups</CardDescription>
                        </div>
                        <Select value={filters.days} onValueChange={(v) => setFilters({ days: v })}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Period" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7">Last 7 Days</SelectItem>
                                <SelectItem value="30">Last 30 Days</SelectItem>
                                <SelectItem value="90">Last 3 Months</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Batch Code</TableHead>
                                    <TableHead>Product Info</TableHead>
                                    <TableHead>Source</TableHead>
                                    <TableHead>User / Device</TableHead>
                                    <TableHead className="text-right">Time</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {traces.map((trace) => (
                                    <TableRow key={trace.id}>
                                        <TableCell className="font-medium">
                                            <Badge variant="outline" className="font-mono">
                                                {trace.batch_code}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{trace.honey_type || 'Unknown Honey'}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {trace.farmer_name ? `Farmer: ${trace.farmer_name}` : ''}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {getSourceIcon(trace.trace_source)}
                                                <span className="capitalize">{trace.trace_source.replace('_', ' ')}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2 text-sm">
                                                    {getDeviceIcon(trace.device_type)}
                                                    <span className="capitalize">{trace.device_type || 'Unknown Device'}</span>
                                                </div>
                                                {trace.is_authenticated && (
                                                    <span className="text-xs text-green-600 font-medium">Authenticated</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right whitespace-nowrap">
                                            {format(new Date(trace.created_at), 'MMM d, HH:mm')}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
