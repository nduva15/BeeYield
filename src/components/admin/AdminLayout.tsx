import React from 'react';
import AdminSidebar, { AdminNavItem } from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
    children: React.ReactNode;
    activeTab: string;
    onTabChange: (tab: string) => void;
    onLogout: () => void;
    navItems: AdminNavItem[];
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
    children,
    activeTab,
    onTabChange,
    onLogout,
    navItems
}) => {
    return (
        <div className="flex h-screen bg-background overflow-hidden font-sans antialiased text-foreground">
            <AdminSidebar
                activeTab={activeTab}
                onTabChange={onTabChange}
                onLogout={onLogout}
                navItems={navItems}
            />
            <main className="flex-1 flex flex-col overflow-hidden bg-muted/20">
                <AdminHeader onLogout={onLogout} />
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-[1600px] mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
