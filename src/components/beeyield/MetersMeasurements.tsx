import React from 'react';
import { cn } from '@/lib/utils';
import FirstStepsBanner from './FirstStepsBanner';
import ChartsView from './ChartsView';
import ConsumptionView from './ConsumptionView';
import ComparisonsView from './ComparisonsView';
import { TrendingUp, Activity, BarChart3, Droplets, ArrowLeftRight, FileText, Calendar } from 'lucide-react';
import MetricCalendarView from './MetricCalendarView';
import { glass } from './GlassTheme';
import { BeeYieldPageHeader, BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';

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
            id: 'meters-heatmap',
            label: 'Density Map',
            subtext: 'metric grid view',
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
            case 'meters-measurements': 
                return <ChartsView />;
            case 'meters-consumption':
                return <ConsumptionView />;
            case 'meters-comparisons':
                return <ComparisonsView />;
            case 'meters-heatmap':
                return <MetricCalendarView />;
            case 'meters-import':
                return (
                    <div className={cn(glass.card, "flex flex-col items-center justify-center py-24 bg-muted/ backdrop-blur-xl border-border/ rounded-[2.5rem] shadow-xl")}>
                        <FileText className="w-10 h-10 text-gray-300 mb-4" />
                        <p className="text-muted-foreground font-black text-[9px]">Data sync interrupted</p>
                    </div>
                );
            default:
                return <ChartsView />;
        }
    };

    return (
        <BeeYieldPageShell className="p-0 md:p-0 -m-4 md:-m-6 space-y-0 pb-0">
        <div className={cn("p-8 -m-0 space-y-8 animate-in fade-in duration-500 pb-12 min-h-screen")}>
            <BeeYieldPageHeader
                icon={TrendingUp}
                label="Data Analysis"
                title={<>Sensor <span className="text-[#F4D03F]">Analytics</span></>}
                subtitle="Analyze your sensor data and find unusual activity"
            />

            {/* Navigation Tabs (Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {tabs.map((tab) => {
                    const isActive = activeSubTab === tab.id || (activeSubTab === 'meters-measurements' && tab.id === 'meters-charts');
                    const Icon = tab.id === 'meters-charts' ? BarChart3 : tab.id === 'meters-consumption' ? Droplets : tab.id === 'meters-comparisons' ? ArrowLeftRight : tab.id === 'meters-heatmap' ? Calendar : FileText;
                    
                    return (
                        <div
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={cn(
                                glass.card,
                                "p-5 cursor-pointer transition-all duration-300 relative overflow-hidden group rounded-[2rem]",
                                isActive
                                    ? "bg-muted/ border-border/ ring-2 ring-[#F4D03F]/30 shadow-2xl scale-[1.02]"
                                    : "bg-muted/ border-border/ hover:bg-muted/ hover:shadow-xl"
                            )}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className={cn(
                                    "w-8 h-8 rounded-xl flex items-center justify-center border transition-all",
                                    isActive ? "bg-[#F4D03F] border-[#F4D03F] text-white" : "bg-muted/ border-border/ text-muted-foreground/70 group-hover:text-foreground"
                                )}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <h3 className={cn(
                                    "font-black text-[11px] transition-colors",
                                    isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                                )}>
                                    {tab.label}
                                </h3>
                            </div>
                            <p className={cn(
                                "text-[9px] font-bold pl-11",
                                isActive ? "text-foreground/60" : "text-muted-foreground/70 opacity-60"
                            )}>
                                {tab.subtext}
                            </p>
                            {isActive && (
                                <div className="absolute top-0 right-0 w-16 h-16 bg-[#F4D03F]/5 rounded-full blur-2xl -mr-8 -mt-8" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Dynamic Content Area */}
            <div className="mt-8">
                {renderContent()}
            </div>
        </div>
        </BeeYieldPageShell>
    );
};

export default MetersMeasurements;

