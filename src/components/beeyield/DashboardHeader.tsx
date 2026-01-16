import React, { useEffect, useState } from 'react';
import { Search, Moon, Sun, Bell, Headphones, Wifi, Settings, LogOut, Puzzle } from 'lucide-react';
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

    const headerIconClass = "w-10 h-10 rounded-xl bg-muted border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground shadow-sm flex items-center justify-center transition-all";

    return (
        <header className="flex items-center justify-between py-3 px-8 bg-background/80 backdrop-blur-md sticky top-0 z-50 border-b border-border/50">
            {/* Search - Centered and Slim */}
            <div className="flex-1 flex justify-center max-w-2xl px-4">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search apiaries, beehives"
                        className="pl-12 bg-muted border-border rounded-full h-11 w-full focus-visible:ring-1 focus-visible:ring-primary shadow-sm text-sm"
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
                {/* Language */}
                <Button
                    variant="ghost"
                    className="rounded-full gap-2 bg-muted border border-border text-foreground hover:bg-accent h-11 px-4 shadow-sm"
                >
                    <img src="https://flagcdn.com/w20/gb.png" alt="English" className="w-5 h-auto rounded-sm" />
                    <span className="font-bold text-xs uppercase tracking-tight">EN</span>
                </Button>

                {/* Theme Toggle */}
                <button onClick={toggleTheme} className={headerIconClass}>
                    {theme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 text-primary" />}
                </button>

                {/* Notifications */}
                <button
                    onClick={() => onTabChange('requests')}
                    className={headerIconClass}
                >
                    <Bell className="w-5 h-5" />
                </button>

                {/* Support Center */}
                <button
                    onClick={() => onTabChange('support')}
                    className={headerIconClass}
                >
                    <Headphones className="w-5 h-5" />
                </button>

                {/* Agro Intelligence (Puzzle) */}
                <button
                    onClick={() => onTabChange('agro-intelligence')}
                    className={headerIconClass}
                >
                    <Puzzle className="w-5 h-5" />
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
