
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminService, ActivityLog } from '@/services/adminService';
import { toast } from "sonner";
import { Loader2, Search, Filter, History, Eye, Download, FileText, CreditCard } from "lucide-react";
import { format } from 'date-fns';

export function ActivityLogTab() {
    const [loading, setLoading] = useState(true);
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [filters, setFilters] = useState({
        activity_type: 'all',
        days: '30'
    });
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, [filters]);

    const loadData = async () => {
        setLoading(true);
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
            // Don't show error toast on first load to act gracefully if backend endpoint missing
        } finally {
            setLoading(false);
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'trace': return <Search className="h-4 w-4 text-blue-500" />;
            case 'invoice': return <FileText className="h-4 w-4 text-green-500" />;
            case 'payment': return <CreditCard className="h-4 w-4 text-purple-500" />;
            case 'document': return <Download className="h-4 w-4 text-orange-500" />;
            default: return <History className="h-4 w-4 text-gray-500" />;
        }
    };

    const getActionBadge = (action: string) => {
        const colors: Record<string, string> = {
            created: 'bg-green-100 text-green-800',
            viewed: 'bg-blue-100 text-blue-800',
            downloaded: 'bg-orange-100 text-orange-800',
            generated: 'bg-purple-100 text-purple-800',
            deleted: 'bg-red-100 text-red-800',
        };
        return (
            <Badge variant="outline" className={colors[action] || 'bg-gray-100'}>
                {action}
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
                        <History className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.total_activities || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            In the last {filters.days} days
                        </p>
                    </CardContent>
                </Card>
                {/* Find top activity types */}
                {Object.entries(stats?.by_type || {}).slice(0, 3).map(([type, count]: any) => (
                    <Card key={type}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium capitalize">{type}s</CardTitle>
                            {getActivityIcon(type)}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{count}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-t-4 border-t-purple-500">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>System Activity Log</CardTitle>
                            <CardDescription>Real-time audit trail of all actions across the platform</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Select
                                name="activity_type"
                                value={filters.activity_type}
                                onValueChange={(val) => setFilters({ ...filters, activity_type: val })}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Activities</SelectItem>
                                    <SelectItem value="trace">Traceability Scans</SelectItem>
                                    <SelectItem value="payment">Payments</SelectItem>
                                    <SelectItem value="invoice">Invoices</SelectItem>
                                    <SelectItem value="document">Documents</SelectItem>
                                    <SelectItem value="export">Exports</SelectItem>
                                    <SelectItem value="account">Accounts</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                name="days"
                                value={filters.days}
                                onValueChange={(val) => setFilters({ ...filters, days: val })}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Time Period" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Today</SelectItem>
                                    <SelectItem value="7">Last 7 Days</SelectItem>
                                    <SelectItem value="30">Last 30 Days</SelectItem>
                                    <SelectItem value="90">Last 3 Months</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button variant="outline" size="icon" onClick={loadData}>
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No activities found for the selected period.
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Action</TableHead>
                                        <TableHead>Entity</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Details</TableHead>
                                        <TableHead className="text-right">Time</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activities.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="font-medium capitalize flex items-center gap-2">
                                                {getActivityIcon(log.activity_type)}
                                                {log.activity_type}
                                            </TableCell>
                                            <TableCell>{getActionBadge(log.action)}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium capitalize">{log.entity_type}</span>
                                                    <span className="text-xs text-muted-foreground">{log.entity_reference || '-'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span>{log.user_name || 'System / Guest'}</span>
                                                    <span className="text-xs text-muted-foreground">{log.user_email || 'Anonymous'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate">
                                                {log.metadata ? (
                                                    <span className="text-xs text-muted-foreground">
                                                        {JSON.stringify(log.metadata).substring(0, 50)}
                                                        {JSON.stringify(log.metadata).length > 50 ? '...' : ''}
                                                    </span>
                                                ) : '-'}
                                            </TableCell>
                                            <TableCell className="text-right whitespace-nowrap">
                                                {format(new Date(log.created_at), 'MMM d, HH:mm')}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
