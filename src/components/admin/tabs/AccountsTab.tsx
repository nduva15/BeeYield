
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminService, AccountRecord } from '@/services/adminService';
import { Loader2, Users, UserCheck, RefreshCw, Shield, UserPlus } from "lucide-react";
import { format } from 'date-fns';
import { glass, PageHeader, GlassStatCard } from '@/components/beeyield/GlassTheme';
import { cn } from '@/lib/utils';

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
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
            <PageHeader
                icon={Users}
                label="Identity"
                title="Account Registry"
                subtitle="Centralized directory of all registered entities and their verification status."
                actions={
                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-border/50 hover:bg-primary/10 transition-all active:scale-95" onClick={loadData}>
                        <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                    </Button>
                }
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <GlassStatCard
                    label="Registries"
                    value={stats?.total_accounts || 0}
                    icon={Users}
                />
                <GlassStatCard
                    label="Validated"
                    value={stats?.active_accounts || 0}
                    icon={UserCheck}
                    color="text-emerald-500"
                />
                <GlassStatCard
                    label="Customers"
                    value={stats?.by_type?.customer || 0}
                    icon={Shield}
                />
                <GlassStatCard
                    label="Stakeholders"
                    value={stats?.by_type?.farmer || 0}
                    icon={UserPlus}
                />
            </div>

            <div className={cn(glass.section, "p-0 overflow-hidden")}>
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-[#F4D03F]/10 bg-muted/20">
                            <TableHead className="py-4 px-6 font-black text-[10px] tracking-widest uppercase">Identity Email</TableHead>
                            <TableHead className="py-4 px-6 font-black text-[10px] tracking-widest uppercase">Legal Name</TableHead>
                            <TableHead className="py-4 px-6 font-black text-[10px] tracking-widest uppercase text-center">Entity Class</TableHead>
                            <TableHead className="py-4 px-6 font-black text-[10px] tracking-widest uppercase text-center">Security Status</TableHead>
                            <TableHead className="py-4 px-6 font-black text-[10px] tracking-widest uppercase text-right">Registration</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && accounts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="py-24 text-center">
                                    <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto opacity-50" />
                                    <p className="mt-4 font-black text-[10px] tracking-widest text-muted-foreground uppercase">Scanning user registry...</p>
                                </TableCell>
                            </TableRow>
                        ) : accounts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="py-24 text-center">
                                    <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                                        <Users className="h-8 w-8 text-muted-foreground/30" />
                                    </div>
                                    <p className="font-black text-[10px] tracking-widest text-muted-foreground uppercase">No identities found in registry</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            accounts.map((acc) => (
                                <TableRow key={acc.id} className="hover:bg-muted/10 transition-all border-b border-[#F4D03F]/10 group">
                                    <TableCell className="px-6 py-5">
                                        <span className="font-black text-[11px] tracking-tighter uppercase text-primary/80 truncate block max-w-[200px]">
                                            {acc.email}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-6 py-5">
                                        <span className="font-black text-[11px] tracking-tighter uppercase">
                                            {acc.first_name || 'NULL'} {acc.last_name || 'ID'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-6 py-5 text-center">
                                        <Badge variant="outline" className="font-black text-[8px] tracking-widest px-2 py-0.5 rounded-lg border-primary/20 bg-primary/5 text-primary uppercase">
                                            {acc.account_type || 'CUSTOMER'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-6 py-5 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className={cn("h-2 w-2 rounded-full", acc.is_active ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-muted-foreground/30")} />
                                            <span className="font-black text-[9px] uppercase tracking-widest opacity-60">
                                                {acc.verification_status?.replace('_', ' ') || 'UNVERIFIED'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-5 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="font-black text-[10px] tracking-tighter">{format(new Date(acc.created_at), 'MMM dd, yyyy')}</span>
                                            <span className="font-mono text-[9px] opacity-40 tracking-widest uppercase">REG_PROTOCOL</span>
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

