import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, LogOut, ShoppingBag } from 'lucide-react';
import Logo from '@/assets/Logo.png';

export interface ShopNavItem {
    id: string;
    label: string;
    icon: LucideIcon;
    hidden?: boolean;
}

interface SidebarProps {
    className?: string;
    activeTab: string;
    onTabChange: (tab: string) => void;
    onLogout: () => void;
    navItems: ShopNavItem[];
}

const ShopDashboardSidebar: React.FC<SidebarProps> = ({
    className,
    activeTab,
    onTabChange,
    onLogout,
    navItems,
}) => {
    return (
        <div className={cn("flex flex-col h-full bg-white border-r border-gray-200 w-64 transition-all duration-300 shadow-sm", className)}>
            {/* Logo area - More consumer friendly */}
            <div className="p-6 border-b border-gray-50">
                <div className="flex items-center gap-3">
                    <img src={Logo} alt="Logo" className="w-10 h-10 object-contain" />
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-none">My Account</h1>
                        <p className="text-[10px] font-bold text-primary tracking-widest mt-1 uppercase">Shop Dashboard</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 mt-6 space-y-1 overflow-y-auto custom-scrollbar">
                {navItems.filter(item => !item.hidden).map((item) => {
                    const isActive = activeTab === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={cn(
                                "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold group",
                                isActive
                                    ? "bg-primary text-white shadow-md shadow-primary/20"
                                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-gray-400 group-hover:text-primary")} />
                            {item.label}
                            {item.id === 'checkout' && (
                                <span className="ml-auto w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Footer Section */}
            <div className="p-4 space-y-2 border-t border-gray-100 bg-gray-50/30">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all font-semibold text-sm group"
                >
                    <LogOut className="w-5 h-5 transition-colors group-hover:text-red-500" />
                    Log out
                </button>
                <p className="text-[10px] text-gray-400 font-medium text-center pt-2">
                    BEE YIELD SHOP v2.0
                </p>
            </div>
        </div>
    );
};

export default ShopDashboardSidebar;
