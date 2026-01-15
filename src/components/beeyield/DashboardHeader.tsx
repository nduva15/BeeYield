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
            <div className="flex items-center gap-2 ml-4">
                {/* Language */}
                <Button variant="ghost" className="rounded-full gap-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1e1e1e]">
                    <img src="https://flagcdn.com/w20/gb.png" alt="English" className="w-5 h-auto rounded-sm" />
                    <span className="hidden md:inline">English</span>
                </Button>

                {/* Theme Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className="rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-[#1e1e1e]"
                >
                    {theme === 'light' ? (
                        <Sun className="w-5 h-5" />
                    ) : (
                        <Moon className="w-5 h-5 text-blue-400" />
                    )}
                    <span className="sr-only">Toggle theme</span>
                </Button>

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-[#1e1e1e] relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#09090b]"></span>
                </Button>

                {/* Support */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onTabChange('requests')}
                    className="rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-[#1e1e1e]"
                >
                    <Headphones className="w-5 h-5" />
                </Button>

                {/* Connectivity */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onTabChange('online')}
                    className="rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-[#1e1e1e]"
                >
                    <Wifi className="w-5 h-5 text-green-500" />
                </Button>

                {/* Settings */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onTabChange('settings')}
                    className="rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-[#1e1e1e]"
                >
                    <Settings className="w-5 h-5" />
                </Button>

                <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1" />

                {/* Logout */}
                <Button variant="ghost" size="icon" onClick={onLogout} className="rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-[#1e1e1e]">
                    <LogOut className="w-5 h-5" />
                </Button>
            </div>
        </header>
    );
};

export default DashboardHeader;
