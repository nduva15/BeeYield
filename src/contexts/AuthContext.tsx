import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabaseShop, supabaseBeeYield, supabaseCEBA } from '@/lib/supabase';
import { Session, User, AuthError, AuthMFAEnrollResponse, AuthMFAChallengeResponse, AuthMFAVerifyResponse, Factor, SupabaseClient } from '@supabase/supabase-js';

interface MFAEnrollResult {
    id: string;
    type: 'totp';
    totp: {
        qr_code: string;
        secret: string;
        uri: string;
    };
}

type AuthBackend = 'shop' | 'beeyield' | 'ceba';

interface AuthContextType {
    // Current active user/session based on path
    user: User | null;
    session: Session | null;
    loading: boolean;
    activeBackend: AuthBackend;

    // Backend-specific users
    shopUser: User | null;
    beeyieldUser: User | null;
    cebaUser: User | null;

    // Methods
    signIn: (email: string, password: string, backend?: AuthBackend) => Promise<{ error: AuthError | null; mfaRequired?: boolean }>;
    signUp: (email: string, password: string, metadata?: Record<string, any>, backend?: AuthBackend) => Promise<{ error: AuthError | null; data?: { user: User | null; session: Session | null } }>;
    signInWithGoogle: (metadata?: Record<string, any>, backend?: AuthBackend) => Promise<{ error: AuthError | null }>;
    signOut: (backend?: AuthBackend | 'all') => Promise<void>;

    // Password Reset Methods
    resetPassword: (email: string, backend?: AuthBackend) => Promise<{ error: AuthError | null }>;
    updatePassword: (newPassword: string, backend?: AuthBackend) => Promise<{ error: AuthError | null }>;

    // MFA Methods
    mfaRequired: boolean;
    mfaFactorId: string | null;
    enrollMFA: (backend?: AuthBackend) => Promise<{ data: MFAEnrollResult | null; error: Error | null }>;
    verifyMFAEnrollment: (factorId: string, code: string, backend?: AuthBackend) => Promise<{ error: Error | null }>;
    verifyMFAChallenge: (code: string, backend?: AuthBackend) => Promise<{ error: Error | null }>;
    unenrollMFA: (factorId: string, backend?: AuthBackend) => Promise<{ error: Error | null }>;
    getMFAFactors: (backend?: AuthBackend) => Promise<{ factors: Factor[]; error: Error | null }>;
    hasMFAEnabled: (backend?: AuthBackend) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Internal sync component that uses useLocation from Router
const BackendSynchronizer = ({ onPathChange }: { onPathChange: (path: string) => void }) => {
    const location = useLocation();
    useEffect(() => {
        onPathChange(location.pathname);
    }, [location.pathname, onPathChange]);
    return null;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [shopUser, setShopUser] = useState<User | null>(null);
    const [shopSession, setShopSession] = useState<Session | null>(null);
    const [beeyieldUser, setBeeyieldUser] = useState<User | null>(null);
    const [beeyieldSession, setBeeyieldSession] = useState<Session | null>(null);
    const [cebaUser, setCebaUser] = useState<User | null>(null);
    const [cebaSession, setCebaSession] = useState<Session | null>(null);

    const [loading, setLoading] = useState(true);
    const [mfaRequired, setMfaRequired] = useState(false);
    const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);

    // Determine current backend based on path
    const getActiveBackendFromPath = (path: string): AuthBackend => {
        if (path.includes('/ceba') || path.startsWith('/admin')) return 'ceba';
        if (path.includes('/beeyield')) return 'beeyield';
        if (path.includes('/auth/callback')) {
            const stored = localStorage.getItem('authBackend') as AuthBackend;
            if (stored && ['shop', 'beeyield', 'ceba'].includes(stored)) return stored;
        }
        return 'shop';
    };

    const [activeBackend, setActiveBackend] = useState<AuthBackend>(getActiveBackendFromPath(window.location.pathname));

    const handlePathChange = useMemo(() => (path: string) => {
        const newBackend = getActiveBackendFromPath(path);
        setActiveBackend(prev => prev !== newBackend ? newBackend : prev);
    }, []);

    const getClient = (backend?: AuthBackend): SupabaseClient => {
        const target = backend || activeBackend;
        if (target === 'ceba') return supabaseCEBA!;
        if (target === 'beeyield') return supabaseBeeYield!;
        return supabaseShop!;
    };

    useEffect(() => {
        const initAuth = async () => {
            // Short-circuit if no supabase clients exist
            if (!supabaseShop && !supabaseBeeYield && !supabaseCEBA) {
                setLoading(false);
                return;
            }

            try {
                // Fetch sessions in parallel - handle errors gracefully
                const results = await Promise.allSettled([
                    supabaseShop?.auth.getSession(),
                    supabaseBeeYield?.auth.getSession(),
                    supabaseCEBA?.auth.getSession()
                ]);

                if (results[0].status === 'fulfilled' && results[0].value?.data?.session) {
                    setShopSession(results[0].value.data.session);
                    setShopUser(results[0].value.data.session.user);
                }

                if (results[1].status === 'fulfilled' && results[1].value?.data?.session) {
                    setBeeyieldSession(results[1].value.data.session);
                    setBeeyieldUser(results[1].value.data.session.user);
                }

                if (results[2].status === 'fulfilled' && results[2].value?.data?.session) {
                    setCebaSession(results[2].value.data.session);
                    setCebaUser(results[2].value.data.session.user);
                }
            } catch (err) {
                console.error('Auth initialization error:', err);
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        const subscriptions: Array<{ data: { subscription: { unsubscribe: () => void } } }> = [];

        if (supabaseShop) {
            subscriptions.push(supabaseShop.auth.onAuthStateChange((_event, session) => {
                setShopSession(session);
                setShopUser(session?.user ?? null);
            }));
        }

        if (supabaseBeeYield) {
            subscriptions.push(supabaseBeeYield.auth.onAuthStateChange((_event, session) => {
                setBeeyieldSession(session);
                setBeeyieldUser(session?.user ?? null);
            }));
        }

        if (supabaseCEBA) {
            subscriptions.push(supabaseCEBA.auth.onAuthStateChange((_event, session) => {
                setCebaSession(session);
                setCebaUser(session?.user ?? null);
            }));
        }

        return () => {
            subscriptions.forEach(sub => sub.data.subscription.unsubscribe());
        };
    }, []);

    // Derived user/session for backward compatibility
    const user = useMemo(() => {
        if (activeBackend === 'ceba') return cebaUser;
        if (activeBackend === 'beeyield') return beeyieldUser;
        return shopUser;
    }, [activeBackend, shopUser, beeyieldUser, cebaUser]);

    const session = useMemo(() => {
        if (activeBackend === 'ceba') return cebaSession;
        if (activeBackend === 'beeyield') return beeyieldSession;
        return shopSession;
    }, [activeBackend, shopSession, beeyieldSession, cebaSession]);

    const signIn = async (email: string, password: string, backend?: AuthBackend) => {
        const client = getClient(backend);
        const { data, error } = await client.auth.signInWithPassword({ email, password });

        if (data?.session === null && !error) {
            const { data: factorsData } = await client.auth.mfa.listFactors();
            if (factorsData?.totp && factorsData.totp.length > 0) {
                const factor = factorsData.totp[0];
                setMfaRequired(true);
                setMfaFactorId(factor.id);
                return { error: null, mfaRequired: true };
            }
        }
        return { error };
    };

    const signUp = async (
        email: string,
        password: string,
        metadata?: Record<string, any>,
        backend?: AuthBackend
    ) => {
        const client = getClient(backend);
        const { data, error } = await client.auth.signUp({
            email,
            password,
            options: { data: metadata },
        });
        return { error, data: { user: data.user, session: data.session } };
    };

    const signInWithGoogle = async (metadata?: Record<string, any>, backend?: AuthBackend) => {
        const client = getClient(backend);
        const { error } = await client.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                queryParams: { access_type: 'offline', prompt: 'consent' },
            },
        });
        return { error };
    };

    const signOut = async (backend?: AuthBackend | 'all') => {
        setMfaRequired(false);
        setMfaFactorId(null);

        if (backend === 'all') {
            await Promise.all([
                supabaseShop?.auth.signOut(),
                supabaseBeeYield?.auth.signOut(),
                supabaseCEBA?.auth.signOut()
            ]);
        } else {
            const client = getClient(backend);
            await client.auth.signOut();
        }
    };

    const resetPassword = async (email: string, backend?: AuthBackend) => {
        const client = getClient(backend);
        const { error } = await client.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/update-password`,
        });
        return { error };
    };

    const updatePassword = async (newPassword: string, backend?: AuthBackend) => {
        const client = getClient(backend);
        const { error } = await client.auth.updateUser({ password: newPassword });
        return { error };
    };

    const enrollMFA = async (backend?: AuthBackend) => {
        const client = getClient(backend);
        try {
            const { data, error } = await client.auth.mfa.enroll({
                factorType: 'totp',
                friendlyName: 'BeeYield Authenticator',
            }) as AuthMFAEnrollResponse;
            if (error) throw error;
            return { data: data as MFAEnrollResult, error: null };
        } catch (err) {
            return { data: null, error: err as Error };
        }
    };

    const verifyMFAEnrollment = async (factorId: string, code: string, backend?: AuthBackend) => {
        const client = getClient(backend);
        try {
            const { data: challengeData, error: challengeError } = await client.auth.mfa.challenge({ factorId }) as AuthMFAChallengeResponse;
            if (challengeError) throw challengeError;
            const { error: verifyError } = await client.auth.mfa.verify({ factorId, challengeId: challengeData.id, code }) as AuthMFAVerifyResponse;
            if (verifyError) throw verifyError;
            return { error: null };
        } catch (err) {
            return { error: err as Error };
        }
    };

    const verifyMFAChallenge = async (code: string, backend?: AuthBackend) => {
        const client = getClient(backend);
        if (!mfaFactorId) return { error: new Error('No MFA factor ID available') };
        try {
            const { data: challengeData, error: challengeError } = await client.auth.mfa.challenge({ factorId: mfaFactorId }) as AuthMFAChallengeResponse;
            if (challengeError) throw challengeError;
            const { error: verifyError } = await client.auth.mfa.verify({ factorId: mfaFactorId, challengeId: challengeData.id, code }) as AuthMFAVerifyResponse;
            if (verifyError) throw verifyError;
            setMfaRequired(false);
            setMfaFactorId(null);
            return { error: null };
        } catch (err) {
            return { error: err as Error };
        }
    };

    const unenrollMFA = async (factorId: string, backend?: AuthBackend) => {
        const client = getClient(backend);
        try {
            const { error } = await client.auth.mfa.unenroll({ factorId });
            if (error) throw error;
            return { error: null };
        } catch (err) {
            return { error: err as Error };
        }
    };

    const getMFAFactors = async (backend?: AuthBackend) => {
        const client = getClient(backend);
        try {
            const { data, error } = await client.auth.mfa.listFactors();
            if (error) throw error;
            return { factors: data.totp || [], error: null };
        } catch (err) {
            return { factors: [], error: err as Error };
        }
    };

    const hasMFAEnabled = async (backend?: AuthBackend) => {
        const client = getClient(backend);
        try {
            const { data } = await client.auth.mfa.listFactors();
            return (data?.totp?.length ?? 0) > 0;
        } catch {
            return false;
        }
    };

    const value = {
        user,
        session,
        loading,
        activeBackend,
        shopUser,
        beeyieldUser,
        cebaUser,
        mfaRequired,
        mfaFactorId,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        resetPassword,
        updatePassword,
        enrollMFA,
        verifyMFAEnrollment,
        verifyMFAChallenge,
        unenrollMFA,
        getMFAFactors,
        hasMFAEnabled,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
            {/* Note: This component MUST be rendered inside a Router. 
                Move AuthProvider inside BrowserRouter in main.tsx if using this. */}
            <BackendSynchronizer onPathChange={handlePathChange} />
        </AuthContext.Provider>
    );
};

export default AuthContext;
