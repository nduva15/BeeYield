import React from 'react';
import {
    FileBarChart,
    Terminal,
    Activity,
    ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PollinationReports: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#FFF9F0] text-[#064e3b] font-sans antialiased p-8 md:p-12">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Back Link */}
                <Link to="/precision-pollination" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#10b981] hover:text-[#064e3b] transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Overview
                </Link>

                {/* Header */}
                <div className="border-b-4 border-[#064e3b] pb-8">
                    <h1 className="text-6xl font-black uppercase tracking-tighter leading-none">
                        Site <span className="text-[#10b981]">Reports</span>
                    </h1>
                    <p className="text-[#064e3b]/40 font-black uppercase text-[10px] tracking-[0.4em] mt-4">
                        Enterprise Audit & Compliance // v2.4.0
                    </p>
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Bloom Report Card */}
                        <div className="border-4 border-[#064e3b] bg-[#FFF9F0] overflow-hidden group shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]">
                            <div className="bg-[#10b981] p-6 border-b-4 border-[#064e3b] flex justify-between items-center">
                                <h4 className="text-xl font-black text-[#1A1A1A] uppercase tracking-tight">Bloom Saturation Report</h4>
                                <Terminal className="w-5 h-5 text-[#1A1A1A]" />
                            </div>
                            <div className="p-10 space-y-8">
                                <div className="flex justify-between items-end border-b-2 border-neutral-100 pb-4">
                                    <span className="text-[10px] font-black uppercase text-neutral-400">Period Coverage</span>
                                    <span className="font-black text-lg">MAR 14 - MAR 28</span>
                                </div>
                                <div className="flex justify-between items-end border-b-2 border-neutral-100 pb-4">
                                    <span className="text-[10px] font-black uppercase text-neutral-400">Peak Saturation</span>
                                    <span className="font-black text-lg text-[#10b981]">92.4%</span>
                                </div>
                                <div className="flex justify-between items-end border-b-2 border-neutral-100 pb-4">
                                    <span className="text-[10px] font-black uppercase text-neutral-400">Foraging Overlap</span>
                                    <span className="font-black text-lg">88.1%</span>
                                </div>
                                <button className="w-full py-4 bg-[#064e3b] text-[#1A1A1A] font-black uppercase tracking-widest text-xs hover:bg-[#facc15] hover:text-[#1A1A1A] transition-none">
                                    Export Geodata (.CSV)
                                </button>
                            </div>
                        </div>

                        {/* Hive Performance Card */}
                        <div className="border-4 border-[#064e3b] bg-[#FFF9F0] overflow-hidden group shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]">
                            <div className="bg-[#facc15] p-6 border-b-4 border-[#064e3b] flex justify-between items-center">
                                <h4 className="text-xl font-black text-[#064e3b] uppercase tracking-tight">Hive Efficiency Audit</h4>
                                <Activity className="w-5 h-5 text-[#064e3b]" />
                            </div>
                            <div className="p-10 space-y-8">
                                <div className="flex justify-between items-end border-b-2 border-neutral-100 pb-4">
                                    <span className="text-[10px] font-black uppercase text-neutral-400">Audit Units</span>
                                    <span className="font-black text-lg">45 Nodes</span>
                                </div>
                                <div className="flex justify-between items-end border-b-2 border-neutral-100 pb-4">
                                    <span className="text-[10px] font-black uppercase text-neutral-400">Underperforming</span>
                                    <span className="font-black text-lg text-red-500">2 Units</span>
                                </div>
                                <div className="flex justify-between items-end border-b-2 border-neutral-100 pb-4">
                                    <span className="text-[10px] font-black uppercase text-neutral-400">Avg Colony Health</span>
                                    <span className="font-black text-lg text-[#10b981]">OPTIMAL</span>
                                </div>
                                <button className="w-full py-4 border-4 border-[#064e3b] text-[#064e3b] font-black uppercase tracking-widest text-xs hover:bg-[#064e3b] hover:text-[#1A1A1A] transition-none">
                                    Run Deep Diagnostic
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Historical Timeline */}
                    <div className="border-4 border-[#064e3b] p-8 bg-neutral-50 space-y-6">
                        <h3 className="text-xl font-black uppercase tracking-widest border-b-2 border-black pb-4">Recent Audit Logs</h3>
                        <div className="space-y-4 font-mono text-[10px] uppercase">
                            <div className="flex gap-10">
                                <span className="text-[#10b981] font-black">2026.03.14 09:42</span>
                                <span className="text-neutral-400">System Message</span>
                                <span className="font-bold">Automated bloom report generated for Sector 7G.</span>
                            </div>
                            <div className="flex gap-10">
                                <span className="text-[#10b981] font-black">2026.03.13 14:10</span>
                                <span className="text-neutral-400">System Message</span>
                                <span className="font-bold">Wait time for Node_Alpha exceeding threshold (Colony Activity Spike).</span>
                            </div>
                            <div className="flex gap-10">
                                <span className="text-red-500 font-black">2026.03.12 23:58</span>
                                <span className="text-neutral-400">Audit Alert</span>
                                <span className="font-bold">Manual override detected at Gate_Beta. Logging session.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PollinationReports;
