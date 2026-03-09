import React from 'react';
import GlassSidebar from './GlassSidebar';
import { NavItem } from './DashboardSidebar';
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
        /* Theme-aware canvas — respects light/dark toggle */
        <div className="flex h-screen w-full bg-[#fdfbf6] dark:bg-[#09090b] overflow-hidden font-sans text-slate-900 dark:text-white selection:bg-amber-100 dark:selection:bg-amber-900/30">
            {/* Sidebar — fixed left column */}
            <GlassSidebar
                activeTab={activeTab}
                onTabChange={onTabChange}
                onLogout={onLogout}
                navItems={navItems}
            />

            {/* Main content column */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative md:pl-[280px] transition-all duration-300">
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
                        console.log('Refresh current view data');
                    }}
                />

                {/* Scrollable content area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                    {/* Background Accents (Landing Page Style) */}
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_80%_20%,#fef3c7_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_80%_20%,#451a03_0%,transparent_50%)] opacity-40 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-[radial-gradient(circle_at_20%_80%,#ecfdf5_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_20%_80%,#064e3b_0%,transparent_50%)] opacity-40 pointer-events-none" />

                    <div className="max-w-[1600px] mx-auto p-4 md:p-10 relative z-10">
                        {!isAdmin && <FirstStepsBanner onTabChange={onTabChange} />}
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, scale: 0.98, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        >
                            {children}
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
