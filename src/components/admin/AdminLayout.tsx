import React from 'react';
import AdminSidebar, { AdminNavItem } from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { cn } from '@/lib/utils';
import { Container } from '@/components/ui/layout';

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
        <div className="flex h-screen bg-white overflow-hidden font-sans antialiased text-beeyield-green">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(27,145,87,0.02),transparent_40%)] pointer-events-none" />
            <AdminSidebar
                activeTab={activeTab}
                onTabChange={onTabChange}
                onLogout={onLogout}
                navItems={navItems}
            />
            <main className="flex-1 flex flex-col overflow-hidden bg-beeyield-cream/10 relative z-10">
                <AdminHeader onLogout={onLogout} />
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <Container size="lg" className="py-8">
                        {children}
                    </Container>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
