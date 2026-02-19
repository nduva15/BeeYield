import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, Shield, Terminal, Activity, Server, Globe } from 'lucide-react';
import { SUPER_ADMIN_EMAIL } from '@/config/constants';

interface CebaLoginFormProps {
    onSuccess?: () => void;
    onForgotPassword?: () => void;
    onSwitchToRegister?: () => void;
}

const CebaLoginForm: React.FC<CebaLoginFormProps> = ({
    onSuccess,
    onForgotPassword,
    onSwitchToRegister
}) => {
    const { signIn, signOut, signInWithGoogle, verifyMFAChallenge, mfaRequired } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mfaCode, setMfaCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [showMFAInput, setShowMFAInput] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error, mfaRequired: needsMFA } = await signIn(email, password, 'ceba');

        if (error) {
            toast.error('Authentication Failed', { description: error.message });
            setLoading(false);
            return;
        }

        if (needsMFA) {
            setShowMFAInput(true);
            toast.info('Secure Token Required', { description: 'Provide the 6-digit MFA sequence.' });
            setLoading(false);
            return;
        }

        await handleFinalizeAccess();
    };

    const handleMFAVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await verifyMFAChallenge(mfaCode, 'ceba');

        if (error) {
            toast.error('Token Invalid', { description: error.message });
        } else {
            toast.success('Token Accepted. Synchronizing...');
            setShowMFAInput(false);
            await handleFinalizeAccess();
        }
        setLoading(false);
    };

    const handleFinalizeAccess = async () => {
        // Fetch user and check role
        const { supabaseCEBA } = await import('@/lib/supabase');
        if (supabaseCEBA) {
            const { data } = await supabaseCEBA.auth.getUser();
            const loggedInUser = data?.user;

            if (loggedInUser) {
                const userRole = loggedInUser.user_metadata?.role || 'user';
                const isSuperAdminEmail = [SUPER_ADMIN_EMAIL, 'timothynduva349@gmail.com'].includes(loggedInUser.email?.toLowerCase() || '');
                const isAdmin = userRole === 'admin' || userRole === 'super_admin' || isSuperAdminEmail;

                if (!isAdmin) {
                    await signOut('ceba');
                    toast.error('Access Restricted', {
                        description: 'This terminal is for authorized CEBA administrators only.'
                    });
                    setLoading(false);
                    return;
                }

                // Ensure profile exists in ceba_profiles
                const { error: profileError } = await supabaseCEBA
                    .from('ceba_profiles')
                    .select('id')
                    .eq('id', loggedInUser.id)
                    .single();

                if (profileError) {
                    // Auto-provision admin profile
                    await supabaseCEBA.from('ceba_profiles').upsert({
                        id: loggedInUser.id,
                        email: loggedInUser.email,
                        full_name: loggedInUser.user_metadata?.full_name || 'Admin User',
                        admin_role: 'system_admin',
                        updated_at: new Date().toISOString()
                    });
                }

                toast.success('Access Granted. Welcome, Commander.');
                onSuccess?.();
            }
        }
    };

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        localStorage.setItem('authReturnTo', '/ceba');
        localStorage.setItem('authBackend', 'ceba');

        const { error } = await signInWithGoogle(undefined, 'ceba');
        if (error) {
            toast.error('Cloud Auth Failed', { description: error.message });
            setGoogleLoading(false);
        }
    };

    if (showMFAInput || mfaRequired) {
        return (
            <form onSubmit={handleMFAVerify} className="space-y-8">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-xl bg-beeyield-green/5 flex items-center justify-center mx-auto border-2 border-beeyield-green/20">
                        <Shield className="h-6 w-6 text-beeyield-green" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-black text-beeyield-green uppercase tracking-[0.3em]">Identity Verification</h3>
                        <p className="text-[9px] font-black text-black/30 uppercase tracking-widest font-mono">
                            Waiting for MFA handshake code
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    <Label htmlFor="ceba-mfa-code" className="text-beeyield-green font-black uppercase text-[9px] tracking-widest pl-1">Token Input</Label>
                    <Input
                        id="ceba-mfa-code"
                        type="text"
                        placeholder="000000"
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="text-center text-3xl tracking-[0.6em] font-mono h-20 bg-white border-2 border-beeyield-green/10 focus:border-beeyield-gold focus:ring-0 text-beeyield-black rounded-none transition-all"
                        maxLength={6}
                        required
                        autoFocus
                    />
                </div>

                <Button type="submit" className="w-full h-16 bg-beeyield-green text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-none shadow-premium hover:shadow-glow transition-all" disabled={loading || mfaCode.length !== 6}>
                    {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        'Validate Token'
                    )}
                </Button>

                <button
                    type="button"
                    onClick={() => {
                        setShowMFAInput(false);
                        setMfaCode('');
                    }}
                    className="w-full text-[9px] font-black uppercase tracking-widest text-beeyield-green/40 hover:text-beeyield-gold transition-colors"
                >
                    &lt; Back to Primary Authentication &gt;
                </button>
            </form>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Button
                type="button"
                variant="outline"
                className="w-full h-12 bg-white border-2 border-beeyield-green/10 hover:border-beeyield-gold/40 text-beeyield-green font-black uppercase text-[10px] tracking-widest transition-all"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
            >
                {googleLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-beeyield-gold" />
                ) : (
                    <Globe className="mr-2 h-4 w-4 text-beeyield-gold" />
                )}
                Authorize via Cloud Identity
            </Button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t-2 border-beeyield-green/5" />
                </div>
                <div className="relative flex justify-center text-[8px] uppercase font-black tracking-widest">
                    <span className="bg-white px-4 text-beeyield-green/40">Manual Override</span>
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="ceba-email" className="text-beeyield-green font-black uppercase text-[10px] tracking-widest">Administrator ID</Label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Terminal className="h-4 w-4 text-beeyield-gold/40 group-focus-within:text-beeyield-gold transition-colors" />
                        </div>
                        <Input
                            id="ceba-email"
                            type="email"
                            placeholder="admin@ceba.sys"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 h-12 bg-white border-2 border-beeyield-green/10 focus:border-beeyield-gold focus:ring-beeyield-gold/20 font-mono text-sm transition-all"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="ceba-password" className="text-beeyield-green font-black uppercase text-[10px] tracking-widest">Access Key</Label>
                        {onForgotPassword && (
                            <button
                                type="button"
                                onClick={onForgotPassword}
                                className="text-[10px] font-black uppercase tracking-widest text-beeyield-gold hover:text-beeyield-orange transition-colors"
                            >
                                Reset Key
                            </button>
                        )}
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-4 w-4 text-beeyield-gold/40 group-focus-within:text-beeyield-gold transition-colors" />
                        </div>
                        <Input
                            id="ceba-password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 h-12 bg-white border-2 border-beeyield-green/10 focus:border-beeyield-gold focus:ring-beeyield-gold/20 font-mono text-sm transition-all"
                            required
                        />
                    </div>
                </div>
            </div>

            <Button
                type="submit"
                className="w-full h-14 bg-beeyield-green hover:bg-beeyield-green-dark text-white font-black uppercase tracking-[0.2em] shadow-lg hover:shadow-glow transition-all active:scale-95"
                disabled={loading}
            >
                {loading ? (
                    <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Authenticating...
                    </div>
                ) : (
                    'Initiate Access'
                )}
            </Button>

            <div className="flex flex-col gap-4 items-center">
                {onSwitchToRegister && (
                    <button
                        type="button"
                        onClick={onSwitchToRegister}
                        className="text-[10px] font-black uppercase tracking-widest text-beeyield-green/40 hover:text-beeyield-green transition-colors"
                    >
                        Request New Admin Credentials
                    </button>
                )}

                <div className="flex items-center gap-4 text-[8px] font-black text-beeyield-green/20 uppercase tracking-[0.3em]">
                    <div className="flex items-center gap-1"><Server className="w-2 h-2" /> Node: Primary</div>
                    <div className="flex items-center gap-1"><Globe className="w-2 h-2" /> Protocol: TLS 1.3</div>
                </div>
            </div>
        </form>
    );
};

export default CebaLoginForm;
