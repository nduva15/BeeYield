import React from 'react';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Hexagon, ChevronDown, LogOut, Settings, Sun, Moon, Binary, Shield, Command, Terminal, Activity, Layers, Network, ShieldCheck, Zap, Dna, Microspectrum, Fingerprint, Lock, Radio } from 'lucide-react';
import { NavItem } from './DashboardSidebar';
import { useTheme } from '@/contexts/ThemeContext';
import { beeyieldService, SensorAlert } from '@/services/beeyieldService';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '@/assets/Logo.png';

interface GlassSidebarProps {
    className?: string;
    activeTab: string;
    onTabChange: (tab: string) => void;
    onLogout: () => void;
    navItems: NavItem[];
}

const GlassSidebar: React.FC<GlassSidebarProps> = ({
    className,
    activeTab,
    onTabChange,
    onLogout,
    navItems
}) => {
    const [expandedFolders, setExpandedFolders] = React.useState<string[]>(['beeyield', 'data', 'precision-pollination-folder', 'management-folder']);
    const { theme, setTheme } = useTheme();

    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const toggleFolder = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setExpandedFolders(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <div
            className={cn(
                "fixed left-0 top-0 bottom-0 w-[340px] bg-white/60 dark:bg-[#080808]/90 backdrop-blur-3xl border-r border-white/5 z-50 hidden md:flex flex-col antialiased shadow-[0_80px_150px_rgba(0,0,0,0.4)] transition-all duration-1000",
                className
            )}
        >
            {/* ── Cinematic Brand Cluster ── */}
            <div className="relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-full bg-honey/10 opacity-0 group-hover:opacity-100 transition-opacity duration-2000" />
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-honey/20 rounded-full blur-[80px] pointer-events-none group-hover:scale-150 transition-transform duration-[3000ms]" />

                <button
                    onClick={() => onTabChange('home')}
                    className="h-32 flex items-center px-10 border-b border-white/5 relative z-10 w-full text-left group"
                >
                    <div className="flex items-center gap-8">
                        <div className="w-18 h-18 flex items-center justify-center flex-shrink-0 bg-honey/15 rounded-[1.8rem] group-hover:rotate-[720deg] transition-all duration-[2000ms] border-2 border-honey/40 shadow-[0_20px_40px_rgba(251,191,36,0.3)] p-3 backdrop-blur-2xl">
                            <img src={Logo} alt="BeeYield" className="w-full h-full object-contain filter group-hover:brightness-150 group-hover:drop-shadow-[0_0_15px_rgba(251,191,36,1)] transition-all" />
                        </div>
                        <div className="flex flex-col space-y-2">
                            <span className="text-3xl font-black text-foreground tracking-tighter italic uppercase leading-none italic group-hover:text-honey transition-colors duration-1000">BeeYield <span className="text-honey">Hub</span></span>
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-honey animate-pulse" />
                                <span className="text-[10px] font-black text-honey/40 uppercase tracking-[0.6em] italic leading-none">Kernel_v5.2.0_STABLE</span>
                            </div>
                        </div>
                    </div>
                </button>
            </div>

            {/* ── Operational Node Pulsar ── */}
            <div className="h-16 flex items-center justify-between px-10 bg-black/10 dark:bg-white/[0.02] border-b border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-honey/[0.02] animate-shimmer" />
                <div className="flex items-center gap-4 relative z-10">
                    <Terminal className="w-4 h-4 text-foreground/20 animate-pulse" />
                    <span className="text-[10px] font-black uppercase text-foreground/20 tracking-[0.5em] italic">Federated_Nodes</span>
                </div>
                <div className="flex items-center gap-4 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20 shadow-4xl relative z-10 skew-x-[-15deg]">
                    <div className="relative flex h-2.5 w-2.5 skew-x-[15deg]">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </div>
                    <span className="text-[10px] font-black tracking-[0.3em] text-emerald-500 italic skew-x-[15deg]">ACTIVE_LINK</span>
                </div>
            </div>

            {/* ── High-Fidelity Navigation Skeleton ── */}
            <div className="flex-1 overflow-y-auto px-8 py-12 custom-scrollbar space-y-4">
                <div className="flex items-center gap-6 px-6 mb-10 opacity-20">
                    <span className="text-[11px] font-black text-foreground uppercase tracking-[0.8em] italic">System_Registry</span>
                    <div className="flex-1 h-px bg-foreground/40" />
                </div>

                <div className="space-y-4">
                    {navItems.filter(item => !item.hidden).map((item) => {
                        const isActive = activeTab === item.id;
                        const isFolder = item.hasSubmenu;
                        const isExpanded = expandedFolders.includes(item.id);

                        return (
                            <div key={item.id} className="w-full">
                                <button
                                    onClick={() => isFolder ? toggleFolder(item.id) : onTabChange(item.id)}
                                    className={cn(
                                        "w-full flex items-center justify-between h-18 px-6 transition-all duration-1000 rounded-[2.2rem] group relative border border-transparent overflow-hidden",
                                        isActive
                                            ? "bg-white dark:bg-white/10 text-foreground shadow-[0_45px_100px_-20px_rgba(0,0,0,0.3)] border-white/10"
                                            : "text-foreground/30 hover:text-foreground hover:bg-honey/15 dark:hover:bg-white/5"
                                    )}
                                >
                                    <div className="flex items-center gap-6 relative z-10">
                                        <div className={cn(
                                            "w-12 h-12 rounded-[1.2rem] flex items-center justify-center transition-all duration-1000 shadow-4xl border border-transparent",
                                            isActive
                                                ? "bg-honey text-black shadow-[0_15px_30px_rgba(251,191,36,0.5)] border-honey/40 rotate-12 scale-110"
                                                : "bg-black/5 dark:bg-white/5 group-hover:text-honey group-hover:border-honey/40 group-hover:scale-110"
                                        )}>
                                            <item.icon className={cn("w-6 h-6", isActive ? "text-black" : "opacity-30 group-hover:opacity-100 group-hover:scale-110 transition-transform")} />
                                        </div>
                                        <span className={cn(
                                            "text-[15px] font-black uppercase tracking-widest italic transition-all duration-1000",
                                            isActive ? "text-foreground group-hover:text-honey" : "text-foreground/30 group-hover:text-foreground"
                                        )}>
                                            {item.label}
                                        </span>
                                    </div>

                                    {isFolder && (
                                        <ChevronDown className={cn(
                                            "w-5 h-5 transition-all duration-1000 relative z-10",
                                            isActive ? "text-honey" : "text-foreground/10 group-hover:text-honey/40",
                                            isExpanded ? "rotate-180" : ""
                                        )} />
                                    )}

                                    {isActive && (
                                        <motion.div
                                            layoutId="sidebar-active-pill"
                                            className="absolute inset-0 bg-honey/[0.08] dark:bg-honey/[0.12] rounded-[2.2rem] border border-honey/20 pointer-events-none"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-honey/10 to-transparent animate-shimmer" />
                                        </motion.div>
                                    )}
                                </button>

                                {/* Industrial Sub-Hub Integration */}
                                <AnimatePresence mode="popLayout">
                                    {isFolder && isExpanded && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0, x: -20 }}
                                            animate={{ opacity: 1, height: 'auto', x: 0 }}
                                            exit={{ opacity: 0, height: 0, x: -20 }}
                                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                            className="mt-4 ml-12 pl-8 border-l-2 border-honey/20 space-y-2 py-6 overflow-hidden relative"
                                        >
                                            <div className="absolute top-0 left-0 bottom-0 w-[2px] bg-gradient-to-b from-honey via-honey/20 to-transparent opacity-40" />

                                            {item.submenuItems?.map((sub: any, idx: number) => {
                                                if ('title' in sub) {
                                                    return (
                                                        <div key={idx} className="space-y-4 pt-6 first:pt-0">
                                                            <div className="flex items-center gap-4 px-6 mb-2 opacity-20">
                                                                <Microspectrum className="w-4 h-4 text-honey" />
                                                                <span className="text-[10px] font-black text-foreground uppercase tracking-[0.5em] italic">{sub.title}</span>
                                                            </div>
                                                            {sub.items.map((subItem: any) => (
                                                                <button
                                                                    key={subItem.id}
                                                                    onClick={() => onTabChange(subItem.id)}
                                                                    className={cn(
                                                                        "w-full text-left h-14 px-8 text-[12px] font-black uppercase tracking-widest italic rounded-2xl transition-all duration-700 flex items-center justify-between group/sub",
                                                                        activeTab === subItem.id
                                                                            ? "text-honey bg-honey/15 border border-honey/30 shadow-4xl"
                                                                            : "text-foreground/20 hover:text-foreground hover:bg-white/40 dark:hover:bg-white/5"
                                                                    )}
                                                                >
                                                                    <div className="flex items-center gap-6">
                                                                        <div className={cn("w-2 h-2 rounded-full transition-all duration-1000", activeTab === subItem.id ? "bg-honey scale-150 shadow-[0_0_15px_rgba(251,191,36,1)]" : "bg-foreground/10 group-hover/sub:bg-honey/60")} />
                                                                        {subItem.label.toUpperCase()}
                                                                    </div>
                                                                    {activeTab === subItem.id && <Radio className="w-4 h-4 text-honey animate-pulse" />}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    );
                                                }
                                                return (
                                                    <button
                                                        key={sub.id}
                                                        onClick={() => onTabChange(sub.id)}
                                                        className={cn(
                                                            "w-full text-left h-14 px-8 text-[12px] font-black uppercase tracking-widest italic rounded-2xl transition-all duration-700 flex items-center justify-between group/sub",
                                                            activeTab === sub.id
                                                                ? "text-honey bg-honey/15 border border-honey/30 shadow-4xl"
                                                                : "text-foreground/20 hover:text-foreground hover:bg-white/40 dark:hover:bg-white/5"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-6">
                                                            <div className={cn("w-2 h-2 rounded-full transition-all duration-1000", activeTab === sub.id ? "bg-honey scale-150 shadow-[0_0_15px_rgba(251,191,36,1)]" : "bg-foreground/10 group-hover/sub:bg-honey/60")} />
                                                            {sub.label.toUpperCase()}
                                                        </div>
                                                        {activeTab === sub.id && <Radio className="w-4 h-4 text-honey animate-pulse" />}
                                                    </button>
                                                );
                                            })}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Industrial Command Control Footer ── */}
            <div className="p-10 border-t border-white/5 bg-black/10 dark:bg-[#080808]/60 backdrop-blur-3xl space-y-4">
                <button
                    onClick={() => setTheme(isDark ? 'light' : 'dark')}
                    className="w-full h-18 flex items-center justify-between px-8 bg-white/40 dark:bg-black/60 text-foreground/30 hover:text-foreground rounded-[1.8rem] transition-all duration-1000 border border-white/5 hover:border-honey/60 group/theme shadow-inner overflow-hidden relative"
                >
                    <div className="absolute inset-0 bg-honey/[0.02] animate-shimmer" />
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-honey/15 flex items-center justify-center border border-honey/30 shadow-4xl group-hover/theme:rotate-[360deg] transition-all duration-1000">
                            {isDark ? <Moon className="w-5 h-5 text-honey" /> : <Sun className="w-5 h-5 text-honey" />}
                        </div>
                        <span className="text-[12px] font-black uppercase tracking-[0.4em] italic group-hover/theme:text-honey transition-colors">
                            Neural_Link
                        </span>
                    </div>
                    <div className={cn(
                        "w-12 h-7 rounded-full p-1.5 transition-all duration-1000 shadow-inner relative z-10",
                        isDark ? "bg-honey shadow-[0_0_20px_rgba(251,191,36,0.3)]" : "bg-black/20"
                    )}>
                        <motion.div
                            layout
                            className="w-4 h-4 rounded-full bg-black shadow-4xl"
                            animate={{ x: isDark ? 20 : 0 }}
                            transition={{ type: "spring", stiffness: 600, damping: 40 }}
                        />
                    </div>
                </button>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => onTabChange('settings')}
                        className="h-18 flex items-center justify-center gap-5 bg-white/40 dark:bg-black/60 text-foreground/20 hover:text-foreground hover:bg-honey/15 rounded-[1.8rem] transition-all duration-1000 border border-white/5 hover:border-honey/60 group shadow-inner"
                    >
                        <Settings className="w-6 h-6 group-hover:rotate-[360deg] transition-all duration-[2000ms] group-hover:text-honey" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] italic">CONFIG</span>
                    </button>
                    <button
                        onClick={onLogout}
                        className="h-18 flex items-center justify-center gap-5 bg-white/40 dark:bg-black/60 text-foreground/20 hover:text-red-500 hover:bg-red-500/10 rounded-[1.8rem] transition-all duration-1000 border border-white/5 hover:border-red-500/40 group shadow-inner"
                    >
                        <LogOut className="w-6 h-6 group-hover:-translate-x-3 transition-all duration-700" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] italic">TERMINATE</span>
                    </button>
                </div>

                <div className="pt-10 flex flex-col items-center gap-6 opacity-15 hover:opacity-100 transition-all duration-1000 group/footer cursor-default">
                    <div className="flex items-center gap-6 w-full">
                        <Lock className="w-4 h-4 text-honey group-hover/footer:rotate-12 transition-transform" />
                        <div className="flex-1 h-px bg-foreground/40 group-hover/footer:bg-honey transition-colors" />
                        <Fingerprint className="w-5 h-5 text-honey group-hover/footer:scale-125 transition-transform" />
                        <div className="flex-1 h-px bg-foreground/40 group-hover/footer:bg-honey transition-colors" />
                        <ShieldCheck className="w-4 h-4 text-honey group-hover/footer:-rotate-12 transition-transform" />
                    </div>
                    <div className="space-y-1 text-center">
                        <span className="text-[10px] font-black text-foreground uppercase tracking-[0.5em] italic block group-hover/footer:text-honey transition-colors">© MMXXVI BEEYIELD_AI_SYSTEMS</span>
                        <span className="text-[8px] font-bold text-foreground/40 uppercase tracking-[1em] block">SECURE_LEDGER_ACTIVE</span>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
                .animate-shimmer { animation: shimmer 5s infinite linear; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(251, 191, 36, 0.05); border-radius: 20px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(251, 191, 36, 0.2); }
            `}</style>
        </div>
    );
};

export default GlassSidebar;
