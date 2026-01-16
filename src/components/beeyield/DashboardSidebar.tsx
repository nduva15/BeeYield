import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, Hexagon, ChevronDown, ChevronRight, MessageSquare, LayoutGrid, Box, LineChart, Signal, Bluetooth, Cpu, Usb, FileText, HelpCircle, LogOut } from 'lucide-react';

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
    const [expandedItems, setExpandedItems] = useState<string[]>(['beeyield', 'data', 'meters', 'meters-list', 'meters-buildings', 'meters-measurements']);

    const toggleExpand = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <div className={cn("flex flex-col h-full bg-card border-r border-border w-64 transition-colors duration-300", className)}>
            {/* Logo area */}
            <div className="p-8 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <Hexagon className="w-6 h-6 text-primary-foreground fill-current" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground tracking-widest leading-none">BEEYIELD HUB</h1>
                        <p className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] mt-1 uppercase">MAIN MENU</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 mt-8 space-y-1 overflow-y-auto custom-scrollbar">
                {navItems.filter(item => !item.hidden).map((item) => {
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
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className={cn(
                                        "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
                                        isActive ? "bg-white/40 shadow-sm" : "bg-muted"
                                    )}>
                                        <item.icon className={cn("w-4 h-4", isActive ? "text-gray-900" : "text-muted-foreground group-hover:text-foreground")} />
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
                                    {item.submenuItems.map((subItem) => {
                                        // Check if this subItem has active children or is active itself
                                        const isSubActive = activeTab === subItem.id;
                                        const hasSubItems = subItem.subItems && subItem.subItems.length > 0;
                                        const isSubExpanded = expandedItems.includes(subItem.id);
                                        const isChildActive = subItem.subItems?.some(child => child.id === activeTab);

                                        return (
                                            <div key={subItem.id}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (hasSubItems) {
                                                            toggleExpand(subItem.id, e);
                                                        } else {
                                                            onTabChange(subItem.id);
                                                        }
                                                    }}
                                                    className={cn(
                                                        "w-full text-left py-2 px-3 text-xs font-medium transition-all duration-200 flex items-center justify-between rounded-xl",
                                                        isSubActive || isChildActive
                                                            ? "bg-primary/10 text-primary font-semibold"
                                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {subItem.icon && (
                                                            <subItem.icon className={cn(
                                                                "w-4 h-4",
                                                                isSubActive || isChildActive ? "text-primary" : "text-muted-foreground"
                                                            )} />
                                                        )}
                                                        {!subItem.icon && (
                                                            <div className={cn(
                                                                "w-1.5 h-1.5 rounded-full",
                                                                isSubActive || isChildActive ? "bg-primary" : "bg-muted-foreground/30"
                                                            )} />
                                                        )}
                                                        {subItem.label}
                                                    </div>
                                                    {hasSubItems && (
                                                        <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", isSubExpanded ? "rotate-0" : "-rotate-90")} />
                                                    )}
                                                </button>

                                                {/* nested Items */}
                                                {hasSubItems && isSubExpanded && (
                                                    <div className="ml-3 pl-3 border-l border-gray-100 dark:border-white/5 space-y-1 mt-1 mb-1">
                                                        {subItem.subItems!.map((child) => (
                                                            <button
                                                                key={child.id}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onTabChange(child.id);
                                                                }}
                                                                className={cn(
                                                                    "w-full text-left py-1.5 px-3 text-[11px] font-medium transition-all duration-200 flex items-center gap-2 rounded-lg",
                                                                    activeTab === child.id
                                                                        ? "bg-[#F1D2A0]/20 text-[#B88A44] font-semibold"
                                                                        : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5"
                                                                )}
                                                            >
                                                                {child.icon ? (
                                                                    <child.icon className={cn("w-3.5 h-3.5", activeTab === child.id ? "text-[#B88A44]" : "text-gray-400")} />
                                                                ) : (
                                                                    <div className={cn(
                                                                        "w-1 h-1 rounded-full",
                                                                        activeTab === child.id ? "bg-[#B88A44]" : "bg-gray-300 dark:bg-gray-600"
                                                                    )} />
                                                                )}
                                                                {child.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Footer Section based on Image */}
            <div className="p-4 space-y-4 border-t border-border bg-muted/30">
                {/* Server Status */}
                <div
                    onClick={() => onTabChange('server-status')}
                    className="bg-primary/10 px-4 py-3 rounded-2xl flex items-center justify-between border border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_hsl(var(--primary))]" />
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Server Status</span>
                    </div>
                    <span className="text-[10px] font-bold text-primary uppercase">OK</span>
                </div>

                {/* Log Out */}
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all font-semibold text-sm group"
                >
                    <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center group-hover:bg-destructive/10 transition-colors">
                        <LogOut className="w-4 h-4" />
                    </div>
                    Log out
                </button>

                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider text-center pt-2">
                    BEEYIELD APP © BUILD 2026-01-14
                </p>
            </div>
        </div>
    );
};

export default DashboardSidebar;
