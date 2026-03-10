import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSettings } from '@/contexts/SettingsContext';
import { Sparkles, Terminal, Shield, ArrowRight, Zap, Info, Binary } from 'lucide-react';
import { motion } from 'framer-motion';
import { glass } from './GlassTheme';

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
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn(glass.card, "relative p-12 md:p-16 rounded-[4rem] border-white/5 bg-white/60 dark:bg-[#0D0D0D]/60 shadow-[0_60px_120px_-20px_rgba(0,0,0,0.3)] mb-16 overflow-hidden group")}
        >
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-honey/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-honey/15 transition-all duration-1000" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10 relative z-10">
                <div className="space-y-6">
                    <div className="flex items-center gap-6">
                        <div className="inline-flex items-center gap-3 px-6 py-2 bg-honey/10 text-honey rounded-full text-[10px] font-black uppercase tracking-[0.4em] border border-honey/20 shadow-2xl skew-x-[-12deg]">
                            <span className="skew-x-[12deg] flex items-center gap-3">
                                <Binary className="w-3.5 h-3.5" />
                                System Onboarding_v4.4_LIVE
                            </span>
                        </div>
                        <div className="flex items-center gap-3 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20 shadow-inner">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic font-mono">ENCRYPTION: ACTIVE</span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-7xl font-black text-foreground tracking-tighter uppercase italic leading-[0.85]">
                            Initialization <br />
                            <span className="text-honey">Phase</span>
                        </h2>
                        <p className="text-muted-foreground/40 text-xl font-medium italic border-l-4 border-honey/20 pl-10 max-w-2xl leading-relaxed">
                            BeeYield Core is standing by. Calibrate your industrial hive fleet, provision IoT nodes, and synchronize real-time telemetry datasets via the Kernel Relay.
                        </p>
                    </div>
                </div>
                <button
                    onClick={hideBanner}
                    className={cn(glass.btnSecondary, "h-18 px-12 rounded-[2.5rem] bg-white/40 dark:bg-black/40 text-muted-foreground hover:text-red-500 font-black uppercase text-xs tracking-widest shadow-3xl border border-white/10 transition-all hover:bg-red-500/5 flex items-center gap-4")}
                >
                    Dismiss Protocol <ArrowRight className="w-5 h-5 opacity-40 group-hover:translate-x-2 transition-transform" />
                </button>
            </div>

            <div className="mt-14 relative z-10 pt-10 border-t border-white/5">
                <p className="text-[11px] font-black text-muted-foreground/30 uppercase tracking-[0.5em] mb-10 italic">Strategic Access Nodes</p>
                <div className="flex flex-wrap gap-6">
                    {[
                        { label: 'Asset Management', tab: 'places', icon: Shield, color: 'honey' },
                        { label: 'IoT Infrastructure', tab: 'devices', icon: Zap, color: 'emerald-500' },
                        { label: 'Master Telemetry', tab: 'data', icon: Terminal, color: 'blue-500' },
                        { label: 'Support Matrix', tab: 'support', icon: Info, color: 'orange-500' },
                        { label: 'AI Intelligence', tab: 'agro-intelligence', icon: Sparkles, color: 'purple-500' },
                        { label: 'System Config', tab: 'settings', icon: Binary, color: 'neutral-400' },
                    ].map((link) => (
                        <button
                            key={link.tab}
                            onClick={() => onTabChange(link.tab)}
                            className={cn(
                                "group relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-black/40 border border-white/5 hover:border-honey/40 text-foreground shadow-3xl px-10 h-18 transition-all hover:scale-[1.05] active:scale-95 flex items-center gap-6",
                            )}
                        >
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 bg-black/5 dark:bg-white/5 border border-white/10 group-hover:border-honey/40")}>
                                <link.icon className={cn("w-5 h-5 group-hover:text-honey text-muted-foreground/30 transition-colors")} />
                            </div>
                            <span className="text-[13px] font-black uppercase tracking-widest italic">{link.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default FirstStepsBanner;
