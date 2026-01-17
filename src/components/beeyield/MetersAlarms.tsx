import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Bell, Clock, Activity
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

const MetersAlarms: React.FC = () => {
    const [showBanner, setShowBanner] = useState(true);

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
            priorityColor: 'text-amber-600 border-amber-200 bg-amber-50',
            typeColor: 'bg-amber-100 text-amber-700'
        },
        {
            id: 3,
            title: 'No growth',
            location: 'Building B - basement',
            time: 'Yesterday 9:40 PM',
            priority: 'Medium',
            type: 'WARNING',
            notified: 'SMS',
            priorityColor: 'text-amber-600 border-amber-200 bg-amber-50',
            typeColor: 'bg-amber-100 text-amber-700'
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

    const chartData = [
        { name: 'Mon', responseTime: 2.5 },
        { name: 'Tue', responseTime: 3.2 },
        { name: 'Wed', responseTime: 1.8 },
        { name: 'Thu', responseTime: 4.5 },
        { name: 'Fri', responseTime: 2.1 },
        { name: 'Sat', responseTime: 1.5 },
        { name: 'Sun', responseTime: 1.2 },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* First Steps Banner */}
            {showBanner && (
                <Card className="bg-[#FFF8F0] dark:bg-[#2a2018] border-none shadow-sm relative overflow-hidden">
                    <CardContent className="p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div className="space-y-2">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">First steps</h2>
                                <p className="text-gray-600 dark:text-gray-400">Start here to set up your apiaries, devices, and measurements.</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700"
                                onClick={() => setShowBanner(false)}
                            >
                                Hide
                            </Button>
                        </div>

                        <div className="space-y-3">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quick Links</p>
                            <div className="flex flex-wrap gap-3">
                                {[
                                    "Add apiaries and hives",
                                    "My devices",
                                    "Measurement data",
                                    "Support Center",
                                    "BeeHUB Agro Intelligence",
                                    "Settings"
                                ].map((link) => (
                                    <Button key={link} variant="secondary" className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700 rounded-full text-sm">
                                        {link}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <h1 className="text-[2.5rem] font-bold text-[#0F172A] dark:text-white tracking-tight">Alarms & events</h1>

            {/* Top Notifications Section */}
            <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm overflow-hidden">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Bell className="w-5 h-5 text-gray-900 dark:text-white" fill="currentColor" />
                        <CardTitle className="text-lg font-bold">Top notifications from last 48h</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {alarms.map((alarm) => (
                            <div key={alarm.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-all cursor-pointer group">
                                <div className="space-y-1 mb-4 md:mb-0">
                                    <h4 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">{alarm.title}</h4>
                                    <p className="text-sm text-gray-500">{alarm.location} • {alarm.time}</p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="flex gap-3">
                                        <Badge variant="outline" className={`px-3 py-1 font-medium ${alarm.priorityColor}`}>
                                            {alarm.priority}
                                        </Badge>
                                        <Badge className={`px-3 py-1 font-bold items-center gap-1.5 ${alarm.typeColor} hover:${alarm.typeColor} border-none shadow-none`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${alarm.type === 'ALERT' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                                            {alarm.type}
                                        </Badge>
                                    </div>
                                    <span className="text-xs text-gray-400 font-medium whitespace-nowrap hidden md:inline-block">Notified: {alarm.notified}</span>
                                </div>
                            </div>
                        ))}
                        {/* Generate Alarm Report Placeholder Row */}
                        <div className="p-4 bg-gray-50/50 dark:bg-gray-900/20 text-center">
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-widest cursor-pointer hover:text-primary transition-colors">
                                View all notifications
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Response History Chart */}
                <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Response history</CardTitle>
                        <CardDescription>Quick view of response time and status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94A3B8', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94A3B8', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="responseTime" name="Avg Response (h)" radius={[4, 4, 0, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.responseTime > 3 ? '#F59E0B' : '#B48428'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 text-center">
                            <p className="text-sm text-gray-500">Average response time this week: <span className="font-bold text-gray-900 dark:text-white">2.4h</span></p>
                        </div>
                    </CardContent>
                </Card>

                {/* Responses List */}
                <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm h-full">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Responses</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:shadow-sm transition-shadow">
                            <div className="space-y-1">
                                <h4 className="font-bold text-gray-900 dark:text-white">Service ticket</h4>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Clock className="w-3.5 h-3.5" />
                                    Response time 2h
                                </div>
                            </div>
                            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-3 py-1">
                                Closed
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:shadow-sm transition-shadow">
                            <div className="space-y-1">
                                <h4 className="font-bold text-gray-900 dark:text-white">Admin follow-up</h4>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Activity className="w-3.5 h-3.5" />
                                    In progress
                                </div>
                            </div>
                            <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-none px-3 py-1">
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
