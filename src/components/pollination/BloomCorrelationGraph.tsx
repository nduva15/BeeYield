import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Line
} from 'recharts';

const data: any[] = [];

const BloomCorrelationGraph: React.FC = () => {
    return (
        <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorBloom" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1B9157" stopOpacity={0.12} />
                            <stop offset="95%" stopColor="#1B9157" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.04)" strokeDasharray="3 3" />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#999', fontWeight: 800, fontSize: 9 }}
                        dy={8}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#999', fontWeight: 800, fontSize: 9 }}
                        width={30}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: '12px',
                            border: '1px solid rgba(244,208,63,0.1)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                            padding: '8px 12px',
                            fontSize: '10px',
                            fontWeight: 800,
                            textTransform: 'uppercase' as const,
                            backgroundColor: '#fff'
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="bloom"
                        stroke="#1B9157"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorBloom)"
                        animationDuration={1000}
                    />
                    <Line
                        type="monotone"
                        dataKey="activity"
                        stroke="#F4D03F"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={{ r: 3, fill: '#fff', strokeWidth: 2, stroke: '#F4D03F' }}
                        activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default BloomCorrelationGraph;
