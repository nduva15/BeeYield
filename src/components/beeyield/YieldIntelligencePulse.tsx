import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Zap, Activity, Brain, ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const YieldIntelligencePulse: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <Badge variant="outline" className="mb-2 border-[#10b981]/30 text-[#10b981] bg-[#10b981]/5 font-black uppercase tracking-[0.2em] text-[10px]">
                        Yield AI Pulse
                    </Badge>
                    <h3 className="text-2xl font-black text-[#064e3b] tracking-tighter uppercase">Predictive <span className="text-[#10b981]">Abundance</span></h3>
                </div>
                <div className="flex items-center gap-2 text-[#10b981] font-black text-sm">
                    <Activity className="w-4 h-4 animate-pulse" />
                    LIVE_FEED
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[6px_6px_0px_0px_rgba(16,185,129,1)] group hover:-translate-y-1 transition-all">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 bg-[#064e3b] flex items-center justify-center border-2 border-[#10b981]">
                                <Target className="w-5 h-5 text-[#facc15]" />
                            </div>
                            <span className="text-[10px] font-black text-[#10b981]">+12.4%</span>
                        </div>
                        <p className="text-[10px] font-black uppercase text-[#064e3b]/40 tracking-widest mb-1">Target Yield</p>
                        <h4 className="text-3xl font-black text-[#064e3b] tracking-tighter">1,250 KG</h4>
                        <div className="mt-4 h-1.5 w-full bg-neutral-100 border border-[#064e3b]/10 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '75%' }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-[#10b981]"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-none border-4 border-[#064e3b] bg-[#064e3b] shadow-[6px_6px_0px_0px_rgba(250,204,21,1)] group hover:-translate-y-1 transition-all">
                    <CardContent className="p-6 text-white text-dark">
                        <div className="flex justify-between items-start mb-4 text-[#facc15]">
                            <div className="w-10 h-10 bg-white flex items-center justify-center border-2 border-[#facc15]">
                                <Brain className="w-5 h-5 text-[#064e3b]" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">Optimized</span>
                        </div>
                        <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-1">Colony Vigor</p>
                        <h4 className="text-3xl font-black text-white tracking-tighter">94.2%</h4>
                        <div className="flex items-center gap-2 mt-4 text-[10px] font-black text-[#facc15] uppercase tracking-widest">
                            <Zap className="w-3 h-3" />
                            Peak Productivity Window Open
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-none border-4 border-[#064e3b] bg-white shadow-[6px_6px_0px_0px_rgba(6,78,59,0.1)] group hover:-translate-y-1 transition-all">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 bg-neutral-50 flex items-center justify-center border-2 border-[#064e3b]">
                                <TrendingUp className="w-5 h-5 text-[#064e3b]" />
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-[#064e3b]/20" />
                        </div>
                        <p className="text-[10px] font-black uppercase text-[#064e3b]/40 tracking-widest mb-1">Market Valuation</p>
                        <h4 className="text-3xl font-black text-[#064e3b] tracking-tighter">KES 2.2M</h4>
                        <p className="text-[8px] font-black text-[#10b981] uppercase tracking-[0.2em] mt-4">Calculated from 184 tracking nodes</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default YieldIntelligencePulse;
