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
        /* Pure black canvas — true X/Uber dark foundation */
        <div className="flex h-screen w-full bg-[#000000] overflow-hidden font-sans text-white selection:bg-[#F59E0B]/30">
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
                <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ scrollbarColor: '#1A1A1A transparent' }}>
                    <div className="max-w-[1600px] mx-auto p-4 md:p-8">
                        {!isAdmin && <FirstStepsBanner onTabChange={onTabChange} />}
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
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
