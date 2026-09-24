import React, { useState, useMemo } from 'react';
import GlassSidebar from './GlassSidebar';
import { NavItem } from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import DashboardFooter from './DashboardFooter';
import QuickActionModal from './QuickActionModal';
import FirstStepsBanner from './FirstStepsBanner';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
    Compass, Heart, ClipboardList, CheckSquare, AudioLines, Bug, MapPin,
    Calculator, Layers, Package, BarChart3, Target, Flower2, Sprout,
    Plane, HeartPulse, Info, Download, BookOpen, Plug, Cpu, LifeBuoy,
    Settings, LogIn
} from 'lucide-react';

export type DeviceMode = 'auto' | 'phone' | 'pad' | 'laptop';

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
    const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden font-sans text-foreground selection:bg-primary/30 selection:text-foreground">
            {/* Sidebar */}
            {!hideSidebar && (
                <GlassSidebar
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                    onLogout={onLogout}
                    navItems={navItems}
                    mobileOpen={mobileSidebarOpen}
                    onMobileClose={() => setMobileSidebarOpen(false)}
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
                        navItems={navItems}
                        onToggleMobileSidebar={() => setMobileSidebarOpen(prev => !prev)}
                        onToggleToolsDrawer={() => setToolsDrawerOpen(prev => !prev)}
                    />
                )}

                <QuickActionModal
                    isOpen={isQuickActionOpen}
                    onClose={() => setIsQuickActionOpen(false)}
                    onSuccess={() => {}}
                />

                {/* Content Area - Naturally Responsive Fluid Viewport */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-muted/10">
                    <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 relative z-10 overflow-x-hidden">
                        {!isAdmin && !hideBanner && <FirstStepsBanner onTabChange={onTabChange} />}
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="w-full max-w-full overflow-x-hidden"
                        >
                            {children}
                        </motion.div>
                        {/* Full Dashboard Footer */}
                        <DashboardFooter onTabChange={onTabChange} />
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
