import React from 'react';
import {
    Sprout,
    Calendar,
    Zap,
    Activity,
    TrendingUp,
    Plus,
    History,
    FileText,
    ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import OrchardStatus from '../pollination/OrchardStatus';
import BloomCorrelationGraph from '../pollination/BloomCorrelationGraph';
import HiveMetrics from '../pollination/HiveMetrics';
import BloomLogForm from '../pollination/BloomLogForm';

interface BloomTrackingViewProps {
    onTabChange: (tab: string, message?: string, action?: string) => void;
}

const BloomTrackingView: React.FC<BloomTrackingViewProps> = ({ onTabChange }) => {
    const [showLogForm, setShowLogForm] = React.useState(false);

    return (
        <div className="p-8 space-y-12 bg-white min-h-screen text-[#064e3b] antialiased">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b-4 border-[#064e3b] pb-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#facc15] border-4 border-[#064e3b] flex items-center justify-center">
                            <Sprout className="w-6 h-6 text-[#064e3b]" />
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter uppercase leading-[0.8]">
                            Bloom <span className="text-[#10b981]">Intelligence</span>
                        </h1>
                    </div>
                    <p className="text-[#10b981] font-black uppercase text-[10px] tracking-[0.4em] mt-4">
                        Phenological Analysis & Pollination Curves
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowLogForm(true)}
                        className="flex items-center gap-3 px-8 py-4 bg-[#064e3b] text-white border-2 border-[#064e3b] font-black uppercase text-xs tracking-widest hover:bg-[#10b981] transition-none shadow-[6px_6px_0px_0px_rgba(16,185,129,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                    >
                        <Plus className="w-4 h-4" />
                        Log Bloom Data
                    </button>
                </div>
            </div>

            {/* Hero Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8">
                    <OrchardStatus />
                </div>
                <div className="lg:col-span-4">
                    <HiveMetrics />
                </div>
            </div>

            {/* Technical Analysis Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b-4 border-[#064e3b] pb-4">
                    <div className="flex items-center gap-4">
                        <Activity className="w-6 h-6 text-[#10b981]" />
                        <h3 className="text-3xl font-black uppercase tracking-tighter">Pollination Correlation</h3>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#10b981]/20 border border-[#10b981]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#064e3b]/40">Bloom %</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-1 bg-[#10b981]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#064e3b]/40">Bee Activity</span>
                        </div>
                    </div>
                </div>

                <div className="border-4 border-[#064e3b] bg-white p-8 shadow-[8px_8px_0px_0px_rgba(6,78,59,1)]">
                    <BloomCorrelationGraph />
                </div>
            </div>

            {/* Bloom Logger Modal/Overlay */}
            {showLogForm && (
                <BloomLogForm onClose={() => setShowLogForm(false)} />
            )}
        </div>
    );
};

export default BloomTrackingView;
