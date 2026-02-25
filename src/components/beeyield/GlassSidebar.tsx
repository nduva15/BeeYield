import React from 'react';
import { cn } from '@/lib/utils';
import { Hexagon, ChevronDown, LogOut, Settings, Zap } from 'lucide-react';
import { NavItem } from './DashboardSidebar';

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

    const toggleFolder = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setExpandedFolders(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <div
            className={cn(
                "fixed left-0 top-0 bottom-0 w-[280px] bg-[#000000] border-r border-[#1A1A1A] z-40 hidden md:flex flex-col antialiased",
                className
            )}
        >
            {/* ── Brand Header ── */}
            <button
                onClick={() => onTabChange('home')}
                className="h-[72px] flex items-center px-6 border-b border-[#1A1A1A] hover:bg-[#0D0D0D] transition-colors group w-full text-left"
            >
                <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 bg-[#F59E0B] flex items-center justify-center flex-shrink-0 group-hover:bg-[#FBBF24] transition-colors">
                        <Hexagon className="w-5 h-5 text-black fill-current" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[15px] font-black text-white uppercase tracking-tighter leading-none">BeeYield</span>
                        <span className="text-[9px] font-bold text-[#F59E0B] uppercase tracking-[0.25em] mt-0.5 font-mono">REGISTRY_V4</span>
                    </div>
                </div>
            </button>

            {/* ── Status Bar ── */}
            <div className="h-9 flex items-center justify-between px-6 border-b border-[#1A1A1A] bg-[#0A0A0A]">
                <span className="text-[8px] font-black uppercase text-white/20 tracking-[0.25em] font-mono">NODES</span>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-[8px] font-black tracking-widest text-emerald-400 font-mono">SYNC_OK</span>
                </div>
            </div>

            {/* ── Navigation ── */}
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                <div>
                    {navItems.filter(item => !item.hidden).map((item) => {
                        const isActive = activeTab === item.id;
                        const isFolder = item.hasSubmenu;
                        const isExpanded = expandedFolders.includes(item.id);

                        return (
                            <div key={item.id} className="w-full">
                                <button
                                    onClick={() => isFolder ? toggleFolder(item.id) : onTabChange(item.id)}
                                    className={cn(
                                        "w-full flex items-center justify-between h-14 px-6 transition-colors group relative",
                                        isActive
                                            ? "bg-[#111111] text-white"
                                            : "text-white/40 hover:text-white hover:bg-[#0D0D0D]"
                                    )}
                                >
                                    {/* Gold active indicator */}
                                    {isActive && (
                                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#F59E0B]" />
                                    )}

                                    <div className="flex items-center gap-3.5">
                                        <item.icon className={cn(
                                            "w-4 h-4 flex-shrink-0 transition-colors",
                                            isActive ? "text-[#F59E0B]" : "text-white/30 group-hover:text-white/70"
                                        )} />
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-[0.18em] font-mono",
                                            isActive ? "text-white" : "text-white/40 group-hover:text-white"
                                        )}>
                                            {item.label}
                                        </span>
                                    </div>

                                    {isFolder && (
                                        <ChevronDown className={cn(
                                            "w-3.5 h-3.5 transition-transform duration-200 flex-shrink-0",
                                            isActive ? "text-white/40" : "text-white/20",
                                            isExpanded ? "rotate-180" : ""
                                        )} />
                                    )}
                                </button>

                                {/* Submenu */}
                                {isFolder && isExpanded && (
                                    <div className="bg-[#080808] border-y border-[#1A1A1A]">
                                        {item.submenuItems?.map((sub: any, idx: number) => {
                                            if ('title' in sub) {
                                                return (
                                                    <div key={idx}>
                                                        <div className="px-10 pt-3 pb-1.5">
                                                            <span className="text-[8px] font-black text-white/15 uppercase tracking-[0.3em] font-mono">{sub.title}</span>
                                                        </div>
                                                        {sub.items.map((subItem: any) => (
                                                            <button
                                                                key={subItem.id}
                                                                onClick={() => onTabChange(subItem.id)}
                                                                className={cn(
                                                                    "w-full text-left h-11 px-[52px] text-[9px] font-black uppercase tracking-[0.18em] font-mono transition-colors",
                                                                    activeTab === subItem.id
                                                                        ? "text-[#F59E0B] bg-[#F59E0B]/5"
                                                                        : "text-white/30 hover:text-white hover:bg-white/5"
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
                                                        "w-full text-left h-12 px-10 text-[9px] font-black uppercase tracking-[0.18em] font-mono transition-colors",
                                                        activeTab === sub.id
                                                            ? "text-[#F59E0B] bg-[#F59E0B]/5"
                                                            : "text-white/30 hover:text-white hover:bg-white/5"
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
            <div className="border-t border-[#1A1A1A] bg-[#000000]">
                <button
                    onClick={() => onTabChange('settings')}
                    className="w-full h-12 flex items-center gap-3.5 px-6 text-white/30 hover:text-white hover:bg-[#0D0D0D] transition-colors border-b border-[#1A1A1A]"
                >
                    <Settings className="w-4 h-4 flex-shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] font-mono">Settings</span>
                </button>
                <button
                    onClick={onLogout}
                    className="w-full h-12 flex items-center gap-3.5 px-6 text-white/30 hover:text-red-400 hover:bg-red-400/5 transition-colors group"
                >
                    <LogOut className="w-4 h-4 flex-shrink-0 group-hover:text-red-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] font-mono">Logout</span>
                </button>
                <div className="h-8 flex items-center justify-center border-t border-[#1A1A1A]">
                    <span className="text-[7px] font-black text-white/10 uppercase tracking-[0.4em] font-mono">© 2026 BEEYIELD</span>
                </div>
            </div>
        </div>
    );
};

export default GlassSidebar;
