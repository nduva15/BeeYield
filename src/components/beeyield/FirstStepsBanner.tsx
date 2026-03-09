import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';
import { Sparkles, Terminal } from 'lucide-react';

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
        <div className="relative bg-amber-500/5 dark:bg-amber-500/10 p-10 md:p-12 rounded-[3.5rem] border border-amber-500/20 dark:border-amber-500/10 mb-12 animate-in fade-in slide-in-from-top-8 duration-700 mx-2 overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2.5 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
                        <Terminal className="w-3.5 h-3.5" />
                        System Onboarding Protocol
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
                        Initialization <span className="text-emerald-600">Phase</span>
                    </h2>
                    <p className="text-slate-500 dark:text-white/30 text-[15px] font-medium uppercase tracking-tight max-w-xl">
                        Calibrate your hive fleet, provision IoT nodes, and synchronize real-time telemetry datasets.
                    </p>
                </div>
                <Button
                    variant="ghost"
                    onClick={hideBanner}
                    className="h-14 px-10 rounded-2xl bg-white dark:bg-white/5 text-slate-400 hover:text-red-500 hover:bg-red-500/5 font-black uppercase text-[11px] tracking-widest shadow-sm border border-slate-100 dark:border-white/5 transition-all active:scale-95"
                >
                    Dismiss Protocol
                </Button>
            </div>

            <div className="mt-10 relative z-10">
                <p className="text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.4em] mb-6 italic">Strategic Entry Points</p>
                <div className="flex flex-wrap gap-4">
                    {[
                        { label: 'Asset Management', tab: 'places' },
                        { label: 'IoT Infrastructure', tab: 'devices' },
                        { label: 'Master Telemetry', tab: 'data' },
                        { label: 'Support Matrix', tab: 'support' },
                        { label: 'AI Intelligence', tab: 'agro-intelligence' },
                        { label: 'System Config', tab: 'settings' },
                    ].map((link) => (
                        <button
                            key={link.tab}
                            onClick={() => onTabChange(link.tab)}
                            className="rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-amber-500/50 hover:bg-amber-500/5 text-slate-900 dark:text-white shadow-sm text-[12px] font-black uppercase tracking-widest px-8 h-12 transition-all active:scale-95 hover:scale-[1.02]"
                        >
                            {link.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FirstStepsBanner;
