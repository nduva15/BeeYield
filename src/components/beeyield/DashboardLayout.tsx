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
    hideSidebar?: boolean;
    hideBanner?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
    children,
    activeTab,
    onTabChange,
    onLogout,
    navItems,
    isAdmin = false,
    hideHeader = false,
    hideSidebar = false,
    hideBanner = false
}) => {
    const [isQuickActionOpen, setIsQuickActionOpen] = React.useState(false);

    return (
        <div className="flex h-screen w-full bg-[#F9F7F2] overflow-hidden font-sans text-[#1A1A1A] selection:bg-[#F4D03F]/30 selection:text-[#1A1A1A]">
            {/* Sidebar */}
            {!hideSidebar && (
                <GlassSidebar
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                    onLogout={onLogout}
                    navItems={navItems}
                />
            )}

            {/* Main content */}
            <main className={cn(
                "flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-300",
                hideSidebar ? "md:pl-0" : "md:pl-[280px]"
            )}>
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
                    }}
                />

                {/* Content area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4 md:py-6 relative z-10">
                        {!isAdmin && !hideBanner && <FirstStepsBanner onTabChange={onTabChange} />}
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        >
                            {children}
                        </motion.div>
                    </div>
                </div>
            </main>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 0, 0, 0.2); }
            `}</style>
        </div>
    );
};

export default DashboardLayout;
