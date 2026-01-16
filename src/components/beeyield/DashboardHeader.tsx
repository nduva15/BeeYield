import React, { useEffect, useState } from 'react';
import {
    Search, Moon, Sun, BellRing, LifeBuoy, Settings2, LogOut,
    Sparkles, Command, User, ChevronDown, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageCode } from '@/lib/translations';

interface DashboardHeaderProps {
    onLogout: () => void;
    onTabChange: (tab: string) => void;
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

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onLogout, onTabChange }) => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const { language, setLanguage, t } = useLanguage();
    const { user } = useAuth();

    // Find initial selected language object
    const selectedLang = languages.find(l => l.code === language) || languages[0];

    // Initialize theme
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const initialTheme = savedTheme || systemTheme;

        setTheme(initialTheme);
        if (initialTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);

        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const handleLanguageChange = (lang: typeof languages[0]) => {
        setLanguage(lang.code);
        toast.success(`Language changed to ${lang.name} (${lang.country})`);
    };

    const actionIcons = [
        { icon: Sparkles, id: 'assistant', label: t('ai'), color: 'text-purple-500' },
        { icon: LifeBuoy, id: 'support', label: t('help'), color: 'text-blue-500' },
        { icon: BellRing, id: 'requests', label: t('notifications'), color: 'text-orange-500' },
        { icon: Settings2, id: 'settings', label: t('settings'), color: 'text-gray-500' }
    ];

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="flex items-center justify-between py-3 px-6 m-4 mb-2 rounded-[2rem] bg-white/60 dark:bg-black/40 backdrop-blur-2xl border border-white/40 dark:border-white/5 shadow-premium sticky top-4 z-50 transition-all duration-300"
        >
            {/* Search - Spotlight Style */}
            <div className={`flex-1 max-w-2xl transition-all duration-500 ${isSearchFocused ? 'scale-[1.02]' : ''}`}>
                <div className="relative group">
                    <div className={`absolute inset-0 bg-gradient-to-r from-primary/20 to-amber-500/20 rounded-2xl blur-xl opacity-0 transition-opacity duration-500 ${isSearchFocused ? 'opacity-100' : ''}`} />
                    <div className="relative flex items-center bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm transition-all shadow-inner hover:shadow-md focus-within:shadow-lg focus-within:ring-2 focus-within:ring-primary/20">
                        <Search className={`ml-4 w-5 h-5 transition-colors ${isSearchFocused ? 'text-primary' : 'text-muted-foreground'}`} />
                        <Input
                            placeholder={t('search_placeholder')}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                            className="border-none bg-transparent h-12 w-full focus-visible:ring-0 placeholder:text-muted-foreground/50 text-base"
                        />
                        <div className="pr-4 hidden md:flex items-center gap-2">
                            <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded bg-muted/50 px-2 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                <span className="text-xs">⌘</span>K
                            </kbd>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 ml-6">

                {/* Language Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="hidden lg:flex items-center gap-3 px-5 h-11 rounded-full bg-white/60 dark:bg-white/5 border border-white/40 dark:border-white/10 hover:bg-white/80 active:bg-white/90 transition-all font-bold text-xs shadow-sm"
                        >
                            <div className="w-6 h-4 rounded-[2px] overflow-hidden shadow-sm border border-black/10">
                                <img src={selectedLang.flag} alt={selectedLang.country} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-foreground tracking-widest font-black uppercase">{selectedLang.name}</span>
                            <ChevronDown className="w-4 h-4 text-muted-foreground/50" />
                        </motion.button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-60 rounded-[2rem] p-3 bg-white/90 dark:bg-black/90 backdrop-blur-2xl border border-white/40 dark:border-white/10 z-[60] shadow-2xl">
                        <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-4 py-2 opacity-70">{t('region_language')}</DropdownMenuLabel>
                        {languages.map((lang) => (
                            <DropdownMenuItem
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang)}
                                className={`rounded-xl px-3 py-2 cursor-pointer transition-colors mb-1 last:mb-0 focus:bg-primary/10 focus:text-primary ${language === lang.code ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5'}`}
                            >
                                <div className="w-8 h-5 rounded-[2px] overflow-hidden shadow-sm border border-black/10 mr-3">
                                    <img src={lang.flag} alt={lang.country} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex flex-col flex-1">
                                    <span className="text-sm font-semibold leading-tight">{lang.country}</span>
                                    <span className="text-[10px] text-muted-foreground/80 uppercase font-medium">{lang.name}</span>
                                </div>
                                {language === lang.code && <Check className="w-4 h-4 ml-2" />}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-200 dark:via-white/10 to-transparent mx-1 hidden sm:block" />

                {/* Interactive Icons */}
                <div className="flex items-center gap-2">
                    {actionIcons.map((item) => (
                        <motion.button
                            key={item.id}
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onTabChange(item.id)}
                            className="relative group w-11 h-11 rounded-2xl bg-white/40 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 flex items-center justify-center transition-all border border-transparent hover:border-white/50 dark:hover:border-white/10 hover:shadow-lg"
                        >
                            <item.icon className={`w-5 h-5 text-muted-foreground group-hover:${item.color} transition-colors duration-300`} />
                            {item.id === 'requests' && (
                                <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-black shadow-sm" />
                            )}
                        </motion.button>
                    ))}

                    {/* Theme Toggle - Animated */}
                    <motion.button
                        whileHover={{ rotate: 90 }}
                        whileTap={{ scale: 0.8 }}
                        onClick={toggleTheme}
                        className="w-11 h-11 rounded-2xl bg-white/40 dark:bg-white/5 hover:bg-amber-100 dark:hover:bg-amber-900/30 flex items-center justify-center transition-all text-muted-foreground hover:text-amber-500"
                    >
                        <AnimatePresence mode="wait">
                            {theme === 'light' ? (
                                <motion.div
                                    key="sun"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                >
                                    <Sun className="w-5 h-5 fill-current" />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="moon"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                >
                                    <Moon className="w-5 h-5 fill-current" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </div>

                {/* Profile Section */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="ml-2 pl-1 pr-1 py-1 flex items-center gap-3 bg-white/50 dark:bg-white/5 rounded-full border border-white/50 dark:border-white/10 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                        >
                            <Avatar className="h-9 w-9 border-2 border-white dark:border-black shadow-sm">
                                <AvatarImage src={user?.user_metadata?.avatar_url || "https://ui.shadcn.com/avatars/01.png"} alt={user?.user_metadata?.first_name || "Timothy"} />
                                <AvatarFallback className="bg-gradient-to-br from-primary to-amber-600 text-white font-bold">
                                    {user ? (user.user_metadata?.first_name?.charAt(0) + (user.user_metadata?.last_name?.charAt(0) || user.email?.charAt(0).toUpperCase())) : "TN"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden xl:flex flex-col items-start mr-3">
                                <span className="text-xs font-bold text-foreground leading-none">{user?.user_metadata?.first_name || "Timothy"} {user?.user_metadata?.last_name || 'Nduva'}</span>
                                <span className="text-[10px] text-muted-foreground font-medium leading-none mt-1 group-hover:text-primary transition-colors">{user?.user_metadata?.role || 'Professional'}</span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-muted-foreground mr-2 hidden xl:block" />
                        </motion.button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.user_metadata?.first_name || "Timothy"} {user?.user_metadata?.last_name || "Nduva"}</p>
                                <p className="text-xs leading-none text-muted-foreground">{user?.email || "timothy@beeyield.com"}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onTabChange('settings')}>
                            <User className="mr-2 h-4 w-4" />
                            <span>{t('profile')}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onTabChange('billing')}>
                            <Command className="mr-2 h-4 w-4" />
                            <span>{t('billing')}</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20" onClick={onLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>{t('logout')}</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </motion.header>
    );
};

export default DashboardHeader;

