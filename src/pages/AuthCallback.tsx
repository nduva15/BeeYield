import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

/**
 * Auth Callback Page
 * Handles the redirect from OAuth providers (Google, etc.)
 * Supabase automatically handles the token exchange, we just need to redirect.
 */
const AuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                // Supabase handles the token exchange automatically
                // We just need to wait for it and redirect
                if (!supabase) {
                    navigate('/login?error=client_init_failed');
                    return;
                }
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('Auth callback error:', error);
                    navigate('/login?error=auth_failed');
                    return;
                }

                if (session) {
                    // Fetch the user data to get the name for the toast
                    const { data: { user } } = await supabase.auth.getUser();

                    // Metadata Validation Check
                    const requireMetadataStr = localStorage.getItem('authRequireMetadata');
                    if (requireMetadataStr && user) {
                        try {
                            const requireMetadata = JSON.parse(requireMetadataStr);
                            const missingMetadata = Object.entries(requireMetadata).some(
                                ([key, value]) => {
                                    // Skip metadata check for Timothy's primary account
                                    if (user.email === 'timothynduva349@gmail.com') return false;
                                    return user.user_metadata?.[key] !== value;
                                }
                            );

                            if (missingMetadata) {
                                await supabase.auth.signOut();
                                localStorage.removeItem('authRequireMetadata');
                                navigate('/beeyield-login?error=account_required', { replace: true });
                                return;
                            }
                        } catch (e) {
                            console.error('Error parsing requireMetadata:', e);
                        }
                    }
                    localStorage.removeItem('authRequireMetadata');

                    const fullName = (user?.user_metadata?.full_name || user?.user_metadata?.name) ||
                        (user?.user_metadata?.first_name ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim() : null) ||
                        'Client';

                    import('sonner').then(({ toast }) => {
                        toast.success(`Welcome back, ${fullName}! 🎉`);
                    });

                    // Successfully authenticated, redirect to home or intended destination
                    const returnTo = localStorage.getItem('authReturnTo') || '/';
                    localStorage.removeItem('authReturnTo');

                    // Small delay to ensure session is fully propagated
                    setTimeout(() => {
                        navigate(returnTo, { replace: true });
                    }, 500);
                } else {
                    // No session, redirect to login
                    navigate('/login', { replace: true });
                }
            } catch (err) {
                console.error('Auth callback error:', err);
                navigate('/login?error=auth_failed', { replace: true });
            }
        };

        handleAuthCallback();
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <h2 className="text-xl font-semibold">Completing sign in...</h2>
                <p className="text-muted-foreground">Please wait while we verify your account.</p>
            </div>
        </div>
    );
};

export default AuthCallback;
