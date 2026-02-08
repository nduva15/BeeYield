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
        <div className="w-full flex items-center justify-between py-4 px-10 sticky top-0 z-50 bg-[#F8FAFC] border-b border-slate-200/50 backdrop-blur-md antialiased">
            {/* Left Spacer */}
            <div className="flex-1 hidden md:block" />

            {/* Right Actions Area */}
            <div className="flex items-center gap-3 justify-end flex-[2]">

                {/* Search - Refined to match image */}
                <div className="relative group min-w-[320px] max-w-[420px]">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-500 transition-all" />
                    <input
                        placeholder={t('search_placeholder')}
                        className="w-full bg-white border border-slate-200 pl-14 h-12 rounded-full text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/30 transition-all placeholder:text-slate-400 shadow-sm shadow-slate-100"
                    />
                </div>

                {/* Language Selector - Full Name + Arrow */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-12 px-6 rounded-full bg-white border border-slate-200 gap-3 hover:bg-slate-50 transition-all shrink-0 shadow-sm shadow-slate-100">
                            <div className="w-5 h-3.5 overflow-hidden shadow-sm border border-black/5 rounded-sm">
                                <img src={selectedLang.flag} alt={selectedLang.country} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[13px] font-semibold text-slate-700">{selectedLang.name}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-3xl p-3 bg-white border border-slate-200 shadow-2xl">
                        {languages.map((lang) => (
                            <DropdownMenuItem
                                key={lang.code}
                                onClick={() => setLanguage(lang.code)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors mb-1 last:mb-0",
                                    language === lang.code ? "bg-amber-50 text-amber-700 font-bold" : "hover:bg-slate-50"
                                )}
                            >
                                <div className="w-5 h-3.5 overflow-hidden border border-black/5 shrink-0 rounded-[1px]">
                                    <img src={lang.flag} alt={lang.country} className="w-full h-full object-cover" />
                                </div>
                                <span className="text-[12px] font-medium">{lang.name}</span>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>


                {/* Notifications + Arrow */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-12 px-4 rounded-full bg-white border border-slate-200 hover:bg-slate-50 shadow-sm shadow-slate-100 flex items-center gap-1.5">
                            <Bell className="w-4 h-4 text-slate-600" />
                            <ChevronDown className="w-3 h-3 text-slate-400" />
                            <div className="absolute top-3 right-3.5 w-1.5 h-1.5 rounded-full bg-red-500 ring-2 ring-white" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 rounded-3xl p-2 bg-white border border-slate-200 shadow-2xl">
                        <div className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Alerts</div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Support (Headset) */}
                <Button variant="ghost" size="icon" onClick={() => onTabChange('support')} className="w-12 h-12 rounded-full bg-white border border-slate-200 hover:bg-slate-50 shadow-sm shadow-slate-100">
                    <Headphones className="w-4 h-4 text-slate-600" />
                </Button>

                {/* IoT Connection Status (Wifi Icon) */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-12 px-4 rounded-full bg-white border border-slate-200 hover:bg-slate-50 shadow-sm shadow-slate-100 flex items-center gap-1.5">
                            <Wifi className="w-4 h-4 text-slate-600" />
                            <ChevronDown className="w-3 h-3 text-slate-400" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-3xl p-3 bg-white border border-slate-200 shadow-2xl">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-[11px] font-bold">Bridge Connected</span>
                        </div>
                        <div className="text-[10px] text-slate-400">Hub 42: Active</div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Settings (Double Gear in image looks like custom or just gear) */}
                <Button variant="ghost" size="icon" onClick={() => onTabChange('settings')} className="w-12 h-12 rounded-full bg-white border border-slate-200 hover:bg-slate-50 shadow-sm shadow-slate-100">
                    <Settings className="w-4 h-4 text-slate-600" />
                </Button>

                {/* Logout Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onLogout}
                    className="w-12 h-12 rounded-full bg-white border border-slate-200 hover:bg-red-50 hover:text-red-500 shadow-sm shadow-slate-100 transition-all"
                >
                    <LogOut className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};

export default DashboardHeader;
