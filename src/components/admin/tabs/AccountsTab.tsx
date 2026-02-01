
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { adminService, AccountRecord } from '@/services/adminService';
import { Loader2, Users, UserCheck } from "lucide-react";
import { format } from 'date-fns';

export function AccountsTab() {
    const [loading, setLoading] = useState(true);
    const [accounts, setAccounts] = useState<AccountRecord[]>([]);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [accountsData, statsData] = await Promise.all([
                adminService.getAccountRegistry(),
                adminService.getAccountStats()
            ]);
            setAccounts(accountsData || []);
            setStats(statsData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.total_accounts || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats?.active_accounts || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Customers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.by_type?.customer || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Farmers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.by_type?.farmer || 0}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-t-4 border-t-orange-500">
                <CardHeader>
                    <CardTitle>User Account Registry</CardTitle>
                    <CardDescription>Directory of all registered profiles</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email / Identity</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Registered</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {accounts.map((acc) => (
                                    <TableRow key={acc.id}>
                                        <TableCell className="font-medium">{acc.email}</TableCell>
                                        <TableCell>{acc.first_name} {acc.last_name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">{acc.account_type || 'customer'}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {acc.is_active ? (
                                                    <span className="h-2 w-2 rounded-full bg-green-500" />
                                                ) : (
                                                    <span className="h-2 w-2 rounded-full bg-gray-300" />
                                                )}
                                                <span className="capitalize text-sm">{acc.verification_status?.replace('_', ' ') || 'unverified'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {format(new Date(acc.created_at), 'MMM d, yyyy')}
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
