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
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onTabChange }) => {
    const { user, beeyieldUser } = useAuth();
    const { language, setLanguage } = useLanguage();

    return (
        <header className="h-20 bg-white border-b-2 border-black sticky top-0 z-30 flex items-center justify-between px-8">
            {/* System Status */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 px-3 py-1 bg-black border-2 border-black text-white">
                    <Signal className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">Status: Online</span>
                </div>
                <div className="hidden md:flex items-center gap-3 text-black">
                    <Terminal className="w-4 h-4 opacity-40" />
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">session/registry</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
                <div className="hidden lg:flex items-center border-2 border-black h-11 px-4 bg-white transition-none focus-within:bg-neutral-50">
                    <Search className="w-4 h-4 text-black mr-3" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent border-none outline-none text-[10px] font-bold uppercase text-black placeholder:text-neutral-300 w-48"
                    />
                </div>

                <div className="h-11 w-2 bg-black/10 mx-2 hidden lg:block" />

                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="h-11 w-11 border-2 border-black bg-white flex items-center justify-center hover:bg-neutral-100 transition-none">
                            <Bell className="w-4 h-4" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 rounded-none border-2 border-black p-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white animate-none">
                        <div className="bg-black p-4 border-b-2 border-black">
                            <p className="text-[10px] font-bold text-white uppercase tracking-widest">Alerts</p>
                        </div>
                        <div className="p-4 text-center py-10">
                            <RefreshCw className="w-8 h-8 text-neutral-200 mx-auto mb-3" />
                            <p className="text-[10px] font-bold uppercase text-neutral-300">No Notifications</p>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Profile */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="h-11 flex items-center gap-3 px-4 border-2 border-black bg-[#FF4F00] text-white hover:bg-black transition-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1">
                            <div className="w-6 h-6 border-2 border-white/20 bg-white/10 overflow-hidden flex items-center justify-center">
                                <User className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest hidden md:block">User: Admin</span>
                            <ChevronDown className="w-3 h-3" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-none border-2 border-black p-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white animate-none">
                        <DropdownMenuLabel className="p-4 text-[10px] font-bold uppercase text-neutral-400 bg-neutral-50">Account</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-black/10 m-0" />
                        <DropdownMenuItem onClick={() => onTabChange('settings')} className="p-4 text-[10px] font-bold uppercase hover:bg-[#FF4F00] hover:text-white focus:bg-[#FF4F00] focus:text-white rounded-none cursor-pointer transition-none">
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem className="p-4 text-[10px] font-bold uppercase hover:bg-neutral-100 focus:bg-neutral-100 rounded-none cursor-pointer transition-none">
                            API Keys
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};

export default DashboardHeader;
