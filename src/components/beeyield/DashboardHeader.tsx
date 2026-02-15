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
        <div className="w-full flex items-center justify-between py-5 px-10 sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-beeyield-green/5 antialiased">
            {/* Left Spacer */}
            <div className="flex-1 hidden md:block" />

            {/* Right Actions Area */}
            <div className="flex items-center gap-4 justify-end flex-[3]">

                {/* Search - Refined to match image */}
                <div className="relative group min-w-[320px] max-w-[420px]">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-beeyield-green/20 group-focus-within:text-beeyield-gold transition-all" />
                    <input
                        placeholder={t('search_placeholder')}
                        className="w-full bg-beeyield-green/[0.03] border border-beeyield-green/10 pl-14 pr-6 h-12 rounded-full text-[13px] font-bold text-beeyield-green focus:outline-none focus:ring-4 focus:ring-beeyield-gold/10 focus:border-beeyield-gold/30 transition-all placeholder:text-beeyield-green/20 shadow-inner"
                    />
                </div>

                {/* Language Selector - Full Name + Arrow */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-12 px-6 rounded-full bg-white border border-beeyield-green/10 gap-3 hover:bg-beeyield-cream/30 transition-all shrink-0 shadow-sm shadow-beeyield-green/5">
                            <div className="w-5 h-3.5 overflow-hidden shadow-sm border border-black/5 rounded-sm">
                                <img src={selectedLang.flag} alt={selectedLang.country} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[12px] font-black uppercase tracking-widest text-beeyield-green/70">{selectedLang.name}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-[24px] p-3 bg-white border border-beeyield-green/10 shadow-2xl backdrop-blur-xl">
                        {languages.map((lang) => (
                            <DropdownMenuItem
                                key={lang.code}
                                onClick={() => setLanguage(lang.code)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all mb-1 last:mb-0 text-[12px] font-bold uppercase tracking-wider",
                                    language === lang.code ? "bg-beeyield-gold/10 text-beeyield-green" : "hover:bg-beeyield-cream/50 text-beeyield-green/40"
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


                {/* Notifications + Arrow */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-12 px-4 rounded-full bg-white border border-beeyield-green/10 hover:bg-beeyield-cream/30 shadow-sm shadow-beeyield-green/5 flex items-center gap-1.5 group relative">
                            <Bell className="w-4 h-4 text-beeyield-green/40 group-hover:text-beeyield-gold transition-colors" />
                            <ChevronDown className="w-3 h-3 text-beeyield-green/20" />
                            <div className="absolute top-3 right-3.5 w-2 h-2 rounded-full bg-beeyield-orange ring-2 ring-white animate-pulse" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 rounded-[24px] p-4 bg-white border border-beeyield-green/10 shadow-2xl">
                        <div className="p-2 text-[10px] font-black text-beeyield-green/20 uppercase tracking-[0.25em] text-center">Protocol Stream: Stable</div>
                        <div className="flex flex-col items-center justify-center py-6 opacity-40">
                            <Check className="w-10 h-10 text-beeyield-green/10 mb-2" />
                            <p className="text-xs font-bold text-beeyield-green/40 italic">Zero unread pings</p>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Support (Headset) */}
                <Button variant="ghost" size="icon" onClick={() => onTabChange('support')} className="w-12 h-12 rounded-full bg-white border border-beeyield-green/10 hover:bg-beeyield-cream/30 shadow-sm shadow-beeyield-green/5 group">
                    <Headphones className="w-4 h-4 text-beeyield-green/40 group-hover:text-beeyield-green transition-colors" />
                </Button>

                {/* IoT Connection Status (Wifi Icon) */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-12 px-4 rounded-full bg-white border border-beeyield-green/10 hover:bg-beeyield-cream/30 shadow-sm shadow-beeyield-green/5 flex items-center gap-1.5 group">
                            <Wifi className="w-4 h-4 text-beeyield-green/40 group-hover:text-beeyield-green transition-colors" />
                            <ChevronDown className="w-3 h-3 text-beeyield-green/20" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 rounded-[24px] p-5 bg-white border border-beeyield-green/10 shadow-2xl">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="relative">
                                <div className="w-2.5 h-2.5 rounded-full bg-beeyield-green" />
                                <div className="absolute inset-0 rounded-full bg-beeyield-green animate-ping opacity-30" />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-widest text-beeyield-green">Bridge Active</span>
                        </div>
                        <div className="text-[10px] font-bold text-beeyield-green/30 tracking-wider">Node Hub-042 // KIBERA-GOLD</div>
                        <div className="mt-4 pt-4 border-t border-beeyield-green/5">
                            <div className="flex justify-between text-[9px] font-black text-beeyield-green/20 uppercase">
                                <span>Signal Strength</span>
                                <span className="text-beeyield-green/60">100%</span>
                            </div>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Settings */}
                <Button variant="ghost" size="icon" onClick={() => onTabChange('settings')} className="w-12 h-12 rounded-full bg-white border border-beeyield-green/10 hover:bg-beeyield-cream/30 shadow-sm shadow-beeyield-green/5 group">
                    <Settings className="w-4 h-4 text-beeyield-green/40 group-hover:rotate-45 transition-all" />
                </Button>

                {/* Logout Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onLogout}
                    className="w-12 h-12 rounded-full bg-white border border-beeyield-green/10 hover:bg-beeyield-orange/10 hover:text-beeyield-orange shadow-sm shadow-beeyield-green/5 transition-all group"
                >
                    <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                </Button>
            </div>
        </div>
    );
};

export default DashboardHeader;
