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
import { Hexagon, ChevronDown, LogOut, Settings, Sun, Moon, Binary, Shield, Command, Terminal, Activity, Layers, Network, ShieldCheck, Zap, Dna, Microscope, Fingerprint, Lock, Radio } from 'lucide-react';
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
                "fixed left-0 top-0 bottom-0 w-[340px] bg-[#0A0A0A] border-r border-white/10 z-50 hidden md:flex flex-col antialiased shadow-[0_0_100px_rgba(0,0,0,1)] transition-all",
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
                        <div className="w-18 h-18 flex items-center justify-center flex-shrink-0 bg-[#FF6B00]/5 rounded-2xl group-hover:rotate-[360deg] transition-all duration-[1.5s] border border-[#FF6B00]/20 p-3 backdrop-blur-2xl">
                            <img src={Logo} alt="BeeYield" className="w-full h-full object-contain filter group-hover:brightness-150 transition-all opacity-80 group-hover:opacity-100" />
                        </div>
                        <div className="flex flex-col space-y-2">
                            <span className="text-3xl font-black text-white tracking-tighter uppercase leading-none group-hover:text-[#FF6B00] transition-colors">BeeYield <span className="text-[#FF6B00]">Ops</span></span>
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] animate-pulse" />
                                <span className="text-[9px] font-mono font-black text-[#FF6B00]/40 uppercase tracking-[0.4em] leading-none">v5.2.0_STABLE</span>
                            </div>
                        </div>
                    </div>
                </button>
            </div>

            {/* ── Operational Node Pulsar ── */}
            <div className="h-16 flex items-center justify-between px-10 bg-white/[0.02] border-b border-white/5 relative overflow-hidden">
                <div className="flex items-center gap-4 relative z-10">
                    <Terminal className="w-4 h-4 text-white/20" />
                    <span className="text-[9px] font-black uppercase text-white/20 tracking-[0.5em]">Uplink_Node</span>
                </div>
                <div className="flex items-center gap-4 bg-white/5 px-4 py-1.5 rounded-lg border border-white/10 relative z-10">
                    <div className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </div>
                    <span className="text-[9px] font-black tracking-[0.2em] text-white/60">NOMINAL</span>
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
                                        "w-full flex items-center justify-between h-16 px-6 transition-all rounded-xl group relative border border-transparent overflow-hidden",
                                        isActive
                                            ? "bg-white/10 text-white border-white/20 shadow-2xl"
                                            : "text-white/30 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <div className="flex items-center gap-6 relative z-10">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all border border-transparent",
                                            isActive
                                                ? "bg-[#FF6B00] text-[#000000] shadow-[0_0_20px_rgba(255,107,0,0.4)]"
                                                : "bg-white/5 group-hover:text-[#FF6B00] group-hover:border-[#FF6B00]/30"
                                        )}>
                                            <item.icon className={cn("w-5 h-5", isActive ? "text-[#000000]" : "opacity-30 group-hover:opacity-100")} />
                                        </div>
                                        <span className={cn(
                                            "text-[13px] font-black uppercase tracking-widest transition-all",
                                            isActive ? "text-white" : "text-white/20 group-hover:text-white"
                                        )}>
                                            {item.label}
                                        </span>
                                    </div>

                                    {isFolder && (
                                        <ChevronDown className={cn(
                                            "w-4 h-4 transition-all",
                                            isActive ? "text-[#FF6B00]" : "text-white/10 group-hover:text-[#FF6B00]/40",
                                            isExpanded ? "rotate-180" : ""
                                        )} />
                                    )}

                                    {isActive && (
                                        <div className="absolute inset-0 bg-[#FF6B00]/[0.05] pointer-events-none" />
                                    )}
                                </button>

                                {/* Industrial Sub-Hub Integration */}
                                <AnimatePresence mode="popLayout">
                                    {isFolder && isExpanded && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-2 ml-4 pl-6 border-l border-white/10 space-y-1 py-4 overflow-hidden"
                                        >

                                            {item.submenuItems?.map((sub: any, idx: number) => {
                                                if ('title' in sub) {
                                                    return (
                                                        <div key={idx} className="space-y-4 pt-6 first:pt-0">
                                                            <div className="flex items-center gap-4 px-6 mb-2 opacity-20">
                                                                <Microscope className="w-4 h-4 text-honey" />
                                                                <span className="text-[10px] font-black text-foreground uppercase tracking-[0.5em] italic">{sub.title}</span>
                                                            </div>
                                                            {sub.items.map((subItem: any) => (
                                                                <button
                                                                    key={subItem.id}
                                                                    onClick={() => onTabChange(subItem.id)}
                                                                    className={cn(
                                                                        "w-full text-left h-14 px-8 text-[12px] font-black uppercase tracking-widest italic rounded-2xl transition-all duration-700 flex items-center justify-between group/sub",
                                                                        activeTab === subItem.id
                                                                            ? "text-[#FF6B00] bg-[#FF6B00]/10 border border-[#FF6B00]/20 shadow-lg"
                                                                             : "text-white/20 hover:text-white hover:bg-white/5"
                                                                    )}
                                                                >
                                                                    <div className="flex items-center gap-6">
                                                                        <div className={cn("w-1.5 h-1.5 rounded-full transition-all", activeTab === subItem.id ? "bg-[#FF6B00] shadow-[0_0_10px_#FF6B00]" : "bg-white/10 group-hover/sub:bg-[#FF6B00]/60")} />
                                                                        {subItem.label.toUpperCase()}
                                                                    </div>
                                                                    {activeTab === subItem.id && <Radio className="w-3 h-3 text-[#FF6B00] animate-pulse" />}
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
                                                                ? "text-[#FF6B00] bg-[#FF6B00]/10 border border-[#FF6B00]/20 shadow-lg"
                                                                 : "text-white/20 hover:text-white hover:bg-white/5"
                                                        )}
                                                    >
                                                         <div className="flex items-center gap-6">
                                                             <div className={cn("w-1.5 h-1.5 rounded-full transition-all", activeTab === sub.id ? "bg-[#FF6B00] shadow-[0_0_10px_#FF6B00]" : "bg-white/10 group-hover/sub:bg-[#FF6B00]/60")} />
                                                             {sub.label.toUpperCase()}
                                                         </div>
                                                         {activeTab === sub.id && <Radio className="w-3 h-3 text-[#FF6B00] animate-pulse" />}
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
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover/theme:border-[#FF6B00]/40 transition-all">
                            {isDark ? <Moon className="w-4 h-4 text-white" /> : <Sun className="w-4 h-4 text-white" />}
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-[0.4em] group-hover/theme:text-[#FF6B00] transition-colors">
                            Dark_Link
                        </span>
                    </div>
                    <div className={cn(
                        "w-12 h-6 rounded-full p-1 transition-all shadow-inner relative z-10",
                        isDark ? "bg-[#FF6B00]" : "bg-white/10"
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
                        className="h-16 flex items-center justify-center gap-4 bg-white/5 text-white/20 hover:text-white hover:bg-[#FF6B00]/10 rounded-xl transition-all border border-white/5 hover:border-[#FF6B00]/40 group"
                    >
                        <Settings className="w-5 h-5 group-hover:rotate-180 transition-all group-hover:text-[#FF6B00]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">CONFIG</span>
                    </button>
                    <button
                        onClick={onLogout}
                        className="h-16 flex items-center justify-center gap-4 bg-white/5 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-white/5 hover:border-red-500/40 group"
                    >
                        <LogOut className="w-5 h-5 group-hover:-translate-x-2 transition-all" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">EXIT_OS</span>
                    </button>
                </div>

                <div className="pt-8 flex flex-col items-center gap-4 opacity-20 hover:opacity-100 transition-all cursor-default">
                    <div className="flex items-center gap-6 w-full">
                        <Lock className="w-3 h-3 text-[#FF6B00]" />
                        <div className="flex-1 h-px bg-white/10" />
                        <Fingerprint className="w-4 h-4 text-[#FF6B00]" />
                        <div className="flex-1 h-px bg-white/10" />
                        <ShieldCheck className="w-3 h-3 text-[#FF6B00]" />
                    </div>
                    <div className="space-y-1 text-center font-mono">
                        <span className="text-[9px] font-black text-white uppercase tracking-[0.3em] block">© MMXXVI BEEYIELD_OS</span>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
                .animate-shimmer { animation: shimmer 5s infinite linear; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 107, 0, 0.1); border-radius: 20px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 107, 0, 0.4); }
            `}</style>
        </div>
    );
};

export default GlassSidebar;
