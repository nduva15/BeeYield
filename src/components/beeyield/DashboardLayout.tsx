import React, { useState, useEffect } from 'react';
import GlassSidebar from './GlassSidebar';
import { NavItem } from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import DashboardFooter from './DashboardFooter';
import QuickActionModal from './QuickActionModal';
import FirstStepsBanner from './FirstStepsBanner';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Smartphone, Tablet, Laptop, MonitorSmartphone, Lock } from 'lucide-react';

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
    const [deviceMode, setDeviceMode] = useState<DeviceMode>(() => {
        try {
            return (localStorage.getItem('beeyield_device_mode') as DeviceMode) || 'auto';
        } catch {
            return 'auto';
        }
    });

    const handleDeviceModeChange = (mode: DeviceMode) => {
        setDeviceMode(mode);
        try {
            localStorage.setItem('beeyield_device_mode', mode);
        } catch {
            // Ignore localStorage quota or access errors
        }
    };

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
                        deviceMode={deviceMode}
                        onDeviceModeChange={handleDeviceModeChange}
                    />
                )}

                <QuickActionModal
                    isOpen={isQuickActionOpen}
                    onClose={() => setIsQuickActionOpen(false)}
                    onSuccess={() => {}}
                />

                {/* Content Area with Device Lock Viewport Simulation */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-muted/10">
                    {/* Render Phone Simulator Viewport */}
                    {deviceMode === 'phone' && (
                        <div className="w-full flex flex-col items-center py-6 px-2 min-h-full">
                            <div className="mb-2 flex items-center gap-2 px-3 py-1 bg-amber-500/15 border border-amber-500/30 rounded-full text-[11px] font-bold text-[#B78103] dark:text-[#F4D03F]">
                                <Smartphone className="w-3.5 h-3.5" />
                                <span>Phone Lock: 390px Mobile Frame</span>
                                <Lock className="w-3 h-3" />
                                <button 
                                    onClick={() => handleDeviceModeChange('auto')}
                                    className="ml-2 underline hover:opacity-80"
                                >
                                    Unlock
                                </button>
                            </div>
                            <div className="w-[390px] max-w-full bg-background border-[5px] border-neutral-800 dark:border-neutral-700 shadow-2xl rounded-[44px] overflow-hidden flex flex-col relative ring-8 ring-black/5">
                                {/* Simulated Phone Notch */}
                                <div className="h-7 bg-neutral-900 flex items-center justify-center shrink-0">
                                    <div className="w-24 h-4 bg-black rounded-full" />
                                </div>
                                <div className="p-3 sm:p-4 overflow-y-auto max-h-[85vh] custom-scrollbar">
                                    {!isAdmin && !hideBanner && <FirstStepsBanner onTabChange={onTabChange} />}
                                    <motion.div
                                        key={activeTab}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        {children}
                                    </motion.div>
                                    <DashboardFooter onTabChange={onTabChange} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Render Tablet/Pad Simulator Viewport */}
                    {deviceMode === 'pad' && (
                        <div className="w-full flex flex-col items-center py-6 px-3 min-h-full">
                            <div className="mb-2 flex items-center gap-2 px-3 py-1 bg-amber-500/15 border border-amber-500/30 rounded-full text-[11px] font-bold text-[#B78103] dark:text-[#F4D03F]">
                                <Tablet className="w-3.5 h-3.5" />
                                <span>Tablet / Pad Lock: 768px Frame</span>
                                <Lock className="w-3 h-3" />
                                <button 
                                    onClick={() => handleDeviceModeChange('auto')}
                                    className="ml-2 underline hover:opacity-80"
                                >
                                    Unlock
                                </button>
                            </div>
                            <div className="w-[768px] max-w-full bg-background border-4 border-neutral-700 dark:border-neutral-600 shadow-2xl rounded-[36px] overflow-hidden flex flex-col relative ring-8 ring-black/5">
                                {/* Simulated Pad Notch */}
                                <div className="h-5 bg-neutral-800 flex items-center justify-center shrink-0">
                                    <div className="w-3 h-3 rounded-full bg-neutral-950" />
                                </div>
                                <div className="p-4 sm:p-6 overflow-y-auto max-h-[85vh] custom-scrollbar">
                                    {!isAdmin && !hideBanner && <FirstStepsBanner onTabChange={onTabChange} />}
                                    <motion.div
                                        key={activeTab}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        {children}
                                    </motion.div>
                                    <DashboardFooter onTabChange={onTabChange} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Render Laptop Viewport */}
                    {deviceMode === 'laptop' && (
                        <div className="w-full py-4 px-3 sm:px-6">
                            <div className="max-w-[1280px] mx-auto">
                                <div className="mb-3 flex items-center justify-between px-3 py-1.5 bg-muted/40 border border-border rounded-xl text-xs font-bold text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <Laptop className="w-3.5 h-3.5 text-[#F4D03F]" />
                                        Laptop Screen Lock (1280px)
                                    </span>
                                    <button 
                                        onClick={() => handleDeviceModeChange('auto')}
                                        className="text-[#B78103] dark:text-[#F4D03F] hover:underline text-[11px]"
                                    >
                                        Reset to Auto
                                    </button>
                                </div>
                                {!isAdmin && !hideBanner && <FirstStepsBanner onTabChange={onTabChange} />}
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    {children}
                                </motion.div>
                                <DashboardFooter onTabChange={onTabChange} />
                            </div>
                        </div>
                    )}

                    {/* Render Fluid Auto / Responsive Viewport */}
                    {deviceMode === 'auto' && (
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
                            {/* Full Dashboard Footer for Phone, Pad & Laptop */}
                            <DashboardFooter onTabChange={onTabChange} />
                        </div>
                    )}

                    {/* Floating Mobile Device Lock Pill for Phone/Tablet screens */}
                    <div className="lg:hidden fixed bottom-4 right-4 z-40 flex items-center gap-1 p-1 bg-neutral-900/90 backdrop-blur-lg text-white border border-white/10 rounded-full shadow-2xl">
                        {[
                            { id: 'auto', icon: MonitorSmartphone, title: 'Fluid Auto' },
                            { id: 'phone', icon: Smartphone, title: 'Phone Lock' },
                            { id: 'pad', icon: Tablet, title: 'Pad Lock' },
                            { id: 'laptop', icon: Laptop, title: 'Laptop Lock' },
                        ].map((btn) => (
                            <button
                                key={btn.id}
                                onClick={() => handleDeviceModeChange(btn.id as DeviceMode)}
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                                    deviceMode === btn.id
                                        ? "bg-[#F4D03F] text-neutral-900 shadow-md scale-105"
                                        : "text-white/60 hover:text-white"
                                )}
                                title={btn.title}
                            >
                                <btn.icon className="w-3.5 h-3.5" />
                            </button>
                        ))}
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
