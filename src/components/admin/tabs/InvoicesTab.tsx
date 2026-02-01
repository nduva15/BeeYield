
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminService, InvoiceRecord } from '@/services/adminService';
import { Loader2, FileText, Download } from "lucide-react";
import { format } from 'date-fns';

export function InvoicesTab() {
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [invoicesData, statsData] = await Promise.all([
                adminService.getInvoiceRegistry(),
                adminService.getInvoiceStats()
            ]);
            setInvoices(invoicesData || []);
            setStats(statsData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            paid: 'bg-green-100 text-green-800 border-green-200',
            unpaid: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            overdue: 'bg-red-100 text-red-800 border-red-200',
            cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
        };
        return (
            <Badge variant="outline" className={colors[status] || 'bg-gray-100'}>
                {status}
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">KES {(stats?.total_amount_kes || 0).toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">KES {(stats?.paid_amount_kes || 0).toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">KES {(stats?.unpaid_amount_kes || 0).toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Count</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.total_invoices || 0}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-t-4 border-t-indigo-500">
                <CardHeader>
                    <CardTitle>Invoices Registry</CardTitle>
                    <CardDescription>Management of all customer invoices</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice #</TableHead>
                                    <TableHead>Order Link</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.map((inv) => (
                                    <TableRow key={inv.id}>
                                        <TableCell className="font-mono font-medium">{inv.invoice_number}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">{inv.order_number || '-'}</TableCell>
                                        <TableCell>{inv.customer_email}</TableCell>
                                        <TableCell className="text-right font-bold">
                                            KES {inv.total_kes.toLocaleString()}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(inv.status)}</TableCell>
                                        <TableCell className="text-right text-sm text-muted-foreground">
                                            {format(new Date(inv.created_at), 'MMM d, yyyy')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm">
                                                <Download className="h-4 w-4 mr-1" />
                                                PDF
                                            </Button>
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
