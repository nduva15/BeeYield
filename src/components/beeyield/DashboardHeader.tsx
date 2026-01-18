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
            case 'devices': return { title: 'MEASUREMENT DATA', subtitle: 'BeeYield devices assigned to your hives.' };
            case 'assistant': return { title: 'AI ASSISTANT', subtitle: 'Intelligent beekeeping insights.' };
            case 'places': return { title: 'MY PLACES', subtitle: 'Manage your apiaries and locations.' };
            case 'beeyield': return { title: 'BEEYIELD HIVES', subtitle: 'Comprehensive hive management.' };
            case 'billing': return { title: 'BILLING', subtitle: 'Manage your subscription and usage.' };
            case 'support': return { title: 'SUPPORT CENTER', subtitle: 'Get help and track requests.' };
            default:
                if (activeTab.startsWith('meters')) return { title: 'METERS', subtitle: 'Energy and consumption monitoring.' };
                return { title: 'DASHBOARD', subtitle: 'Welcome back to your ecosystem.' };
        }
    };

    const headerContent = getTitle();

    return (
        <div className="bg-white dark:bg-[#1A1816] border-b border-slate-100 dark:border-white/10 px-8 py-4 flex items-center justify-between gap-4 sticky top-0 z-50 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all">
            {/* Title Area */}
            <div className="flex flex-col min-w-[200px]">
                <h1 className="text-2xl font-black text-[#0F172A] dark:text-white uppercase tracking-tight">{headerContent.title}</h1>
                <p className="text-[13px] text-slate-400 dark:text-slate-500 font-medium truncate">{headerContent.subtitle}</p>
            </div>

            {/* Actions Area */}
            <div className="flex items-center gap-4 flex-1 justify-end">
                {/* Search */}
                <div className="relative group max-w-[400px] flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                        placeholder="Search apiaries, beehives"
                        className="w-full bg-slate-50/50 dark:bg-white/5 border-slate-200/60 dark:border-white/10 pl-11 h-12 rounded-full text-sm font-medium focus-visible:ring-0 focus-visible:border-blue-400 transition-all placeholder:text-slate-400"
                    />
                </div>

                {/* Language Selector */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-12 px-5 rounded-full bg-slate-50/50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 gap-3 hover:bg-slate-100/50 transition-all group shrink-0">
                            <div className="w-5 h-3 overflow-hidden shadow-sm border border-black/5">
                                <img src={selectedLang.flag} alt={selectedLang.country} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">{selectedLang.name}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-60 rounded-2xl p-2 bg-white dark:bg-[#1A1816] border-slate-200 dark:border-white/10 shadow-xl">
                        {languages.map((lang) => (
                            <DropdownMenuItem
                                key={lang.code}
                                onClick={() => setLanguage(lang.code)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors mb-0.5 last:mb-0",
                                    language === lang.code ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" : "hover:bg-slate-50 dark:hover:bg-white/5"
                                )}
                            >
                                <div className="w-6 h-4 overflow-hidden border border-black/5 shrink-0">
                                    <img src={lang.flag} alt={lang.country} className="w-full h-full object-cover" />
                                </div>
                                <span className="text-sm font-semibold">{lang.name}</span>
                                {language === lang.code && <Check className="w-4 h-4 ml-auto" />}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Action Icons */}
                <div className="flex items-center gap-2 shrink-0">
                    <Button variant="ghost" size="icon" onClick={toggleTheme} className="w-12 h-12 rounded-2xl bg-slate-50/50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 hover:bg-slate-100/50 transition-all">
                        {theme === 'light' ? <Sun className="w-5 h-5 text-slate-500" /> : <Moon className="w-5 h-5 text-blue-400" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl bg-slate-50/50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 hover:bg-slate-100/50 relative transition-all">
                        <Bell className="w-5 h-5 text-slate-500" />
                        <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-white dark:border-[#1A1816]" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onTabChange('support')} className="w-12 h-12 rounded-2xl bg-slate-50/50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 hover:bg-slate-100/50 transition-all focus:bg-slate-100/50">
                        <LifeBuoy className="w-5 h-5 text-slate-500" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl bg-slate-50/50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 hover:bg-slate-100/50 transition-all">
                        <Signal className="w-5 h-5 text-slate-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onTabChange('settings')} className="w-12 h-12 rounded-2xl bg-slate-50/50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 hover:bg-slate-100/50 transition-all">
                        <Settings className="w-5 h-5 text-slate-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onLogout} className="w-12 h-12 rounded-2xl bg-slate-50/50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 hover:bg-red-50 dark:hover:bg-red-500/10 group transition-all">
                        <LogOut className="w-5 h-5 text-slate-500 group-hover:text-red-500 transition-colors" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DashboardHeader;
