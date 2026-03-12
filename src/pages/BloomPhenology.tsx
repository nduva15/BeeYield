import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Flower2,
    Calendar,
    LineChart as ChartIcon,
    ArrowRight,
    Search,
    Filter,
    CloudSun,
    Sprout,
    History
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { motion } from 'framer-motion';

const bloomData = [
    { stage: 'BBCH 51', intensity: 10, date: 'Mar 1' },
    { stage: 'BBCH 55', intensity: 35, date: 'Mar 5' },
    { stage: 'BBCH 60', intensity: 65, date: 'Mar 10' },
    { stage: 'BBCH 65', intensity: 95, date: 'Mar 15' },
    { stage: 'BBCH 67', intensity: 80, date: 'Mar 20' },
    { stage: 'BBCH 69', intensity: 40, date: 'Mar 25' },
];

const BloomPhenology: React.FC = () => {
    const [selectedOrchard, setSelectedOrchard] = React.useState('North Block Alpha');

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-[#064e3b] pb-10">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[#10b981] bg-[#064e3b]">
                        <Flower2 className="w-3.5 h-3.5 text-[#facc15]" />
                        <span className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Floral Phenology Engine</span>
                    </div>
                    <h1 className="text-6xl font-black text-[#064e3b] tracking-tighter uppercase leading-none">
                        Bloom <span className="text-[#10b981]">Synchronization</span>
                    </h1>
                    <p className="text-[#064e3b]/40 font-black text-sm uppercase tracking-widest mt-2 px-1">
                        BBCH Growth Stages · Pollination Window Tracking · Forage Opportunity Math
                    </p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="h-16 px-8 rounded-none border-4 border-[#064e3b] font-black uppercase tracking-widest text-xs">
                        <History className="w-4 h-4 mr-2" />
                        Historic Index
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* stage selection */}
                <Card className="lg:col-span-1 rounded-none border-4 border-[#064e3b] bg-white shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]">
                    <CardHeader className="p-8 border-b-4 border-[#064e3b]/5">
                        <CardTitle className="text-xl font-black text-[#064e3b] uppercase tracking-tighter">Current Growth Stage</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        <div className="text-center py-10 border-4 border-[#064e3b]/5 bg-neutral-50/50">
                            <span className="text-7xl font-black text-[#064e3b] italic">65</span>
                            <p className="text-[10px] font-black uppercase text-[#064e3b]/40 mt-2 tracking-widest">BBCH Scale: Full Bloom</p>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[9px] font-black uppercase text-[#064e3b]/40 tracking-widest block">Stage Progression Slider</label>
                            <div className="h-3 w-full bg-neutral-100 border-2 border-[#064e3b] relative">
                                <div className="absolute top-0 left-0 bottom-0 bg-[#10b981] w-[65%]" />
                                <div className="absolute top-[-4px] left-[65%] w-5 h-5 bg-[#facc15] border-2 border-[#064e3b] translate-x-[-10px]" />
                            </div>
                            <div className="flex justify-between text-[8px] font-black uppercase text-[#064e3b]/60">
                                <span>Bud (50)</span>
                                <span>Peak (65)</span>
                                <span>Fall (69)</span>
                            </div>
                        </div>

                        <div className="p-6 bg-[#064e3b] text-gray-900">
                            <div className="flex items-center gap-2 mb-2">
                                <Sprout className="w-4 h-4 text-[#10b981]" />
                                <span className="text-[10px] font-black uppercase">Optimization Notice</span>
                            </div>
                            <p className="text-[9px] font-bold leading-relaxed uppercase">
                                Current stage indicates peak nectar secretion. Deploy Grade A pallets immediately to maximize pollination ROI.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Intensity Chart */}
                <Card className="lg:col-span-2 rounded-none border-4 border-[#064e3b] bg-white shadow-[12px_12px_0px_0px_rgba(16,185,129,1)]">
                    <CardHeader className="p-8 border-b-4 border-[#064e3b]/5 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-black text-[#064e3b] uppercase tracking-tighter">Bloom Intensity Curve</CardTitle>
                            <p className="text-[10px] font-black uppercase text-[#064e3b]/30">Real-time flowering density over time</p>
                        </div>
                        <Badge className="bg-[#facc15] text-[#064e3b] rounded-none px-4 py-1 text-[10px] font-black">PEAK WINDOW: 4 DAYS REMAINING</Badge>
                    </CardHeader>
                    <CardContent className="p-8 h-[400px]">
                        <ResponsiveContainer width="100%" height="100%" debounce={50}>
                            <AreaChart data={bloomData}>
                                <defs>
                                    <linearGradient id="bloomGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="date"
                                    className="text-[10px] font-black uppercase"
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    hide
                                    domain={[0, 100]}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '0px',
                                        border: '4px solid #064e3b',
                                        fontSize: '10px',
                                        fontWeight: '900',
                                        textTransform: 'uppercase'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="intensity"
                                    stroke="#064e3b"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#bloomGradient)"
                                />
                                <ReferenceLine x="Mar 15" stroke="#facc15" strokeWidth={4} strokeDasharray="8 8" label={{ position: 'top', value: 'CURRENT', fill: '#064e3b', fontSize: 10, fontWeight: 900 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default BloomPhenology;
