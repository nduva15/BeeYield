import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    ComposedChart
} from 'recharts';
import { TrendingUp, Activity, ArrowUpRight } from 'lucide-react';

const data = [
    { time: '06:00', weight: 42.1, velocity: 0.1 },
    { time: '08:00', weight: 42.2, velocity: 0.3 },
    { time: '10:00', weight: 42.4, velocity: 0.8 },
    { time: '12:00', weight: 42.8, velocity: 1.2 },
    { time: '14:00', weight: 43.1, velocity: 0.9 },
    { time: '16:00', weight: 43.3, velocity: 0.4 },
    { time: '18:00', weight: 43.4, velocity: 0.1 },
];

const WeightDynamicsChart: React.FC = () => {
    return (
        <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]">
            <CardHeader className="p-6 border-b-4 border-[#064e3b]/5 flex flex-row items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-[#10b981]" />
                        <CardTitle className="text-lg font-black text-[#064e3b] uppercase tracking-tighter italic">Weight Dynamics (dW/dt)</CardTitle>
                    </div>
                    <p className="text-[9px] font-black uppercase text-[#064e3b]/30 tracking-widest">Continuous Mass Influx Monitoring</p>
                </div>
                <Badge className="bg-[#064e3b] text-white rounded-none px-3 py-1 text-[9px] font-black italic">NECTAR FLOW: ACTIVE</Badge>
            </CardHeader>
            <CardContent className="p-6 h-[300px]">
                <ResponsiveContainer width="100%" height="100%" debounce={50}>
                    <ComposedChart data={data}>
                        <defs>
                            <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                            dataKey="time"
                            className="text-[9px] font-black uppercase"
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            yAxisId="weight"
                            domain={['dataMin - 0.5', 'dataMax + 0.5']}
                            className="text-[9px] font-bold"
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            yAxisId="velocity"
                            orientation="right"
                            hide
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '0px',
                                border: '3px solid #064e3b',
                                fontSize: '9px',
                                fontWeight: '900',
                                textTransform: 'uppercase'
                            }}
                        />
                        <Area
                            yAxisId="velocity"
                            type="monotone"
                            dataKey="velocity"
                            fill="url(#velocityGradient)"
                            stroke="none"
                        />
                        <Line
                            yAxisId="weight"
                            type="monotone"
                            dataKey="weight"
                            stroke="#064e3b"
                            strokeWidth={3}
                            dot={{ fill: '#064e3b', r: 3, strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 6, fill: '#10b981', stroke: '#064e3b', strokeWidth: 2 }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="p-4 bg-neutral-50 border-2 border-[#064e3b]/5">
                        <span className="text-[8px] font-black uppercase text-[#064e3b]/40 block mb-1">Influx Velocity</span>
                        <div className="flex items-center gap-2">
                            <ArrowUpRight className="w-3 h-3 text-[#10b981]" />
                            <span className="text-sm font-black text-[#064e3b]">+1.2 kg/day</span>
                        </div>
                    </div>
                    <div className="p-4 bg-neutral-50 border-2 border-[#064e3b]/5">
                        <span className="text-[8px] font-black uppercase text-[#064e3b]/40 block mb-1">Biological Yield</span>
                        <div className="flex items-center gap-2">
                            <Activity className="w-3 h-3 text-[#064e3b]" />
                            <span className="text-sm font-black text-[#064e3b]">Σ (dW/dt) = 14.2kg</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default WeightDynamicsChart;
