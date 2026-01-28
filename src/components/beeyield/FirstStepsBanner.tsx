import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';

interface FirstStepsBannerProps {
    onTabChange: (tab: string) => void;
}

const FirstStepsBanner: React.FC<FirstStepsBannerProps> = ({ onTabChange }) => {
    const { showGuides, setShowGuides } = useSettings();

    if (!showGuides) return null;

    const hideBanner = () => {
        setShowGuides(false);
    };

    return (
        <div className="relative bg-[#F4D03F]/10 dark:bg-[#F4D03F]/5 p-8 md:p-10 rounded-[2.5rem] border border-[#F4D03F]/20 dark:border-[#F4D03F]/10 mb-10 animate-in fade-in slide-in-from-top-4 duration-700 mx-2">
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <h2 className="text-[28px] font-[900] text-[#1B9157] dark:text-[#F4D03F] tracking-tight">First steps</h2>
                    <p className="text-slate-600 dark:text-slate-400 text-[16px] font-medium">
                        Start here to set up your apiaries, devices, and measurements.
                    </p>
                </div>
                <Button
                    variant="ghost"
                    onClick={hideBanner}
                    className="bg-white hover:bg-[#F4D03F]/20 text-[#1B9157] font-bold rounded-full px-8 h-12 shadow-sm border border-[#F4D03F]/20 transition-all active:scale-95"
                >
                    Hide
                </Button>
            </div>

            <div className="mt-8">
                <p className="text-[11px] font-[900] text-[#1B9157]/60 dark:text-[#F4D03F]/60 uppercase tracking-[0.2em] mb-4">QUICK LINKS</p>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => onTabChange('places')}
                        className="rounded-full bg-white dark:bg-zinc-900 border border-[#F4D03F]/10 hover:border-[#F4D03F]/40 hover:bg-[#F4D03F]/5 dark:hover:bg-zinc-800 text-slate-900 dark:text-white shadow-sm text-[13px] font-bold px-7 h-11 transition-all active:scale-95"
                    >
                        Add apiaries and hives
                    </button>
                    <button
                        onClick={() => onTabChange('devices')}
                        className="rounded-full bg-white dark:bg-zinc-900 border border-[#F4D03F]/10 hover:border-[#F4D03F]/40 hover:bg-[#F4D03F]/5 dark:hover:bg-zinc-800 text-slate-900 dark:text-white shadow-sm text-[13px] font-bold px-7 h-11 transition-all active:scale-95"
                    >
                        My devices
                    </button>
                    <button
                        onClick={() => onTabChange('data')}
                        className="rounded-full bg-white dark:bg-zinc-900 border border-[#F4D03F]/10 hover:border-[#F4D03F]/40 hover:bg-[#F4D03F]/5 dark:hover:bg-zinc-800 text-slate-900 dark:text-white shadow-sm text-[13px] font-bold px-7 h-11 transition-all active:scale-95"
                    >
                        Measurement data
                    </button>
                    <button
                        onClick={() => onTabChange('support')}
                        className="rounded-full bg-white dark:bg-zinc-900 border border-[#F4D03F]/10 hover:border-[#F4D03F]/40 hover:bg-[#F4D03F]/5 dark:hover:bg-zinc-800 text-slate-900 dark:text-white shadow-sm text-[13px] font-bold px-7 h-11 transition-all active:scale-95"
                    >
                        Support Center
                    </button>
                    <button
                        onClick={() => onTabChange('agro-intelligence')}
                        className="rounded-full bg-white dark:bg-zinc-900 border border-[#F4D03F]/10 hover:border-[#F4D03F]/40 hover:bg-[#F4D03F]/5 dark:hover:bg-zinc-800 text-slate-900 dark:text-white shadow-sm text-[13px] font-bold px-7 h-11 transition-all active:scale-95"
                    >
                        BeeHUB Agro Intelligence
                    </button>
                    <button
                        onClick={() => onTabChange('settings')}
                        className="rounded-full bg-white dark:bg-zinc-900 border border-[#F4D03F]/10 hover:border-[#F4D03F]/40 hover:bg-[#F4D03F]/5 dark:hover:bg-zinc-800 text-slate-900 dark:text-white shadow-sm text-[13px] font-bold px-7 h-11 transition-all active:scale-95"
                    >
                        Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FirstStepsBanner;
