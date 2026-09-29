import React from 'react';
import { Sun, Moon, Eye } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface SunlightModeToggleProps {
    className?: string;
    variant?: 'pill' | 'icon';
}

export const SunlightModeToggle: React.FC<SunlightModeToggleProps> = ({
    className,
    variant = 'pill'
}) => {
    const { isSunlightMode, toggleSunlightMode } = useTheme();

    if (variant === 'icon') {
        return (
            <button
                type="button"
                onClick={toggleSunlightMode}
                className={cn(
                    "h-10 w-10 rounded-2xl flex items-center justify-center transition-all border shadow-xs cursor-pointer active:scale-95 touch-manipulation",
                    isSunlightMode
                        ? "bg-amber-500 text-black border-black font-black"
                        : "bg-white/90 dark:bg-stone-900/90 border-stone-200/90 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-amber-400"
                )}
                title={isSunlightMode ? "Disable Sunlight Mode" : "Enable Sunlight High-Contrast Mode for bright fields"}
                aria-label="Toggle Field Sunlight Mode"
            >
                <Sun className={cn("w-4 h-4", isSunlightMode && "stroke-[3]")} />
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={toggleSunlightMode}
            className={cn(
                "inline-flex items-center gap-1.5 h-10 px-3.5 rounded-2xl text-xs font-bold transition-all border shadow-xs cursor-pointer active:scale-95 touch-manipulation",
                isSunlightMode
                    ? "bg-amber-400 text-black border-black font-black shadow-md"
                    : "bg-white/90 dark:bg-stone-900/90 border-stone-200/90 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-amber-400",
                className
            )}
            title="Toggle High-Contrast Outdoor Field Mode"
            aria-label="Toggle High-Contrast Outdoor Field Mode"
        >
            <Sun className={cn("w-4 h-4 text-amber-500", isSunlightMode && "text-black stroke-[3]")} />
            <span>{isSunlightMode ? "Sunlight Mode: ON" : "Field Sun Mode"}</span>
        </button>
    );
};
