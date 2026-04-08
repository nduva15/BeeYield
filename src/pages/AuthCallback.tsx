import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseShop, supabaseBeeYield, supabaseCEBA } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { SUPER_ADMIN_EMAIL } from '@/config/constants';
import { BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';
import { ensureProfileForUser } from '@/lib/profileSync';
import { getBeeYieldPendingOnboardingPath } from '@/lib/beeyieldOnboarding';
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
                const { backend, returnTo: requestedReturnTo, requireMetadata } = readAuthCallbackState();
                clearAuthRedirectState();

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
                const activeClient = clients[backend] || supabaseShop;
                const loginPath = getLoginPathForBackend(backend);

                if (!activeClient) {
                    navigate(`${loginPath}?error=client_init_failed`, { replace: true });
                    return;
                }

                // Supabase handles the token exchange automatically upon getSession()
                // It parses the URL hash fragment to extract the access_token.
                const { data: { session }, error } = await activeClient.auth.getSession();

                if (error) {
                    console.error('Auth callback error:', error);
                    navigate(`${loginPath}?error=auth_failed`, { replace: true });
                    return;
                }

                if (session) {
                    // Fetch the user data to get the name for the toast
                    const { data: { user } } = await activeClient.auth.getUser();

                    if (user) {
                        try {
                            const { error: profileError } = await ensureProfileForUser(
                                activeClient,
                                backend,
                                user,
                                {
                                    onlyIfMissing: true,
                                    role: backend === 'ceba' ? 'admin' : undefined,
                                },
                            );

                            if (profileError) {
                                console.error('Error ensuring platform profile:', profileError);
                            }
                        } catch (profileErr) {
                            console.error('Error ensuring platform profile:', profileErr);
                        }
                    }

                    if (requireMetadata && user) {
                        try {
                            const missingMetadata: Record<string, any> = {};

                            Object.entries(requireMetadata).forEach(([key, value]) => {
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
                    const pendingBeeYieldReturnTo = backend === 'beeyield'
                        ? getBeeYieldPendingOnboardingPath(user?.email)
                        : null;
                    const returnTo = requestedReturnTo || pendingBeeYieldReturnTo;

                    // Small delay to ensure session is fully propagated
                    setTimeout(() => {
                        navigate(returnTo, { replace: true });
                    }, 500);
                } else {
                    // No session found in hash or storage
                    // It's possible the hash was cleared or invalid
                    console.warn('No session found after callback');
                    navigate(loginPath, { replace: true });
                }
            } catch (err) {
                console.error('Auth callback exception:', err);
                const loginPath = getLoginPathForBackend(readAuthCallbackState().backend);
                navigate(`${loginPath}?error=auth_exception`, { replace: true });
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
