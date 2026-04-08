export type BeeYieldOnboardingStep = 'apiary' | 'hive' | 'device';

export interface BeeYieldOnboardingState {
    step: BeeYieldOnboardingStep;
}

export interface BeeYieldDashboardTarget {
    tab: string;
    action: string;
}

const STORAGE_KEY = 'beeyieldPendingOnboarding';

export const buildBeeYieldOnboardingAction = (
    step: BeeYieldOnboardingStep,
    ids?: { apiaryId?: string; hiveId?: string },
): string => {
    if (step === 'apiary') {
        return 'onboarding:add-apiary';
    }

    if (step === 'hive') {
        return ids?.apiaryId ? `onboarding:add-hive:${ids.apiaryId}` : 'onboarding:add-hive';
    }

    const parts = ['onboarding:add-device'];
    if (ids?.apiaryId) parts.push(ids.apiaryId);
    if (ids?.hiveId) parts.push(ids.hiveId);
    return parts.join(':');
};

export const getBeeYieldDashboardTarget = (
    step: BeeYieldOnboardingStep,
    ids?: { apiaryId?: string; hiveId?: string },
): BeeYieldDashboardTarget => {
    if (step === 'apiary') {
        return { tab: 'places', action: buildBeeYieldOnboardingAction(step, ids) };
    }

    if (step === 'hive') {
        return { tab: 'beeyield', action: buildBeeYieldOnboardingAction(step, ids) };
    }

    return { tab: 'devices', action: buildBeeYieldOnboardingAction(step, ids) };
};

export const getBeeYieldDashboardPath = (
    step: BeeYieldOnboardingStep = 'apiary',
    ids?: { apiaryId?: string; hiveId?: string },
): string => {
    const target = getBeeYieldDashboardTarget(step, ids);
    const params = new URLSearchParams({
        tab: target.tab,
        action: target.action,
    });
    return `/beeyield-dashboard?${params.toString()}`;
};

export const setBeeYieldPendingOnboarding = (state: BeeYieldOnboardingState = { step: 'apiary' }) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const getBeeYieldPendingOnboarding = (): BeeYieldOnboardingState | null => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw) as BeeYieldOnboardingState;
        if (parsed?.step === 'apiary' || parsed?.step === 'hive' || parsed?.step === 'device') {
            return parsed;
        }
    } catch (error) {
        console.error('Failed to parse BeeYield onboarding state', error);
    }

    localStorage.removeItem(STORAGE_KEY);
    return null;
};

export const clearBeeYieldPendingOnboarding = () => {
    localStorage.removeItem(STORAGE_KEY);
};

export const getBeeYieldPendingOnboardingPath = (): string | null => {
    const state = getBeeYieldPendingOnboarding();
    if (!state) return null;
    return getBeeYieldDashboardPath(state.step);
};
