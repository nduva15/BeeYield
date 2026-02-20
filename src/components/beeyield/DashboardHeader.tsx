import React, { useEffect, useState } from 'react';
import {
    Search, Bell, Settings, LogOut,
    ChevronDown, Check, Wifi, Globe, User, Terminal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageCode } from '@/lib/translations';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
    onLogout: () => void;
    onTabChange: (tab: string) => void;
    activeTab: string;
}

const languages = [
    { code: 'EN' as LanguageCode, name: 'ENGLISH' },
    { code: 'FR' as LanguageCode, name: 'FRANÇAIS' },
    { code: 'DE' as LanguageCode, name: 'DEUTSCH' },
    { code: 'ES' as LanguageCode, name: 'ESPAÑOL' },
    { code: 'SW' as LanguageCode, name: 'KISWAHILI' },
    { code: 'ZH' as LanguageCode, name: '中文' },
    { code: 'PL' as LanguageCode, name: 'POLSKI' },
];

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onLogout, onTabChange, activeTab }) => {
    const { language, setLanguage, t } = useLanguage();
    const { user } = useAuth();

    const selectedLang = languages.find(l => l.code === language) || languages[0];

    return (
        <header className="w-full h-20 flex items-center justify-between px-8 bg-white border-b-2 border-black sticky top-0 z-[60] antialiased">
            {/* Context Line - Brutalist Path */}
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-3 px-4 py-2 bg-black text-white">
                    <Terminal className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{activeTab.replace('-', ' ')}</span>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center gap-0">

                {/* Search Bar - Tool UI */}
                <div className="relative border-l-2 border-black last:border-r-2 h-20 flex items-center px-6 group">
                    <Search className="w-4 h-4 text-black mr-4" />
                    <input
                        placeholder="SEARCH DATA..."
                        className="bg-transparent text-[11px] font-bold uppercase tracking-wider focus:outline-none w-48 placeholder:text-gray-400"
                    />
                </div>

                {/* Language - Functional Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="h-20 px-8 border-l-2 border-black hover:bg-gray-50 flex items-center gap-3 transition-colors">
                            <Globe className="w-4 h-4" />
                            <span className="text-[11px] font-black uppercase">{selectedLang.code}</span>
                            <ChevronDown className="w-3 h-3" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-none border-2 border-black p-0 bg-white shadow-none mt-0">
                        {languages.map((lang) => (
                            <DropdownMenuItem
                                key={lang.code}
                                onClick={() => setLanguage(lang.code)}
                                className={cn(
                                    "px-4 py-3 cursor-pointer text-[10px] font-black uppercase rounded-none border-b border-black last:border-none",
                                    language === lang.code ? "bg-emerald-500 text-black" : "hover:bg-gray-100"
                                )}
                            >
                                {lang.name}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Alerts - Counter UI */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="h-20 w-20 border-l-2 border-black hover:bg-gray-50 flex items-center justify-center relative group transition-colors">
                            <Bell className="w-5 h-5" />
                            <div className="absolute top-6 right-6 w-2 h-2 bg-red-500 border border-black" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 rounded-none border-2 border-black p-6 bg-white shadow-none mt-0">
                        <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 border-b-2 border-black pb-2">System Alerts</h4>
                        <div className="py-8 text-center border-2 border-dashed border-gray-200">
                            <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                            <p className="text-[10px] font-bold text-gray-400 uppercase">No active alerts</p>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Profile - Direct UI */}
                <div className="h-20 px-8 border-l-2 border-black flex items-center gap-4 bg-gray-50">
                    <div className="w-8 h-8 bg-black flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-gray-500 uppercase">Status</span>
                        <span className="text-[10px] font-black uppercase tracking-tighter">Connected</span>
                    </div>
                </div>

                {/* Settings & Logout */}
                <button
                    onClick={() => onTabChange('settings')}
                    className="h-20 w-20 border-l-2 border-black hover:bg-gray-50 flex items-center justify-center transition-colors"
                >
                    <Settings className="w-5 h-5" />
                </button>
                <button
                    onClick={onLogout}
                    className="h-20 w-20 border-l-2 border-r-2 border-black hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
};

export default DashboardHeader;
