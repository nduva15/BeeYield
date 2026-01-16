import React, { useEffect, useState } from 'react';
import { Search, Moon, Sun, Bell, User, Menu, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

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

    return (
        <header className="flex items-center justify-between py-3 px-6 bg-white dark:bg-card border-b border-gray-100 dark:border-border sticky top-0 z-50">
            {/* Left: Breadcrumb */}
            <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Application</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Dashboard</span>
            </div>

            {/* Center: Search */}
            <div className="flex-1 flex justify-center max-w-xl px-8">
                <div className="relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search..."
                        className="pl-11 bg-gray-50 dark:bg-muted border-0 rounded-lg h-10 w-full placeholder:text-muted-foreground/60 text-sm focus-visible:ring-1 focus-visible:ring-amber-500"
                    />
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
                <button
                    onClick={toggleTheme}
                    className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-muted hover:bg-gray-100 dark:hover:bg-muted/80 flex items-center justify-center transition-colors"
                >
                    {theme === 'light' ? (
                        <Sun className="w-4 h-4 text-amber-500" />
                    ) : (
                        <Moon className="w-4 h-4 text-amber-400" />
                    )}
                </button>

                <button className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-muted hover:bg-gray-100 dark:hover:bg-muted/80 flex items-center justify-center transition-colors relative">
                    <Bell className="w-4 h-4 text-muted-foreground" />
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-500 rounded-full" />
                </button>

                {/* User Avatar */}
                <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-200 dark:border-border">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                        <User className="w-4 h-4 text-white" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
