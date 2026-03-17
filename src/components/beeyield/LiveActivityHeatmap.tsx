import React from 'react';
import { Activity, Layers } from 'lucide-react';

interface LiveActivityHeatmapProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

const LiveActivityHeatmap: React.FC<LiveActivityHeatmapProps> = ({ onTabChange }) => {
    return (
        <div className="p-8 space-y-8 bg-[#FFF9F0] min-h-screen text-[#064e3b] antialiased">
            <div className="flex items-center gap-4 border-b-4 border-[#064e3b] pb-6">
                <div className="w-10 h-10 bg-[#064e3b] border-4 border-[#064e3b] flex items-center justify-center shadow-[4px_4px_0px_0px_#facc15]">
                    <Layers className="w-6 h-6 text-[#facc15]" />
                </div>
                <div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase leading-[0.9]">
                        PIP <span className="text-[#10b981]">Heatmap</span>
                    </h1>
                    <p className="text-[#10b981] font-black uppercase text-[10px] tracking-[0.4em]">
                        Live activity requires real field telemetry.
                    </p>
                </div>
            </div>

            <div className="border-4 border-[#064e3b] bg-white p-8 shadow-[10px_10px_0px_0px_#10b981]">
                <div className="flex items-center gap-3 mb-3">
                    <Activity className="w-5 h-5 text-[#10b981]" />
                    <h2 className="text-xl font-black uppercase tracking-tight">No live stream data</h2>
                </div>
                <p className="text-sm font-bold text-[#064e3b]/70 leading-relaxed max-w-3xl">
                    This page previously displayed simulated heatmaps and synthetic pollinator mix data. It now requires backend-provided
                    field activity telemetry. Connect devices and ingest measurements to enable this view.
                </p>
            </div>
        </div>
    );
};

export default LiveActivityHeatmap;
