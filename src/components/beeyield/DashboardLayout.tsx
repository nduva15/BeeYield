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
        <div className="flex h-screen w-full bg-[#F4F7FB] dark:bg-[#070708] overflow-hidden font-sans text-slate-900 dark:text-slate-100 selection:bg-[#CEF144]/30 p-0 md:p-6">
            <div className="relative flex w-full h-full bg-white/40 dark:bg-black/10 backdrop-blur-xl md:rounded-[40px] border border-white/20 dark:border-white/5 shadow-2xl overflow-hidden">
                <GlassSidebar
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                    onLogout={onLogout}
                    navItems={navItems}
                    className="md:m-4 md:rounded-[32px] md:h-[calc(100%-32px)]"
                />

                <main className="flex-1 flex flex-col h-full overflow-hidden relative md:pl-[280px] transition-all duration-500">
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

                    <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                        <div className="max-w-[1600px] mx-auto">
                            {!isAdmin && <FirstStepsBanner onTabChange={onTabChange} />}
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
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

