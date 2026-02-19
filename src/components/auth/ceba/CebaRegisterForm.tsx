import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, User, Shield, Terminal, Globe } from 'lucide-react';

interface CebaRegisterFormProps {
    onSuccess?: () => void;
    onSwitchToLogin?: () => void;
}

const CebaRegisterForm: React.FC<CebaRegisterFormProps> = ({
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
            toast.error("Access codes do not match");
            setLoading(false);
            return;
        }

        const { data: signupData, error } = await signUp(email, password, {
            first_name: firstName,
            last_name: lastName,
            role: 'admin',
            ceba_active: true
        }, 'ceba');

        if (error) {
            toast.error("Registration Failed", { description: error.message });
        } else {
            // Auto-provision profile
            const { supabaseCEBA } = await import('@/lib/supabase');
            if (supabaseCEBA && signupData?.user) {
                await supabaseCEBA.from('ceba_profiles').upsert({
                    id: signupData.user.id,
                    email: signupData.user.email,
                    full_name: `${firstName} ${lastName}`.trim(),
                    admin_role: 'system_admin',
                    updated_at: new Date().toISOString()
                });
            }

            toast.success("Admin Node Provisioned. Please check your email for activation.");
            onSuccess?.();
        }
        setLoading(false);
    };

    const handleGoogleSignUp = async () => {
        setGoogleLoading(true);
        localStorage.setItem('authReturnTo', '/ceba');
        localStorage.setItem('authBackend', 'ceba');

        const { error } = await signInWithGoogle({ ceba_active: true }, 'ceba');
        if (error) {
            toast.error('Cloud Registration Failed', { description: error.message });
            setGoogleLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Button
                type="button"
                variant="outline"
                className="w-full h-12 bg-white border-2 border-beeyield-green/10 hover:border-beeyield-gold/40 text-beeyield-green font-black uppercase text-[10px] tracking-widest transition-all"
                onClick={handleGoogleSignUp}
                disabled={googleLoading}
            >
                {googleLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-beeyield-gold" />
                ) : (
                    <Globe className="mr-2 h-4 w-4 text-beeyield-gold" />
                )}
                Register via Cloud Identity
            </Button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t-2 border-beeyield-green/5" />
                </div>
                <div className="relative flex justify-center text-[8px] uppercase font-black tracking-widest">
                    <span className="bg-white px-4 text-beeyield-green/40">Credential Entry</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="ceba-firstName" className="text-beeyield-green font-black uppercase text-[10px] tracking-widest">First Name</Label>
                    <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-beeyield-gold/40 group-focus-within:text-beeyield-gold transition-colors" />
                        <Input
                            id="ceba-firstName"
                            placeholder="ADMIN_FIRST"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="pl-10 h-12 bg-white border-2 border-beeyield-green/10 focus:border-beeyield-gold focus:ring-beeyield-gold/20 font-mono text-sm uppercase transition-all"
                            required
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="ceba-lastName" className="text-beeyield-green font-black uppercase text-[10px] tracking-widest">Last Name</Label>
                    <Input
                        id="ceba-lastName"
                        placeholder="ADMIN_LAST"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="h-12 bg-white border-2 border-beeyield-green/10 focus:border-beeyield-gold focus:ring-beeyield-gold/20 font-mono text-sm uppercase transition-all"
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="ceba-reg-email" className="text-beeyield-green font-black uppercase text-[10px] tracking-widest">Terminal Identity (Email)</Label>
                <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-beeyield-gold/40 group-focus-within:text-beeyield-gold transition-colors" />
                    <Input
                        id="ceba-reg-email"
                        type="email"
                        placeholder="admin@ceba.sys"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 bg-white border-2 border-beeyield-green/10 focus:border-beeyield-gold focus:ring-beeyield-gold/20 font-mono text-sm transition-all"
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="ceba-reg-password" className="text-beeyield-green font-black uppercase text-[10px] tracking-widest">Sec. Protocol</Label>
                    <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-beeyield-gold/40 group-focus-within:text-beeyield-gold transition-colors" />
                        <Input
                            id="ceba-reg-password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 h-12 bg-white border-2 border-beeyield-green/10 focus:border-beeyield-gold focus:ring-beeyield-gold/20 font-mono text-sm transition-all"
                            required
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="ceba-reg-confirm" className="text-beeyield-green font-black uppercase text-[10px] tracking-widest">Verify Prot.</Label>
                    <Input
                        id="ceba-reg-confirm"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-12 bg-white border-2 border-beeyield-green/10 focus:border-beeyield-gold focus:ring-beeyield-gold/20 font-mono text-sm transition-all"
                        required
                    />
                </div>
            </div>

            <Button
                type="submit"
                className="w-full h-14 bg-beeyield-gold hover:bg-beeyield-orange text-beeyield-black font-black uppercase tracking-[0.2em] shadow-lg hover:shadow-glow transition-all active:scale-95 border-b-4 border-black/20"
                disabled={loading}
            >
                {loading ? (
                    <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Provisioning...
                    </div>
                ) : (
                    'Register Admin Node'
                )}
            </Button>

            {onSwitchToLogin && (
                <p className="text-center text-[10px] font-black uppercase tracking-widest text-beeyield-green/40">
                    Existing Administrator?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="text-beeyield-gold hover:text-beeyield-orange underline"
                    >
                        Terminal Access
                    </button>
                </p>
            )}
        </form>
    );
};

export default CebaRegisterForm;
