import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User, AuthError, AuthMFAEnrollResponse, AuthMFAChallengeResponse, AuthMFAVerifyResponse, Factor } from '@supabase/supabase-js';

interface MFAEnrollResult {
    id: string;
    type: 'totp';
    totp: {
        qr_code: string;
        secret: string;
        uri: string;
    };
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    mfaRequired: boolean;
    mfaFactorId: string | null;
    signIn: (email: string, password: string) => Promise<{ error: AuthError | null; mfaRequired?: boolean }>;
    signUp: (email: string, password: string, metadata?: { first_name?: string; last_name?: string }) => Promise<{ error: AuthError | null; data?: { user: User | null } }>;
    signInWithGoogle: () => Promise<{ error: AuthError | null }>;
    signOut: () => Promise<void>;
    // MFA Methods
    enrollMFA: () => Promise<{ data: MFAEnrollResult | null; error: Error | null }>;
    verifyMFAEnrollment: (factorId: string, code: string) => Promise<{ error: Error | null }>;
    verifyMFAChallenge: (code: string) => Promise<{ error: Error | null }>;
    unenrollMFA: (factorId: string) => Promise<{ error: Error | null }>;
    getMFAFactors: () => Promise<{ factors: Factor[]; error: Error | null }>;
    hasMFAEnabled: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [mfaRequired, setMfaRequired] = useState(false);
    const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        // Check if MFA is required
        if (data?.session === null && !error) {
            // MFA challenge required - get factors
            const { data: factorsData } = await supabase.auth.mfa.listFactors();
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
        metadata?: { first_name?: string; last_name?: string }
    ) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata,
            },
        });
        return { error, data: { user: data.user } };
    };

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        });
        return { error };
    };

    const signOut = async () => {
        setMfaRequired(false);
        setMfaFactorId(null);
        await supabase.auth.signOut();
    };

    // MFA: Enroll a new TOTP factor
    const enrollMFA = async (): Promise<{ data: MFAEnrollResult | null; error: Error | null }> => {
        try {
            const { data, error } = await supabase.auth.mfa.enroll({
                factorType: 'totp',
                friendlyName: 'BeeYield Authenticator',
            }) as AuthMFAEnrollResponse;

            if (error) throw error;

            return {
                data: data as MFAEnrollResult,
                error: null
            };
        } catch (err) {
            return { data: null, error: err as Error };
        }
    };

    // MFA: Verify enrollment with TOTP code
    const verifyMFAEnrollment = async (factorId: string, code: string) => {
        try {
            const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
                factorId,
            }) as AuthMFAChallengeResponse;

            if (challengeError) throw challengeError;

            const { error: verifyError } = await supabase.auth.mfa.verify({
                factorId,
                challengeId: challengeData.id,
                code,
            }) as AuthMFAVerifyResponse;

            if (verifyError) throw verifyError;

            return { error: null };
        } catch (err) {
            return { error: err as Error };
        }
    };

    // MFA: Verify challenge during login
    const verifyMFAChallenge = async (code: string) => {
        if (!mfaFactorId) {
            return { error: new Error('No MFA factor ID available') };
        }

        try {
            const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
                factorId: mfaFactorId,
            }) as AuthMFAChallengeResponse;

            if (challengeError) throw challengeError;

            const { error: verifyError } = await supabase.auth.mfa.verify({
                factorId: mfaFactorId,
                challengeId: challengeData.id,
                code,
            }) as AuthMFAVerifyResponse;

            if (verifyError) throw verifyError;

            setMfaRequired(false);
            setMfaFactorId(null);

            return { error: null };
        } catch (err) {
            return { error: err as Error };
        }
    };

    // MFA: Unenroll a factor
    const unenrollMFA = async (factorId: string) => {
        try {
            const { error } = await supabase.auth.mfa.unenroll({ factorId });
            if (error) throw error;
            return { error: null };
        } catch (err) {
            return { error: err as Error };
        }
    };

    // MFA: Get all enrolled factors
    const getMFAFactors = async () => {
        try {
            const { data, error } = await supabase.auth.mfa.listFactors();
            if (error) throw error;
            return { factors: data.totp || [], error: null };
        } catch (err) {
            return { factors: [], error: err as Error };
        }
    };

    // MFA: Check if user has MFA enabled
    const hasMFAEnabled = async () => {
        try {
            const { data } = await supabase.auth.mfa.listFactors();
            return (data?.totp?.length ?? 0) > 0;
        } catch {
            return false;
        }
    };

    const value = {
        user,
        session,
        loading,
        mfaRequired,
        mfaFactorId,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        enrollMFA,
        verifyMFAEnrollment,
        verifyMFAChallenge,
        unenrollMFA,
        getMFAFactors,
        hasMFAEnabled,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
