import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle2, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const MetersAlarms: React.FC = () => {
    const alarms = [
        { id: 1, type: 'Leak Detected', location: 'Building A - Zone 2', time: 'Today, 08:12', severity: 'critical', status: 'active' },
        { id: 2, type: 'Tamper Attempt', location: 'Building C - Unit 12', time: 'Yesterday, 16:05', severity: 'critical', status: 'resolved' },
        { id: 3, type: 'Pressure Drop', location: 'Building A - Pump Room', time: 'Yesterday, 11:10', severity: 'warning', status: 'active' },
        { id: 4, type: 'No Communication', location: 'Building D - Elevator', time: 'Yesterday, 13:22', severity: 'warning', status: 'investigating' },
        { id: 5, type: 'High Temp Alert', location: 'Building B - Boiler', time: '2 days ago', severity: 'info', status: 'resolved' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-[2.5rem] font-bold text-[#0F172A] dark:text-white tracking-tight">Alarms & Events</h1>
                    <p className="text-gray-500 dark:text-gray-400">Monitor and manage critical system alerts.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Filter className="w-4 h-4" /> Filter
                    </Button>
                    <Button variant="default" className="bg-red-600 hover:bg-red-700 text-white gap-2">
                        <AlertTriangle className="w-4 h-4" /> Acknowledge All
                    </Button>
                </div>
            </div>

            <Card className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#09090b] shadow-sm">
                <CardHeader className="p-6 border-b border-gray-100 dark:border-gray-800">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input placeholder="Search alarms..." className="pl-9 bg-gray-50 dark:bg-gray-900 border-none" />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {alarms.map((alarm) => (
                            <div key={alarm.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center",
                                        alarm.severity === 'critical' ? "bg-red-100 text-red-600" :
                                            alarm.severity === 'warning' ? "bg-amber-100 text-amber-600" :
                                                "bg-blue-100 text-blue-600"
                                    )}>
                                        <AlertTriangle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white">{alarm.type}</h4>
                                        <p className="text-sm text-gray-500">{alarm.location} • {alarm.time}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Badge variant={alarm.status === 'active' ? 'destructive' : 'secondary'} className="uppercase text-[10px]">
                                        {alarm.status}
                                    </Badge>
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                        <CheckCircle2 className="w-4 h-4 text-gray-400" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default MetersAlarms;
