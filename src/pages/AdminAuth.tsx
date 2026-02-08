import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import LoginForm from '@/components/auth/LoginForm';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import { Shield, Lock, LogIn, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

type AuthMode = 'login' | 'forgot-password';

const AdminAuth = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [authMode, setAuthMode] = useState<AuthMode>('login');

    const redirectPath = searchParams.get('redirect') || '/ceba';

    useEffect(() => {
        if (!loading && user) {
            // Check if user has admin role
            const userRole = user?.user_metadata?.role || 'user';
            const isSuperAdminEmail = ['timothynduva349@gmail.com'].includes(user?.email?.toLowerCase() || '');
            const isAdmin = userRole === 'admin' || userRole === 'super_admin' || isSuperAdminEmail;

            if (isAdmin) {
                navigate(redirectPath);
            }
            // If user exists but is NOT admin, we simply stay on this page 
            // and let them log in via the form (which will overwrite the session)
        }
    }, [user, loading, navigate, redirectPath]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
            {/* Background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/20 blur-[120px] rounded-full animate-pulse" />
            </div>

            <div className="container max-w-lg mx-auto relative z-10 space-y-8">
                {/* Header */}
                <div className="space-y-4 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto border-2 border-primary/20 shadow-glow shadow-primary/10">
                        <Shield className="h-10 w-10 text-primary" />
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tightest leading-none uppercase">
                        BeeYield <span className="text-primary italic">Admin</span>
                    </h1>
                    <p className="text-lg text-muted-foreground font-medium">
                        Secure gateway for BeeYield administrators.
                    </p>
                </div>

                {/* Auth Mode Selector */}
                <Card className="border-none glass sm:glass-dark shadow-2xl rounded-[2.5rem] overflow-hidden border border-white/5">
                    <CardContent className="pt-6 pb-8 px-8">
                        {/* Login Form */}
                        {authMode === 'login' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="mb-6 flex items-center justify-center gap-2 text-primary font-bold uppercase tracking-widest text-sm">
                                    <LogIn className="w-4 h-4" /> Gateway Access
                                </div>
                                <LoginForm
                                    onSuccess={() => navigate(redirectPath)}
                                    // Remove registration switch to prevent public signups
                                    onSwitchToRegister={() => { }}
                                    onForgotPassword={() => setAuthMode('forgot-password')}
                                />
                            </div>
                        )}

                        {/* Forgot Password Form */}
                        {authMode === 'forgot-password' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <ForgotPasswordForm
                                    onBackToLogin={() => setAuthMode('login')}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Return link */}
                <div className="text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="text-muted-foreground hover:text-primary transition-colors text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 mx-auto"
                    >
                        <Lock className="h-3 w-3" /> Exit Terminal
                    </button>
                    <p className="mt-4 text-[10px] text-muted-foreground/50">
                        Authorized Personnel Only. All access attempts are logged.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminAuth;
