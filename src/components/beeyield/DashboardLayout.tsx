import React from 'react';
import DashboardSidebar, { NavItem } from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import QuickActionModal from './QuickActionModal';
import FirstStepsBanner from './FirstStepsBanner';
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
    const [isQuickActionOpen, setIsQuickActionOpen] = React.useState(false);
    return (
        <div className="flex h-screen w-full bg-[#FAF9F6] overflow-hidden font-sans text-foreground selection:bg-primary/20">
            <div className="relative z-10 flex w-full h-full">
                <DashboardSidebar
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                    onLogout={onLogout}
                    navItems={navItems}
                    isAdmin={isAdmin}
                />

                <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                    {!hideHeader && (
                        <DashboardHeader
                            onLogout={onLogout}
                            onTabChange={onTabChange}
                            activeTab={activeTab}
                            onQuickAction={() => setIsQuickActionOpen(true)}
                        />
                    )}

                    <QuickActionModal
                        isOpen={isQuickActionOpen}
                        onClose={() => setIsQuickActionOpen(false)}
                        onSuccess={() => {
                            // Optionally trigger a refresh of the current view
                            console.log('Refresh current view data');
                        }}
                    />

                    <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                        <div className="max-w-[1600px] mx-auto">
                            {!isAdmin && <FirstStepsBanner onTabChange={onTabChange} />}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, delay: 0.2 }}
                            >
                                {children}
                            </motion.div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;

