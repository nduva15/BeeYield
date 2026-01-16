import React, { useEffect, useState } from 'react';
import { Search, Moon, Sun, Bell, Shield, Settings, LogOut, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AdminHeaderProps {
    onLogout: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onLogout }) => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        const initialTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
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

    const headerIconClass = "w-10 h-10 rounded-xl bg-muted border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground shadow-sm flex items-center justify-center transition-all";

    return (
        <header className="flex items-center justify-between py-3 px-8 bg-background/80 backdrop-blur-md sticky top-0 z-50 border-b border-border/50">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full border border-border">
                    <Activity className="w-4 h-4 text-destructive animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Admin Session Active</span>
                </div>
            </div>

            <div className="flex-1 flex justify-center max-w-2xl px-4">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Global System Search..."
                        className="pl-12 bg-muted border-border rounded-full h-11 w-full focus-visible:ring-1 focus-visible:ring-destructive shadow-sm text-sm"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button onClick={toggleTheme} className={headerIconClass}>
                    {theme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 text-destructive" />}
                </button>

                <button className={headerIconClass}>
                    <Bell className="w-5 h-5" />
                </button>

                <button className={headerIconClass}>
                    <Settings className="w-5 h-5" />
                </button>

                <button onClick={onLogout} className={cn(headerIconClass, "hover:bg-destructive hover:text-white")}>
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
};

// Helper to make cn work if not imported correctly in this file
const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default AdminHeader;
