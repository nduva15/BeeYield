
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { adminService, PaymentTransaction } from '@/services/adminService';
import { Loader2, DollarSign, CreditCard } from "lucide-react";
import { format } from 'date-fns';

export function PaymentsTab() {
    const [loading, setLoading] = useState(true);
    const [payments, setPayments] = useState<PaymentTransaction[]>([]);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [paymentsData, statsData] = await Promise.all([
                adminService.getPaymentTransactions(),
                adminService.getPaymentStats()
            ]);
            setPayments(paymentsData || []);
            setStats(statsData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            completed: 'bg-green-100 text-green-800 border-green-200',
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            failed: 'bg-red-100 text-red-800 border-red-200',
            refunded: 'bg-gray-100 text-gray-800 border-gray-200',
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
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            KES {(stats?.successful_amount_kes || 0).toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.total_transactions || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">M-Pesa Volume</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            KES {(stats?.amount_by_method?.mpesa || 0).toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Card Volume</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            KES {(stats?.amount_by_method?.card || 0).toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-t-4 border-t-green-500">
                <CardHeader>
                    <CardTitle>Payment Transactions</CardTitle>
                    <CardDescription>All incoming and outgoing payments</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order #</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payments.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell className="font-mono">{payment.order_number || '-'}</TableCell>
                                        <TableCell>{payment.customer_email || 'Guest'}</TableCell>
                                        <TableCell className="capitalize flex items-center gap-2">
                                            {payment.payment_method === 'mpesa' ? (
                                                <Badge variant="secondary" className="bg-green-50 text-green-700">M-Pesa</Badge>
                                            ) : (
                                                <div className="flex items-center"><CreditCard className="h-3 w-3 mr-1" /> Card</div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right font-bold">
                                            KES {payment.amount_kes.toLocaleString()}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                                        <TableCell className="text-right text-muted-foreground text-sm">
                                            {format(new Date(payment.created_at), 'MMM d, HH:mm')}
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
