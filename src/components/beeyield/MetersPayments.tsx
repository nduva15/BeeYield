import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, CreditCard, DollarSign, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

const MetersPayments: React.FC = () => {
    const transactions = [
        { id: 'INV-001', date: 'Jan 15, 2024', amount: '$450.00', status: 'paid', method: 'Auto-Pay' },
        { id: 'INV-002', date: 'Dec 15, 2023', amount: '$432.50', status: 'paid', method: 'Visa •••• 4242' },
        { id: 'INV-003', date: 'Nov 15, 2023', amount: '$460.20', status: 'paid', method: 'Visa •••• 4242' },
        { id: 'INV-004', date: 'Oct 15, 2023', amount: '$415.00', status: 'paid', method: 'Visa •••• 4242' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <h1 className="text-[2.5rem] font-bold text-[#0F172A] dark:text-white tracking-tight">Payments & Settlements</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gradient-to-br from-primary to-amber-600 text-white shadow-lg shadow-primary/20">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white/80">Current Balance</p>
                                <h3 className="text-2xl font-bold">$0.00</h3>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-6">
                            <Button className="flex-1 bg-white text-primary hover:bg-white/90 border-0">Pay Now</Button>
                            <Button variant="outline" className="flex-1 border-white/30 text-white hover:bg-white/10">History</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
                        <CardTitle className="text-lg font-bold">Recent Transactions</CardTitle>
                        <Button variant="ghost" size="sm" className="text-xs text-primary">View All</Button>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {transactions.map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                                            <CreditCard className="w-4 h-4 text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white">Invoice #{tx.id}</p>
                                            <p className="text-xs text-gray-500">{tx.date} • {tx.method}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900 dark:text-white">{tx.amount}</p>
                                        <Badge variant="outline" className="text-[10px] text-green-600 border-green-200 bg-green-50">
                                            {tx.status.toUpperCase()}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default MetersPayments;
