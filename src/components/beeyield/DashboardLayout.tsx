import React from 'react';
import DashboardSidebar, { NavItem } from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface DashboardLayoutProps {
    children: React.ReactNode;
    activeTab: string;
    onTabChange: (tab: string) => void;
    onLogout: () => void;
    navItems: NavItem[];
    isAdmin?: boolean;
    hideHeader?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
    children,
    activeTab,
    onTabChange,
    onLogout,
    navItems,
    isAdmin = false,
    hideHeader = false
}) => {
    return (
        <div className="flex h-screen w-full bg-[#f8f9fc] dark:bg-[#000000] overflow-hidden font-sans text-foreground selection:bg-primary/20 bg-[url('https://images.unsplash.com/photo-1473625247510-8ceb1760943f?q=80&w=2611&auto=format&fit=crop')] bg-cover bg-center">
            {/* Backdrop Overlay for readability */}
            <div className="absolute inset-0 bg-white/90 dark:bg-black/90 backdrop-blur-xl z-0" />

            <div className="relative z-10 flex w-full h-full">
                <DashboardSidebar
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                    onLogout={onLogout}
                    navItems={navItems}
                    isAdmin={isAdmin}
                />

                <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                    {!hideHeader && <DashboardHeader onLogout={onLogout} onTabChange={onTabChange} />}

                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="flex-1 overflow-y-auto p-4 pt-2 custom-scrollbar"
                    >
                        <div className="max-w-[1600px] mx-auto h-full">
                            {children}
                        </div>
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;

