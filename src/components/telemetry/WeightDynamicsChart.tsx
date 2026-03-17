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
import { TrendingUp, Activity } from 'lucide-react';

export type WeightDynamicsPoint = { time: string; weight: number; velocity: number };

const WeightDynamicsChart: React.FC<{ data?: WeightDynamicsPoint[] }> = ({ data }) => {
    const series = (data || []).filter((p) => p && Number.isFinite(p.weight) && Number.isFinite(p.velocity));
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
                {series.length >= 2 ? (
                    <ResponsiveContainer width="100%" height="100%" debounce={50}>
                        <ComposedChart data={series}>
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
                ) : (
                    <div className="h-full w-full flex items-center justify-center text-center">
                        <div className="space-y-1">
                            <p className="text-xs font-black uppercase text-[#064e3b]">No weight series yet</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#064e3b]/40">
                                Ingest weight readings to enable dynamics.
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default WeightDynamicsChart;
