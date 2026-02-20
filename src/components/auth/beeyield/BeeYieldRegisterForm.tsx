import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, User, ShieldCheck, Database } from 'lucide-react';

interface BeeYieldRegisterFormProps {
    onSuccess?: () => void;
    onSwitchToLogin?: () => void;
}

const BeeYieldRegisterForm: React.FC<BeeYieldRegisterFormProps> = ({
    onSuccess,
    onSwitchToLogin
}) => {
    const { signUp, signInWithGoogle } = useAuth();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            setLoading(false);
            return;
        }

        const { data: signupData, error } = await signUp(email, password, {
            first_name: firstName,
            last_name: lastName,
            role: 'professional',
            beeyield_active: true
        }, 'beeyield');

        if (error) {
            toast.error("Account creation failed", { description: error.message });
        } else {
            const { supabaseBeeYield } = await import('@/lib/supabase');
            if (supabaseBeeYield && signupData?.user) {
                await supabaseBeeYield.from('beeyield_profiles').upsert({
                    id: signupData.user.id,
                    email: signupData.user.email,
                    full_name: `${firstName} ${lastName}`.trim(),
                    is_professional: true,
                    updated_at: new Date().toISOString()
                });
            }

            toast.success("Account created. Check your email for a verification link.");
            onSuccess?.();
        }
        setLoading(false);
    };

    const handleGoogleSignUp = async () => {
        setGoogleLoading(true);
        localStorage.setItem('authReturnTo', '/beeyield-dashboard');
        localStorage.setItem('authBackend', 'beeyield');
        const { error } = await signInWithGoogle({ beeyield_active: true }, 'beeyield');
        if (error) {
            toast.error("Google sync failed", { description: error.message });
            setGoogleLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Button
                type="button"
                variant="outline"
                className="w-full h-12 bg-white border-2 border-black text-black hover:bg-black hover:text-white transition-none font-bold text-xs uppercase rounded-none"
                onClick={handleGoogleSignUp}
                disabled={googleLoading}
            >
                {googleLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <ShieldCheck className="mr-2 h-4 w-4" />
                )}
                Sign up with Google
            </Button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-black" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                    <span className="bg-white px-4 text-black border border-black">OR ENTER DETAILS</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="by-reg-firstName" className="text-black font-bold text-[10px] uppercase tracking-widest">First Name</Label>
                    <Input
                        id="by-reg-firstName"
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="h-12 bg-white border-2 border-black focus:bg-yellow-50 focus:ring-0 text-black font-bold text-xs rounded-none placeholder:text-neutral-400"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="by-reg-lastName" className="text-black font-bold text-[10px] uppercase tracking-widest">Last Name</Label>
                    <Input
                        id="by-reg-lastName"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="h-12 bg-white border-2 border-black focus:bg-yellow-50 focus:ring-0 text-black font-bold text-xs rounded-none placeholder:text-neutral-400"
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="by-reg-email" className="text-black font-bold text-[10px] uppercase tracking-widest">Email Address</Label>
                <Input
                    id="by-reg-email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-white border-2 border-black focus:bg-yellow-50 focus:ring-0 text-black font-bold text-xs rounded-none placeholder:text-neutral-400"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="by-reg-password" className="text-black font-bold text-[10px] uppercase tracking-widest">Password</Label>
                    <Input
                        id="by-reg-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 bg-white border-2 border-black focus:bg-yellow-50 focus:ring-0 text-black font-bold text-xs rounded-none placeholder:text-neutral-400"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="by-reg-confirm" className="text-black font-bold text-[10px] uppercase tracking-widest">Confirm Password</Label>
                    <Input
                        id="by-reg-confirm"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-12 bg-white border-2 border-black focus:bg-yellow-50 focus:ring-0 text-black font-bold text-xs rounded-none placeholder:text-neutral-400"
                        required
                    />
                </div>
            </div>

            <Button
                type="submit"
                className="w-full h-12 bg-[#FF4F00] text-white font-bold uppercase tracking-widest text-xs rounded-none border-2 border-black hover:bg-black hover:text-[#FF4F00] transition-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                disabled={loading}
            >
                <div className="flex items-center gap-2">
                    <Database className="w-4 h-4" /> Create Account
                </div>
            </Button>

            {onSwitchToLogin && (
                <p className="text-center text-[10px] font-bold text-black uppercase tracking-widest">
                    Already have an account?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="text-[#007AFF] hover:underline"
                    >
                        Log in
                    </button>
                </p>
            )}
        </form>
    );
};

export default BeeYieldRegisterForm;
