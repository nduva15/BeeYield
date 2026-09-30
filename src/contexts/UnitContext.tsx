import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { beeyieldService } from '@/services/beeyieldService';

export type TempUnit = 'celsius' | 'fahrenheit';
export type WeightUnit = 'kg' | 'lbs';

export interface UnitContextType {
    tempUnit: TempUnit;
    setTempUnit: (unit: TempUnit) => void;
    weightUnit: WeightUnit;
    setWeightUnit: (unit: WeightUnit) => void;
    tempUnitLabel: string;
    weightUnitLabel: string;
    formatTemp: (celsiusVal?: number | null, decimals?: number) => string;
    formatWeight: (kgVal?: number | null, decimals?: number) => string;
    convertTemp: (celsiusVal: number) => number;
    convertWeight: (kgVal: number) => number;
}

const UnitContext = createContext<UnitContextType | undefined>(undefined);

const STORAGE_KEY_TEMP = 'beeyield_temp_unit';
const STORAGE_KEY_WEIGHT = 'beeyield_weight_unit';

export const UnitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [tempUnit, setTempUnitState] = useState<TempUnit>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY_TEMP) as TempUnit;
            if (saved === 'celsius' || saved === 'fahrenheit') return saved;
        } catch {}
        return 'celsius';
    });

    const [weightUnit, setWeightUnitState] = useState<WeightUnit>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY_WEIGHT) as WeightUnit;
            if (saved === 'kg' || saved === 'lbs') return saved;
        } catch {}
        return 'kg';
    });

    const setTempUnit = (unit: TempUnit) => {
        setTempUnitState(unit);
        try {
            localStorage.setItem(STORAGE_KEY_TEMP, unit);
            // Optionally sync with backend unit_system
            void beeyieldService.updateSettings({
                unit_system: unit === 'celsius' ? 'Metric' : 'Imperial',
            }).catch(() => {});
        } catch {}
    };

    const setWeightUnit = (unit: WeightUnit) => {
        setWeightUnitState(unit);
        try {
            localStorage.setItem(STORAGE_KEY_WEIGHT, unit);
            void beeyieldService.updateSettings({
                unit_system: unit === 'kg' ? 'Metric' : 'Imperial',
            }).catch(() => {});
        } catch {}
    };

    const tempUnitLabel = tempUnit === 'celsius' ? 'Celsius (°C)' : 'Fahrenheit (°F)';
    const weightUnitLabel = weightUnit === 'kg' ? 'Kilograms (kg)' : 'Pounds (lbs)';

    const convertTemp = (celsiusVal: number): number => {
        if (tempUnit === 'fahrenheit') {
            return (celsiusVal * 9) / 5 + 32;
        }
        return celsiusVal;
    };

    const convertWeight = (kgVal: number): number => {
        if (weightUnit === 'lbs') {
            return kgVal * 2.20462;
        }
        return kgVal;
    };

    const formatTemp = (celsiusVal?: number | null, decimals: number = 1): string => {
        if (celsiusVal === undefined || celsiusVal === null || Number.isNaN(celsiusVal)) {
            return '—';
        }
        const val = convertTemp(celsiusVal);
        return `${val.toFixed(decimals)} ${tempUnit === 'celsius' ? '°C' : '°F'}`;
    };

    const formatWeight = (kgVal?: number | null, decimals: number = 1): string => {
        if (kgVal === undefined || kgVal === null || Number.isNaN(kgVal)) {
            return '—';
        }
        const val = convertWeight(kgVal);
        return `${val.toFixed(decimals)} ${weightUnit === 'kg' ? 'kg' : 'lbs'}`;
    };

    return (
        <UnitContext.Provider
            value={{
                tempUnit,
                setTempUnit,
                weightUnit,
                setWeightUnit,
                tempUnitLabel,
                weightUnitLabel,
                formatTemp,
                formatWeight,
                convertTemp,
                convertWeight,
            }}
        >
            {children}
        </UnitContext.Provider>
    );
};

export const useUnits = (): UnitContextType => {
    const context = useContext(UnitContext);
    if (!context) {
        // Fallback default if used outside of provider
        return {
            tempUnit: 'celsius',
            setTempUnit: () => {},
            weightUnit: 'kg',
            setWeightUnit: () => {},
            tempUnitLabel: 'Celsius (°C)',
            weightUnitLabel: 'Kilograms (kg)',
            formatTemp: (val, decimals = 1) => val != null ? `${val.toFixed(decimals)} °C` : '—',
            formatWeight: (val, decimals = 1) => val != null ? `${val.toFixed(decimals)} kg` : '—',
            convertTemp: (val) => val,
            convertWeight: (val) => val,
        };
    }
    return context;
};
