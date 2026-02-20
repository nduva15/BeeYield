import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, ChevronDown, LogOut, Search, LayoutGrid, Terminal, Shield, Home, Settings, Database, Activity, Map, BarChart2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export interface NavItem {
    id: string;
    label: string;
    icon: LucideIcon;
    hasSubmenu?: boolean;
    hidden?: boolean;
    submenuItems?: {
        id: string;
        label: string;
        icon?: LucideIcon;
        subItems?: { id: string; label: string; icon?: LucideIcon }[];
    }[];
}

interface SidebarProps {
    className?: string;
    activeTab: string;
    onTabChange: (tab: string) => void;
    onLogout: () => void;
    navItems: NavItem[];
    isAdmin?: boolean;
}

const DashboardSidebar: React.FC<SidebarProps> = ({
    className,
    activeTab,
    onTabChange,
    onLogout,
    navItems,
    isAdmin = false
}) => {
    const [openItems, setOpenItems] = useState<string[]>(['beeyield']);
    const { t } = useLanguage();

    const toggleExpand = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setOpenItems(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    return (
        <aside
            className={cn(
                "flex flex-col h-screen w-[260px] bg-white border-r-2 border-black antialiased z-50",
                className
            )}
        >
            {/* Branding - Sharp Utility */}
            <div className="px-6 py-8 border-b-2 border-black">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-black flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-black text-black leading-none uppercase tracking-tighter">
                            BEEYIELD
                        </h1>
                        <span className="text-[10px] font-bold text-black uppercase mt-1">
                            {isAdmin ? 'SYSTEM CORE' : 'USER DASHBOARD'}
                        </span>
                    </div>
                </div>

                {/* Search - Field UI */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
                    <input
                        type="text"
                        placeholder="Search files..."
                        className="w-full bg-white border-2 border-black py-2 pl-10 pr-4 text-xs font-bold uppercase placeholder:text-gray-400 focus:outline-none"
                    />
                </div>
            </div>

            {/* Navigation - Logic Tree */}
            <div className="flex-1 overflow-y-auto custom-scrollbar-brutalist">
                <div className="p-4 bg-gray-100 border-b-2 border-black">
                    <span className="text-[9px] font-black text-black uppercase tracking-widest">Navigation</span>
                </div>

                <nav className="divide-y-2 divide-black">
                    {navItems.filter(item => !item.hidden).map((item) => {
                        const isActive = activeTab === item.id;
                        const isOpen = openItems.includes(item.id);

                        return (
                            <div key={item.id} className="relative">
                                <button
                                    onClick={() => {
                                        onTabChange(item.id);
                                        if (item.hasSubmenu) toggleExpand(item.id);
                                    }}
                                    className={cn(
                                        "w-full flex items-center justify-between px-6 py-4 transition-colors",
                                        isActive ? "bg-emerald-500 text-black font-black" : "bg-white text-black hover:bg-gray-50"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <item.icon className="w-5 h-5 stroke-[2]" />
                                        <span className="text-[11px] font-bold uppercase tracking-tight">{item.label}</span>
                                    </div>
                                    {item.hasSubmenu && (
                                        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen ? "rotate-0" : "-rotate-90")} />
                                    )}
                                </button>

                                {item.hasSubmenu && isOpen && item.submenuItems && (
                                    <div className="bg-gray-50 border-t-2 border-black divide-y divide-black/10">
                                        {item.submenuItems.map((subItem) => (
                                            <button
                                                key={subItem.id}
                                                onClick={() => onTabChange(subItem.id)}
                                                className={cn(
                                                    "w-full text-left py-3 px-10 text-[10px] font-bold uppercase tracking-widest",
                                                    activeTab === subItem.id ? "bg-black text-white" : "text-black hover:bg-gray-200"
                                                )}
                                            >
                                                {subItem.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t-2 border-black bg-gray-50">
                <div className="grid grid-cols-1 gap-2">
                    <button
                        onClick={() => onTabChange('settings')}
                        className="flex items-center justify-center gap-3 w-full py-3 bg-white border-2 border-black text-[10px] font-black uppercase hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                    >
                        <Settings className="w-4 h-4" />
                        Settings
                    </button>
                    <button
                        onClick={onLogout}
                        className="flex items-center justify-center gap-3 w-full py-3 bg-red-500 text-white border-2 border-black text-[10px] font-black uppercase hover:bg-red-600 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                    >
                        <LogOut className="w-4 h-4" />
                        Log Out
                    </button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar-brutalist::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar-brutalist::-webkit-scrollbar-track {
                    background: white;
                    border-left: 2px solid black;
                }
                .custom-scrollbar-brutalist::-webkit-scrollbar-thumb {
                    background: black;
                }
            `}} />
        </aside>
    );
};

export default DashboardSidebar;
