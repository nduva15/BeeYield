import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, User } from 'lucide-react';

interface RegisterFormProps {
    onSuccess?: () => void;
    onSwitchToLogin?: () => void;
    prefillEmail?: string;
    prefillFirstName?: string;
    prefillLastName?: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
    onSuccess,
    onSwitchToLogin,
    prefillEmail = '',
    prefillFirstName = '',
    prefillLastName = '',
}) => {
    const { signUp } = useAuth();
    const [firstName, setFirstName] = useState(prefillFirstName);
    const [lastName, setLastName] = useState(prefillLastName);
    const [email, setEmail] = useState(prefillEmail);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

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

        const { error } = await signUp(email, password, {
            first_name: firstName,
            last_name: lastName,
        });

        if (error) {
            toast.error('Registration failed', { description: error.message });
        } else {
            toast.success('Account created! 🎉', {
                description: 'Please check your email to verify your account.',
            });
            onSuccess?.();
        }

        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="register-firstName">First Name</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="register-firstName"
                            placeholder="John"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="pl-10"
                            required
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="register-lastName">Last Name</Label>
                    <Input
                        id="register-lastName"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="register-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="register-password"
                        type="password"
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="register-confirmPassword">Confirm Password</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="register-confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                        required
                    />
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                    </>
                ) : (
                    'Create Account'
                )}
            </Button>

            {onSwitchToLogin && (
                <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="text-primary hover:underline font-medium"
                    >
                        Sign in
                    </button>
                </p>
            )}
        </form>
    );
};

export default RegisterForm;
