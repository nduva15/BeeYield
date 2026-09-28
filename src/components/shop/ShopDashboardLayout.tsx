import React, { useState, useCallback } from 'react';
import ShopDashboardSidebar, { ShopNavItem } from './ShopDashboardSidebar';
import ShopDashboardHeader from './ShopDashboardHeader';
import { LayoutGrid, Package, ShoppingBag, Heart, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ShopDashboardLayoutProps {
    children: React.ReactNode;
    activeTab: string;
    onTabChange: (tab: string) => void;
    onLogout: () => void;
    navItems: ShopNavItem[];
    hideHeader?: boolean;
}

const ShopDashboardLayout: React.FC<ShopDashboardLayoutProps> = ({
    children,
    activeTab,
    onTabChange,
    onLogout,
    navItems,
    hideHeader = false
}) => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const navigate = useNavigate();

    const handleToggleSidebar = useCallback(() => {
        requestAnimationFrame(() => {
            React.startTransition(() => {
                setIsMobileOpen((prev) => !prev);
            });
        });
    }, []);

    const handleCloseSidebar = useCallback(() => {
        requestAnimationFrame(() => {
            React.startTransition(() => {
                setIsMobileOpen(false);
            });
        });
    }, []);

    const handleNavClick = useCallback((tab: string) => {
        requestAnimationFrame(() => {
            React.startTransition(() => {
                onTabChange(tab);
            });
        });
    }, [onTabChange]);

    return (
        <div className="flex h-screen bg-[#F9F7F2] overflow-hidden font-sans text-[#1A1A1A] selection:bg-[#F4D03F]/30 selection:text-[#1A1A1A] relative">
            {/* Sidebar (Desktop flex column + Mobile slide-in drawer) */}
            <ShopDashboardSidebar
                activeTab={activeTab}
                onTabChange={onTabChange}
                onLogout={onLogout}
                navItems={navItems}
                isMobileOpen={isMobileOpen}
                onCloseMobile={handleCloseSidebar}
            />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative transition-all duration-300">
                {!hideHeader && (
                    <ShopDashboardHeader
                        onLogout={onLogout}
                        onTabChange={handleNavClick}
                        onToggleSidebar={handleToggleSidebar}
                    />
                )}
                
                <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                    <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 relative z-10 pb-28 md:pb-8">
                        {children}
                    </div>
                </div>

                {/* Mobile Bottom Quick-Navigation Bar (Optimized for Phone Sizing & Instant INP) */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFF9F0]/95 border-t border-[#F4D03F]/25 px-2 py-1.5 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.06)] touch-manipulation select-none">
                    <button
                        type="button"
                        onClick={() => handleNavClick('overview')}
                        className={cn(
                            "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-transform duration-150 min-w-[52px] touch-manipulation active:scale-95 cursor-pointer",
                            activeTab === 'overview' ? "text-[#1A1A1A] font-bold" : "text-gray-500 font-medium"
                        )}
                    >
                        <div className={cn(
                            "p-1.5 rounded-lg transition-colors pointer-events-none",
                            activeTab === 'overview' ? "bg-[#F4D03F]/25 text-[#1A1A1A]" : "text-gray-500"
                        )}>
                            <LayoutGrid className="w-4 h-4 pointer-events-none" />
                        </div>
                        <span className="text-[10px] mt-0.5 tracking-tight pointer-events-none select-none">Overview</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleNavClick('orders')}
                        className={cn(
                            "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-transform duration-150 min-w-[52px] touch-manipulation active:scale-95 cursor-pointer",
                            activeTab === 'orders' ? "text-[#1A1A1A] font-bold" : "text-gray-500 font-medium"
                        )}
                    >
                        <div className={cn(
                            "p-1.5 rounded-lg transition-colors pointer-events-none",
                            activeTab === 'orders' ? "bg-[#F4D03F]/25 text-[#1A1A1A]" : "text-gray-500"
                        )}>
                            <Package className="w-4 h-4 pointer-events-none" />
                        </div>
                        <span className="text-[10px] mt-0.5 tracking-tight pointer-events-none select-none">Orders</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            requestAnimationFrame(() => {
                                React.startTransition(() => {
                                    navigate('/shop');
                                });
                            });
                        }}
                        className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-transform duration-150 min-w-[52px] group touch-manipulation active:scale-95 cursor-pointer"
                    >
                        <div className="p-1.5 rounded-lg bg-[#F4D03F] text-[#1A1A1A] shadow-xs group-hover:scale-105 transition-transform pointer-events-none">
                            <ShoppingBag className="w-4 h-4 pointer-events-none" />
                        </div>
                        <span className="text-[10px] font-black mt-0.5 text-[#1A1A1A] tracking-tight pointer-events-none select-none">Shop</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleNavClick('favorites')}
                        className={cn(
                            "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-transform duration-150 min-w-[52px] touch-manipulation active:scale-95 cursor-pointer",
                            activeTab === 'favorites' ? "text-[#1A1A1A] font-bold" : "text-gray-500 font-medium"
                        )}
                    >
                        <div className={cn(
                            "p-1.5 rounded-lg transition-colors pointer-events-none",
                            activeTab === 'favorites' ? "bg-[#F4D03F]/25 text-[#1A1A1A]" : "text-gray-500"
                        )}>
                            <Heart className="w-4 h-4 pointer-events-none" />
                        </div>
                        <span className="text-[10px] mt-0.5 tracking-tight pointer-events-none select-none">Saved</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleToggleSidebar}
                        className={cn(
                            "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-transform duration-150 min-w-[52px] touch-manipulation active:scale-95 cursor-pointer",
                            isMobileOpen ? "text-[#1A1A1A] font-bold" : "text-gray-500 font-medium"
                        )}
                    >
                        <div className={cn(
                            "p-1.5 rounded-lg transition-colors pointer-events-none",
                            isMobileOpen ? "bg-[#F4D03F]/25 text-[#1A1A1A]" : "text-gray-500"
                        )}>
                            <Menu className="w-4 h-4 pointer-events-none" />
                        </div>
                        <span className="text-[10px] mt-0.5 tracking-tight pointer-events-none select-none">Menu</span>
                    </button>
                </nav>
            </main>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.12); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 0, 0, 0.25); }
            `}</style>
        </div>
    );
};

export default ShopDashboardLayout;
