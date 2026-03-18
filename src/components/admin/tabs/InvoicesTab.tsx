
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminService, InvoiceRecord } from '@/services/adminService';
import { Loader2, FileText, Download, RefreshCw, Receipt, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { format } from 'date-fns';
import { glass, PageHeader, GlassStatCard } from '@/components/beeyield/GlassTheme';
import { cn } from '@/lib/utils';

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
        const styles: Record<string, string> = {
            paid: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
            unpaid: 'bg-[#F4D03F]/10 text-[#F4D03F] border-[#F4D03F]/20',
            overdue: 'bg-destructive/10 text-destructive border-destructive/20',
            cancelled: 'bg-muted/50 text-muted-foreground border-border/50',
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
                icon={Receipt}
                label="Billing"
                title="Invoices Registry"
                subtitle="Archive of customer invoices and legal billing documents."
                actions={
                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-border/50 hover:bg-primary/10 transition-all active:scale-95" onClick={loadData}>
                        <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                    </Button>
                }
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <GlassStatCard
                    label="Circulation"
                    value={`KSh ${(stats?.total_amount_kes || 0).toLocaleString()}`}
                    icon={TrendingUp}
                />
                <GlassStatCard
                    label="Settled"
                    value={`KSh ${(stats?.paid_amount_kes || 0).toLocaleString()}`}
                    icon={CheckCircle2}
                    color="text-emerald-500"
                />
                <GlassStatCard
                    label="Outstanding"
                    value={`KSh ${(stats?.unpaid_amount_kes || 0).toLocaleString()}`}
                    icon={AlertCircle}
                    color="text-orange-500"
                />
                <GlassStatCard
                    label="Count"
                    value={stats?.total_invoices || 0}
                    icon={FileText}
                />
            </div>

            <div className={cn(glass.section, "p-0 overflow-hidden")}>
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-[#F4D03F]/10 bg-muted/20">
                            <TableHead className="py-4 px-6 font-black text-[10px] tracking-widest uppercase">Invoice Identity</TableHead>
                            <TableHead className="py-4 px-6 font-black text-[10px] tracking-widest uppercase text-center">Protocol Ref</TableHead>
                            <TableHead className="py-4 px-6 font-black text-[10px] tracking-widest uppercase">Entity Email</TableHead>
                            <TableHead className="py-4 px-6 font-black text-[10px] tracking-widest uppercase text-right">Magnitude</TableHead>
                            <TableHead className="py-4 px-6 font-black text-[10px] tracking-widest uppercase text-center">Protocol Status</TableHead>
                            <TableHead className="py-4 px-6 font-black text-[10px] tracking-widest uppercase text-right">Timestamp</TableHead>
                            <TableHead className="py-4 px-6 font-black text-[10px] tracking-widest uppercase text-center">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && invoices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="py-24 text-center">
                                    <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto opacity-50" />
                                    <p className="mt-4 font-black text-[10px] tracking-widest text-muted-foreground uppercase">Accessing invoice registry...</p>
                                </TableCell>
                            </TableRow>
                        ) : invoices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="py-24 text-center">
                                    <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                                        <Receipt className="h-8 w-8 text-muted-foreground/30" />
                                    </div>
                                    <p className="font-black text-[10px] tracking-widest text-muted-foreground uppercase">No invoices found in registry</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            invoices.map((inv) => (
                                <TableRow key={inv.id} className="hover:bg-muted/10 transition-all border-b border-[#F4D03F]/10 group">
                                    <TableCell className="px-6 py-5">
                                        <span className="font-mono text-[10px] font-black tracking-widest text-primary/80 uppercase">
                                            {inv.invoice_number}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-6 py-5 text-center">
                                        <span className="font-mono text-[9px] opacity-40 uppercase tracking-widest">
                                            {inv.order_number || 'TRX_STUB'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-6 py-5">
                                        <span className="font-black text-[11px] tracking-tighter uppercase truncate block max-w-[200px]">
                                            {inv.customer_email || 'ROOT_AUTH'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-6 py-5 text-right font-black text-[11px] tracking-tighter">
                                        KSh {inv.total_kes.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="px-6 py-5 text-center">
                                        {getStatusBadge(inv.status)}
                                    </TableCell>
                                    <TableCell className="px-6 py-5 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="font-black text-[10px] tracking-tighter">{format(new Date(inv.created_at), 'MMM dd, yyyy')}</span>
                                            <span className="font-mono text-[9px] opacity-40 tracking-widest uppercase">REG_PROTOCOL</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-5 text-center">
                                        <Button variant="outline" size="sm" className="h-8 w-8 rounded-lg border-border/50 hover:bg-primary/10 transition-all active:scale-95 group-hover:border-primary/30">
                                            <Download className="h-3.5 w-3.5" />
                                        </Button>
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

