import React from 'react';
import { Target, Activity, ShieldAlert, ArrowRight, Download, BarChart3, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { glass, PageHeader } from './GlassTheme';
import { motion } from 'framer-motion';

interface PredictiveSuccessEngineProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

// Simulated data correlating Bloom %, True Flight Hours, and Predicted Yield
const PREDICTION_DATA = [
    { day: 'D1', bloom: 5, flight: 2.2, yield: 400 },
    { day: 'D2', bloom: 15, flight: 4.8, yield: 650 },
    { day: 'D3', bloom: 35, flight: 8.4, yield: 1100 },
    { day: 'D4', bloom: 60, flight: 12.1, yield: 1750 },
    { day: 'D5', bloom: 85, flight: 14.2, yield: 2200 },
    { day: 'D6', bloom: 95, flight: 13.5, yield: 2180 },
];

const PredictiveSuccessEngine: React.FC<PredictiveSuccessEngineProps> = ({ onTabChange }) => {

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={glass.page}
        >
            <PageHeader
                icon={Target}
                label="Forecast"
                title={<>Harvest <span className="text-[#F4D03F]">Predictor</span></>}
                subtitle="High-fidelity yield forecasting based on activity telemetry."
                actions={
                    <div className={cn(glass.badge, "bg-[#1B9157]/5 text-[#1B9157] border-[#1B9157]/20 py-1.5")}>
                        <Activity className="w-3.5 h-3.5 mr-2" />
                        14.2 Visits/Min
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
                {/* Prediction Summary */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className={cn(glass.section, "p-6 flex flex-col items-center")}>
                        <div className="w-full flex items-center justify-between border-b border-[#F4D03F]/10 pb-4 mb-8">
                            <h3 className="text-sm font-bold text-[#1A1A1A]">Seasonal Output</h3>
                            <div className="w-8 h-8 rounded-lg bg-[#F4D03F]/5 border border-[#F4D03F]/20 flex items-center justify-center">
                                <BarChart3 className="w-4 h-4 text-[#F4D03F]" />
                            </div>
                        </div>

                        <div className="relative w-48 h-24 mb-8">
                            <div className="absolute inset-0 flex flex-col items-center justify-end">
                                <span className="text-4xl font-black text-[#1A1A1A] tabular-nums tracking-tighter">2,200</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">LBS / ACRE</span>
                            </div>
                            <svg className="w-full h-full" viewBox="0 0 100 50">
                                <path 
                                    d="M 10 45 A 35 35 0 0 1 90 45" 
                                    fill="none" 
                                    stroke="#F9F7F2" 
                                    strokeWidth="8" 
                                    strokeLinecap="round" 
                                />
                                <motion.path 
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 0.75 }}
                                    transition={{ duration: 2, ease: "easeOut" }}
                                    d="M 10 45 A 35 35 0 0 1 90 45" 
                                    fill="none" 
                                    stroke="#1B9157" 
                                    strokeWidth="8" 
                                    strokeLinecap="round" 
                                />
                            </svg>
                        </div>

                        <div className="grid grid-cols-2 gap-3 w-full">
                            <div className="p-3 rounded-xl bg-[#F9F7F2] border border-[#F4D03F]/10 text-center">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Accuracy</p>
                                <p className="text-sm font-bold text-[#1B9157]">± 5%</p>
                            </div>
                            <div className="p-3 rounded-xl bg-[#F9F7F2] border border-[#F4D03F]/10 text-center">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Growth</p>
                                <p className="text-sm font-bold text-[#1A1A1A]">+12%</p>
                            </div>
                        </div>
                    </div>

                    <div className={cn(glass.card, "p-5 bg-[#1B9157]/5 border-[#1B9157]/10 group")}>
                         <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-[#1B9157]/20 shadow-sm">
                                <ShieldAlert className="w-4 h-4 text-[#1B9157]" />
                            </div>
                            <h3 className="text-sm font-bold text-[#1A1A1A]">Performance Alpha</h3>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-relaxed border-l-2 border-[#1B9157]/30 pl-3">
                            Bees worked <span className="text-[#1A1A1A] font-bold">4 hours longer</span> than predicted by weather node.
                        </p>
                    </div>
                </div>

                {/* Growth Curve */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className={cn(glass.section, "overflow-hidden flex flex-col")}>
                        <div className="px-5 py-4 border-b border-[#F4D03F]/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#F4D03F]/5 border border-[#F4D03F]/20 flex items-center justify-center">
                                    <Activity className="w-4 h-4 text-[#F4D03F]" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-[#1A1A1A]">Efficiency Curve</h3>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest text-[9px]">Sensors vs Logic Node</p>
                                </div>
                            </div>
                        </div>

                        <div className="h-[340px] w-full p-6 relative bg-[#FFF9F0]">
                             <div className="absolute inset-0 opacity-[0.01] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #1A1A1A 1px, transparent 1px), linear-gradient(to bottom, #1A1A1A 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                             
                             <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={PREDICTION_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="yieldGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#F4D03F" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#F4D03F" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000008" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontWeight: 700, fontSize: 10 }} dy={10} />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ 
                                            backgroundColor: '#fff', 
                                            border: '1px solid #F4D03F30', 
                                            borderRadius: '12px', 
                                            padding: '12px',
                                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)'
                                        }}
                                        itemStyle={{
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            color: '#1A1A1A',
                                            textTransform: 'uppercase'
                                        }}
                                        labelStyle={{ display: 'none' }}
                                    />
                                    <Area type="monotone" dataKey="yield" fill="url(#yieldGrad)" stroke="#F4D03F" strokeWidth={3} animationDuration={2000} />
                                    <Line type="monotone" dataKey="flight" stroke="#1B9157" strokeWidth={2} dot={{ fill: '#fff', stroke: '#1B9157', strokeWidth: 2, r: 3 }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className={cn(glass.section, "p-0 overflow-hidden")}>
                        <div className="px-5 py-4 border-b border-[#F4D03F]/10 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-[#1A1A1A]">Success Nodes</h3>
                            <button className={cn(glass.btnSecondary, "h-8 px-3 text-[10px]")}>
                                <Download className="w-3.5 h-3.5 mr-2" />
                                Export Brief
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-[#F9F7F2]/50">
                                        <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Factor</th>
                                        <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Weight</th>
                                        <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Diagnostic</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F4D03F]/5">
                                    {[
                                        { name: 'Flower Visits', val: '14.2/min', weight: '45%', status: 'HIGH' },
                                        { name: 'Bee Activity', val: '92% Aligned', weight: '28%', status: 'NORMAL' },
                                        { name: 'Energy Levels', val: '1,280 J', weight: '15%', status: 'HIGH' },
                                    ].map((row, i) => (
                                        <tr key={i} className="hover:bg-[#F9F7F2] transition-colors">
                                            <td className="px-5 py-3">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-[#1A1A1A]">{row.name}</span>
                                                    <span className="text-[10px] text-gray-400">{row.val}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3 justify-center">
                                                    <div className="h-1.5 w-16 bg-[#F9F7F2] rounded-full overflow-hidden border border-[#F4D03F]/10">
                                                        <div className="h-full bg-[#1B9157]" style={{ width: row.weight }} />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-[#1A1A1A] tabular-nums">{row.weight}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <div className={cn(
                                                    "inline-flex px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest border",
                                                    row.status === 'HIGH' ? "bg-emerald-50 text-[#1B9157] border-emerald-100" : "bg-[#F4D03F]/10 text-[#1A1A1A] border-[#F4D03F]/20"
                                                )}>{row.status}</div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

        </motion.div>
    );
};

export default PredictiveSuccessEngine;
