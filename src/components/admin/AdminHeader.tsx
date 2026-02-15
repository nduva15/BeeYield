import React from 'react';
import { Search, Bell, User, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface AdminHeaderProps {
    onLogout: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onLogout }) => {
    return (
        <header className="flex items-center justify-between py-4 px-6 bg-white/80 backdrop-blur-md border-b border-beeyield-green/5 sticky top-0 z-50">
            {/* Left: Breadcrumb */}
            <div className="flex items-center gap-3">
                <span className="text-sm text-beeyield-green/40 font-medium">Application</span>
                <ChevronRight className="w-4 h-4 text-beeyield-green/20" />
                <span className="text-sm font-bold text-beeyield-green">Dashboard</span>
            </div>

            {/* Center: Search */}
            <div className="flex-1 flex justify-center max-w-xl px-8">
                <div className="relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-beeyield-green/30" />
                    <Input
                        placeholder="Search system..."
                        className="pl-11 bg-beeyield-green/5 border-transparent hover:bg-beeyield-green/10 transition-colors rounded-xl h-10 w-full placeholder:text-beeyield-green/30 text-sm focus-visible:ring-1 focus-visible:ring-beeyield-gold text-beeyield-green font-medium"
                    />
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
                <button className="w-10 h-10 rounded-xl bg-beeyield-gold/10 hover:bg-beeyield-gold/20 flex items-center justify-center transition-all relative group">
                    <Bell className="w-5 h-5 text-beeyield-gold group-hover:scale-110 transition-transform" />
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-beeyield-orange rounded-full ring-2 ring-white animate-pulse" />
                </button>

                {/* User Avatar */}
                <div className="flex items-center gap-3 ml-2 pl-4 border-l border-beeyield-green/10">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-beeyield-gold to-beeyield-orange flex items-center justify-center shadow-soft hover:shadow-glow transition-all cursor-pointer ring-2 ring-white">
                        <User className="w-4 h-4 text-white" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
