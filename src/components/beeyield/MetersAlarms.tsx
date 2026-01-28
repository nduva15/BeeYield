import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Bell, Clock, Activity
} from 'lucide-react';

const MetersAlarms: React.FC = () => {
    const alarms = [
        {
            id: 1,
            title: 'Long-lasting leak',
            location: 'Building A - Frame 2',
            time: 'Today 08:12',
            priority: 'High',
            type: 'ALERT',
            notified: 'SMS + Email',
            priorityColor: 'text-red-600 border-red-200 bg-red-50',
            typeColor: 'bg-red-100 text-red-700'
        },
        {
            id: 2,
            title: 'Sudden use of spike',
            location: 'Building C - Premises 12',
            time: 'Yesterday 18:05',
            priority: 'Medium',
            type: 'WARNING',
            notified: 'Email',
            priorityColor: 'text-[#F4D03F] border-[#F4D03F]/20 bg-[#F4D03F]/5',
            typeColor: 'bg-[#F4D03F]/20 text-[#D4AF37]'
        },
        {
            id: 3,
            title: 'No growth',
            location: 'Building B - basement',
            time: 'Yesterday 9:40 PM',
            priority: 'Medium',
            type: 'WARNING',
            notified: 'SMS',
            priorityColor: 'text-[#F4D03F] border-[#F4D03F]/20 bg-[#F4D03F]/5',
            typeColor: 'bg-[#F4D03F]/20 text-[#D4AF37]'
        },
        {
            id: 4,
            title: 'No communication',
            location: 'Building D - garage',
            time: 'Yesterday 13:22',
            priority: 'High',
            type: 'ALERT',
            notified: 'Push',
            priorityColor: 'text-red-600 border-red-200 bg-red-50',
            typeColor: 'bg-red-100 text-red-700'
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">


            <h1 className="text-[2.5rem] font-bold text-[#1B9157] dark:text-[#F4D03F] tracking-tight">Alarms & events</h1>

            {/* Top Notifications Section */}
            <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm overflow-hidden border-t-4 border-t-[#F4D03F]">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Bell className="w-5 h-5 text-[#1B9157] dark:text-[#F4D03F]" fill="currentColor" />
                        <CardTitle className="text-lg font-bold text-[#1B9157] dark:text-[#F4D03F]">Top notifications from last 48h</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {alarms.map((alarm) => (
                            <div key={alarm.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-[#F4D03F]/5 dark:hover:bg-[#F4D03F]/10 transition-all cursor-pointer group">
                                <div className="space-y-1 mb-4 md:mb-0">
                                    <h4 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-[#1B9157] dark:group-hover:text-[#F4D03F] transition-colors">{alarm.title}</h4>
                                    <p className="text-sm text-gray-500">{alarm.location} • {alarm.time}</p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="flex gap-3">
                                        <Badge variant="outline" className={`px-3 py-1 font-bold ${alarm.priorityColor}`}>
                                            {alarm.priority}
                                        </Badge>
                                        <Badge className={`px-3 py-1 font-bold items-center gap-1.5 ${alarm.typeColor} hover:${alarm.typeColor} border-none shadow-none`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${alarm.type === 'ALERT' ? 'bg-red-500' : 'bg-[#F4D03F]'}`}></div>
                                            {alarm.type}
                                        </Badge>
                                    </div>
                                    <span className="text-xs text-gray-400 font-medium whitespace-nowrap hidden md:inline-block">Notified: {alarm.notified}</span>
                                </div>
                            </div>
                        ))}
                        {/* Generate Alarm Report Placeholder Row */}
                        <div className="p-4 bg-gray-50/50 dark:bg-gray-900/20 text-center">
                            <span className="text-xs font-bold text-[#1B9157] hover:text-[#1B9157]/80 uppercase tracking-widest cursor-pointer transition-colors">
                                View all notifications
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Response History Chart */}
                <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm border-t-2 border-t-[#1B9157]/10">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-[#1B9157]">Response history</CardTitle>
                        <CardDescription>Quick view of response time and status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px] w-full border border-dashed border-[#F4D03F]/30 dark:border-[#F4D03F]/10 rounded-xl flex items-center justify-center bg-[#F4D03F]/5">
                            <span className="text-[#7a6820] dark:text-[#F4D03F] font-bold">Timeline alarm</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Responses List */}
                <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm h-full border-t-2 border-t-[#1B9157]/10">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-[#1B9157]">Responses</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:shadow-sm transition-shadow hover:border-[#1B9157]/30">
                            <div className="space-y-1">
                                <h4 className="font-bold text-gray-900 dark:text-white">Service ticket</h4>
                                <div className="flex items-center gap-2 text-sm text-[#1B9157]">
                                    <Clock className="w-3.5 h-3.5" />
                                    Response time 2h
                                </div>
                            </div>
                            <Badge variant="outline" className="text-[#1B9157] border-[#1B9157]/20 bg-[#1B9157]/5 px-3 py-1 font-bold">
                                Closed
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:shadow-sm transition-shadow hover:border-[#F4D03F]/30">
                            <div className="space-y-1">
                                <h4 className="font-bold text-gray-900 dark:text-white">Admin follow-up</h4>
                                <div className="flex items-center gap-2 text-sm text-[#7a6820] dark:text-[#F4D03F]">
                                    <Activity className="w-3.5 h-3.5" />
                                    In progress
                                </div>
                            </div>
                            <Badge variant="outline" className="text-[#7a6820] dark:text-[#F4D03F] border-[#F4D03F]/20 bg-[#F4D03F]/5 px-3 py-1 font-bold">
                                Pending
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default MetersAlarms;
