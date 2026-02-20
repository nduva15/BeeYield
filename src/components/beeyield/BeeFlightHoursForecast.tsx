import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    ReferenceLine
} from 'recharts';
import { Cloud, Sun, Wind, Thermometer, Zap, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BFHData {
    day: string;
    hours: number;
    temp: number;
    wind: number;
    uv: number;
    status: 'optimal' | 'moderate' | 'low';
}

const mockData: BFHData[] = [
    { day: 'MON', hours: 8.5, temp: 24, wind: 12, uv: 7, status: 'optimal' },
    { day: 'TUE', hours: 9.2, temp: 26, wind: 8, uv: 8, status: 'optimal' },
    { day: 'WED', hours: 4.0, temp: 18, wind: 25, uv: 3, status: 'low' },
    { day: 'THU', hours: 2.1, temp: 16, wind: 35, uv: 2, status: 'low' },
    { day: 'FRI', hours: 6.5, temp: 21, wind: 15, uv: 5, status: 'moderate' },
    { day: 'SAT', hours: 10.0, temp: 28, wind: 5, uv: 9, status: 'optimal' },
    { day: 'SUN', hours: 11.5, temp: 29, wind: 4, uv: 9, status: 'optimal' },
];

const CUSTOM_COLORS = {
    optimal: '#10b981', // Success Green
    moderate: '#facc15', // Warning Yellow
    low: '#94a3b8',      // Slate 400
};

const BeeFlightHoursForecast: React.FC = () => {
    // Detection for "Recovery Mode"
    // Detection for "Recovery Mode"
    const isRecoveryNeeded = mockData.slice(2, 4).every(d => d.status === 'low');

    return (
        <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[12px_12px_0px_0px_rgba(6,78,59,1)] overflow-hidden">
            <CardHeader className="border-b-4 border-[#064e3b] bg-white p-10">
                <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[#10b981] bg-[#064e3b]">
                            <Zap className="w-3.5 h-3.5 text-[#facc15]" />
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Efficiency Engine v1.0</span>
                        </div>
                        <CardTitle className="text-5xl font-black text-[#064e3b] tracking-tighter uppercase leading-none">
                            Bee Flight <span className="text-[#10b981]">Hours</span>
                        </CardTitle>
                        <p className="text-[10px] font-bold text-[#064e3b]/40 uppercase tracking-[0.4em]">7-Day Predictive Work Window</p>
                    </div>

                    {isRecoveryNeeded && (
                        <div className="animate-pulse flex items-center gap-4 bg-yellow-50 border-4 border-[#facc15] p-6 shadow-[6px_6px_0px_0px_rgba(250,204,21,1)]">
                            <AlertCircle className="w-8 h-8 text-[#064e3b]" />
                            <div>
                                <p className="text-xs font-black uppercase text-[#064e3b]">Recovery Mode Active</p>
                                <p className="text-[10px] font-bold text-[#064e3b]/60 uppercase">Target 120% Activity on Next Clear Window</p>
                            </div>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-10 space-y-12">
                {/* Metrics Bar */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="border-2 border-[#064e3b] p-6 bg-neutral-50">
                        <Thermometer className="w-5 h-5 mb-2 text-[#064e3b]" />
                        <p className="text-2xl font-black text-[#064e3b]">15°C+</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Min. Temp</p>
                    </div>
                    <div className="border-2 border-[#064e3b] p-6 bg-neutral-50">
                        <Wind className="w-5 h-5 mb-2 text-[#064e3b]" />
                        <p className="text-2xl font-black text-[#064e3b]">25km/h</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Max Wind</p>
                    </div>
                    <div className="border-2 border-[#064e3b] p-6 bg-neutral-50">
                        <Sun className="w-5 h-5 mb-2 text-[#064e3b]" />
                        <p className="text-2xl font-black text-[#064e3b]">High UV</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Flight Priority</p>
                    </div>
                    <div className="border-2 border-[#064e3b] p-6 bg-[#064e3b] text-white">
                        <Zap className="w-5 h-5 mb-2 text-[#facc15]" />
                        <p className="text-2xl font-black">62.5h</p>
                        <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Total Forecast</p>
                    </div>
                </div>

                {/* Main Forecast Chart */}
                <div className="h-[400px] w-full border-4 border-[#064e3b] p-8 bg-neutral-50 relative">
                    <div className="absolute top-4 right-8 flex gap-6 z-10">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#10b981]" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Optimal</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#facc15]" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Moderate</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-slate-400" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Low/No Flight</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
                        <BarChart data={mockData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#064e3b', fontWeight: 900, fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#064e3b', fontWeight: 900, fontSize: 12 }}
                                dx={-10}
                            />
                            <Tooltip
                                cursor={{ fill: '#facc15', opacity: 0.1 }}
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '4px solid #064e3b',
                                    borderRadius: '0px',
                                    boxShadow: '6px 6px 0px 0px rgba(6,78,59,1)'
                                }}
                                labelStyle={{ fontWeight: 900, color: '#064e3b', marginBottom: '8px' }}
                            />
                            <Bar
                                dataKey="hours"
                                radius={[4, 4, 0, 0]}
                                barSize={60}
                            >
                                {mockData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CUSTOM_COLORS[entry.status]} />
                                ))}
                            </Bar>
                            <ReferenceLine y={8} stroke="#064e3b" strokeDasharray="8 8" label={{
                                position: 'right',
                                value: 'OPTIMAL TARGET',
                                fill: '#064e3b',
                                fontWeight: 900,
                                fontSize: 10
                            }} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Legend/Info */}
                <div className="p-8 border-4 border-[#064e3b] bg-white flex items-start gap-6">
                    <div className="w-12 h-12 bg-[#facc15] border-4 border-[#064e3b] flex items-center justify-center shrink-0">
                        <Info className="w-6 h-6 text-[#064e3b]" />
                    </div>
                    <div>
                        <h4 className="text-xl font-black uppercase tracking-tighter mb-2">Calculating Workable Hours</h4>
                        <p className="text-xs font-bold text-gray-500 uppercase leading-relaxed max-w-3xl">
                            Our system uses micro-climate precision to predict when bees can physically leave the hive.
                            If the temperature drops below 15°C or wind speeds exceed 25km/h, flight hours are discounted.
                            High UV levels prioritize foraging efficiency.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default BeeFlightHoursForecast;
