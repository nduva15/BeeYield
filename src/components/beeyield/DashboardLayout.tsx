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
        /* Theme-aware Glass & Gold canvas — matching BeeYield AI aesthetic */
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

                {/* Scrollable content area — honeycomb + Glass & Gold */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative honeycomb-bg">
                    {/* Warm ambient glow overlays — matching AI view */}
                    <div className="fixed top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-amber-500/[0.06] to-transparent pointer-events-none z-0" />
                    <div className="fixed bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-amber-500/[0.06] to-transparent pointer-events-none rotate-180 z-0" />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-amber-500/[0.015] dark:bg-amber-500/[0.01] rounded-full blur-[150px] pointer-events-none z-0" />

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

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(245, 158, 11, 0.08); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(245, 158, 11, 0.2); }
            `}</style>
        </div>
    );
};

export default DashboardLayout;
