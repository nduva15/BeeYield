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
        <div className="relative bg-[#fdf2e9] dark:bg-[#1a1614] p-10 rounded-[2.5rem] border border-[#fdecdb] dark:border-orange-950/10 mb-10 animate-in fade-in slide-in-from-top-4 duration-700 mx-2">
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <h2 className="text-[28px] font-[900] text-[#1e293b] dark:text-white tracking-tight">First steps</h2>
                    <p className="text-slate-500/80 dark:text-slate-400 text-[16px] font-medium">
                        Start here to set up your apiaries, devices, and measurements.
                    </p>
                </div>
                <Button
                    variant="ghost"
                    onClick={hideBanner}
                    className="bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-full px-6 h-10 shadow-sm border-none transition-all active:scale-95"
                >
                    Hide
                </Button>
            </div>

            <div className="mt-10">
                <p className="text-[11px] font-[900] text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] mb-5">QUICK LINKS</p>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => onTabChange('places')}
                        className="rounded-full bg-white dark:bg-zinc-900 border-none hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-900 dark:text-white shadow-sm text-[13px] font-bold px-7 h-12 transition-all active:scale-95"
                    >
                        Add apiaries and hives
                    </button>
                    <button
                        onClick={() => onTabChange('devices')}
                        className="rounded-full bg-white dark:bg-zinc-900 border-none hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-900 dark:text-white shadow-sm text-[13px] font-bold px-7 h-12 transition-all active:scale-95"
                    >
                        My devices
                    </button>
                    <button
                        onClick={() => onTabChange('data')}
                        className="rounded-full bg-white dark:bg-zinc-900 border-none hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-900 dark:text-white shadow-sm text-[13px] font-bold px-7 h-12 transition-all active:scale-95"
                    >
                        Measurement data
                    </button>
                    <button
                        onClick={() => onTabChange('support')}
                        className="rounded-full bg-white dark:bg-zinc-900 border-none hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-900 dark:text-white shadow-sm text-[13px] font-bold px-7 h-12 transition-all active:scale-95"
                    >
                        Support Center
                    </button>
                    <button
                        onClick={() => onTabChange('agro-intelligence')}
                        className="rounded-full bg-white dark:bg-zinc-900 border-none hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-900 dark:text-white shadow-sm text-[13px] font-bold px-7 h-12 transition-all active:scale-95"
                    >
                        BeeYield Intelligence
                    </button>
                    <button
                        onClick={() => onTabChange('settings')}
                        className="rounded-full bg-white dark:bg-zinc-900 border-none hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-900 dark:text-white shadow-sm text-[13px] font-bold px-7 h-12 transition-all active:scale-95"
                    >
                        Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FirstStepsBanner;
