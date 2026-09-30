import React, { useState } from 'react';
import { ChevronRight, Check, Globe, Thermometer, Scale, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUnits, TempUnit, WeightUnit } from '@/contexts/UnitContext';
import { LanguageCode } from '@/lib/translations';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface RegionalPreferencesCardProps {
    className?: string;
    title?: string;
    subtitle?: string;
}

const LANGUAGES: { code: LanguageCode; name: string; nativeName: string; flag: string }[] = [
    { code: 'EN', name: 'English', nativeName: 'English (US/UK)', flag: '🇬🇧' },
    { code: 'SW', name: 'Swahili', nativeName: 'Kiswahili (East Africa)', flag: '🇰🇪' },
    { code: 'FR', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'DE', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'ES', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'ZH', name: 'Chinese', nativeName: '中文 (Simplified)', flag: '🇨🇳' },
    { code: 'PL', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
];

const TEMP_OPTIONS: { unit: TempUnit; label: string; symbol: string; desc: string }[] = [
    { unit: 'celsius', label: 'Celsius (°C)', symbol: '°C', desc: 'Standard apiculture brood nest benchmark (34.5°C - 35.5°C)' },
    { unit: 'fahrenheit', label: 'Fahrenheit (°F)', symbol: '°F', desc: 'US customary scale for ambient & hive temperature' },
];

const WEIGHT_OPTIONS: { unit: WeightUnit; label: string; symbol: string; desc: string }[] = [
    { unit: 'kg', label: 'Kilograms (kg)', symbol: 'kg', desc: 'International metric standard for hive load & honey batches' },
    { unit: 'lbs', label: 'Pounds (lbs)', symbol: 'lbs', desc: 'Imperial units for scale monitoring & harvest tallies' },
];

export const RegionalPreferencesCard: React.FC<RegionalPreferencesCardProps> = ({
    className,
    title = 'Regional & Unit Preferences',
    subtitle = 'Customize your language and measurement units across live telemetry, charts, and export reports.',
}) => {
    const { language, setLanguage } = useLanguage();
    const { tempUnit, setTempUnit, weightUnit, setWeightUnit, tempUnitLabel, weightUnitLabel } = useUnits();

    const [activeModal, setActiveModal] = useState<'language' | 'temp' | 'weight' | null>(null);

    const currentLanguageObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

    const handleSelectLanguage = (code: LanguageCode) => {
        setLanguage(code);
        setActiveModal(null);
        const selected = LANGUAGES.find((l) => l.code === code);
        toast.success(`Language updated to ${selected?.name || code}`);
    };

    const handleSelectTemp = (unit: TempUnit) => {
        setTempUnit(unit);
        setActiveModal(null);
        toast.success(`Temperature unit set to ${unit === 'celsius' ? 'Celsius (°C)' : 'Fahrenheit (°F)'}`);
    };

    const handleSelectWeight = (unit: WeightUnit) => {
        setWeightUnit(unit);
        setActiveModal(null);
        toast.success(`Weight unit set to ${unit === 'kg' ? 'Kilograms (kg)' : 'Pounds (lbs)'}`);
    };

    return (
        <div className={cn("rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-[#fdfbf7] dark:bg-stone-900/60 p-4 sm:p-5 shadow-xs transition-all", className)}>
            {title && (
                <div className="mb-3.5 pb-2.5 border-b border-stone-200/70 dark:border-stone-800">
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-amber-600" />
                        {title}
                    </h3>
                    {subtitle && (
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                            {subtitle}
                        </p>
                    )}
                </div>
            )}

            <div className="divide-y divide-stone-200/80 dark:divide-stone-800/80">
                {/* 1. Language Row */}
                <button
                    type="button"
                    onClick={() => setActiveModal('language')}
                    className="w-full text-left py-3 px-2 -mx-2 rounded-xl flex items-center justify-between hover:bg-stone-100/70 dark:hover:bg-stone-800/50 transition-colors group cursor-pointer"
                >
                    <div className="space-y-0.5 min-w-0">
                        <span className="text-xs font-medium text-stone-500 dark:text-stone-400 block tracking-tight">
                            Language
                        </span>
                        <p className="text-sm sm:text-base font-semibold text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors truncate">
                            {currentLanguageObj.name}
                        </p>
                    </div>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-stone-400 dark:text-stone-500 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-3" />
                </button>

                {/* 2. Temperature Unit Row */}
                <button
                    type="button"
                    onClick={() => setActiveModal('temp')}
                    className="w-full text-left py-3 px-2 -mx-2 rounded-xl flex items-center justify-between hover:bg-stone-100/70 dark:hover:bg-stone-800/50 transition-colors group cursor-pointer"
                >
                    <div className="space-y-0.5 min-w-0">
                        <span className="text-xs font-medium text-stone-500 dark:text-stone-400 block tracking-tight">
                            Temperature unit
                        </span>
                        <p className="text-sm sm:text-base font-semibold text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors truncate">
                            {tempUnitLabel}
                        </p>
                    </div>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-stone-400 dark:text-stone-500 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-3" />
                </button>

                {/* 3. Weight Unit Row */}
                <button
                    type="button"
                    onClick={() => setActiveModal('weight')}
                    className="w-full text-left py-3 px-2 -mx-2 rounded-xl flex items-center justify-between hover:bg-stone-100/70 dark:hover:bg-stone-800/50 transition-colors group cursor-pointer"
                >
                    <div className="space-y-0.5 min-w-0">
                        <span className="text-xs font-medium text-stone-500 dark:text-stone-400 block tracking-tight">
                            Weight unit
                        </span>
                        <p className="text-sm sm:text-base font-semibold text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors truncate">
                            {weightUnitLabel}
                        </p>
                    </div>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-stone-400 dark:text-stone-500 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-3" />
                </button>
            </div>

            {/* Language Selection Modal */}
            <Dialog open={activeModal === 'language'} onOpenChange={(open) => !open && setActiveModal(null)}>
                <DialogContent className="sm:max-w-md bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-3xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold flex items-center gap-2 text-stone-900 dark:text-stone-100">
                            <Globe className="w-5 h-5 text-amber-600" />
                            Select Language
                        </DialogTitle>
                        <DialogDescription className="text-xs text-stone-500 dark:text-stone-400">
                            Choose your preferred interface language. Changes apply immediately across the dashboard.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2 mt-3 max-h-[60vh] overflow-y-auto pr-1">
                        {LANGUAGES.map((lang) => {
                            const isSelected = language === lang.code;
                            return (
                                <button
                                    key={lang.code}
                                    type="button"
                                    onClick={() => handleSelectLanguage(lang.code)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left group",
                                        isSelected
                                            ? "border-amber-500 bg-amber-500/10 dark:bg-amber-500/15 text-stone-950 dark:text-white shadow-xs font-bold"
                                            : "border-stone-200/80 dark:border-stone-800 hover:border-amber-300 dark:hover:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-900 text-stone-800 dark:text-stone-200 font-medium"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl shrink-0">{lang.flag}</span>
                                        <div>
                                            <p className="text-sm font-semibold">{lang.name}</p>
                                            <p className="text-[11px] text-stone-500 dark:text-stone-400">{lang.nativeName}</p>
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Temperature Unit Selection Modal */}
            <Dialog open={activeModal === 'temp'} onOpenChange={(open) => !open && setActiveModal(null)}>
                <DialogContent className="sm:max-w-md bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-3xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold flex items-center gap-2 text-stone-900 dark:text-stone-100">
                            <Thermometer className="w-5 h-5 text-amber-600" />
                            Select Temperature Unit
                        </DialogTitle>
                        <DialogDescription className="text-xs text-stone-500 dark:text-stone-400">
                            Used for colony brood nest telemetry, microclimate ambient stations, and thermal alerts.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2.5 mt-3">
                        {TEMP_OPTIONS.map((opt) => {
                            const isSelected = tempUnit === opt.unit;
                            return (
                                <button
                                    key={opt.unit}
                                    type="button"
                                    onClick={() => handleSelectTemp(opt.unit)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left",
                                        isSelected
                                            ? "border-amber-500 bg-amber-500/10 dark:bg-amber-500/15 text-stone-950 dark:text-white shadow-xs font-bold"
                                            : "border-stone-200/80 dark:border-stone-800 hover:border-amber-300 dark:hover:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-900 text-stone-800 dark:text-stone-200 font-medium"
                                    )}
                                >
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold">{opt.label}</p>
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                                                {opt.symbol}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-stone-500 dark:text-stone-400">{opt.desc}</p>
                                    </div>
                                    {isSelected && (
                                        <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Weight Unit Selection Modal */}
            <Dialog open={activeModal === 'weight'} onOpenChange={(open) => !open && setActiveModal(null)}>
                <DialogContent className="sm:max-w-md bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-3xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold flex items-center gap-2 text-stone-900 dark:text-stone-100">
                            <Scale className="w-5 h-5 text-amber-600" />
                            Select Weight Unit
                        </DialogTitle>
                        <DialogDescription className="text-xs text-stone-500 dark:text-stone-400">
                            Applied to scale honey gain, harvest lot batching, and extraction ledgers.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2.5 mt-3">
                        {WEIGHT_OPTIONS.map((opt) => {
                            const isSelected = weightUnit === opt.unit;
                            return (
                                <button
                                    key={opt.unit}
                                    type="button"
                                    onClick={() => handleSelectWeight(opt.unit)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left",
                                        isSelected
                                            ? "border-amber-500 bg-amber-500/10 dark:bg-amber-500/15 text-stone-950 dark:text-white shadow-xs font-bold"
                                            : "border-stone-200/80 dark:border-stone-800 hover:border-amber-300 dark:hover:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-900 text-stone-800 dark:text-stone-200 font-medium"
                                    )}
                                >
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold">{opt.label}</p>
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                                                {opt.symbol}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-stone-500 dark:text-stone-400">{opt.desc}</p>
                                    </div>
                                    {isSelected && (
                                        <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default RegionalPreferencesCard;
