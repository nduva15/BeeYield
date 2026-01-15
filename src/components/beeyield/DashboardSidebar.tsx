import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, Hexagon, ChevronDown, ChevronRight, MessageSquare, LayoutGrid, Box, LineChart, Signal, Bluetooth, Cpu, Usb, FileText, HelpCircle, LogOut } from 'lucide-react';

export interface NavItem {
    id: string;
    label: string;
    icon: LucideIcon;
    hasSubmenu?: boolean;
    submenuItems?: { id: string; label: string; icon?: LucideIcon }[];
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
    const [expandedItems, setExpandedItems] = useState<string[]>(['beeyield', 'data', 'meters']);

    const toggleExpand = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <div className={cn("flex flex-col h-full bg-white dark:bg-[#09090b] border-r border-gray-100 dark:border-[#1e1e1e] w-64 transition-colors duration-300", className)}>
            {/* Logo area */}
            <div className="p-8 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-black dark:bg-white rounded-xl flex items-center justify-center shadow-lg">
                        <Hexagon className="w-6 h-6 text-white dark:text-black fill-current" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-widest leading-none">BEEYIELD HUB</h1>
                        <p className="text-[10px] font-bold text-gray-400 tracking-[0.2em] mt-1 uppercase">MAIN MENU</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 mt-8 space-y-1 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const isExpanded = expandedItems.includes(item.id);

                    return (
                        <div key={item.id} className="space-y-1">
                            <button
                                onClick={() => onTabChange(item.id)}
                                className={cn(
                                    "w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 text-sm font-semibold group relative overflow-hidden",
                                    isActive
                                        ? "bg-gradient-to-r from-[#F1D2A0] to-[#E2B77D] text-gray-900 shadow-md"
                                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                                )}
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className={cn(
                                        "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
                                        isActive ? "bg-white/40 shadow-sm" : "bg-gray-50 dark:bg-white/5"
                                    )}>
                                        <item.icon className={cn("w-4 h-4", isActive ? "text-gray-900" : "text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white")} />
                                    </div>
                                    {item.label}
                                </div>
                                {item.hasSubmenu && (
                                    <div
                                        onClick={(e) => toggleExpand(item.id, e)}
                                        className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors relative z-10"
                                    >
                                        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", isExpanded ? "rotate-0" : "-rotate-90")} />
                                    </div>
                                )}
                            </button>

                            {/* Submenu Items */}
                            {item.hasSubmenu && isExpanded && item.submenuItems && (
                                <div className="ml-4 pl-4 border-l border-gray-100 dark:border-white/5 space-y-1 py-1 animate-in slide-in-from-top-2 duration-200">
                                    {item.submenuItems.map((subItem) => (
                                        <button
                                            key={subItem.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onTabChange(subItem.id);
                                            }}
                                            className={cn(
                                                "w-full text-left py-2 px-3 text-xs font-medium transition-all duration-200 flex items-center gap-3 rounded-xl",
                                                activeTab === subItem.id
                                                    ? "bg-[#F1D2A0]/20 text-[#B88A44] font-semibold"
                                                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5"
                                            )}
                                        >
                                            {subItem.icon && (
                                                <subItem.icon className={cn(
                                                    "w-4 h-4",
                                                    activeTab === subItem.id ? "text-[#B88A44]" : "text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300"
                                                )} />
                                            )}
                                            {!subItem.icon && (
                                                <div className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    activeTab === subItem.id ? "bg-[#B88A44]" : "bg-gray-300 dark:bg-gray-600"
                                                )} />
                                            )}
                                            {subItem.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Footer Section based on Image */}
            <div className="p-4 space-y-4 border-t border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                {/* Server Status */}
                <div className="bg-[#D9EBE9] dark:bg-[#132A27] px-4 py-3 rounded-2xl flex items-center justify-between border border-[#B8DCD8] dark:border-[#1B3E3A]">
                    <div className="flex items-center gap-4">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
                        <span className="text-[10px] font-bold text-[#134E48] dark:text-[#4ADE80] uppercase tracking-wider">Server Status</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#134E48] dark:text-[#4ADE80] uppercase">OK</span>
                </div>

                {/* Log Out */}
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all font-semibold text-sm group"
                >
                    <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors">
                        <LogOut className="w-4 h-4" />
                    </div>
                    Log out
                </button>
            </div>
        </div>
    );
};

export default DashboardSidebar;
