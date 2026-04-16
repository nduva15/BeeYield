import type { Apiary, Hive } from '@/services/beeyieldService';

export function getApiaryDisplayName(apiary?: Partial<Apiary> | null): string {
    if (!apiary) return 'Unnamed apiary';

    const name = String(apiary.name || '').trim();
    if (name) return name;

    const location = String(apiary.location_name || '').trim();
    if (location) return location;

    const region = String(apiary.region || '').trim();
    if (region) return region;

    return apiary.id ? `Apiary ${apiary.id}` : 'Unnamed apiary';
}

export function getHiveDisplayName(hive?: Partial<Hive> | null): string {
    if (!hive) return 'Unnamed hive';

    const hiveCode = String(hive.hive_code || '').trim();
    if (hiveCode) return hiveCode;

    const fallbackName = String((hive as Hive & { name?: string }).name || '').trim();
    if (fallbackName) return fallbackName;

    return hive.id ? `Hive ${hive.id}` : 'Unnamed hive';
}
