import React, { useEffect, useState } from 'react';
import {
    Search, Bell, LifeBuoy, Settings, LogOut,
    ChevronDown, Check, Signal, Headphones, Wifi, PlusCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    onQuickAction?: () => void;
}

const languages = [
    { code: 'EN' as LanguageCode, name: 'English', country: 'United Kingdom', flag: 'https://flagcdn.com/gb.svg' },
    { code: 'FR' as LanguageCode, name: 'Français', country: 'France', flag: 'https://flagcdn.com/fr.svg' },
    { code: 'DE' as LanguageCode, name: 'Deutsch', country: 'Germany', flag: 'https://flagcdn.com/de.svg' },
    { code: 'ES' as LanguageCode, name: 'Español', country: 'Spain', flag: 'https://flagcdn.com/es.svg' },
    { code: 'SW' as LanguageCode, name: 'Kiswahili', country: 'Kenya', flag: 'https://flagcdn.com/ke.svg' },
    { code: 'ZH' as LanguageCode, name: '中文', country: 'China', flag: 'https://flagcdn.com/cn.svg' },
    { code: 'PL' as LanguageCode, name: 'Polski', country: 'Poland', flag: 'https://flagcdn.com/pl.svg' },
];

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onLogout, onTabChange, activeTab, onQuickAction }) => {
    const { language, setLanguage, t } = useLanguage();
    const { user } = useAuth();

    const selectedLang = languages.find(l => l.code === language) || languages[0];

    return (
        <div className="w-full flex items-center justify-between py-6 px-10 sticky top-0 z-50 bg-[#F9F7F2]/80 backdrop-blur-xl border-b border-[#E0E0E0] antialiased">
            {/* Left Spacer */}
            <div className="flex-1 hidden md:block" />

            {/* Right Actions Area */}
            <div className="flex items-center gap-4 justify-end flex-[3]">

                {/* Search Bar - Slim and Premium */}
                <div className="relative group min-w-[320px] max-w-[420px]">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-beeyield-forest transition-all" />
                    <input
                        placeholder={t('search_placeholder') || 'Search hive logs...'}
                        className="w-full bg-white border border-[#E0E0E0] pl-12 pr-6 h-11 rounded-xl text-[13px] font-medium text-beeyield-charcoal focus:outline-none focus:ring-4 focus:ring-beeyield-forest/5 focus:border-beeyield-forest/20 transition-all placeholder:text-gray-300 shadow-sm"
                    />
                </div>

                {/* Language Selector */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-11 px-5 rounded-xl bg-white border border-[#E0E0E0] gap-3 hover:bg-gray-50 transition-all shrink-0 shadow-sm">
                            <div className="w-5 h-3.5 overflow-hidden shadow-sm border border-black/5 rounded-sm">
                                <img src={selectedLang.flag} alt={selectedLang.country} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600">{selectedLang.name}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 bg-white border border-[#E0E0E0] shadow-xl">
                        {languages.map((lang) => (
                            <DropdownMenuItem
                                key={lang.code}
                                onClick={() => setLanguage(lang.code)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all mb-1 last:mb-0 text-[12px] font-semibold",
                                    language === lang.code ? "bg-beeyield-forest/[0.04] text-beeyield-forest" : "hover:bg-gray-50 text-gray-500"
                                )}
                            >
                                <div className="w-5 h-3.5 overflow-hidden border border-black/5 shrink-0 rounded-[2px]">
                                    <img src={lang.flag} alt={lang.country} className="w-full h-full object-cover" />
                                </div>
                                <span>{lang.name}</span>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-11 px-3.5 rounded-xl bg-white border border-[#E0E0E0] hover:bg-gray-50 shadow-sm flex items-center gap-1.5 group relative">
                            <Bell className="w-4 h-4 text-gray-400 group-hover:text-beeyield-forest transition-colors" />
                            <ChevronDown className="w-3 h-3 text-gray-300" />
                            <div className="absolute top-2.5 right-3 w-2 h-2 rounded-full bg-beeyield-forest border-2 border-white" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 rounded-2xl p-4 bg-white border border-[#E0E0E0] shadow-xl">
                        <div className="p-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center border-b border-gray-50 mb-4">Feed Active</div>
                        <div className="flex flex-col items-center justify-center py-8 opacity-40">
                            <Check className="w-8 h-8 text-beeyield-forest mb-3" />
                            <p className="text-xs font-semibold text-gray-500 italic">No new telemetry pings</p>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Status Indicator */}
                <div className="hidden lg:flex items-center gap-2.5 px-4 h-11 rounded-xl border border-[#E0E0E0] bg-white shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-beeyield-forest animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-beeyield-forest/60">Node: Persistent</span>
                </div>

                {/* IoT Connection */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-11 px-3.5 rounded-xl bg-white border border-[#E0E0E0] hover:bg-gray-50 shadow-sm flex items-center gap-1.5 group">
                            <Wifi className="w-4 h-4 text-gray-400 group-hover:text-beeyield-forest transition-colors" />
                            <ChevronDown className="w-3 h-3 text-gray-300" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 rounded-2xl p-5 bg-white border border-[#E0E0E0] shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="relative">
                                <div className="w-2.5 h-2.5 rounded-full bg-beeyield-forest" />
                                <div className="absolute inset-0 rounded-full bg-beeyield-forest animate-ping opacity-30" />
                            </div>
                            <span className="text-[11px] font-bold uppercase tracking-widest text-beeyield-forest">Bridge Active</span>
                        </div>
                        <div className="text-[10px] font-bold text-gray-400 tracking-wider">Node Hub-042 // Floaria-01</div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Settings */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onTabChange('settings')}
                    className="w-11 h-11 rounded-xl bg-white border border-[#E0E0E0] hover:bg-gray-50 shadow-sm group transition-all"
                >
                    <Settings className="w-4 h-4 text-gray-400 group-hover:rotate-45 group-hover:text-beeyield-forest transition-all" />
                </Button>

                {/* Logout Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onLogout}
                    className="w-11 h-11 rounded-xl bg-white border border-[#E0E0E0] hover:bg-red-50 hover:text-red-600 hover:border-red-100 shadow-sm transition-all group"
                >
                    <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                </Button>
            </div>
        </div>
    );
};

export default DashboardHeader;
