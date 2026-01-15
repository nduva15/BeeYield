import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Receipt, CreditCard, Download, ExternalLink, ShieldCheck, History, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const BillingView: React.FC = () => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Billing</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your plan, payment methods, and invoice history.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Plan & Payment */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Active Plan */}
                    <Card className="rounded-[2.5rem] bg-gradient-to-br from-[#1e1e1e] to-black text-white border-none shadow-xl overflow-hidden relative">
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl opacity-50" />
                        <CardHeader className="p-10 pb-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <Badge className="bg-amber-500 text-white rounded-md mb-4 border-none font-bold text-[10px] tracking-widest uppercase">Active Plan</Badge>
                                    <h2 className="text-4xl font-black mb-2">BeeHUB Pro Monthly</h2>
                                    <p className="text-gray-400 font-medium italic">Unlimited devices, AI analytics, & Priority support.</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-5xl font-black text-amber-500">$49<span className="text-lg text-gray-400 font-medium">/mo</span></p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-10 pt-6">
                            <div className="flex flex-wrap gap-4 mt-4">
                                <Button className="bg-white text-black hover:bg-gray-100 rounded-2xl px-10 h-14 font-black text-lg shadow-lg">Change Plan</Button>
                                <Button variant="ghost" className="text-white hover:bg-white/10 rounded-2xl px-8 h-14 font-bold border border-white/20">Cancel Subscription</Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Methods */}
                    <Card className="rounded-[2.5rem] border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm p-10">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-bold flex items-center gap-3">
                                <CreditCard className="w-6 h-6 text-blue-500" />
                                Payment Methods
                            </h3>
                            <Button variant="outline" className="rounded-xl gap-2 border-gray-100 dark:border-gray-800 font-bold">
                                <Plus className="w-4 h-4" /> Add Method
                            </Button>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-6 rounded-3xl bg-gray-50 dark:bg-[#1e1e1e] border border-gray-100 dark:border-gray-800 group hover:border-blue-200 transition-colors">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-10 bg-white dark:bg-[#09090b] rounded-lg border border-gray-100 dark:border-gray-800 flex items-center justify-center font-bold text-blue-800 italic">VISA</div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">Visa ending in 4421</p>
                                        <p className="text-sm text-gray-400 font-medium">Expiry 12/26 • <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-[8px] uppercase font-black tracking-widest leading-none border-none">Default</Badge></p>
                                    </div>
                                </div>
                                <Button variant="ghost" className="text-gray-400 hover:text-gray-600 font-bold text-xs uppercase">Edit</Button>
                            </div>
                        </div>
                    </Card>

                    {/* Billing History */}
                    <Card className="rounded-[2.5rem] border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm overflow-hidden">
                        <div className="p-10 pb-0">
                            <h3 className="text-2xl font-bold flex items-center gap-3">
                                <History className="w-6 h-6 text-amber-500" />
                                Billing History
                            </h3>
                        </div>
                        <div className="p-10 pt-8 divide-y divide-gray-50 dark:divide-[#1e1e1e]">
                            {[
                                { id: 'INV-2026-001', date: 'Jan 14, 2026', amount: '$49.00', status: 'Paid' },
                                { id: 'INV-2025-012', date: 'Dec 14, 2025', amount: '$49.00', status: 'Paid' },
                                { id: 'INV-2025-011', date: 'Nov 14, 2025', amount: '$49.00', status: 'Paid' },
                            ].map((inv, i) => (
                                <div key={i} className="py-6 flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-50 dark:bg-[#1e1e1e] rounded-2xl flex items-center justify-center group-hover:bg-amber-50 transition-colors">
                                            <Receipt className="w-5 h-5 text-gray-400 group-hover:text-amber-500 transition-colors" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">{inv.id}</p>
                                            <p className="text-xs text-gray-400 font-medium">{inv.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900 dark:text-white">{inv.amount}</p>
                                            <span className="text-[10px] font-black uppercase text-green-500">{inv.status}</span>
                                        </div>
                                        <Button variant="ghost" size="icon" className="rounded-full">
                                            <Download className="w-5 h-5 text-gray-400 hover:text-[#B48428]" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Right: Summary & Support */}
                <div className="space-y-8">
                    <Card className="rounded-[2.5rem] border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm p-10">
                        <h3 className="text-xl font-bold mb-6">Summary</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-medium">Monthly Price</span>
                                <span className="text-gray-900 dark:text-white font-bold">$49.00</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-medium">VAT (0%)</span>
                                <span className="text-gray-900 dark:text-white font-bold">$0.00</span>
                            </div>
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between">
                                <span className="text-lg font-bold">Total</span>
                                <span className="text-lg font-black text-amber-500">$49.00</span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 font-medium mt-8 leading-relaxed">
                            Your next bill is due on February 14, 2026. Payments are processed automatically through your default method.
                        </p>
                    </Card>

                    <Card className="rounded-[2.5rem] bg-amber-50 dark:bg-amber-950/10 border-none p-10">
                        <ShieldCheck className="w-10 h-10 text-amber-500 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Secure Payments</h3>
                        <p className="text-sm text-amber-800 dark:text-amber-200 opacity-80 font-medium leading-relaxed">
                            All your payment data is encrypted and processed via Stripe. We do not store your full card details.
                        </p>
                        <Button variant="link" className="text-amber-600 font-bold p-0 h-auto mt-4 gap-2">
                            View Privacy Policy
                            <ExternalLink className="w-3 h-3" />
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default BillingView;
