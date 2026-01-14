import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Lock, CheckCircle, Shield } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

const UpdatePasswordForm: React.FC = () => {
    const { updatePassword, session } = useAuth();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isValidSession, setIsValidSession] = useState(false);

    useEffect(() => {
        // Check if we have a valid session (user came from reset link)
        // Supabase automatically logs the user in when they click the reset link
        if (session) {
            setIsValidSession(true);
        }
    }, [session]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        const { error } = await updatePassword(password);

        if (error) {
            toast.error('Password update failed', { description: error.message });
        } else {
            setSuccess(true);
            toast.success('Password updated! 🎉', {
                description: 'You can now log in with your new password.',
            });
        }

        setLoading(false);
    };

    // Success state
    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-amber-900/20 dark:to-gray-900 p-4">
                <div className="w-full max-w-md">
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-amber-200/50 dark:border-amber-500/20 p-8 space-y-6">
                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                                <CheckCircle className="h-10 w-10 text-green-500" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold">Password Updated!</h2>
                                <p className="text-sm text-muted-foreground">
                                    Your password has been successfully updated. You can now log in with your new password.
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={() => navigate('/admin/login')}
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                        >
                            Go to Login
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Loading session check
    if (!isValidSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-amber-900/20 dark:to-gray-900 p-4">
                <div className="w-full max-w-md">
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-amber-200/50 dark:border-amber-500/20 p-8 space-y-6">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto">
                                <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-bold">Verifying reset link...</h2>
                                <p className="text-sm text-muted-foreground">
                                    Please wait while we verify your password reset link.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-amber-900/20 dark:to-gray-900 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-amber-200/50 dark:border-amber-500/20 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="text-center space-y-2">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                                <Shield className="h-8 w-8 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold">Set New Password</h2>
                            <p className="text-sm text-muted-foreground">
                                Create a strong password for your account
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="new-password"
                                        type="password"
                                        placeholder="At least 6 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10"
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm New Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="confirm-password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating password...
                                </>
                            ) : (
                                'Update Password'
                            )}
                        </Button>

                        <p className="text-xs text-center text-muted-foreground">
                            Password must be at least 6 characters long.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UpdatePasswordForm;
