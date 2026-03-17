import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseShop, supabaseBeeYield, supabaseCEBA } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { SUPER_ADMIN_EMAIL } from '@/config/constants';
import { BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';

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
                // Determine which backend initiated the auth
                const storedBackend = localStorage.getItem('authBackend') as 'shop' | 'beeyield' | 'ceba' || 'shop';
                localStorage.removeItem('authBackend'); // Remove after reading

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
                    navigate('/login?error=client_init_failed');
                    return;
                }

                // Supabase handles the token exchange automatically upon getSession()
                // It parses the URL hash fragment to extract the access_token.
                const { data: { session }, error } = await activeClient.auth.getSession();

                if (error) {
                    console.error('Auth callback error:', error);
                    navigate('/login?error=auth_failed');
                    return;
                }

                if (session) {
                    // Fetch the user data to get the name for the toast
                    const { data: { user } } = await activeClient.auth.getUser();

                    if (user) {
                        try {
                            const profileTable = storedBackend === 'shop' ? 'shop_profiles' :
                                storedBackend === 'beeyield' ? 'beeyield_profiles' :
                                    'ceba_profiles';

                            // Check if profile exists
                            const { data: existingProfile } = await activeClient
                                .from(profileTable)
                                .select('id')
                                .eq('id', user.id)
                                .single();

                            if (!existingProfile) {
                                // Create the profile if it doesn't exist (e.g. first time on this platform)
                                await activeClient
                                    .from(profileTable)
                                    .insert({
                                        id: user.id,
                                        first_name: user.user_metadata?.given_name || (user.user_metadata?.full_name?.split(' ')[0]) || '',
                                        last_name: user.user_metadata?.family_name || (user.user_metadata?.full_name?.split(' ')[1]) || '',
                                        email: user.email,
                                        ...(storedBackend === 'beeyield' ? { is_professional: true } : {}),
                                        ...(storedBackend === 'ceba' ? { admin_role: 'content_editor' } : {})
                                    });
                            }
                        } catch (profileErr) {
                            console.error('Error ensuring platform profile:', profileErr);
                        }
                    }

                    const requireMetadataStr = localStorage.getItem('authRequireMetadata');
                    if (requireMetadataStr && user) {
                        try {
                            const requireMetadata = JSON.parse(requireMetadataStr);
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
                    localStorage.removeItem('authRequireMetadata');

                    const fullName = (user?.user_metadata?.full_name || user?.user_metadata?.name) ||
                        (user?.user_metadata?.first_name ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim() : null) ||
                        'Client';

                    toast.success(`Welcome back, ${fullName}! 🎉`);

                    // Successfully authenticated, redirect to intended destination
                    const returnTo = localStorage.getItem('authReturnTo') || '/';
                    localStorage.removeItem('authReturnTo');

                    // Small delay to ensure session is fully propagated
                    setTimeout(() => {
                        navigate(returnTo, { replace: true });
                    }, 500);
                } else {
                    // No session found in hash or storage
                    // It's possible the hash was cleared or invalid
                    console.warn('No session found after callback');
                    navigate('/login', { replace: true });
                }
            } catch (err) {
                console.error('Auth callback exception:', err);
                navigate('/login?error=auth_exception', { replace: true });
            }
        };

        handleAuthCallback();
    }, [navigate]);

    return (
        <BeeYieldPageShell className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <h2 className="text-xl font-semibold">Signing you in...</h2>
                <p className="text-muted-foreground">Just a second...</p>
            </div>
        </BeeYieldPageShell>
    );
};

export default AuthCallback;
