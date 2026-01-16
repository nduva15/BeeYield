import React, { useEffect, useState } from 'react';
import { Search, Moon, Sun, Bell, Headphones, Settings, LogOut, Puzzle, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

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

    const navIcons = [
        { icon: Bell, id: 'requests' },
        { icon: Headphones, id: 'support' },
        { icon: Puzzle, id: 'agro-intelligence' },
        { icon: Settings, id: 'settings' }
    ];

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="flex items-center justify-between py-3 px-6 m-4 mb-0 rounded-3xl bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg sticky top-4 z-50"
        >
            {/* Search - Glassy and Modern */}
            <div className="flex-1 max-w-xl">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search apiaries, beehives or data..."
                        className="pl-11 bg-gray-100/50 dark:bg-white/5 border-transparent focus:bg-white dark:focus:bg-black/40 rounded-2xl h-11 w-full focus-visible:ring-2 focus-visible:ring-primary/20 shadow-none transition-all duration-300 placeholder:text-muted-foreground/60"
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 ml-4">
                {/* Language */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-3 h-11 rounded-xl bg-gray-50/50 dark:bg-white/5 border border-transparent hover:bg-white hover:shadow-md transition-all duration-300"
                >
                    <img src="https://flagcdn.com/w20/gb.png" alt="English" className="w-5 h-auto rounded-sm shadow-sm" />
                    <span className="font-bold text-xs text-muted-foreground uppercase tracking-wider">EN</span>
                </motion.button>

                <div className="h-6 w-px bg-gray-200 dark:bg-white/10 mx-1" />

                {/* Icons */}
                {navIcons.map((item, idx) => (
                    <motion.button
                        key={item.id}
                        whileHover={{ scale: 1.1, backgroundColor: "var(--background)" }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onTabChange(item.id)}
                        className="w-11 h-11 rounded-xl bg-gray-50/50 dark:bg-white/5 text-muted-foreground hover:text-primary hover:shadow-lg hover:shadow-primary/10 flex items-center justify-center transition-all duration-300"
                    >
                        <item.icon className="w-5 h-5" />
                    </motion.button>
                ))}

                {/* Theme Toggle */}
                <motion.button
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleTheme}
                    className="w-11 h-11 rounded-xl bg-gray-50/50 dark:bg-white/5 text-muted-foreground hover:text-amber-500 hover:shadow-lg hover:shadow-amber-500/20 flex items-center justify-center transition-all duration-300"
                >
                    {theme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </motion.button>

                <div className="h-6 w-px bg-gray-200 dark:bg-white/10 mx-1" />

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onLogout}
                    className="flex items-center gap-2 px-4 h-11 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 font-medium text-sm transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Exit</span>
                </motion.button>
            </div>
        </motion.header>
    );
};

export default DashboardHeader;

