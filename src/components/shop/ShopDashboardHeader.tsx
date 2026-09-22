import React from 'react';
import { Bell, ShoppingBag, Search, User, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface ShopDashboardHeaderProps {
    onLogout: () => void;
    onTabChange: (tab: string) => void;
    onToggleSidebar?: () => void;
}

const ShopDashboardHeader: React.FC<ShopDashboardHeaderProps> = ({ onLogout, onTabChange, onToggleSidebar }) => {
    const { user } = useAuth();
    const meta = user?.user_metadata || {};
    const firstName = meta.first_name || meta.full_name?.split(' ')[0] || 'Customer';

    return (
        <header className="flex items-center justify-between py-3 sm:py-4 md:py-5 px-3.5 sm:px-6 md:px-10 bg-[#f9f7f2]/95 backdrop-blur-xs border-b border-[#F4D03F]/15 sticky top-0 z-30">
            {/* Left Section: Mobile Hamburger + Greeting */}
            <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0 pr-2">
                {onToggleSidebar && (
                    <button
                        onClick={onToggleSidebar}
                        className="md:hidden w-9 h-9 rounded-xl bg-white border border-[#F4D03F]/30 text-[#1A1A1A] hover:bg-[#F4D03F]/10 flex items-center justify-center transition-all shadow-xs active:scale-95 flex-shrink-0"
                        aria-label="Open navigation menu"
                    >
                        <Menu className="w-4 h-4 text-[#1A1A1A]" />
                    </button>
                )}

                <div className="min-w-0 flex-1">
                    <h2 className="text-sm sm:text-lg md:text-2xl font-black text-[#1A1A1A] tracking-tight truncate leading-tight">
                        Welcome back, <span className="text-[#B78103]">{firstName}</span>!
                    </h2>
                    <p className="text-[10.5px] sm:text-[12px] text-gray-500 font-medium truncate hidden sm:block">Ready to explore our harvest?</p>
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <div className="relative hidden lg:block w-64 xl:w-72">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search your orders..."
                        className="pl-9 bg-white border-[#F4D03F]/20 rounded-xl h-9.5 w-full focus-visible:ring-2 focus-visible:ring-[#F4D03F]/30 text-[12.5px] font-medium text-[#1A1A1A] placeholder:text-gray-400 shadow-xs"
                    />
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                    <button
                        onClick={() => onTabChange('orders')}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-[#F4D03F]/20 text-gray-600 hover:text-[#1A1A1A] hover:bg-[#F4D03F]/10 flex items-center justify-center transition-all shadow-xs group"
                        title="My Orders"
                    >
                        <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform text-gray-700" />
                    </button>

                    <button
                        onClick={() => onTabChange('help')}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-[#F4D03F]/20 text-gray-600 hover:text-[#1A1A1A] hover:bg-[#F4D03F]/10 flex items-center justify-center transition-all shadow-xs group relative"
                        title="Notifications & Help"
                    >
                        <Bell className="w-4 h-4 group-hover:rotate-12 transition-transform text-gray-700" />
                        <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#F4D03F] rounded-full ring-2 ring-white"></span>
                    </button>

                    <div className="h-5 w-px bg-gray-200 mx-0.5 sm:mx-1 hidden md:block" />

                    <button 
                        className="flex items-center gap-2 pl-0.5 sm:pl-1 cursor-pointer group" 
                        onClick={() => onTabChange('profile')}
                        title="My Account"
                    >
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white flex items-center justify-center border border-[#F4D03F]/30 shadow-xs overflow-hidden group-hover:border-[#F4D03F]/80 transition-all flex-shrink-0">
                            {meta.avatar_url ? (
                                <img src={meta.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#F4D03F]/15 text-[#B78103] font-bold text-xs">
                                    {firstName.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="hidden xl:block text-left relative top-0.5">
                            <p className="text-[12.5px] font-bold text-[#1A1A1A] leading-none group-hover:text-[#B78103] transition-colors truncate max-w-[100px]">{firstName}</p>
                            <p className="text-[10.5px] text-gray-400 font-medium mt-1">My Account</p>
                        </div>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default ShopDashboardHeader;
