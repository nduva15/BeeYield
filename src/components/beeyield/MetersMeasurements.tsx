import React from 'react';
import { cn } from '@/lib/utils';
import FirstStepsBanner from './FirstStepsBanner';
import ChartsView from './ChartsView';
import ConsumptionView from './ConsumptionView';
import ComparisonsView from './ComparisonsView';

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
                    <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-50 rounded-[1.5rem] border border-dashed border-slate-200 dark:border-slate-200">
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">File Import view under construction</p>
                    </div>
                );
            default:
                return <ChartsView />;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <h1 className="text-[2.5rem] font-bold text-[#091E42] dark:text-[#F4D03F] tracking-tight">Measurements & analysis</h1>

            {/* Navigation Tabs (Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {tabs.map((tab) => {
                    const isActive = activeSubTab === tab.id || (activeSubTab === 'meters-measurements' && tab.id === 'meters-charts');
                    return (
                        <div
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={cn(
                                "p-5 rounded-2xl border cursor-pointer transition-all duration-200",
                                isActive
                                    ? "bg-[#FFF9E5]/60 border-[#F4D03F] dark:bg-[#F4D03F]/10 dark:border-[#F4D03F]"
                                    : "bg-white dark:bg-slate-50 border-gray-100 dark:border-slate-200 hover:border-[#F4D03F]/50 hover:shadow-md"
                            )}
                        >
                            <h3 className={cn(
                                "font-bold text-base mb-0.5",
                                isActive ? "text-gray-900 dark:text-[#F4D03F]" : "text-gray-300 dark:text-gray-600"
                            )}>
                                {tab.label}
                            </h3>
                            <p className={cn(
                                "text-xs font-medium",
                                isActive ? "text-gray-600 dark:text-gray-300" : "text-gray-300 dark:text-gray-600 font-normal"
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
