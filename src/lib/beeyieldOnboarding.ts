export type BeeYieldOnboardingStep = 'apiary' | 'hive' | 'device';

export interface BeeYieldOnboardingState {
    step: BeeYieldOnboardingStep;
    email?: string;
    createdAt?: string;
}

export interface BeeYieldDashboardTarget {
    tab: string;
    action: string;
}

const STORAGE_KEY = 'beeyieldPendingOnboarding';
const MAX_ONBOARDING_AGE_MS = 1000 * 60 * 60 * 24 * 7;

const normalizeEmail = (value?: string | null) => value?.trim().toLowerCase() || '';

const isFreshOnboardingState = (createdAt?: string) => {
    if (!createdAt) return true;

    const createdAtMs = new Date(createdAt).getTime();
    if (Number.isNaN(createdAtMs)) return false;

    return (Date.now() - createdAtMs) <= MAX_ONBOARDING_AGE_MS;
};

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
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...state,
        email: normalizeEmail(state.email) || undefined,
        createdAt: state.createdAt || new Date().toISOString(),
    }));
};

export const getBeeYieldPendingOnboarding = (userEmail?: string | null): BeeYieldOnboardingState | null => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw) as BeeYieldOnboardingState;

        if (!(parsed?.step === 'apiary' || parsed?.step === 'hive' || parsed?.step === 'device')) {
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }

        if (!isFreshOnboardingState(parsed.createdAt)) {
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }

        const pendingEmail = normalizeEmail(parsed.email);
        const currentEmail = normalizeEmail(userEmail);
        if (pendingEmail && currentEmail && pendingEmail !== currentEmail) {
            return null;
        }

        return parsed;
    } catch (error) {
        console.error('Failed to parse BeeYield onboarding state', error);
    }

    localStorage.removeItem(STORAGE_KEY);
    return null;
};

export const clearBeeYieldPendingOnboarding = () => {
    localStorage.removeItem(STORAGE_KEY);
};

export const getBeeYieldPendingOnboardingPath = (userEmail?: string | null): string | null => {
    const state = getBeeYieldPendingOnboarding(userEmail);
    if (!state) return null;
    return getBeeYieldDashboardPath(state.step);
};
