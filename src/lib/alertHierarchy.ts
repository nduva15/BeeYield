/**
 * BeeYield 3-Tier Alert Hierarchy System
 * Eliminates alert fatigue by preventing minor routine battery/solar fluctuations
 * from triggering the same screaming red popups as critical swarms or pest outbreaks.
 */

export type AlertTier = 'tier1_critical' | 'tier2_warning' | 'tier3_advisory';

export interface CalibratedAlert {
    id: string;
    tier: AlertTier;
    category: 'queen_and_brood' | 'swarming' | 'pests' | 'hardware' | 'weather' | 'routine';
    title: string;
    message: string;
    timestamp: string;
    hiveCode?: string;
    apiaryName?: string;
    resolved?: boolean;
    urgencyHours: number; // Max recommended response time (e.g. 2 hours for swarm, 72 hours for routine)
}

export function classifyAlertTier(raw: {
    alert_type?: string;
    severity?: string;
    message?: string;
}): { tier: AlertTier; category: CalibratedAlert['category']; urgencyHours: number } {
    const text = `${raw.alert_type || ''} ${raw.severity || ''} ${raw.message || ''}`.toLowerCase();

    // 1. TIER 1 - CRITICAL EMERGENCIES (Requires immediate response < 4 hours)
    if (
        text.includes('swarm') ||
        text.includes('queen loss') ||
        text.includes('queenless') ||
        text.includes('brood chilling') ||
        text.includes('varroa infestation') ||
        text.includes('pest outbreak') ||
        text.includes('predator') ||
        text.includes('theft') ||
        text.includes('overheat')
    ) {
        return {
            tier: 'tier1_critical',
            category: text.includes('varroa') ? 'pests' : text.includes('swarm') ? 'swarming' : 'queen_and_brood',
            urgencyHours: 4
        };
    }

    // 2. TIER 2 - OPERATIONAL WARNINGS (Action within 24-48 hours)
    if (
        text.includes('low battery') ||
        text.includes('humidity') ||
        text.includes('signal weak') ||
        text.includes('inspection overdue') ||
        text.includes('scale calibration') ||
        text.includes('warning')
    ) {
        return {
            tier: 'tier2_warning',
            category: text.includes('battery') || text.includes('signal') ? 'hardware' : 'weather',
            urgencyHours: 48
        };
    }

    // 3. TIER 3 - ADVISORY & ROUTINE LOGS (Quiet, no alarms)
    return {
        tier: 'tier3_advisory',
        category: 'routine',
        urgencyHours: 168 // 7 days / informational
    };
}
