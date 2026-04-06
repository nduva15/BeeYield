import React from 'react';

const STORAGE_KEY = 'beeyield_selected_apiary_id';
const EVENT_NAME = 'beeyield:selected-apiary';

function readStoredApiary() {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem(STORAGE_KEY) || '';
}

export function useSelectedApiary(fallbackId?: string | null) {
    const [selectedApiaryId, setSelectedApiaryIdState] = React.useState<string>(() => readStoredApiary() || fallbackId || '');

    const setSelectedApiaryId = React.useCallback((nextApiaryId: string) => {
        setSelectedApiaryIdState(nextApiaryId);
        if (typeof window === 'undefined') return;
        if (nextApiaryId) {
            window.localStorage.setItem(STORAGE_KEY, nextApiaryId);
        } else {
            window.localStorage.removeItem(STORAGE_KEY);
        }
        window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: nextApiaryId }));
    }, []);

    React.useEffect(() => {
        if (!selectedApiaryId && fallbackId) {
            setSelectedApiaryId(fallbackId);
        }
    }, [fallbackId, selectedApiaryId, setSelectedApiaryId]);

    React.useEffect(() => {
        if (typeof window === 'undefined') return;

        const syncSelectedApiary = () => {
            const stored = readStoredApiary();
            if (stored) {
                setSelectedApiaryIdState(stored);
            }
        };

        const syncFromCustomEvent = (event: Event) => {
            const detail = (event as CustomEvent<string>).detail;
            if (typeof detail === 'string') {
                setSelectedApiaryIdState(detail);
            }
        };

        window.addEventListener('storage', syncSelectedApiary);
        window.addEventListener(EVENT_NAME, syncFromCustomEvent as EventListener);
        return () => {
            window.removeEventListener('storage', syncSelectedApiary);
            window.removeEventListener(EVENT_NAME, syncFromCustomEvent as EventListener);
        };
    }, []);

    return [selectedApiaryId, setSelectedApiaryId] as const;
}
