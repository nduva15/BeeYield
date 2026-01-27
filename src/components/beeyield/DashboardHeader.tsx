import React, { useEffect, useState } from 'react';
import {
    Search, Moon, Sun, Bell, LifeBuoy, Settings, LogOut,
    ChevronDown, Check, Signal
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

    const getTitle = () => {
        switch (activeTab) {
            case 'devices': return { title: t('nav_measurement_data'), subtitle: t('device_subtitle') };
            case 'assistant': return { title: t('nav_ai_assistant'), subtitle: t('agro_intel_desc') || 'Intelligent beekeeping insights.' };
            case 'places': return { title: t('nav_my_places'), subtitle: t('places_desc') || 'Manage your apiaries and locations.' };
            case 'beeyield': return { title: t('nav_beeyield_hives'), subtitle: t('hives_desc') || 'Comprehensive hive management.' };
            case 'billing': return { title: t('billing'), subtitle: t('billing_desc') || 'Manage your subscription and usage.' };
            case 'support': return { title: t('nav_support'), subtitle: t('support_desc') || 'Get help and track requests.' };
            case 'settings': return { title: t('settings'), subtitle: t('region_language') };
            default:
                if (activeTab.startsWith('meters')) return { title: t('nav_meters'), subtitle: t('meters_desc') || 'Energy and consumption monitoring.' };
                return { title: t('dashboard_title'), subtitle: t('dashboard_subtitle') };
        }
    };

    const headerContent = getTitle();

    return (
        <div className="bg-white/70 backdrop-blur-md border-b border-[#E5E5E5]/60 px-8 py-5 flex items-center justify-between gap-6 sticky top-0 z-50 transition-all antialiased">
            {/* Title Area - Enhanced Typography */}
            <div className="flex flex-col min-w-[220px]">
                <h1 className="text-[20px] font-semibold text-[#171717] tracking-[-0.02em] leading-tight">
                    {headerContent.title}
                </h1>
                <p className="text-[13px] text-[#737373] font-medium mt-0.5 tracking-tight">
                    {headerContent.subtitle}
                </p>
            </div>

            {/* Actions Area */}
            <div className="flex items-center gap-4 flex-1 justify-end">
                {/* Search - Refined */}
                <div className="relative group max-w-[420px] flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3] group-focus-within:text-[#171717] transition-all" />
                    <input
                        placeholder={t('search_placeholder')}
                        className="w-full bg-[#F5F5F5]/50 border border-[#E5E5E5]/80 pl-11 h-11 rounded-xl text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-[#E5E5E5] focus:bg-white transition-all placeholder:text-[#A3A3A3]"
                    />
                </div>

                <div className="flex items-center gap-2">
                    {/* Language Selector */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-11 px-4 rounded-xl bg-white border border-[#E5E5E5] gap-3 hover:bg-[#FAFAFA] transition-all group shrink-0 shadow-sm active:scale-95">
                                <div className="w-5 h-3 overflow-hidden shadow-sm border border-black/5 rounded-[2px]">
                                    <img src={selectedLang.flag} alt={selectedLang.country} className="w-full h-full object-cover" />
                                </div>
                                <span className="text-[13px] font-semibold text-[#171717]">{selectedLang.name}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5 bg-white border border-[#E5E5E5] shadow-[0_10px_25_rgba(0,0,0,0.08)]">
                            {languages.map((lang) => (
                                <DropdownMenuItem
                                    key={lang.code}
                                    onClick={() => setLanguage(lang.code)}
                                    className={cn(
                                        "flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-colors mb-0.5 last:mb-0",
                                        language === lang.code ? "bg-[#F5F5F5] text-[#171717]" : "hover:bg-[#FAFAFA]"
                                    )}
                                >
                                    <div className="w-5 h-3 overflow-hidden border border-black/5 shrink-0 rounded-[1px]">
                                        <img src={lang.flag} alt={lang.country} className="w-full h-full object-cover" />
                                    </div>
                                    <span className="text-[13px] font-medium">{lang.name}</span>
                                    {language === lang.code && <Check className="w-3.5 h-3.5 ml-auto text-[#171717]" />}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Action Icons */}
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <Button variant="ghost" size="icon" onClick={toggleTheme} className="w-11 h-11 rounded-xl bg-white border border-[#E5E5E5] hover:bg-[#FAFAFA] shadow-sm transition-all active:scale-95">
                            {theme === 'light' ? <Sun className="w-[18px] h-[18px] text-[#737373]" /> : <Moon className="w-[18px] h-[18px] text-[#2563EB]" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="w-11 h-11 rounded-xl bg-white border border-[#E5E5E5] hover:bg-[#FAFAFA] shadow-sm relative transition-all active:scale-95">
                            <Bell className="w-[18px] h-[18px] text-[#737373]" />
                            <span className="absolute top-[13px] right-[13px] w-1.5 h-1.5 bg-[#2563EB] rounded-full border border-white" />
                        </Button>
                        <div className="w-[1px] h-6 bg-[#E5E5E5] mx-1.5" />
                        <Button variant="ghost" size="icon" onClick={() => onTabChange('settings')} className="w-11 h-11 rounded-xl bg-white border border-[#E5E5E5] hover:bg-[#FAFAFA] shadow-sm transition-all active:scale-95">
                            <Settings className="w-[18px] h-[18px] text-[#737373]" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};



export default DashboardHeader;
