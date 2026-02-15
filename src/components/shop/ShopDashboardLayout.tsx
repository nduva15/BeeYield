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
        <div className="flex h-screen bg-white overflow-hidden font-sans antialiased text-beeyield-green">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,208,63,0.03),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(27,145,87,0.02),transparent_40%)] pointer-events-none" />
            <ShopDashboardSidebar
                activeTab={activeTab}
                onTabChange={onTabChange}
                onLogout={onLogout}
                navItems={navItems}
            />
            <main className="flex-1 flex flex-col overflow-hidden relative z-10">
                {!hideHeader && (
                    <ShopDashboardHeader
                        onLogout={onLogout}
                        onTabChange={onTabChange}
                    />
                )}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-beeyield-cream/10">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ShopDashboardLayout;
