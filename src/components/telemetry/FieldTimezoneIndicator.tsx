import React, { useState, useEffect } from 'react';
import { Clock, Globe, Sun } from 'lucide-react';
import {
    CANONICAL_FIELD_TIMEZONES,
    getSelectedFieldTimezone,
    setSelectedFieldTimezone,
    getCurrentOrchardTimeString
} from '@/lib/fieldTimezone';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const FieldTimezoneIndicator: React.FC = () => {
    const [currentTimezone, setCurrentTimezone] = useState<string>(getSelectedFieldTimezone);
    const [timeString, setTimeString] = useState<string>(getCurrentOrchardTimeString);

    useEffect(() => {
        const updateTime = () => setTimeString(getCurrentOrchardTimeString());
        const timer = setInterval(updateTime, 10000);

        const handleTzChange = (e: any) => {
            setCurrentTimezone(e.detail);
            setTimeString(getCurrentOrchardTimeString());
        };

        window.addEventListener('beeyield:timezone-changed', handleTzChange);
        return () => {
            clearInterval(timer);
            window.removeEventListener('beeyield:timezone-changed', handleTzChange);
        };
    }, []);

    const handleSelect = (tz: string) => {
        setSelectedFieldTimezone(tz);
        setCurrentTimezone(tz);
        setTimeString(getCurrentOrchardTimeString());
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200/90 dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 hover:border-amber-400 text-stone-700 dark:text-stone-300 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                    title="Change Orchard Telemetry Timezone"
                >
                    <Sun className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
                    <span className="font-mono text-[11px]">{timeString}</span>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 shadow-xl">
                <DropdownMenuLabel className="text-xs font-bold text-stone-500 uppercase tracking-wider px-2 py-1">
                    Telemetry Timezone
                </DropdownMenuLabel>
                {Object.values(CANONICAL_FIELD_TIMEZONES).map((tz) => (
                    <DropdownMenuItem
                        key={tz.ianaTimezone}
                        onClick={() => handleSelect(tz.ianaTimezone)}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer ${
                            currentTimezone === tz.ianaTimezone ? 'bg-amber-500/15 font-bold text-amber-900 dark:text-amber-200' : ''
                        }`}
                    >
                        <span>{tz.label}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                            {tz.solarNoonApprox} noon
                        </span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
