import React, { useMemo } from 'react';
import { Calculator, Zap, Target, TrendingUp, Info, Activity, ShieldAlert, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
        <div className="p-8 space-y-12 bg-white min-h-screen text-[#064e3b] antialiased">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-[#064e3b] pb-8">
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-[#064e3b] border-4 border-[#064e3b] flex items-center justify-center shadow-[4px_4px_0px_0px_#facc15]">
                            <Cpu className="w-6 h-6 text-[#facc15]" />
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter uppercase leading-[0.8]">
                            Predictive <span className="text-[#10b981]">Success</span>
                        </h1>
                    </div>
                    <p className="text-[#10b981] font-black uppercase text-[10px] tracking-[0.4em]">
                        AI Prediction Engine · VPM Intensity · Bee Flight Hours (BFH)
                    </p>
                </div>

                <div className="flex bg-[#064e3b] border-4 border-[#064e3b] p-1 shadow-[4px_4px_0px_0px_#10b981]">
                    <div className="px-6 py-2 bg-white flex items-center gap-3">
                        <Activity className="w-4 h-4 text-[#10b981]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#064e3b]">Avg 14.2 VPM</span>
                        <div className="w-px h-4 bg-[#064e3b]/10 mx-2" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#10b981]">Optimal Coverage</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Predicted Yield Gauge */}
                <div className="border-4 border-[#064e3b] p-8 bg-white shadow-[10px_10px_0px_0px_#064e3b] flex flex-col items-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#064e3b]/40 mb-10 w-full">Final Harvest Forecast</p>
                    <div className="relative w-64 h-32 overflow-hidden mb-6">
                        {/* Semi-circular gauge */}
                        <div className="absolute inset-x-0 top-0 h-64 border-[16px] border-[#064e3b]/5 rounded-full" />
                        <div
                            className="absolute inset-x-0 top-0 h-64 border-[16px] border-[#10b981] rounded-full"
                            style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 50%, 0% 50%)', transform: 'rotate(55deg)' }}
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
                            <p className="text-4xl font-black text-[#064e3b]">2,200</p>
                            <p className="text-[8px] font-black uppercase tracking-widest text-[#064e3b]/40">lbs / acre</p>
                        </div>
                    </div>
                    <div className="flex gap-4 w-full">
                        <div className="flex-1 border-2 border-[#064e3b]/5 p-3 text-center">
                            <p className="text-[8px] font-black uppercase text-[#064e3b]/30">Model Confidence</p>
                            <p className="text-sm font-black text-[#10b981]">± 5.2%</p>
                        </div>
                        <div className="flex-1 border-2 border-[#064e3b]/5 p-3 text-center">
                            <p className="text-[8px] font-black uppercase text-[#064e3b]/30">Historical Delta</p>
                            <p className="text-sm font-black text-[#064e3b]">+12.4%</p>
                        </div>
                    </div>
                    <p className="mt-8 text-[9px] font-bold text-[#064e3b]/30 uppercase text-center leading-relaxed">
                        Based on current VPM intensity and bloom sync, our AI predicts a SOTA-level yield harvest.
                    </p>
                </div>

                {/* BFH Analysis Graph */}
                <div className="lg:col-span-2 border-4 border-[#064e3b] p-8 bg-white shadow-[10px_10px_0px_0px_#10b981]">
                    <div className="flex items-center justify-between mb-8 border-b-2 border-[#064e3b]/10 pb-4">
                        <div>
                            <h3 className="text-2xl font-black text-[#064e3b] tracking-tighter uppercase leading-none">True Flight <span className="text-[#10b981]">Hours</span></h3>
                            <p className="text-[9px] text-[#064e3b]/30 font-black uppercase tracking-[0.2em] mt-2">Sensor Data vs. Local Meteorological Station</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-[#10b981]" />
                                <span className="text-[8px] font-black uppercase tracking-widest">In-Field Sensors</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 border-2 border-[#064e3b]/20" />
                                <span className="text-[8px] font-black uppercase tracking-widest">Weather Station</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={PREDICTION_DATA}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#064e3b10" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#064e3b', fontSize: 10, fontWeight: 900 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#064e3b', fontSize: 10, fontWeight: 900 }} />
                                <Area type="monotone" dataKey="flight" fill="#10b98120" stroke="#10b981" strokeWidth={4} />
                                <Line type="step" dataKey="flight" stroke="#064e3b05" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-6 flex items-center gap-6 p-4 bg-[#064e3b]/5 border-2 border-[#10b981]/20">
                        <ShieldAlert className="w-10 h-10 text-[#10b981]" />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#064e3b]">Hidden Yield Opportunity Found</p>
                            <p className="text-[9px] font-bold text-[#064e3b]/50 leading-relaxed uppercase mt-1">
                                Bees migrated 4.2 hours more than local weather data predicted on D4. Acoustic sensors captured sustained flight even during low-temp cloud cover.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* VPM & Success Logic Table */}
            <div className="border-4 border-[#064e3b] overflow-hidden shadow-[12px_12px_0px_0px_rgba(6,78,59,1)]">
                <table className="w-full text-left">
                    <thead className="bg-[#064e3b]">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest">Predictive Component</th>
                            <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest">Live status</th>
                            <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest">AI weighting</th>
                            <th className="px-6 py-4 text-[10px] font-black text-white/40 uppercase tracking-widest">Success influence</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-[#064e3b]/5">
                        {[
                            { name: 'Flower Visit Intensity (VPM)', val: '14.2 visits/min', weight: '45.2%', status: 'HIGH' },
                            { name: 'Bloom-Flight Sync %', val: '92.4% Aligned', weight: '28.1%', status: 'NOMINAL' },
                            { name: 'Cumulative Flight Energy', val: '1,280 J/colony', weight: '15.5%', status: 'HIGH' },
                            { name: 'Species Redundancy Score', val: '0.84 (High Mix)', weight: '11.2%', status: 'STABLE' },
                        ].map((row, i) => (
                            <tr key={i} className="hover:bg-[#064e3b]/2 transition-none">
                                <td className="px-6 py-5 text-sm font-black text-[#064e3b] tracking-tight">{row.name}</td>
                                <td className="px-6 py-5 text-xs font-bold font-mono text-[#064e3b]/60">{row.val}</td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="h-1.5 w-16 bg-[#064e3b]/10 overflow-hidden">
                                            <div className="h-full bg-[#10b981]" style={{ width: row.weight }} />
                                        </div>
                                        <span className="text-[10px] font-black text-[#064e3b]">{row.weight}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className={cn(
                                        "px-3 py-1 text-[8px] font-black uppercase tracking-widest border-2 border-[#064e3b]",
                                        row.status === 'HIGH' ? "bg-[#10b981] text-white" : "bg-white text-[#064e3b]"
                                    )}>{row.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <button className="w-full py-8 border-8 border-[#064e3b] bg-white text-[#064e3b] font-black text-xl uppercase tracking-[0.4em] shadow-[12px_12px_00px_0px_#10b981] hover:bg-[#064e3b] hover:text-white transition-all group">
                Download <span className="text-[#10b981] group-hover:text-[#facc15]">Full Predictive Audit</span> (v2.0)
            </button>
        </div>
    );
};

export default PredictiveSuccessEngine;
