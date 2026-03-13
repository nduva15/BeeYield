import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, User, ShieldCheck, Database, ArrowRight, Zap, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { glass } from '@/components/beeyield/GlassTheme';

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
            toast.error("Passwords do not match");
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
            toast.error("Registration failed", { description: error.message });
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

            toast.success("Account created successfully");
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
            toast.error("Google registration failed", { description: error.message });
            setGoogleLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-gray-500 ml-1 uppercase tracking-wider">Given Name</Label>
                    <Input
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="h-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-[#F4D03F]/50 focus:ring-[#F4D03F]/10 rounded-xl font-medium text-xs transition-all"
                        required
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-gray-500 ml-1 uppercase tracking-wider">Surname</Label>
                    <Input
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="h-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-[#F4D03F]/50 focus:ring-[#F4D03F]/10 rounded-xl font-medium text-xs transition-all"
                        required
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-gray-500 ml-1 uppercase tracking-wider">Kernel Designation</Label>
                <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#F4D03F] transition-colors" />
                    <Input
                        type="email"
                        placeholder="name@beeyield.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-[#F4D03F]/50 focus:ring-[#F4D03F]/10 rounded-xl font-medium text-xs transition-all"
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-gray-500 ml-1 uppercase tracking-wider">Passphrase</Label>
                    <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#F4D03F] transition-colors" />
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 h-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-[#F4D03F]/50 focus:ring-[#F4D03F]/10 rounded-xl font-medium text-xs transition-all"
                            required
                        />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-gray-500 ml-1 uppercase tracking-wider">Verify</Label>
                    <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#F4D03F] transition-colors" />
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-10 h-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-[#F4D03F]/50 focus:ring-[#F4D03F]/10 rounded-xl font-medium text-xs transition-all"
                            required
                        />
                    </div>
                </div>
            </div>

            <Button
                type="submit"
                className={cn(glass.btnPrimary, "w-full h-10 font-bold text-xs uppercase shadow-sm flex items-center justify-center gap-2 mt-2")}
                disabled={loading}
            >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                Initialize Identity
            </Button>

            <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-100" />
                </div>
                <div className="relative flex justify-center text-[9px] font-bold uppercase tracking-[0.3em]">
                    <span className="bg-white px-3 text-gray-300">Relay</span>
                </div>
            </div>

            <Button
                type="button"
                variant="outline"
                className={cn(glass.btnSecondary, "w-full h-10 bg-white border-gray-200 hover:border-[#F4D03F]/50 hover:bg-gray-50 text-gray-600 font-bold text-xs uppercase rounded-xl transition-all flex items-center justify-center gap-2.5")}
                onClick={handleGoogleSignUp}
                disabled={googleLoading}
            >
                {googleLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#F4D03F]" />
                ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                )}
                Federated Google Link
            </Button>
            
            {onSwitchToLogin && (
               <div className="pt-2 text-center">
                   <button 
                        type="button" 
                        onClick={onSwitchToLogin}
                        className="text-[10px] font-bold text-gray-400 hover:text-[#F4D03F] transition-colors uppercase tracking-tight"
                    >
                        Already registered? <span className="text-[#F4D03F] ml-1">Secure Sign In</span>
                    </button>
               </div>
            )}
        </form>
    );
};

export default BeeYieldRegisterForm;
