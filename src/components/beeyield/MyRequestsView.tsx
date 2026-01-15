import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Search, Plus, Filter, Info, MessageSquare, Phone, Mail, PlayCircle, ExternalLink, LifeBuoy } from 'lucide-react';
import { cn } from '@/lib/utils';

const MyRequestsView: React.FC = () => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Requests</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Track your BeeYield support tickets, device troubleshooting, and hardware requests.</p>
                </div>
                <Button className="bg-[#B48428] hover:bg-[#966b1d] text-white rounded-xl px-8 h-12 font-bold gap-2 border-none shadow-lg shadow-amber-500/20">
                    <Plus className="w-5 h-5" />
                    New Request
                </Button>
            </div>

            {/* Request Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Active Requests', value: 2, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                    { label: 'Resolved (30d)', value: 5, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
                    { label: 'Pending Hardware', value: 1, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                ].map((stat, i) => (
                    <Card key={i} className="rounded-3xl border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className="text-3xl font-black text-gray-900 dark:text-white">{stat.value}</p>
                            </div>
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bg)}>
                                <HelpCircle className={cn("w-6 h-6", stat.color)} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Requests List */}
            <Card className="rounded-[2.5rem] border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm overflow-hidden">
                <div className="bg-gray-50/50 dark:bg-[#1e1e1e]/20 p-8 border-b border-gray-100 dark:border-[#1e1e1e] flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="text-xl font-bold">Recent Requests</h3>
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search tickets..."
                                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#09090b] border border-gray-100 dark:border-gray-800 rounded-xl text-sm focus:ring-1 focus:ring-amber-500 outline-none"
                            />
                        </div>
                        <Button variant="outline" className="rounded-xl border-gray-100 dark:border-gray-800">
                            <Filter className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-white/5">
                    {[
                        { id: 'BY-9921', subject: 'BeeHUB Pro v3 Sensor Calibration', status: 'In Review', date: 'Jan 14, 2026', type: 'Technical' },
                        { id: 'BY-9805', subject: 'Additional HiveNode Hardware Request', status: 'Shipping', date: 'Jan 10, 2026', type: 'Hardware' },
                        { id: 'BY-9742', subject: 'Account Subscription Update', status: 'Resolved', date: 'Jan 05, 2026', type: 'Billing' },
                        { id: 'BY-9611', subject: 'Mobile App Sync Issue', status: 'Resolved', date: 'Dec 28, 2025', type: 'Technical' },
                    ].map(req => (
                        <div key={req.id} className="p-6 md:p-8 flex items-center gap-6 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all cursor-pointer group">
                            <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-amber-50 transition-colors">
                                <Info className="w-6 h-6 text-gray-400 group-hover:text-amber-500 transition-colors" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{req.id}</span>
                                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{req.type}</span>
                                </div>
                                <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-amber-600 transition-colors">{req.subject}</h4>
                            </div>
                            <div className="text-right">
                                <Badge className={cn(
                                    "rounded-md text-[10px] font-bold tracking-widest uppercase border-none mb-1",
                                    req.status === 'Resolved' ? "bg-green-100 text-green-700" : req.status === 'Shipping' ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                                )}>
                                    {req.status}
                                </Badge>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">{req.date}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-6 bg-gray-50/30 dark:bg-white/5 text-center">
                    <Button variant="ghost" className="text-amber-600 font-bold hover:bg-transparent">View All Requests History</Button>
                </div>
            </Card>
        </div>
    );
};

export default MyRequestsView;
