import React from 'react';
import ShopDashboardSidebar, { ShopNavItem } from './ShopDashboardSidebar';
import ShopDashboardHeader from './ShopDashboardHeader';
import { cn } from '@/lib/utils';

interface ShopDashboardLayoutProps {
    children: React.ReactNode;
    activeTab: string;
    onTabChange: (tab: string) => void;
    onLogout: () => void;
    navItems: ShopNavItem[];
    hideHeader?: boolean;
}

const ShopDashboardLayout: React.FC<ShopDashboardLayoutProps> = ({
    children,
    activeTab,
    onTabChange,
    onLogout,
    navItems,
    hideHeader = false
}) => {
    return (
        <div className="flex h-screen bg-[#F9F7F2] overflow-hidden font-sans text-[#1A1A1A] selection:bg-[#F4D03F]/30 selection:text-[#1A1A1A]">
            <ShopDashboardSidebar
                activeTab={activeTab}
                onTabChange={onTabChange}
                onLogout={onLogout}
                navItems={navItems}
            />
            <main className="flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-300">
                {!hideHeader && (
                    <ShopDashboardHeader
                        onLogout={onLogout}
                        onTabChange={onTabChange}
                    />
                )}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4 md:py-6 relative z-10">
                        {children}
                    </div>
                </div>
            </main>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 0, 0, 0.2); }
            `}</style>
        </div>
    );
};

export default ShopDashboardLayout;
