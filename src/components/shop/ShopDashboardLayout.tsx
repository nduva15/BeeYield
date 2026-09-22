import React, { useState } from 'react';
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

    return (
        <div className="flex h-screen bg-[#F9F7F2] overflow-hidden font-sans text-[#1A1A1A] selection:bg-[#F4D03F]/30 selection:text-[#1A1A1A] relative">
            {/* Sidebar (Desktop flex column + Mobile slide-in drawer) */}
            <ShopDashboardSidebar
                activeTab={activeTab}
                onTabChange={onTabChange}
                onLogout={onLogout}
                navItems={navItems}
                isMobileOpen={isMobileOpen}
                onCloseMobile={() => setIsMobileOpen(false)}
            />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative transition-all duration-300">
                {!hideHeader && (
                    <ShopDashboardHeader
                        onLogout={onLogout}
                        onTabChange={onTabChange}
                        onToggleSidebar={() => setIsMobileOpen(prev => !prev)}
                    />
                )}
                
                <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                    <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 relative z-10 pb-28 md:pb-8">
                        {children}
                    </div>
                </div>

                {/* Mobile Bottom Quick-Navigation Bar (Optimized for Phone Sizing) */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFF9F0]/95 backdrop-blur-md border-t border-[#F4D03F]/25 px-2 py-1.5 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
                    <button
                        onClick={() => onTabChange('overview')}
                        className={cn(
                            "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[52px]",
                            activeTab === 'overview' ? "text-[#1A1A1A] font-bold" : "text-gray-500 font-medium"
                        )}
                    >
                        <div className={cn(
                            "p-1.5 rounded-lg transition-colors",
                            activeTab === 'overview' ? "bg-[#F4D03F]/25 text-[#1A1A1A]" : "text-gray-500"
                        )}>
                            <LayoutGrid className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] mt-0.5 tracking-tight">Overview</span>
                    </button>

                    <button
                        onClick={() => onTabChange('orders')}
                        className={cn(
                            "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[52px]",
                            activeTab === 'orders' ? "text-[#1A1A1A] font-bold" : "text-gray-500 font-medium"
                        )}
                    >
                        <div className={cn(
                            "p-1.5 rounded-lg transition-colors",
                            activeTab === 'orders' ? "bg-[#F4D03F]/25 text-[#1A1A1A]" : "text-gray-500"
                        )}>
                            <Package className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] mt-0.5 tracking-tight">Orders</span>
                    </button>

                    <button
                        onClick={() => navigate('/shop')}
                        className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[52px] group"
                    >
                        <div className="p-1.5 rounded-lg bg-[#F4D03F] text-[#1A1A1A] shadow-xs group-hover:scale-105 transition-transform">
                            <ShoppingBag className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-black mt-0.5 text-[#1A1A1A] tracking-tight">Shop</span>
                    </button>

                    <button
                        onClick={() => onTabChange('favorites')}
                        className={cn(
                            "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[52px]",
                            activeTab === 'favorites' ? "text-[#1A1A1A] font-bold" : "text-gray-500 font-medium"
                        )}
                    >
                        <div className={cn(
                            "p-1.5 rounded-lg transition-colors",
                            activeTab === 'favorites' ? "bg-[#F4D03F]/25 text-[#1A1A1A]" : "text-gray-500"
                        )}>
                            <Heart className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] mt-0.5 tracking-tight">Saved</span>
                    </button>

                    <button
                        onClick={() => setIsMobileOpen(true)}
                        className={cn(
                            "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[52px]",
                            isMobileOpen ? "text-[#1A1A1A] font-bold" : "text-gray-500 font-medium"
                        )}
                    >
                        <div className={cn(
                            "p-1.5 rounded-lg transition-colors",
                            isMobileOpen ? "bg-[#F4D03F]/25 text-[#1A1A1A]" : "text-gray-500"
                        )}>
                            <Menu className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] mt-0.5 tracking-tight">Menu</span>
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
