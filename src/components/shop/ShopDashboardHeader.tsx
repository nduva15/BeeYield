import React from 'react';
import { Bell, ShoppingBag, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

interface ShopDashboardHeaderProps {
    onLogout: () => void;
    onTabChange: (tab: string) => void;
}

const ShopDashboardHeader: React.FC<ShopDashboardHeaderProps> = ({ onLogout, onTabChange }) => {
    const { user } = useAuth();
    const meta = user?.user_metadata || {};

    return (
        <header className="flex items-center justify-between py-5 px-10 bg-white/70 backdrop-blur-xl border-b border-beeyield-green/5 sticky top-0 z-50">
            {/* Greeting */}
            <div className="flex-1">
                <h2 className="text-xl font-black text-beeyield-green italic tracking-tight">
                    Welcome back, <span className="text-beeyield-gold not-italic">{meta.first_name || 'Customer'}</span>!
                </h2>
                <p className="text-[10px] text-beeyield-green/40 font-black uppercase tracking-[0.2em] mt-1">Personal Harvest Station</p>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                <div className="relative hidden md:block w-72">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-beeyield-green/20" />
                    <Input
                        placeholder="Locate past orders..."
                        className="pl-12 bg-beeyield-green/[0.03] border-beeyield-green/10 rounded-full h-12 w-full focus-visible:ring-4 focus-visible:ring-beeyield-gold/10 text-[13px] font-bold text-beeyield-green placeholder:text-beeyield-green/20 shadow-inner"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => onTabChange('orders')}
                        className="w-12 h-12 rounded-full bg-white border border-beeyield-green/10 text-beeyield-green/40 hover:text-beeyield-green hover:bg-beeyield-cream/30 flex items-center justify-center transition-all shadow-sm shadow-beeyield-green/5 group"
                        title="My Orders"
                    >
                        <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>

                    <button
                        onClick={() => onTabChange('help')}
                        className="w-12 h-12 rounded-full bg-white border border-beeyield-green/10 text-beeyield-green/40 hover:text-beeyield-green hover:bg-beeyield-cream/30 flex items-center justify-center transition-all shadow-sm shadow-beeyield-green/5 group"
                        title="Notifications"
                    >
                        <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    </button>

                    <div className="h-8 w-px bg-beeyield-green/5 mx-2" />

                    <div className="flex items-center gap-4 pl-2 cursor-pointer group" onClick={() => onTabChange('profile')}>
                        <div className="w-11 h-11 rounded-full bg-beeyield-gold/10 flex items-center justify-center border-2 border-white shadow-md overflow-hidden group-hover:scale-105 transition-transform">
                            {meta.avatar_url ? (
                                <img src={meta.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-5 h-5 text-beeyield-green" />
                            )}
                        </div>
                        <div className="hidden lg:block text-left">
                            <p className="text-[13px] font-black text-beeyield-green leading-none group-hover:text-beeyield-gold transition-colors">{meta.first_name} {meta.last_name}</p>
                            <p className="text-[10px] text-beeyield-green/30 font-bold mt-1.5">{user?.email}</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default ShopDashboardHeader;
