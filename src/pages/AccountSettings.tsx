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
        <div className="min-h-screen bg-muted/30 py-12">
            <div className="container max-w-3xl mx-auto px-4 space-y-8">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-black">Account Settings</h1>
                    <p className="text-muted-foreground">Manage your account security and preferences</p>
                </div>

                {/* Profile Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Profile Information
                        </CardTitle>
                        <CardDescription>Your account details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                {userMetadata.avatar_url ? (
                                    <img
                                        src={userMetadata.avatar_url}
                                        alt={fullName}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="text-2xl font-bold text-primary">
                                        {fullName.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div>
                                <p className="font-semibold text-lg">{fullName}</p>
                                <p className="text-muted-foreground flex items-center gap-1">
                                    <Mail className="h-4 w-4" />
                                    {user.email}
                                </p>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid gap-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Account ID</span>
                                <span className="font-mono text-xs">{user.id.slice(0, 8)}...</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Provider</span>
                                <span className="capitalize">{user.app_metadata?.provider || 'Email'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Email Verified</span>
                                <span className={user.email_confirmed_at ? 'text-green-500' : 'text-orange-500'}>
                                    {user.email_confirmed_at ? '✓ Verified' : '⚠ Not verified'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Member Since</span>
                                <span>{new Date(user.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Security Section */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Security
                    </h2>

                    {/* 2FA Setup Component */}
                    <TwoFactorSetup />
                </div>

                {/* Sign Out */}
                <Card className="border-destructive/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold">Sign Out</p>
                                <p className="text-sm text-muted-foreground">
                                    Sign out of your account on this device
                                </p>
                            </div>
                            <Button
                                variant="destructive"
                                onClick={handleSignOut}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Sign Out
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AccountSettings;
