import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import TwoFactorSetup from '@/components/auth/TwoFactorSetup';
import { User, Mail, Shield, LogOut, Loader2 } from 'lucide-react';

const AccountSettings = () => {
    const { user, loading, signOut } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/checkout');
        }
    }, [user, loading, navigate]);

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

    if (!user) {
        return null;
    }

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
                        Identity <span className="text-primary italic">& Security</span>
                    </h1>
                    <p className="text-xl text-muted-foreground font-medium">Manage your account security and authentication preferences.</p>
                </div>

                {/* Profile Card */}
                <Card className="border-none glass sm:glass-dark shadow-premium rounded-[3rem] overflow-hidden">
                    <CardHeader className="p-10 pb-0">
                        <CardTitle className="text-2xl font-black tracking-widest uppercase flex items-center gap-3">
                            <User className="h-6 w-6 text-primary" />
                            Profile Profile
                        </CardTitle>
                        <CardDescription className="text-muted-foreground font-medium">Securely stored encrypted credentials</CardDescription>
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
                            <div className="p-6 bg-white/40 dark:bg-card/40 rounded-3xl border border-border/50 space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Honey ID</span>
                                <p className="font-mono text-sm text-foreground overflow-hidden text-ellipsis">{user.id}</p>
                            </div>
                            <div className="p-6 bg-white/40 dark:bg-card/40 rounded-3xl border border-border/50 space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Auth Provider</span>
                                <p className="font-black text-lg text-foreground uppercase tracking-widest">{user.app_metadata?.provider || 'Email'}</p>
                            </div>
                            <div className="p-6 bg-white/40 dark:bg-card/40 rounded-3xl border border-border/50 space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Security Status</span>
                                <p className={`font-black text-lg uppercase tracking-widest ${user.email_confirmed_at ? 'text-nature-green' : 'text-honey-dark'}`}>
                                    {user.email_confirmed_at ? 'Verified' : 'Unverified'}
                                </p>
                            </div>
                            <div className="p-6 bg-white/40 dark:bg-card/40 rounded-3xl border border-border/50 space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pulse Member Since</span>
                                <p className="font-black text-lg text-foreground">{new Date(user.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Security Section */}
                <div className="space-y-6">
                    <h2 className="text-4xl font-black flex items-center gap-4 tracking-tightest">
                        <Shield className="h-10 w-10 text-primary" />
                        Guardian Security
                    </h2>

                    {/* 2FA Setup Component */}
                    <TwoFactorSetup />
                </div>

                {/* Sign Out */}
                <Card className="border-none glass sm:glass-dark shadow-premium rounded-[3rem] overflow-hidden">
                    <CardContent className="p-10">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="text-center sm:text-left">
                                <p className="text-2xl font-black tracking-tightest">Session Management</p>
                                <p className="text-base text-muted-foreground font-medium">
                                    Safely end your current session and clear local credentials.
                                </p>
                            </div>
                            <Button
                                size="lg"
                                variant="destructive"
                                className="h-14 px-10 font-black rounded-2xl shadow-glow shadow-destructive/20 active:scale-95 transition-all"
                                onClick={handleSignOut}
                            >
                                <LogOut className="mr-3 h-6 w-6" />
                                End Session
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AccountSettings;
