import React, { useState, useMemo } from 'react';
import GlassSidebar from './GlassSidebar';
import { NavItem } from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import DashboardFooter from './DashboardFooter';
import QuickActionModal from './QuickActionModal';
import FirstStepsBanner from './FirstStepsBanner';
import ToolSidebar, { type ToolGroup } from './lovable_ai/ToolSidebar';
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
    const [toolsDrawerOpen, setToolsDrawerOpen] = useState(false);

    const toolGroups: ToolGroup[] = useMemo(() => [
        {
            label: "Apiary operations",
            items: [
                { label: "Apiaries & Live Weather", icon: Compass, onClick: () => onTabChange('apiaries-weather') },
                { label: "Hive Health Dashboard", icon: HeartPulse, onClick: () => onTabChange('hive-health') },
                { label: "Inspections & Diagnostics", icon: ClipboardList, onClick: () => onTabChange('inspections') },
                { label: "My Tasks & Schedules", icon: CheckSquare, onClick: () => onTabChange('tasks') },
                { label: "Acoustic Audit (Sound Analysis)", icon: AudioLines, onClick: () => onTabChange('sound-analysis') },
                { label: "Alerts", icon: Bug, onClick: () => onTabChange('sensor-alerts') },
                { label: "Hive Placement Map", icon: MapPin, onClick: () => onTabChange('site-map') },
                { label: "Feeding Schedule Timeline", icon: Calculator, onClick: () => onTabChange('feeding-schedule') },
                { label: "Apiary & Equipment Sizing", icon: Layers, onClick: () => onTabChange('apiary-sizing') },
            ]
        },
        {
            label: "Yield & pollination",
            items: [
                { label: "Harvest Logs & Verification", icon: Package, onClick: () => onTabChange('harvests') },
                { label: "Harvest Calculator", icon: Calculator, onClick: () => onTabChange('harvest-calculator') },
                { label: "Honey Yield Projection", icon: BarChart3, onClick: () => onTabChange('yield-projection') },
                { label: "Precision Pollination Drilldown", icon: Target, onClick: () => onTabChange('precision-drilldown') },
                { label: "Pollination Planning", icon: Target, onClick: () => onTabChange('pollination-planning-ai') },
                { label: "Pollination Calcs", icon: Calculator, onClick: () => onTabChange('pollination-calcs') },
                { label: "Pollination Data & Charts", icon: BarChart3, onClick: () => onTabChange('pollination-analytics') },
                { label: "Stocking Density Lookup", icon: Flower2, onClick: () => onTabChange('pollination-lookup') },
                { label: "MOA — Multi-Objective View", icon: Layers, onClick: () => onTabChange('moa-view') },
                { label: "MOA Run Comparison", icon: Layers, onClick: () => onTabChange('moa-compare') },
            ]
        },
        {
            label: "Bloom & flight",
            items: [
                { label: "Bloom Phenology", icon: Sprout, onClick: () => onTabChange('bloom-phenology') },
                { label: "Bee Flight & Activity Tracker", icon: Plane, onClick: () => onTabChange('flight-tracker') },
                { label: "Quick Activity Counter", icon: Plane, onClick: () => onTabChange('vpm-counter') },
                { label: "Bee Activity Forecaster", icon: BarChart3, onClick: () => onTabChange('bfh-forecast') },
                { label: "Florage Database", icon: Sprout, onClick: () => onTabChange('florage-page') },
                { label: "Forage Zones & Floral Resources", icon: Flower2, onClick: () => onTabChange('forage-zones') },
            ]
        },
        {
            label: "Knowledge & reference",
            items: [
                { label: "Bee Diseases (Editable)", icon: HeartPulse, onClick: () => onTabChange('bee-diseases') },
                { label: "Varroa Simulator", icon: HeartPulse, onClick: () => onTabChange('varroa-simulator') },
                { label: "Beeyield Calculators", icon: Calculator, onClick: () => onTabChange('beeyield-calculators') },
                { label: "Knowledge Base Search", icon: Info, onClick: () => onTabChange('knowledge-search') },
                { label: "Dataset Import & Re-index", icon: Download, onClick: () => onTabChange('dataset-import') },
            ]
        },
        {
            label: "Business & devices",
            items: [
                { label: "About BeeYield (Our Story)", icon: BookOpen, onClick: () => onTabChange('about') },
                { label: "BeeYield Blogs & Field Notes", icon: BookOpen, onClick: () => onTabChange('blogs') },
                { label: "Integrations (Shopify, QuickBooks, eTIMS)", icon: Plug, onClick: () => onTabChange('integrations') },
                { label: "My Devices, USB, Bluetooth & Online", icon: Cpu, onClick: () => onTabChange('measurement-tools') },
                { label: "Support & Tickets", icon: LifeBuoy, onClick: () => onTabChange('support') },
                { label: "Settings — Control Center", icon: Settings, onClick: () => onTabChange('settings') },
                { label: "About Beeyield AI", icon: Info, onClick: () => onTabChange('about-ai') },
                { label: "Sign in / Sign up", icon: LogIn, onClick: () => onTabChange('auth') },
            ]
        }
    ], [onTabChange]);

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

            {/* BeeYield AI ToolSidebar Rail matching companion 1:1 */}
            <ToolSidebar
                groups={toolGroups}
                open={toolsDrawerOpen}
                onClose={() => setToolsDrawerOpen(false)}
            />

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
