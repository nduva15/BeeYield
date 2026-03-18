import React from 'react';
import { Bell, ShoppingBag, Search, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface ShopDashboardHeaderProps {
    onLogout: () => void;
    onTabChange: (tab: string) => void;
}

const ShopDashboardHeader: React.FC<ShopDashboardHeaderProps> = ({ onLogout, onTabChange }) => {
    const { user } = useAuth();
    const meta = user?.user_metadata || {};
    const firstName = meta.first_name || meta.full_name?.split(' ')[0] || 'Customer';

    return (
        <header className="flex items-center justify-between py-5 px-6 md:px-10 bg-[#f9f7f2] border-b border-[#F4D03F]/10 sticky top-0 z-40">
            {/* Greeting */}
            <div className="flex-1">
                <h2 className="text-xl md:text-2xl font-bold text-[#1A1A1A] tracking-tight">
                    Welcome back, <span className="text-[#F4D03F]">{firstName}</span>!
                </h2>
                <p className="text-[12px] text-gray-500 font-medium mt-1">Ready to explore our harvest?</p>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                <div className="relative hidden lg:block w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search your orders..."
                        className="pl-10 bg-white border-[#F4D03F]/20 rounded-xl h-10 w-full focus-visible:ring-2 focus-visible:ring-[#F4D03F]/30 text-[13px] font-medium text-[#1A1A1A] placeholder:text-gray-400 shadow-sm"
                    />
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                    <button
                        onClick={() => onTabChange('orders')}
                        className="w-10 h-10 rounded-xl bg-white border border-[#F4D03F]/20 text-gray-500 hover:text-[#1A1A1A] hover:bg-[#F4D03F]/5 flex items-center justify-center transition-all shadow-sm group"
                        title="My Orders"
                    >
                        <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>

                    <button
                        onClick={() => onTabChange('help')}
                        className="w-10 h-10 rounded-xl bg-white border border-[#F4D03F]/20 text-gray-500 hover:text-[#1A1A1A] hover:bg-[#F4D03F]/5 flex items-center justify-center transition-all shadow-sm group relative"
                        title="Notifications"
                    >
                        <Bell className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-[#F4D03F] rounded-full"></span>
                    </button>

                    <div className="h-6 w-px bg-gray-200 mx-1 md:mx-2 hidden md:block" />

                    <button className="flex items-center gap-3 pl-1 md:pl-2 cursor-pointer group" onClick={() => onTabChange('profile')}>
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-[#F4D03F]/20 shadow-sm overflow-hidden group-hover:border-[#F4D03F]/60 transition-all">
                            {meta.avatar_url ? (
                                <img src={meta.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-4 h-4 text-gray-500" />
                            )}
                        </div>
                        <div className="hidden xl:block text-left relative top-0.5">
                            <p className="text-[13px] font-bold text-[#1A1A1A] leading-none group-hover:text-[#F4D03F] transition-colors">{firstName}</p>
                            <p className="text-[11px] text-gray-400 font-medium mt-1">My Account</p>
                        </div>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default ShopDashboardHeader;
