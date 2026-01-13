import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, Hexagon, LogOut } from 'lucide-react';

export interface NavItem {
    id: string;
    label: string;
    icon: LucideIcon;
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
    return (
        <div className={cn("flex flex-col h-full bg-[#09090b] border-r border-[#1e1e1e] w-64", className)}>
            {/* Logo area */}
            <div className="p-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 flex items-center justify-center">
                        <Hexagon className="w-6 h-6 text-white fill-white" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">BeeYield</span>
                    {isAdmin && (
                        <span className="bg-[#e9b30822] text-[#e9b308] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                            Admin
                        </span>
                    )}
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 mt-4 space-y-1">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium",
                            activeTab === item.id
                                ? "bg-[#1e1e1e] text-white"
                                : "text-[#71717a] hover:text-white hover:bg-[#1e1e1e]/50"
                        )}
                    >
                        <item.icon className={cn("w-4 h-4", activeTab === item.id ? "text-white" : "text-[#71717a]")} />
                        {item.label}
                    </button>
                ))}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-[#1e1e1e]">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#71717a] hover:text-white hover:bg-[#1e1e1e]/50 transition-all duration-200"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default DashboardSidebar;
