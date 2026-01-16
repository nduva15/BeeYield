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
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans antialiased text-gray-900">
            <ShopDashboardSidebar
                activeTab={activeTab}
                onTabChange={onTabChange}
                onLogout={onLogout}
                navItems={navItems}
            />
            <main className="flex-1 flex flex-col overflow-hidden">
                {!hideHeader && (
                    <ShopDashboardHeader
                        onLogout={onLogout}
                        onTabChange={onTabChange}
                    />
                )}
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ShopDashboardLayout;
