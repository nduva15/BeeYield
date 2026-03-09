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
import { Hexagon, ChevronDown, LogOut, Settings, Sun, Moon } from 'lucide-react';
import { NavItem } from './DashboardSidebar';
import { useTheme } from '@/contexts/ThemeContext';
import { beeyieldService, SensorAlert } from '@/services/beeyieldService';

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
    const [expandedFolders, setExpandedFolders] = React.useState<string[]>(['beeyield', 'data']);
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
                "fixed left-0 top-0 bottom-0 w-[280px] bg-white dark:bg-[#09090b] border-r border-slate-200/60 dark:border-white/5 z-40 hidden md:flex flex-col antialiased",
                className
            )}
        >
            {/* ── Brand Header ── */}
            <button
                onClick={() => onTabChange('home')}
                className="h-[88px] flex items-center px-8 border-b border-slate-200/60 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-all group w-full text-left"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 bg-amber-50 dark:bg-amber-900/20 rounded-xl group-hover:scale-110 transition-transform">
                        <img src="/logo.png" alt="BeeYield" className="w-7 h-7 object-contain" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">BeeYield</span>
                        <span className="text-[9px] font-black text-amber-600 uppercase tracking-[0.2em] mt-1">Industrial Registry</span>
                    </div>
                </div>
            </button>

            {/* ── Status Bar ── */}
            <div className="h-10 flex items-center justify-between px-8 bg-slate-50/50 dark:bg-white/5 border-b border-slate-200/60 dark:border-white/5">
                <span className="text-[9px] font-black uppercase text-slate-400 dark:text-white/20 tracking-widest">System Nodes</span>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[9px] font-black tracking-widest text-emerald-600 dark:text-emerald-400">ACTIVE</span>
                </div>
            </div>

            {/* ── Navigation ── */}
            <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
                <div className="space-y-1">
                    {navItems.filter(item => !item.hidden).map((item) => {
                        const isActive = activeTab === item.id;
                        const isFolder = item.hasSubmenu;
                        const isExpanded = expandedFolders.includes(item.id);

                        return (
                            <div key={item.id} className="w-full">
                                <button
                                    onClick={() => isFolder ? toggleFolder(item.id) : onTabChange(item.id)}
                                    className={cn(
                                        "w-full flex items-center justify-between h-12 px-4 transition-all duration-300 rounded-xl group relative",
                                        isActive
                                            ? "bg-amber-50 dark:bg-amber-900/10 text-amber-900 dark:text-amber-100 shadow-sm"
                                            : "text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                                    )}
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                            isActive ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "bg-transparent text-slate-400 dark:text-white/20 group-hover:text-amber-500"
                                        )}>
                                            <item.icon className="w-4 h-4" />
                                        </div>
                                        <span className={cn(
                                            "text-xs font-black uppercase tracking-widest",
                                            isActive ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-white/40 group-hover:text-slate-900 dark:group-hover:text-white"
                                        )}>
                                            {item.label}
                                        </span>
                                    </div>

                                    {isFolder && (
                                        <ChevronDown className={cn(
                                            "w-4 h-4 transition-transform duration-300",
                                            isActive ? "text-amber-600" : "text-slate-300 dark:text-white/10",
                                            isExpanded ? "rotate-180" : ""
                                        )} />
                                    )}
                                </button>

                                {/* Submenu */}
                                {isFolder && isExpanded && (
                                    <div className="mt-1 ml-4 pl-4 border-l-2 border-slate-100 dark:border-white/5 space-y-1 py-1">
                                        {item.submenuItems?.map((sub: any, idx: number) => {
                                            if ('title' in sub) {
                                                return (
                                                    <div key={idx} className="space-y-1">
                                                        <div className="px-4 pt-3 pb-1">
                                                            <span className="text-[9px] font-black text-slate-300 dark:text-white/10 uppercase tracking-widest">{sub.title}</span>
                                                        </div>
                                                        {sub.items.map((subItem: any) => (
                                                            <button
                                                                key={subItem.id}
                                                                onClick={() => onTabChange(subItem.id)}
                                                                className={cn(
                                                                    "w-full text-left h-10 px-4 text-xs font-bold uppercase tracking-wider rounded-lg transition-all",
                                                                    activeTab === subItem.id
                                                                        ? "text-amber-600 dark:text-amber-500 bg-amber-50/50 dark:bg-amber-900/10"
                                                                        : "text-slate-400 dark:text-white/30 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                                                                )}
                                                            >
                                                                {subItem.label}
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
                                                        "w-full text-left h-10 px-4 text-xs font-bold uppercase tracking-wider rounded-lg transition-all",
                                                        activeTab === sub.id
                                                            ? "text-amber-600 dark:text-amber-500 bg-amber-50/50 dark:bg-amber-900/10"
                                                            : "text-slate-400 dark:text-white/30 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                                                    )}
                                                >
                                                    {sub.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Footer ── */}
            <div className="p-4 border-t border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#09090b] space-y-1">
                {/* Theme Toggle Switch */}
                <button
                    onClick={() => setTheme(isDark ? 'light' : 'dark')}
                    className="w-full h-11 flex items-center justify-between px-4 text-slate-500 dark:text-white/40 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all"
                >
                    <div className="flex items-center gap-3">
                        {isDark ? <Moon className="w-4 h-4 text-amber-500" /> : <Sun className="w-4 h-4 text-amber-500" />}
                        <span className="text-[11px] font-black uppercase tracking-widest">
                            Appearance
                        </span>
                    </div>
                    <div className={cn(
                        "w-9 h-5 rounded-full p-1 transition-colors duration-500",
                        isDark ? "bg-amber-500" : "bg-slate-200"
                    )}>
                        <div className={cn(
                            "w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-500",
                            isDark ? "translate-x-4" : "translate-x-0"
                        )} />
                    </div>
                </button>

                <button
                    onClick={() => onTabChange('settings')}
                    className="w-full h-11 flex items-center gap-3 px-4 text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all"
                >
                    <Settings className="w-4 h-4" />
                    <span className="text-[11px] font-black uppercase tracking-widest">Settings</span>
                </button>
                <button
                    onClick={onLogout}
                    className="w-full h-11 flex items-center gap-3 px-4 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all group"
                >
                    <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-black uppercase tracking-widest">Sign Out</span>
                </button>
                <div className="pt-4 text-center">
                    <span className="text-[8px] font-black text-slate-300 dark:text-white/10 uppercase tracking-[0.5em]">© 2026 BEEYIELD</span>
                </div>
            </div>
        </div>
    );
};

export default GlassSidebar;
