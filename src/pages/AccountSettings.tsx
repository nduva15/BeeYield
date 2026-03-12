import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import TwoFactorSetup from '@/components/auth/TwoFactorSetup';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import { User, Mail, Shield, LogOut, Loader2, UserPlus, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type AuthMode = 'login' | 'register';

const AccountSettings = () => {
    const { user, loading, signOut } = useAuth();
    const navigate = useNavigate();
    const [authMode, setAuthMode] = useState<AuthMode>('login');

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    // Show Login/Register forms when user is NOT logged in
    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 py-24">
                <div className="container max-w-lg mx-auto px-4 space-y-8">
                    {/* Header */}
                    <div className="space-y-4 text-center">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto border-2 border-primary/20">
                            <User className="h-10 w-10 text-primary" />
                        </div>
                        <h1 className="text-4xl font-black text-foreground tracking-tightest leading-none">
                            {authMode === 'login' ? 'Welcome Back' : 'Join BeeYield'}
                        </h1>
                        <p className="text-lg text-muted-foreground font-medium">
                            {authMode === 'login'
                                ? 'Sign in to access your account'
                                : 'Create an account to track orders and more'}
                        </p>
                    </div>

                    {/* Auth Mode Selector */}
                    <Card className="border-none glass shadow-premium rounded-[2rem] overflow-hidden">
                        <CardContent className="pt-6 pb-8 px-8">
                            {/* Tab Switcher */}
                            <div className="grid grid-cols-2 gap-2 mb-8 p-1 bg-muted rounded-2xl">
                                <button
                                    type="button"
                                    onClick={() => setAuthMode('login')}
                                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${authMode === 'login'
                                        ? 'bg-primary text-primary-foreground shadow-lg'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <LogIn className="h-4 w-4" />
                                    Sign In
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAuthMode('register')}
                                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${authMode === 'register'
                                        ? 'bg-primary text-primary-foreground shadow-lg'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <UserPlus className="h-4 w-4" />
                                    Create Account
                                </button>
                            </div>

                            {/* Login Form */}
                            {authMode === 'login' && (
                                <LoginForm
                                    onSuccess={() => { }}
                                    onSwitchToRegister={() => setAuthMode('register')}
                                />
                            )}

                            {/* Register Form */}
                            {authMode === 'register' && (
                                <RegisterForm
                                    onSuccess={() => { }}
                                    onSwitchToLogin={() => setAuthMode('login')}
                                />
                            )}
                        </CardContent>
                    </Card>

                    {/* Benefits */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-4 rounded-2xl bg-card/50 border border-border/50">
                            <span className="text-2xl">🍯</span>
                            <p className="text-xs font-bold mt-2 text-muted-foreground">Track Orders</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-card/50 border border-border/50">
                            <span className="text-2xl">⚡</span>
                            <p className="text-xs font-bold mt-2 text-muted-foreground">Fast Checkout</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-card/50 border border-border/50">
                            <span className="text-2xl">🎁</span>
                            <p className="text-xs font-bold mt-2 text-muted-foreground">Exclusive Deals</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // User is logged in - show account settings
    const userMetadata = user.user_metadata || {};
    const firstName = userMetadata.first_name || userMetadata.full_name?.split(' ')[0] || '';
    const lastName = userMetadata.last_name || userMetadata.full_name?.split(' ').slice(1).join(' ') || '';
    const fullName = firstName && lastName ? `${firstName} ${lastName}` : firstName || 'User';

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 py-24">
            <div className="container max-w-4xl mx-auto px-4 space-y-12">
                {/* Header */}
                <div className="space-y-4 text-center lg:text-left">
                    <h1 className="text-5xl font-black text-foreground tracking-tightest leading-none">
                        Account <span className="text-primary">& Security</span>
                    </h1>
                    <p className="text-xl text-muted-foreground font-medium">Manage your account settings.</p>
                </div>

                {/* Profile Card */}
                <Card className="border-none glass sm:glass-dark shadow-premium rounded-[3rem] overflow-hidden">
                    <CardHeader className="p-10 pb-0">
                        <CardTitle className="text-2xl font-black tracking-widest uppercase flex items-center gap-3">
                            <User className="h-6 w-6 text-primary" />
                            Profile
                        </CardTitle>
                        <CardDescription className="text-muted-foreground font-medium">Your profile details</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 space-y-8">
                        <div className="flex flex-col sm:flex-row items-center gap-8">
                            <div className="w-24 h-24 rounded-[2rem] bg-primary/10 flex items-center justify-center border-2 border-primary/20 p-1 shadow-glow shadow-primary/20">
                                {userMetadata.avatar_url ? (
                                    <img
                                        src={userMetadata.avatar_url}
                                        alt={fullName}
                                        className="w-full h-full rounded-[1.8rem] object-cover"
                                    />
                                ) : (
                                    <span className="text-4xl font-black text-primary">
                                        {fullName.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div className="text-center sm:text-left space-y-2">
                                <p className="font-black text-3xl tracking-tight leading-none">{fullName}</p>
                                <p className="text-lg text-muted-foreground font-semibold flex items-center justify-center sm:justify-start gap-3">
                                    <Mail className="h-5 w-5 text-primary" />
                                    {user.email}
                                </p>
                            </div>
                        </div>

                        <Separator className="bg-border/50" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-white/40 rounded-3xl border border-border/50 space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">User ID</span>
                                <p className="font-mono text-sm text-foreground overflow-hidden text-ellipsis">{user.id}</p>
                            </div>
                            <div className="p-6 bg-white/40 rounded-3xl border border-border/50 space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Login Method</span>
                                <p className="font-black text-lg text-foreground uppercase tracking-widest">{user.app_metadata?.provider || 'Email'}</p>
                            </div>
                            <div className="p-6 bg-white/40 rounded-3xl border border-border/50 space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</span>
                                <p className={`font-black text-lg uppercase tracking-widest ${user.email_confirmed_at ? 'text-nature-green' : 'text-honey-dark'}`}>
                                    {user.email_confirmed_at ? 'Verified' : 'Unverified'}
                                </p>
                            </div>
                            <div className="p-6 bg-white/40 rounded-3xl border border-border/50 space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Member Since</span>
                                <p className="font-black text-lg text-foreground">{new Date(user.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Security Section */}
                <div className="space-y-6">
                    <h2 className="text-4xl font-black flex items-center gap-4 tracking-tightest">
                        <Shield className="h-10 w-10 text-primary" />
                        Security
                    </h2>

                    {/* 2FA Setup Component */}
                    <TwoFactorSetup />
                </div>

                {/* Sign Out */}
                <Card className="border-none glass sm:glass-dark shadow-premium rounded-[3rem] overflow-hidden">
                    <CardContent className="p-10">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="text-center sm:text-left">
                                <p className="text-2xl font-black tracking-tightest">Log Out</p>
                                <p className="text-base text-muted-foreground font-medium">
                                    Log out of your account.
                                </p>
                            </div>
                            <Button
                                size="lg"
                                variant="destructive"
                                className="h-14 px-10 font-black rounded-2xl shadow-glow shadow-destructive/20 active:scale-95 transition-all"
                                onClick={handleSignOut}
                            >
                                <LogOut className="mr-3 h-6 w-6" />
                                Log Out
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AccountSettings;
