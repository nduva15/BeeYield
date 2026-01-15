import React, { useEffect, useState } from 'react';
import { Search, Moon, Sun, Bell, Headphones, Wifi, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DashboardHeaderProps {
    onLogout: () => void;
    onTabChange: (tab: string) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onLogout, onTabChange }) => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

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

    const headerIconClass = "w-10 h-10 rounded-xl bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#1e1e1e] text-slate-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1c1c1c] shadow-sm flex items-center justify-center transition-all";

    return (
        <header className="flex items-center justify-between py-3 px-8 bg-[#f8f6f3]/50 dark:bg-[#09090b] backdrop-blur-md sticky top-0 z-50">
            {/* Search - Centered and Slim */}
            <div className="flex-1 flex justify-center max-w-2xl px-4">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search apiaries, beehives"
                        className="pl-12 bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#1e1e1e] rounded-full h-11 w-full focus-visible:ring-1 focus-visible:ring-amber-200 shadow-sm text-sm"
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
                {/* Language */}
                <Button
                    variant="ghost"
                    className="rounded-full gap-2 bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#1e1e1e] text-slate-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#1c1c1c] h-11 px-4 shadow-sm"
                >
                    <img src="https://flagcdn.com/w20/gb.png" alt="English" className="w-5 h-auto rounded-sm" />
                    <span className="font-bold text-xs">English</span>
                </Button>

                {/* Theme Toggle */}
                <button onClick={toggleTheme} className={headerIconClass}>
                    {theme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 text-blue-400" />}
                </button>

                {/* Notifications */}
                <button className={headerIconClass}>
                    <Bell className="w-5 h-5" />
                </button>

                {/* Support Center */}
                <button
                    onClick={() => onTabChange('support')}
                    className={headerIconClass}
                >
                    <Headphones className="w-5 h-5" />
                </button>

                {/* Connectivity */}
                <button
                    onClick={() => onTabChange('online')}
                    className={headerIconClass}
                >
                    <Wifi className="w-5 h-5" />
                </button>

                {/* Settings */}
                <button
                    onClick={() => onTabChange('settings')}
                    className={headerIconClass}
                >
                    <Settings className="w-5 h-5" />
                </button>

                {/* Logout */}
                <button
                    onClick={onLogout}
                    className={headerIconClass}
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
};

export default DashboardHeader;
