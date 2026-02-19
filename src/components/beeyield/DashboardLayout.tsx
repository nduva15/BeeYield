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
        <div className="flex h-screen w-full bg-beeyield-sand dark:bg-[#0a0a0a] overflow-hidden font-sans text-beeyield-charcoal dark:text-gray-100 selection:bg-beeyield-forest/20">
            {/* Subtle Texture/Grain could go here if needed, but keeping it clean for now */}

            <div className="relative z-10 flex w-full h-full">
                <GlassSidebar
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                    onLogout={onLogout}
                    navItems={navItems}
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

                    <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
                        <div className="max-w-[1680px] mx-auto">
                            {!isAdmin && <FirstStepsBanner onTabChange={onTabChange} />}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
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

