import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { SUPER_ADMIN_EMAIL } from '@/config/constants';
import { BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';
import { ensureProfileForUser, hasProfileForUser } from '@/lib/profileSync';
import { clearAuthRedirectState, getLoginPathForBackend, readAuthCallbackState } from '@/lib/authRedirect';

/**
 * Auth Callback Page
 * Handles the redirect from OAuth providers (Google, etc.)
 * Supabase automatically handles the token exchange via hash fragment parsing.
 * We must use the correct client instance to pick up the session.
 */
const AuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                const callbackState = readAuthCallbackState();
                const storedBackend = callbackState.backend;

                // Dynamically import clients to avoid circular deps if any
                // Note: The initial import at the top of the file is still there,
                // but this dynamic import ensures we have the latest references if needed,
                // and aligns with the instruction's intent to re-import.
                const { supabaseShop, supabaseBeeYield, supabaseCEBA } = await import('@/lib/supabase');
                const clients = {
                    shop: supabaseShop,
                    beeyield: supabaseBeeYield,
                    ceba: supabaseCEBA
                };
                const activeClient = clients[storedBackend] || supabaseShop;

                if (!activeClient) {
                    navigate(`${getLoginPathForBackend(storedBackend)}?error=client_init_failed`);
                    return;
                }

                const url = new URL(window.location.href);
                const code = url.searchParams.get('code');
                let sessionResult;

                if (code) {
                    sessionResult = await activeClient.auth.exchangeCodeForSession(code);
                } else {
                    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
                    const accessToken = hashParams.get('access_token');
                    const refreshToken = hashParams.get('refresh_token');
                    if (accessToken && refreshToken) {
                        sessionResult = await activeClient.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken,
                        });
                    } else {
                        sessionResult = await activeClient.auth.getSession();
                    }
                }

                const { data: { session }, error } = sessionResult;

                if (error) {
                    console.error('Auth callback error:', error);
                    navigate(`${getLoginPathForBackend(storedBackend)}?error=auth_failed`);
                    return;
                }

                if (session) {
                    // Fetch the user data to get the name for the toast
                    const { data: { user } } = await activeClient.auth.getUser();

                    if (user) {
                        const profileStatus = await hasProfileForUser(activeClient, storedBackend, user.id);
                        const isAdminUser = storedBackend === 'ceba'
                            && (
                                user.user_metadata?.role === 'admin'
                                || user.user_metadata?.role === 'super_admin'
                                || user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()
                            );
                        const shouldCreatePlatformProfile = callbackState.intent === 'signup' || isAdminUser;

                        if (!profileStatus.exists && !shouldCreatePlatformProfile) {
                            await activeClient.auth.signOut();
                            clearAuthRedirectState();
                            toast.error('Account not found for this area', {
                                description: 'Please create the right account first.',
                            });
                            navigate(`${getLoginPathForBackend(storedBackend)}?error=wrong_account`, { replace: true });
                            return;
                        }

                        if (!profileStatus.exists || shouldCreatePlatformProfile) {
                            const { error: profileError } = await ensureProfileForUser(
                                activeClient,
                                storedBackend,
                                user,
                                {
                                    onlyIfMissing: !shouldCreatePlatformProfile,
                                    role: storedBackend === 'ceba'
                                        ? 'admin'
                                        : storedBackend === 'beeyield'
                                            ? 'professional'
                                            : 'user',
                                },
                            );

                            if (profileError) {
                                console.error('Error ensuring platform profile:', profileError);
                            }
                        }
                    }

                    if (callbackState.requireMetadata && user) {
                        try {
                            const missingMetadata: Record<string, any> = {};

                            Object.entries(callbackState.requireMetadata).forEach(([key, value]) => {
                                // Skip update for Timothy's primary account
                                if (user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) return;

                                if (user.user_metadata?.[key] !== value) {
                                    missingMetadata[key] = value;
                                }
                            });

                            if (Object.keys(missingMetadata).length > 0) {
                                await activeClient.auth.updateUser({
                                    data: { ...user.user_metadata, ...missingMetadata }
                                });
                            }
                        } catch (e) {
                            console.error('Error handling requireMetadata:', e);
                        }
                    }

                    const fullName = (user?.user_metadata?.full_name || user?.user_metadata?.name) ||
                        (user?.user_metadata?.first_name ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim() : null) ||
                        'Client';

                    toast.success(`Welcome back, ${fullName}! 🎉`);

                    // Successfully authenticated, redirect to intended destination
                    const returnTo = callbackState.returnTo || '/';
                    clearAuthRedirectState();

                    // Small delay to ensure session is fully propagated
                    setTimeout(() => {
                        navigate(returnTo, { replace: true });
                    }, 500);
                } else {
                    // No session found in hash or storage
                    // It's possible the hash was cleared or invalid
                    console.warn('No session found after callback');
                    clearAuthRedirectState();
                    navigate(getLoginPathForBackend(storedBackend), { replace: true });
                }
            } catch (err) {
                console.error('Auth callback exception:', err);
                const callbackState = readAuthCallbackState();
                clearAuthRedirectState();
                navigate(`${getLoginPathForBackend(callbackState.backend)}?error=auth_exception`, { replace: true });
            }
        };

        handleAuthCallback();
    }, [navigate]);

    return (
        <BeeYieldPageShell className="min-h-screen flex items-center justify-center bg-background m-0">
            <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <h2 className="text-xl font-semibold">Signing you in...</h2>
                <p className="text-muted-foreground">Just a second...</p>
            </div>
        </BeeYieldPageShell>
    );
};

export default AuthCallback;
