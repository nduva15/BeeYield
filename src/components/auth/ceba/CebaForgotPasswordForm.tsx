import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Mail, ArrowLeft, CheckCircle, Shield, Terminal } from 'lucide-react';

interface CebaForgotPasswordFormProps {
    onBackToLogin: () => void;
}

const CebaForgotPasswordForm: React.FC<CebaForgotPasswordFormProps> = ({
    onBackToLogin
}) => {
    const { resetPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await resetPassword(email, 'ceba');

        if (error) {
            toast.error('Reset Protocol Failed', { description: error.message });
        } else {
            setEmailSent(true);
            toast.success('Secure reset directive transmitted.');
        }
        setLoading(false);
    };

    if (emailSent) {
        return (
            <div className="space-y-6 text-center">
                <div className="w-20 h-20 rounded-xl bg-beeyield-green/5 flex items-center justify-center mx-auto border-2 border-beeyield-green/20">
                    <CheckCircle className="h-10 w-10 text-beeyield-green" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-sm font-black text-beeyield-green uppercase tracking-[0.3em]">
                        Directive Transmitted
                    </h3>
                    <p className="text-[10px] font-black text-black/40 uppercase tracking-widest font-mono leading-relaxed max-w-xs mx-auto">
                        Check your secure terminal (<span className="text-beeyield-green">{email}</span>) for the administrative reset link.
                    </p>
                </div>
                <Button
                    type="button"
                    className="w-full h-12 bg-white border-2 border-beeyield-green/10 hover:border-beeyield-gold/40 text-beeyield-green font-black uppercase tracking-widest text-[9px] rounded-none shadow-none"
                    variant="outline"
                    onClick={onBackToLogin}
                >
                    <ArrowLeft className="mr-2 h-3 w-3" />
                    Return to Terminal
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-xl bg-beeyield-green/5 flex items-center justify-center mx-auto border-2 border-beeyield-green/20">
                    <Shield className="h-6 w-6 text-beeyield-green" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-sm font-black text-beeyield-green uppercase tracking-[0.3em]">
                        Access Key Reset
                    </h3>
                    <p className="text-[9px] font-black text-black/30 uppercase tracking-widest font-mono leading-loose">
                        Initiate secure administrative key recovery
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                <Label htmlFor="ceba-reset-email" className="text-beeyield-green font-black uppercase text-[9px] tracking-widest pl-1">
                    Administrator Terminal ID
                </Label>
                <div className="relative group">
                    <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-beeyield-gold/40 group-focus-within:text-beeyield-gold transition-colors" />
                    <Input
                        id="ceba-reset-email"
                        type="email"
                        placeholder="admin@ceba.sys"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-14 bg-white border-2 border-beeyield-green/10 focus:border-beeyield-gold focus:ring-beeyield-gold/20 font-mono text-sm rounded-none transition-all"
                        required
                        autoFocus
                    />
                </div>
            </div>

            <Button
                type="submit"
                className="w-full h-14 bg-beeyield-green hover:bg-beeyield-green-dark text-white font-black uppercase tracking-[0.2em] shadow-lg hover:shadow-glow transition-all active:scale-95 rounded-none"
                disabled={loading}
            >
                {loading ? (
                    <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Transmitting...
                    </div>
                ) : (
                    'Transmit Reset Directive'
                )}
            </Button>

            <button
                type="button"
                onClick={onBackToLogin}
                className="w-full flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-beeyield-green/40 hover:text-beeyield-gold transition-colors"
            >
                <ArrowLeft className="h-3 w-3" />
                Abort — Return to Primary Authentication
            </button>
        </form>
    );
};

export default CebaForgotPasswordForm;
