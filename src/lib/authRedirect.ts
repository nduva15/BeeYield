const AUTH_BACKENDS = ['shop', 'beeyield', 'ceba'] as const;

export type AuthBackend = (typeof AUTH_BACKENDS)[number];

type AuthMetadata = Record<string, any>;

const STORAGE_KEYS = {
    backend: 'authBackend',
    returnTo: 'authReturnTo',
    requireMetadata: 'authRequireMetadata',
} as const;

const DEFAULT_RETURN_PATHS: Record<AuthBackend, string> = {
    shop: '/shop-dashboard',
    beeyield: '/beeyield-dashboard',
    ceba: '/ceba',
};

const LOGIN_PATHS: Record<AuthBackend, string> = {
    shop: '/login',
    beeyield: '/beeyield-login',
    ceba: '/ceba/login',
};

const isAuthBackend = (value: string | null): value is AuthBackend =>
    value !== null && AUTH_BACKENDS.includes(value as AuthBackend);

const normalizeReturnTo = (value: string | null | undefined, fallback: string) => {
    if (!value || !value.startsWith('/') || value.startsWith('//')) {
        return fallback;
    }

    return value;
};

const parseMetadata = (value: string | null): AuthMetadata | null => {
    if (!value) {
        return null;
    }

    try {
        const parsed = JSON.parse(value);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            return parsed as AuthMetadata;
        }
    } catch (error) {
        console.warn('Failed to parse auth callback metadata', error);
    }

    return null;
};

export const getDefaultReturnTo = (backend: AuthBackend) => DEFAULT_RETURN_PATHS[backend];

export const getLoginPathForBackend = (backend: AuthBackend) => LOGIN_PATHS[backend];

export const buildAuthCallbackUrl = ({
    backend,
    returnTo,
    requireMetadata,
}: {
    backend: AuthBackend;
    returnTo?: string;
    requireMetadata?: AuthMetadata;
}) => {
    const url = new URL('/auth/callback', window.location.origin);
    url.searchParams.set('backend', backend);
    url.searchParams.set('returnTo', normalizeReturnTo(returnTo, getDefaultReturnTo(backend)));

    if (requireMetadata && Object.keys(requireMetadata).length > 0) {
        url.searchParams.set('requireMetadata', JSON.stringify(requireMetadata));
    }

    return url.toString();
};

export const persistAuthRedirectState = ({
    backend,
    returnTo,
    requireMetadata,
}: {
    backend: AuthBackend;
    returnTo?: string;
    requireMetadata?: AuthMetadata;
}) => {
    try {
        localStorage.setItem(STORAGE_KEYS.backend, backend);
        localStorage.setItem(STORAGE_KEYS.returnTo, normalizeReturnTo(returnTo, getDefaultReturnTo(backend)));

        if (requireMetadata && Object.keys(requireMetadata).length > 0) {
            localStorage.setItem(STORAGE_KEYS.requireMetadata, JSON.stringify(requireMetadata));
        } else {
            localStorage.removeItem(STORAGE_KEYS.requireMetadata);
        }
    } catch (error) {
        console.warn('Unable to persist auth redirect state', error);
    }
};

export const clearAuthRedirectState = () => {
    try {
        localStorage.removeItem(STORAGE_KEYS.backend);
        localStorage.removeItem(STORAGE_KEYS.returnTo);
        localStorage.removeItem(STORAGE_KEYS.requireMetadata);
    } catch (error) {
        console.warn('Unable to clear auth redirect state', error);
    }
};

export const readAuthCallbackState = () => {
    const url = new URL(window.location.href);
    const backendFromUrl = url.searchParams.get('backend');
    const backendFromStorage = (() => {
        try {
            return localStorage.getItem(STORAGE_KEYS.backend);
        } catch {
            return null;
        }
    })();

    const backend = isAuthBackend(backendFromUrl)
        ? backendFromUrl
        : isAuthBackend(backendFromStorage)
            ? backendFromStorage
            : 'shop';

    const returnToFromUrl = url.searchParams.get('returnTo');
    const returnToFromStorage = (() => {
        try {
            return localStorage.getItem(STORAGE_KEYS.returnTo);
        } catch {
            return null;
        }
    })();

    const requireMetadataFromUrl = parseMetadata(url.searchParams.get('requireMetadata'));
    const requireMetadataFromStorage = (() => {
        try {
            return parseMetadata(localStorage.getItem(STORAGE_KEYS.requireMetadata));
        } catch {
            return null;
        }
    })();

    return {
        backend,
        returnTo: normalizeReturnTo(returnToFromUrl ?? returnToFromStorage, getDefaultReturnTo(backend)),
        requireMetadata: requireMetadataFromUrl ?? requireMetadataFromStorage,
    };
};
