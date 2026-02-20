import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';

const data = [
    { date: '03.01', bloom: 10, activity: 5 },
    { date: '03.04', bloom: 15, activity: 8 },
    { date: '03.07', bloom: 25, activity: 12 },
    { date: '03.10', bloom: 45, activity: 20 },
    { date: '03.13', bloom: 72, activity: 65 },
    { date: '03.16', bloom: 85, activity: 92 },
    { date: '03.19', bloom: 95, activity: 98 },
    { date: '03.22', bloom: 80, activity: 85 },
    { date: '03.25', bloom: 50, activity: 40 },
];

const BloomCorrelationGraph: React.FC = () => {
    return (
        <div className="h-[400px] w-full bg-white">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorBloom" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#064e3b" strokeOpacity={0.05} strokeDasharray="3 3" />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#064e3b', fontWeight: 900, fontSize: 10 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#064e3b', fontWeight: 900, fontSize: 10 }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#064e3b',
                            border: '4px solid #10b981',
                            borderRadius: '0px',
                            padding: '12px'
                        }}
                        itemStyle={{ color: '#fff', fontWeight: 900, textTransform: 'uppercase', fontSize: '10px' }}
                        labelStyle={{ color: '#facc15', fontWeight: 900, marginBottom: '4px', fontSize: '12px' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="bloom"
                        stroke="#10b981"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorBloom)"
                        animationDuration={2000}
                    />
                    <Line
                        type="monotone"
                        dataKey="activity"
                        stroke="#064e3b"
                        strokeWidth={2}
                        strokeDasharray="8 8"
                        dot={{ r: 4, fill: '#064e3b', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default BloomCorrelationGraph;
