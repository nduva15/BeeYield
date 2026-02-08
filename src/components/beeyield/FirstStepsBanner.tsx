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
        <div className="relative bg-[#FF9100]/5 p-10 md:p-12 rounded-[2.5rem] border border-[#FF9100]/10 mb-10 animate-in fade-in slide-in-from-top-4 duration-700 mx-2 overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/[0.02] rounded-full -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-110" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                <div className="space-y-1">
                    <h2 className="text-[32px] font-black text-[#1B9157] tracking-tight leading-none italic">First steps</h2>
                    <p className="text-slate-500 text-[16px] font-medium max-w-lg">
                        Accelerate your ecosystem setup by linking hardware and defining your first apiary structure.
                    </p>
                </div>
                <Button
                    variant="ghost"
                    onClick={hideBanner}
                    className="bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-600 font-black rounded-2xl px-10 h-14 shadow-xl shadow-slate-200/50 border border-slate-100 transition-all active:scale-95 uppercase tracking-widest text-xs"
                >
                    Dismiss Guide
                </Button>
            </div>

            <div className="mt-10 relative z-10">
                <p className="text-[10px] font-black text-[#FF9100]/60 uppercase tracking-[0.2em] mb-5 ml-1">QUICK START MODULES</p>
                <div className="flex flex-wrap gap-3">
                    {[
                        { id: 'places', label: 'Define Apiaries' },
                        { id: 'devices', label: 'Provision Hardware' },
                        { id: 'data', label: 'Telemetry stream' },
                        { id: 'support', label: 'Support Center' },
                        { id: 'agro-intelligence', label: 'AI Intelligence' },
                        { id: 'settings', label: 'Global Settings' }
                    ].map((link) => (
                        <button
                            key={link.id}
                            onClick={() => onTabChange(link.id)}
                            className="rounded-xl bg-white border border-slate-100 hover:border-[#FF9100]/40 hover:bg-[#FF9100]/5 text-slate-700 shadow-sm text-[13px] font-black px-8 h-12 transition-all active:scale-[0.97] hover:shadow-lg hover:shadow-amber-500/5"
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
