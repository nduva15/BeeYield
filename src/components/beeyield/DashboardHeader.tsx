import React, { useEffect, useState } from 'react';
import {
    Search, Moon, Sun, Bell, LifeBuoy, Settings, LogOut,
    ChevronDown, Check, Signal, Headphones, Wifi
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

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onLogout, onTabChange, activeTab }) => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const { language, setLanguage, t } = useLanguage();
    const { user } = useAuth();

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const initialTheme = savedTheme || systemTheme;
        setTheme(initialTheme);
        if (initialTheme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        if (newTheme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    };

    const selectedLang = languages.find(l => l.code === language) || languages[0];

    return (
        <div className="w-full flex items-center justify-between py-4 px-8 sticky top-0 z-50 transition-all antialiased">
            {/* Search - Refined */}
            <div className="relative group max-w-[420px] flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3] group-focus-within:text-[#171717] transition-all" />
                <input
                    placeholder={t('search_placeholder')}
                    className="w-full bg-white border border-[#E5E5E5] pl-11 h-11 rounded-full text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#F4D03F] focus:border-[#F4D03F] focus:bg-white transition-all placeholder:text-[#A3A3A3] shadow-sm"
                />
            </div>

            {/* Actions Area */}
            <div className="flex items-center gap-3 justify-end">
                {/* Language Selector */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-11 px-4 rounded-full bg-white border border-[#E5E5E5] gap-3 hover:bg-[#FAFAFA] hover:border-[#F4D03F]/50 transition-all group shrink-0 shadow-sm active:scale-95">
                            <div className="w-5 h-3 overflow-hidden shadow-sm border border-black/5 rounded-[2px]">
                                <img src={selectedLang.flag} alt={selectedLang.country} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[13px] font-semibold text-[#171717] group-hover:text-[#171717]">{selectedLang.name}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5 bg-white border border-[#E5E5E5] shadow-[0_10px_25_rgba(0,0,0,0.08)]">
                        {languages.map((lang) => (
                            <DropdownMenuItem
                                key={lang.code}
                                onClick={() => setLanguage(lang.code)}
                                className={cn(
                                    "flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-colors mb-0.5 last:mb-0",
                                    language === lang.code ? "bg-[#F4D03F]/10 text-[#1B9157] font-semibold" : "hover:bg-[#FAFAFA]"
                                )}
                            >
                                <div className="w-5 h-3 overflow-hidden border border-black/5 shrink-0 rounded-[1px]">
                                    <img src={lang.flag} alt={lang.country} className="w-full h-full object-cover" />
                                </div>
                                <span className="text-[13px] font-medium">{lang.name}</span>
                                {language === lang.code && <Check className="w-3.5 h-3.5 ml-auto text-[#1B9157]" />}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Theme Toggle */}
                <Button variant="ghost" size="icon" onClick={toggleTheme} className="w-11 h-11 rounded-full bg-white border border-[#E5E5E5] hover:bg-[#FAFAFA] shadow-sm transition-all active:scale-95">
                    {theme === 'light' ? <Sun className="w-[18px] h-[18px] text-[#171717]" /> : <Moon className="w-[18px] h-[18px] text-[#171717]" />}
                </Button>

                {/* Notifications */}
                <Button variant="ghost" className="h-11 px-3 rounded-full bg-white border border-[#E5E5E5] hover:bg-[#FAFAFA] shadow-sm relative transition-all active:scale-95 flex items-center gap-1 min-w-[44px]">
                    <Bell className="w-[18px] h-[18px] text-[#171717]" />
                    <ChevronDown className="w-3 h-3 text-[#A3A3A3]" />
                </Button>

                {/* Support (Headset) */}
                <Button variant="ghost" size="icon" onClick={() => onTabChange('support')} className="w-11 h-11 rounded-full bg-white border border-[#E5E5E5] hover:bg-[#FAFAFA] shadow-sm transition-all active:scale-95">
                    <Headphones className="w-[18px] h-[18px] text-[#171717]" />
                </Button>

                {/* Connection Status (Wifi) */}
                <Button variant="ghost" className="h-11 px-3 rounded-full bg-white border border-[#E5E5E5] hover:bg-[#FAFAFA] shadow-sm relative transition-all active:scale-95 group flex items-center gap-1 min-w-[44px]">
                    <Wifi className="w-[18px] h-[18px] text-[#171717]" />
                    <ChevronDown className="w-3 h-3 text-[#737373]" />
                </Button>

                {/* Settings */}
                <Button variant="ghost" size="icon" onClick={() => onTabChange('settings')} className="w-11 h-11 rounded-full bg-white border border-[#E5E5E5] hover:bg-[#FAFAFA] shadow-sm transition-all active:scale-95">
                    <Settings className="w-[18px] h-[18px] text-[#171717]" />
                </Button>

                {/* Logout */}
                <Button variant="ghost" size="icon" onClick={onLogout} className="w-11 h-11 rounded-full bg-white border border-[#E5E5E5] hover:bg-[#FAFAFA] shadow-sm transition-all active:scale-95">
                    <LogOut className="w-[18px] h-[18px] text-[#171717]" />
                </Button>
            </div>
        </div>
    );
};



export default DashboardHeader;
