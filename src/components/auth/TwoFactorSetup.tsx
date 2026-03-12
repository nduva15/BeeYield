import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Shield, ShieldCheck, ShieldOff, Copy, Check } from 'lucide-react';
import { Factor } from '@supabase/supabase-js';

interface TwoFactorSetupProps {
    onComplete?: () => void;
}

const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({ onComplete }) => {
    const { enrollMFA, verifyMFAEnrollment, unenrollMFA, getMFAFactors, user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [enrolling, setEnrolling] = useState(false);
    const [factors, setFactors] = useState<Factor[]>([]);
    const [enrollmentData, setEnrollmentData] = useState<{
        id: string;
        qr_code: string;
        secret: string;
    } | null>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        loadFactors();
    }, []);

    const loadFactors = async () => {
        setLoading(true);
        const { factors: loadedFactors } = await getMFAFactors();
        setFactors(loadedFactors);
        setLoading(false);
    };

    const handleEnroll = async () => {
        setEnrolling(true);
        const { data, error } = await enrollMFA();

        if (error) {
            toast.error('Error starting setup', { description: error.message });
            setEnrolling(false);
            return;
        }

        if (data) {
            setEnrollmentData({
                id: data.id,
                qr_code: data.totp.qr_code,
                secret: data.totp.secret,
            });
        }
        setEnrolling(false);
    };

    const handleVerifyEnrollment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!enrollmentData) return;

        setLoading(true);
        const { error } = await verifyMFAEnrollment(enrollmentData.id, verificationCode);

        if (error) {
            toast.error('Code verification failed', { description: error.message });
        } else {
            toast.success('Security enabled!');
            setEnrollmentData(null);
            setVerificationCode('');
            await loadFactors();
            onComplete?.();
        }
        setLoading(false);
    };

    const handleUnenroll = async (factorId: string) => {
        setLoading(true);
        const { error } = await unenrollMFA(factorId);

        if (error) {
            toast.error('Error disabling security', { description: error.message });
        } else {
            toast.success('Security disabled');
            await loadFactors();
        }
        setLoading(false);
    };

    const copySecret = () => {
        if (enrollmentData?.secret) {
            navigator.clipboard.writeText(enrollmentData.secret);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success('Secret key copied');
        }
    };

    if (!user) {
        return (
            <div className="p-10 text-center text-gray-400 font-medium bg-white/50 rounded-[2rem] border border-gray-100">
                Please sign in to manage security settings.
            </div>
        );
    }

    if (loading && factors.length === 0) {
        return (
            <div className="p-20 flex items-center justify-center bg-white/50 rounded-[2rem] border border-gray-100">
                <Loader2 className="h-8 w-8 animate-spin text-honey" />
            </div>
        );
    }

    if (enrollmentData) {
        return (
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
                <CardHeader className="p-8 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-honey/10 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-honey" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold tracking-tight">Setup Extra Security</CardTitle>
                            <CardDescription className="text-gray-500 font-medium">Scan the QR code with your authenticator app</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8 pt-4 space-y-8">
                    <div className="flex justify-center p-6 bg-gray-50 rounded-3xl border border-gray-100">
                        <div className="bg-white p-3 rounded-2xl shadow-sm">
                            <img
                                src={enrollmentData.qr_code}
                                alt="QR Code"
                                className="w-40 h-40"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Manual Entry Key</p>
                        <div className="flex items-center gap-2 p-1 bg-gray-50 rounded-2xl border border-gray-100">
                            <code className="flex-1 px-4 py-3 font-mono text-sm text-gray-600 break-all select-all">
                                {enrollmentData.secret}
                            </code>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={copySecret}
                                className="h-12 w-12 rounded-xl text-gray-400 hover:text-honey"
                            >
                                {copied ? <Check className="h-5 w-5 text-beeyield-green" /> : <Copy className="h-5 w-5" />}
                            </Button>
                        </div>
                    </div>

                    <form onSubmit={handleVerifyEnrollment} className="space-y-6">
                        <div className="space-y-3">
                            <Label htmlFor="verify-code" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                                Verification Code
                            </Label>
                            <Input
                                id="verify-code"
                                placeholder="000000"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="h-14 text-center text-3xl tracking-[0.4em] font-bold bg-gray-50 border-gray-200 focus:border-beeyield-green focus:ring-beeyield-green/20 rounded-2xl"
                                maxLength={6}
                                required
                            />
                        </div>

                        <div className="flex gap-4 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 h-14 rounded-2xl font-bold border-gray-200 text-gray-500 hover:bg-gray-50"
                                onClick={() => {
                                    setEnrollmentData(null);
                                    setVerificationCode('');
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 h-14 rounded-2xl font-bold bg-beeyield-green hover:bg-beeyield-green/90 text-white shadow-lg active:scale-95 transition-all"
                                disabled={loading || verificationCode.length !== 6}
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirm'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        );
    }

    const hasMFA = factors.length > 0;

    return (
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${hasMFA ? 'bg-beeyield-green/10' : 'bg-honey/10'}`}>
                        {hasMFA ? <ShieldCheck className="h-5 w-5 text-beeyield-green" /> : <Shield className="h-5 w-5 text-honey" />}
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold tracking-tight">Extra Security (MFA)</CardTitle>
                        <CardDescription className="text-gray-500 font-medium">Add an extra layer of protection to your account</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
                <div className={`p-6 rounded-3xl border ${hasMFA ? 'bg-beeyield-green/5 border-beeyield-green/10' : 'bg-honey/5 border-honey/10'}`}>
                    <p className={`text-sm font-bold ${hasMFA ? 'text-beeyield-green' : 'text-honey'}`}>
                        {hasMFA ? 'Account is currently protected' : 'Account is not currently protected'}
                    </p>
                    <p className="text-xs text-gray-500 mt-2 font-medium leading-relaxed">
                        {hasMFA 
                            ? `Extra security was enabled on ${new Date(factors[0].created_at).toLocaleDateString()}.`
                            : 'Setup a second step after your password to keep your account safe from unauthorized access.'
                        }
                    </p>
                </div>

                {hasMFA ? (
                    <Button
                        variant="outline"
                        className="w-full h-14 rounded-2xl border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 transition-all font-bold active:scale-95"
                        onClick={() => {
                            if (confirm('Are you sure you want to disable extra security?')) {
                                handleUnenroll(factors[0].id);
                            }
                        }}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Disable Security'}
                    </Button>
                ) : (
                    <Button
                        className="w-full h-14 rounded-2xl bg-beeyield-green hover:bg-beeyield-green/90 text-white font-bold shadow-lg shadow-beeyield-green/10 active:scale-95 transition-all"
                        onClick={handleEnroll}
                        disabled={enrolling}
                    >
                        {enrolling ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Turn On Security'}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};

export default TwoFactorSetup;
