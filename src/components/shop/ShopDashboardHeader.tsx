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
        <header className="flex items-center justify-between py-4 px-8 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
            {/* Greeting */}
            <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">
                    Welcome back, <span className="text-primary">{meta.first_name || 'Customer'}</span>!
                </h2>
                <p className="text-xs text-gray-500 font-medium">Manage your orders and account preferences.</p>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
                <div className="relative hidden md:block w-64 mr-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search your orders..."
                        className="pl-10 bg-gray-50 border-none rounded-lg h-10 w-full focus-visible:ring-1 focus-visible:ring-primary/20 text-sm"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onTabChange('orders')}
                        className="w-10 h-10 rounded-lg bg-gray-50 text-gray-500 hover:text-primary hover:bg-primary/5 flex items-center justify-center transition-all shadow-sm"
                        title="My Orders"
                    >
                        <ShoppingBag className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => onTabChange('help')}
                        className="w-10 h-10 rounded-lg bg-gray-50 text-gray-500 hover:text-primary hover:bg-primary/5 flex items-center justify-center transition-all shadow-sm"
                        title="Notifications"
                    >
                        <Bell className="w-5 h-5" />
                    </button>

                    <div className="h-8 w-px bg-gray-200 mx-2" />

                    <div className="flex items-center gap-3 pl-2 cursor-pointer" onClick={() => onTabChange('profile')}>
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                            {meta.avatar_url ? (
                                <img src={meta.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-5 h-5 text-primary" />
                            )}
                        </div>
                        <div className="hidden lg:block text-left">
                            <p className="text-sm font-bold text-gray-900 leading-none">{meta.first_name} {meta.last_name}</p>
                            <p className="text-[10px] text-gray-500 font-medium mt-1">{user?.email}</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default ShopDashboardHeader;
