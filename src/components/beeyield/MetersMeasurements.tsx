import React from 'react';
import { cn } from '@/lib/utils';
import FirstStepsBanner from './FirstStepsBanner';
import ChartsView from './ChartsView';
import ConsumptionView from './ConsumptionView';
import ComparisonsView from './ComparisonsView';
import { TrendingUp } from 'lucide-react';

interface MetersMeasurementsProps {
    onTabChange: (tab: string) => void;
    activeSubTab?: string;
}

const MetersMeasurements: React.FC<MetersMeasurementsProps> = ({ onTabChange, activeSubTab = 'meters-charts' }) => {
    const tabs = [
        {
            id: 'meters-charts',
            label: 'Charts',
            subtext: 'trend and anomalies',
        },
        {
            id: 'meters-consumption',
            label: 'Consumption',
            subtext: 'totals by medium',
        },
        {
            id: 'meters-comparisons',
            label: 'Comparisons',
            subtext: 'monitor vs meter',
        },
        {
            id: 'meters-import',
            label: 'File import',
            subtext: 'CSV / XLS',
        }
    ];

    const renderContent = () => {
        switch (activeSubTab) {
            case 'meters-charts':
            case 'meters-measurements': // Default / fallback
                return <ChartsView />;
            case 'meters-consumption':
                return <ConsumptionView />;
            case 'meters-comparisons':
                return <ComparisonsView />;
            case 'meters-import':
                return (
                    <div className="flex flex-col items-center justify-center py-24 bg-white border-4 border-dashed border-[#064e3b]/10 rounded-none">
                        <p className="text-[#064e3b]/30 font-black uppercase tracking-[0.2em] text-[10px]">Asynchronous Data Ingest Protocol: INTERRUPTED</p>
                    </div>
                );
            default:
                return <ChartsView />;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[#10b981] bg-[#064e3b] mb-4">
                    <TrendingUp className="w-3.5 h-3.5 text-[#facc15]" />
                    <span className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Signal & Load Analytics</span>
                </div>
                <h1 className="text-5xl font-black text-[#064e3b] tracking-tighter uppercase leading-none">Diagnostic <span className="text-[#10b981]">Engine</span></h1>
            </div>

            {/* Navigation Tabs (Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {tabs.map((tab) => {
                    const isActive = activeSubTab === tab.id || (activeSubTab === 'meters-measurements' && tab.id === 'meters-charts');
                    return (
                        <div
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={cn(
                                "p-6 rounded-none border-4 cursor-pointer transition-none",
                                isActive
                                    ? "bg-[#064e3b] border-[#064e3b] text-gray-900 shadow-[6px_6px_0px_0px_rgba(250,204,21,1)]"
                                    : "bg-white border-[#064e3b] text-[#064e3b] hover:bg-[#facc15]/5 hover:shadow-[4px_4px_0px_0px_rgba(6,78,59,1)]"
                            )}
                        >
                            <h3 className={cn(
                                "font-black text-sm uppercase tracking-tighter mb-1",
                                isActive ? "text-[#facc15]" : "text-[#064e3b]"
                            )}>
                                {tab.label}
                            </h3>
                            <p className={cn(
                                "text-[9px] font-black uppercase tracking-widest",
                                isActive ? "text-gray-600" : "text-[#064e3b]/30"
                            )}>
                                {tab.subtext}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Dynamic Content Area */}
            <div className="mt-8">
                {renderContent()}
            </div>
        </div>
    );
};

export default MetersMeasurements;
