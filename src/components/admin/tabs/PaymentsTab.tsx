
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminService, PaymentTransaction } from '@/services/adminService';
import { Loader2, DollarSign, CreditCard, RefreshCw, TrendingUp, ShieldCheck, Wallet } from "lucide-react";
import { format } from 'date-fns';
import { glass, PageHeader, GlassStatCard } from '@/components/beeyield/GlassTheme';
import { cn } from '@/lib/utils';

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
        const styles: Record<string, string> = {
            completed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
            pending: 'bg-[#F4D03F]/10 text-[#F4D03F] border-[#F4D03F]/20',
            failed: 'bg-destructive/10 text-destructive border-destructive/20',
            refunded: 'bg-muted/50 text-muted-foreground border-border/50',
        };
        return (
            <Badge variant="outline" className={cn("font-black text-[9px] px-2 py-0.5 rounded-lg uppercase tracking-widest", styles[status] || 'bg-muted/50 text-muted-foreground')}>
                {status}
            </Badge>
        );
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
            <PageHeader
                icon={Wallet}
                label="Financials"
                title="Payment Ledger"
                subtitle="End-to-end monitoring of transaction flows and payment processing."
                actions={
                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-border/50 hover:bg-primary/10 transition-all active:scale-95" onClick={loadData}>
                        <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                    </Button>
                }
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <GlassStatCard
                    label="Circulation"
                    value={`KSh ${(stats?.successful_amount_kes || 0).toLocaleString()}`}
                    icon={TrendingUp}
                    color="text-emerald-500"
                />
                <GlassStatCard
                    label="Operations"
                    value={stats?.total_transactions || 0}
                    icon={ShieldCheck}
                />
                <GlassStatCard
                    label="M-Pesa Flow"
                    value={`KSh ${(stats?.amount_by_method?.mpesa || 0).toLocaleString()}`}
                    icon={Wallet}
                />
                <GlassStatCard
                    label="Bridge Flow"
                    value={`KSh ${(stats?.amount_by_method?.card || 0).toLocaleString()}`}
                    icon={CreditCard}
                />
            </div>

            <div className={cn(glass.section, "p-0 overflow-hidden")}>
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-[#F4D03F]/10 bg-muted/20">
                            <TableHead className="py-4 px-6 font-black text-[10px] tracking-widest uppercase">Protocol Ref</TableHead>
                            <TableHead className="py-4 px-6 font-black text-[10px] tracking-widest uppercase">Entity Identity</TableHead>
                            <TableHead className="py-4 px-6 font-black text-[10px] tracking-widest uppercase text-center">Gateway</TableHead>
                            <TableHead className="py-4 px-6 font-black text-[10px] tracking-widest uppercase text-right">Magnitude</TableHead>
                            <TableHead className="py-4 px-6 font-black text-[10px] tracking-widest uppercase text-center">Protocol Status</TableHead>
                            <TableHead className="py-4 px-6 font-black text-[10px] tracking-widest uppercase text-right">Timestamp</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && payments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="py-24 text-center">
                                    <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto opacity-50" />
                                    <p className="mt-4 font-black text-[10px] tracking-widest text-muted-foreground uppercase">Syncing with payment gateways...</p>
                                </TableCell>
                            </TableRow>
                        ) : payments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="py-24 text-center">
                                    <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                                        <Wallet className="h-8 w-8 text-muted-foreground/30" />
                                    </div>
                                    <p className="font-black text-[10px] tracking-widest text-muted-foreground uppercase">No financial transactions detected</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            payments.map((payment) => (
                                <TableRow key={payment.id} className="hover:bg-muted/10 transition-all border-b border-[#F4D03F]/10 group">
                                    <TableCell className="px-6 py-5">
                                        <span className="font-mono text-[10px] font-black tracking-widest text-primary/80 uppercase">
                                            {payment.order_number || 'TRX_STUB'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-black text-[11px] tracking-tighter uppercase">{payment.customer_email || 'ROOT_AUTH'}</span>
                                            <span className="font-mono text-[8px] opacity-40 uppercase tracking-widest">GUEST_SECURE</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-5 text-center">
                                        <div className={cn(
                                            "inline-flex items-center gap-2 rounded-lg px-2 py-1 border",
                                            payment.payment_method === 'mpesa' ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500" : "bg-primary/5 border-primary/20 text-primary"
                                        )}>
                                            {payment.payment_method === 'mpesa' ? <Wallet className="h-3 w-3" /> : <CreditCard className="h-3 w-3" />}
                                            <span className="font-black text-[9px] uppercase tracking-widest truncate max-w-[60px]">{payment.payment_method}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-5 text-right font-black text-[11px] tracking-tighter">
                                        KSh {payment.amount_kes.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="px-6 py-5 text-center">
                                        {getStatusBadge(payment.status)}
                                    </TableCell>
                                    <TableCell className="px-6 py-5 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="font-black text-[10px] tracking-tighter">{format(new Date(payment.created_at), 'MMM dd, yyyy')}</span>
                                            <span className="font-mono text-[9px] opacity-40 tracking-widest">{format(new Date(payment.created_at), 'HH:mm')}</span>
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

