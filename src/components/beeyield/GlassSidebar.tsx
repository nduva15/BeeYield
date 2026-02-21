import React from 'react';
import { cn } from '@/lib/utils';
import { Hexagon, ChevronDown, LogOut, Settings } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { NavItem } from './DashboardSidebar';
import { Button } from '@/components/ui/button';

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
    const { t } = useLanguage();

    const toggleFolder = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setExpandedFolders(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <div
            className={cn(
                "fixed left-0 top-0 bottom-0 w-80 bg-white border-r-4 border-black z-40 hidden md:flex flex-col antialiased",
                className
            )}
        >
            {/* Brand Logo */}
            <div className="h-32 flex items-center px-8 border-b-4 border-black bg-white group cursor-pointer" onClick={() => onTabChange('home')}>
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 border-4 border-black bg-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(16,185,129,1)] group-hover:bg-[#10b981] transition-none">
                        <Hexagon className="w-8 h-8 text-[#CEF144] fill-current" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-3xl font-black text-black uppercase tracking-tighter leading-none">Floaria™</span>
                        <span className="text-[10px] font-black text-[#10b981] uppercase tracking-[0.3em] mt-1 italic italic-none">V2.0 Registry</span>
                    </div>
                </div>
            </div>

            {/* Nav Links */}
            <div className="flex-1 overflow-y-auto custom-scrollbar-slim">
                <div className="h-14 flex items-center justify-between border-b-2 border-black bg-neutral-50 px-8">
                    <span className="text-[9px] font-black uppercase text-black/30 tracking-[0.3em]">Operational_Nodes</span>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#10b981] animate-pulse" />
                        <span className="text-[8px] font-black tracking-widest text-[#10b981]">SYNC_OK</span>
                    </div>
                </div>

                <div className="divide-y-2 divide-black/5">
                    {navItems.filter(item => !item.hidden).map((item) => {
                        const isActive = activeTab === item.id;
                        const isFolder = item.hasSubmenu;
                        const isExpanded = expandedFolders.includes(item.id);

                        return (
                            <div key={item.id} className="w-full">
                                <button
                                    onClick={() => isFolder ? toggleFolder(item.id) : onTabChange(item.id)}
                                    className={cn(
                                        "w-full flex items-center justify-between h-16 px-8 transition-none group relative overflow-hidden",
                                        isActive ? "bg-[#10b981] text-white" : "text-black hover:bg-neutral-50"
                                    )}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-0 bottom-0 w-2 bg-black" />
                                    )}
                                    <div className="flex items-center gap-4">
                                        <item.icon className={cn(
                                            "w-5 h-5",
                                            isActive ? "text-white" : "text-black/40 group-hover:text-black"
                                        )} />
                                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                                    </div>
                                    {isFolder && (
                                        <ChevronDown className={cn(
                                            "w-4 h-4 transition-transform duration-200",
                                            isActive ? "text-white" : "text-black/20",
                                            isExpanded ? "rotate-180" : ""
                                        )} />
                                    )}
                                </button>

                                {isFolder && isExpanded && (
                                    <div className="bg-neutral-50 border-b-2 border-black/5">
                                        {item.submenuItems?.map((sub: any, idx) => {
                                            if ('title' in sub) {
                                                return (
                                                    <div key={idx} className="pb-4">
                                                        <div className="px-12 py-4">
                                                            <span className="text-[9px] font-black text-black/30 uppercase tracking-[0.2em]">{sub.title}</span>
                                                        </div>
                                                        {sub.items.map((subItem: any) => (
                                                            <button
                                                                key={subItem.id}
                                                                onClick={() => onTabChange(subItem.id)}
                                                                className={cn(
                                                                    "w-full text-left h-12 px-14 text-[10px] font-black uppercase tracking-widest transition-none",
                                                                    activeTab === subItem.id ? "bg-black text-white" : "text-black/50 hover:bg-black/5 hover:text-black"
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
                                                        "w-full text-left h-14 px-12 text-[10px] font-black uppercase tracking-widest transition-none",
                                                        activeTab === sub.id ? "bg-black text-white" : "text-black/50 hover:bg-black/5 hover:text-black"
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

            {/* Footer */}
            <div className="p-8 border-t-4 border-black bg-white space-y-4">
                <Button
                    variant="ghost"
                    onClick={() => onTabChange('settings')}
                    className="w-full h-14 border-2 border-black rounded-none bg-white flex items-center justify-start gap-4 px-6 hover:bg-neutral-100 transition-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]"
                >
                    <Settings className="w-5 h-5 text-black" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-black">Settings</span>
                </Button>
                <Button
                    onClick={onLogout}
                    className="w-full h-14 border-2 border-black rounded-none bg-black text-white flex items-center justify-start gap-4 px-6 hover:bg-red-600 transition-none shadow-[6px_6px_0px_0px_rgba(16,185,129,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                >
                    <LogOut className="w-5 h-5 text-white" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
                </Button>
            </div>
        </div>
    );
};

export default GlassSidebar;
