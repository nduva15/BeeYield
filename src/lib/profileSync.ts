import type { SupabaseClient, User } from '@supabase/supabase-js';

export type AuthBackend = 'shop' | 'beeyield' | 'ceba';

interface EnsureProfileOptions {
    onlyIfMissing?: boolean;
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
}

interface ProfileTarget {
    table: 'profiles' | 'shop_profiles' | 'beeyield_profiles';
    payload: Record<string, unknown>;
}

const splitDisplayName = (displayName?: string | null) => {
    const trimmed = displayName?.trim();

    if (!trimmed) {
        return { firstName: '', lastName: '' };
    }

    const [firstName = '', ...rest] = trimmed.split(/\s+/);
    return {
        firstName,
        lastName: rest.join(' '),
    };
};

const getNameParts = (user: User, options: EnsureProfileOptions) => {
    const metadata = user.user_metadata ?? {};
    const displayName = typeof metadata.full_name === 'string'
        ? metadata.full_name
        : typeof metadata.name === 'string'
            ? metadata.name
            : undefined;

    const fallback = splitDisplayName(displayName);

    return {
        firstName: options.firstName?.trim()
            || metadata.first_name
            || metadata.given_name
            || fallback.firstName,
        lastName: options.lastName?.trim()
            || metadata.last_name
            || metadata.family_name
            || fallback.lastName,
    };
};

const getProfileTarget = (
    backend: AuthBackend,
    user: User,
    options: EnsureProfileOptions,
): ProfileTarget => {
    const { firstName, lastName } = getNameParts(user, options);
    const email = options.email ?? user.email ?? null;
    const role = options.role
        || (typeof user.user_metadata?.role === 'string' ? user.user_metadata.role : undefined)
        || 'user';

    if (backend === 'shop') {
        return {
            table: 'shop_profiles',
            payload: {
                id: user.id,
                email,
                first_name: firstName,
                last_name: lastName,
                updated_at: new Date().toISOString(),
            },
        };
    }

    if (backend === 'beeyield') {
        return {
            table: 'beeyield_profiles',
            payload: {
                id: user.id,
                email,
                first_name: firstName,
                last_name: lastName,
                is_professional: true,
                updated_at: new Date().toISOString(),
            },
        };
    }

    return {
        table: 'profiles',
        payload: {
            id: user.id,
            email,
            first_name: firstName,
            last_name: lastName,
            role: role === 'super_admin' ? 'super_admin' : 'admin',
            updated_at: new Date().toISOString(),
        },
    };
};

export const ensureProfileForUser = async (
    client: SupabaseClient,
    backend: AuthBackend,
    user: User,
    options: EnsureProfileOptions = {},
) => {
    const target = getProfileTarget(backend, user, options);

    if (options.onlyIfMissing) {
        const { data: existingProfile, error: existingProfileError } = await client
            .from(target.table)
            .select('id')
            .eq('id', user.id)
            .maybeSingle();

        if (!existingProfileError && existingProfile) {
            return { error: null, skipped: true };
        }
    }

    const { error } = await client
        .from(target.table)
        .upsert(target.payload, { onConflict: 'id' });

    return { error, skipped: false };
};
