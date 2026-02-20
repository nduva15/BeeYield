import React from 'react';
import { cn } from '@/lib/utils';
import {
    Search,
    Bell,
    Settings,
    User,
    ChevronDown,
    Zap,
    Signal,
    Activity,
    Database,
    Globe,
    Terminal,
    RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardHeaderProps {
    onTabChange: (tab: string) => void;
    onLogout: () => void;
    activeTab: string;
    onQuickAction: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    onTabChange,
    onLogout,
    activeTab,
    onQuickAction
}) => {
    const { user, beeyieldUser } = useAuth();
    const { language, setLanguage } = useLanguage();

    return (
        <header className="h-20 bg-white border-b-4 border-[#064e3b] sticky top-0 z-30 flex items-center justify-between px-8">
            {/* System Status */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 px-3 py-1 bg-[#064e3b] border-2 border-[#10b981] text-white">
                    <Signal className="w-3 h-3 text-[#facc15]" />
                    <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap text-white">Status: Online</span>
                </div>
                <div className="hidden md:flex items-center gap-3 text-[#064e3b]">
                    <Terminal className="w-4 h-4 opacity-30" />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-30">session/registry</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onQuickAction}
                    className="hidden sm:flex items-center gap-2 px-4 h-11 bg-[#facc15] border-2 border-[#064e3b] font-black uppercase text-[10px] tracking-widest hover:bg-[#064e3b] hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(6,78,59,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                    <Zap className="w-3 h-3" />
                    Deploy Node
                </button>

                <div className="hidden lg:flex items-center border-2 border-[#064e3b] h-11 px-4 bg-white transition-none focus-within:bg-[#facc15]/5">
                    <Search className="w-4 h-4 text-[#064e3b] mr-3" />
                    <input
                        type="text"
                        placeholder="SEARCH REGISTRY..."
                        className="bg-transparent border-none outline-none text-[10px] font-black uppercase text-[#064e3b] placeholder:text-[#064e3b]/30 w-48"
                    />
                </div>

                <div className="h-11 w-[2px] bg-[#064e3b]/10 mx-2 hidden lg:block" />

                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="h-11 w-11 border-2 border-[#064e3b] bg-white flex items-center justify-center hover:bg-[#facc15]/10 transition-none">
                            <Bell className="w-4 h-4 text-[#064e3b]" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 rounded-none border-4 border-[#064e3b] p-0 shadow-[8px_8px_0px_0px_rgba(6,78,59,1)] bg-white animate-none">
                        <div className="bg-[#064e3b] p-4 border-b-2 border-[#064e3b]">
                            <p className="text-[10px] font-black text-white uppercase tracking-widest">Active Alerts</p>
                        </div>
                        <div className="p-4 text-center py-10 bg-white">
                            <RefreshCw className="w-8 h-8 text-[#064e3b]/10 mx-auto mb-3" />
                            <p className="text-[10px] font-black uppercase text-[#064e3b]/30">No Registry Alerts</p>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Profile */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="h-11 flex items-center gap-3 px-4 border-2 border-[#064e3b] bg-[#10b981] text-white hover:bg-[#064e3b] transition-all shadow-[4px_4px_0px_0px_rgba(6,78,59,1)] active:shadow-none active:translate-x-1 active:translate-y-1">
                            <div className="w-6 h-6 border-2 border-white/20 bg-white/10 overflow-hidden flex items-center justify-center">
                                <User className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">User: Admin</span>
                            <ChevronDown className="w-3 h-3" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-none border-4 border-[#064e3b] p-0 shadow-[8px_8px_0px_0px_rgba(6,78,59,1)] bg-white animate-none">
                        <DropdownMenuLabel className="p-4 text-[10px] font-black uppercase text-[#064e3b]/40 bg-neutral-50 border-b-2 border-[#064e3b]/10">Account Management</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onTabChange('settings')} className="p-4 text-[10px] font-black uppercase hover:bg-[#10b981] hover:text-white focus:bg-[#10b981] focus:text-white rounded-none cursor-pointer transition-none border-b-2 border-[#064e3b]/5">
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem className="p-4 text-[10px] font-black uppercase hover:bg-[#10b981] hover:text-white focus:bg-[#10b981] focus:text-white rounded-none cursor-pointer transition-none border-b-2 border-[#064e3b]/5">
                            Registry Keys
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onLogout} className="p-4 text-[10px] font-black uppercase hover:bg-red-500 hover:text-white focus:bg-red-500 focus:text-white rounded-none cursor-pointer transition-none">
                            System Exit
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};

export default DashboardHeader;
