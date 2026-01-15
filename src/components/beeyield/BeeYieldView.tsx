import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Box, Plus, MoreVertical, Thermometer, Droplets, Weight, Activity, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import FirstStepsBanner from './FirstStepsBanner';

interface BeeYieldViewProps {
    onTabChange: (tab: string) => void;
}

const BeeYieldView: React.FC<BeeYieldViewProps> = ({ onTabChange }) => {
    const hives = [
        { id: 1, name: 'Hive 01', type: 'Langstroth', status: 'Healthy', temp: '34.5°C', humidity: '55%', weight: '42.0kg', apiary: 'North Orchard' },
        { id: 2, name: 'Hive 02', type: 'Flow Hive', status: 'Warning', temp: '38.2°C', humidity: '62%', weight: '38.5kg', apiary: 'North Orchard' },
        { id: 3, name: 'Hive 03', type: 'Top Bar', status: 'Healthy', temp: '33.9°C', humidity: '52%', weight: '51.2kg', apiary: 'Backyard' },
        { id: 4, name: 'Hive 04', type: 'Langstroth', status: 'Healthy', temp: '34.1°C', humidity: '54%', weight: '45.8kg', apiary: 'River Side' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            <FirstStepsBanner onTabChange={onTabChange} />

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-[2.5rem] font-bold text-[#0F172A] dark:text-white tracking-tight">BeeYield Hives</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Real-time monitoring and management of your BeeYield IoT environment.</p>
                </div>
                <Button className="bg-[#4ADE80] hover:bg-[#22c55e] text-black rounded-xl px-6 h-12 font-bold shadow-lg shadow-green-500/20 border-none">
                    <Plus className="w-5 h-5 mr-2" /> Add Component
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {hives.map((hive) => (
                    <Card key={hive.id} className="rounded-[2rem] border border-gray-100 dark:border-[#1e1e1e] bg-white dark:bg-[#09090b] shadow-sm hover:shadow-xl transition-all group">
                        <CardHeader className="p-6 pb-2">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-gray-50 dark:bg-[#1e1e1e] rounded-2xl flex items-center justify-center group-hover:bg-[#F8F2E4] dark:group-hover:bg-[#27272a] transition-colors">
                                    <Box className="w-6 h-6 text-[#B48428]" />
                                </div>
                                <div className="flex gap-2">
                                    <Badge className={cn(
                                        "rounded-full border-none px-2 py-0.5 text-[10px] uppercase font-bold tracking-tight",
                                        hive.status === 'Healthy' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                                    )}>
                                        {hive.status}
                                    </Badge>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-gray-400">
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            <CardTitle className="text-xl font-bold">{hive.name}</CardTitle>
                            <div className="flex items-center gap-1.5 text-gray-400 font-medium text-sm mt-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {hive.apiary}
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 pt-4 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Temperature</p>
                                    <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold">
                                        <Thermometer className="w-4 h-4 text-orange-400" /> {hive.temp}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Humidity</p>
                                    <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold">
                                        <Droplets className="w-4 h-4 text-blue-400" /> {hive.humidity}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Weight</p>
                                    <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold">
                                        <Weight className="w-4 h-4 text-emerald-400" /> {hive.weight}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Activity</p>
                                    <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold">
                                        <Activity className="w-4 h-4 text-blue-500" /> High
                                    </div>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full rounded-xl border-gray-100 dark:border-gray-800 text-sm font-bold h-10 hover:bg-gray-50 dark:hover:bg-[#1e1e1e] shadow-none">
                                View Full Analytics
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default BeeYieldView;
