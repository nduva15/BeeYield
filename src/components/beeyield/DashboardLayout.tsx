import React from 'react';
import DashboardSidebar, { NavItem } from './DashboardSidebar';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
    children: React.ReactNode;
    activeTab: string;
    onTabChange: (tab: string) => void;
    onLogout: () => void;
    navItems: NavItem[];
    isAdmin?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
    children,
    activeTab,
    onTabChange,
    onLogout,
    navItems,
    isAdmin = false
}) => {
    return (
        <div className="flex h-screen bg-black overflow-hidden font-sans antialiased text-white">
            <DashboardSidebar
                activeTab={activeTab}
                onTabChange={onTabChange}
                onLogout={onLogout}
                navItems={navItems}
                isAdmin={isAdmin}
            />
            <main className="flex-1 overflow-y-auto bg-[#09090b] p-8">
                <div className="max-w-[1600px] mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
