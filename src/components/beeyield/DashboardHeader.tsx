import React, { useEffect, useState } from 'react';
import { Search, Globe, Moon, Sun, Bell, Headphones, Wifi, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DashboardHeaderProps {
    onLogout: () => void;
    onTabChange: (tab: string) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onLogout, onTabChange }) => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    // Initialize theme from localStorage or system preference
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

    return (
        <header className="flex items-center justify-between py-4 px-8 bg-white dark:bg-[#09090b] border-b border-gray-100 dark:border-[#1e1e1e] sticky top-0 z-10">
            {/* Search */}
            <div className="flex-1 max-w-xl">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search apiaries, beehives"
                        className="pl-10 bg-gray-50 dark:bg-[#1e1e1e] border-none rounded-full h-10 w-full focus-visible:ring-1 focus-visible:ring-gray-200 dark:focus-visible:ring-gray-700"
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 ml-4">
                {/* Language */}
                <Button variant="ghost" className="rounded-xl gap-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1e1e1e] h-10 px-3">
                    <img src="https://flagcdn.com/w20/gb.png" alt="English" className="w-5 h-auto rounded-sm" />
                    <span className="hidden lg:inline font-bold text-xs uppercase tracking-wider">English</span>
                </Button>

                {/* Main Action Group */}
                <div className="flex items-center gap-0.5">
                    {/* Theme Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        className="rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-[#1e1e1e] w-10 h-10"
                    >
                        {theme === 'light' ? (
                            <Sun className="w-5 h-5" />
                        ) : (
                            <Moon className="w-5 h-5 text-blue-400" />
                        )}
                    </Button>

                    {/* Notifications */}
                    <Button variant="ghost" size="icon" className="rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-[#1e1e1e] w-10 h-10 relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#09090b]"></span>
                    </Button>

                    {/* Grid Icon (Hives/Grid) */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onTabChange('beeyield')}
                        className="rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-[#1e1e1e] w-10 h-10"
                    >
                        <div className="grid grid-cols-2 gap-0.5 transform rotate-45 scale-75">
                            <div className="w-2 h-2 bg-gray-400 rounded-sm" />
                            <div className="w-2 h-2 bg-gray-400 rounded-sm" />
                            <div className="w-2 h-2 bg-gray-400 rounded-sm" />
                            <div className="w-2 h-2 bg-gray-400 rounded-sm" />
                        </div>
                    </Button>

                    {/* Shield Icon (Traceability) */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onTabChange('data')}
                        className="rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-[#1e1e1e] w-10 h-10"
                    >
                        <Wifi className="w-5 h-5 text-gray-400" /> {/* Using Wifi as placeholder for the different connectivity icon if needed, wait, the image has Wifi separately */}
                        {/* Actually, let's look at the image again. Grid, Shield, Wifi, Bluetooth */}
                        <Globe className="w-5 h-5 text-gray-400" />
                    </Button>
                </div>

                {/* Connectivity Box */}
                <div className="flex items-center bg-gray-50/50 dark:bg-[#1e1e1e]/40 rounded-xl px-1 ml-1 h-10">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onTabChange('online')}
                        className="rounded-lg text-gray-400 hover:text-green-500 w-8 h-8"
                    >
                        <Wifi className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onTabChange('bluetooth')}
                        className="rounded-lg text-gray-400 hover:text-blue-500 w-8 h-8"
                    >
                        <div className="w-4 h-4 flex items-center justify-center">
                            <span className="text-[10px] font-black">B</span>
                        </div>
                    </Button>
                </div>

                {/* Settings (Amber highlight) */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onTabChange('settings')}
                    className="rounded-xl bg-[#B48428] text-white hover:bg-[#966b1d] w-10 h-10 ml-1 shadow-lg shadow-amber-500/20"
                >
                    <Settings className="w-5 h-5" />
                </Button>

                {/* Logout */}
                <Button variant="ghost" size="icon" onClick={onLogout} className="rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-[#1e1e1e] w-10 h-10 ml-1">
                    <LogOut className="w-5 h-5" />
                </Button>
            </div>
        </header>
    );
};

export default DashboardHeader;
