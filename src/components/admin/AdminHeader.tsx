import React from 'react';
import { Search, Bell, User, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface AdminHeaderProps {
    onLogout: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onLogout }) => {
    return (
        <header className="flex items-center justify-between py-3 px-6 bg-white border-b border-gray-100 sticky top-0 z-50">
            {/* Left: Breadcrumb */}
            <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Application</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Dashboard</span>
            </div>

            {/* Center: Search */}
            <div className="flex-1 flex justify-center max-w-xl px-8">
                <div className="relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search..."
                        className="pl-11 bg-gray-50 border-0 rounded-lg h-10 w-full placeholder:text-muted-foreground/60 text-sm focus-visible:ring-1 focus-visible:ring-amber-500"
                    />
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
                <button className="w-9 h-9 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors relative">
                    <Bell className="w-4 h-4 text-muted-foreground" />
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-500 rounded-full" />
                </button>

                {/* User Avatar */}
                <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-200">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                        <User className="w-4 h-4 text-white" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
