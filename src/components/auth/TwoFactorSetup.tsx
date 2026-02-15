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
            toast.error('Failed to start 2FA enrollment', { description: error.message });
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
            toast.error('Verification failed', { description: error.message });
        } else {
            toast.success('2FA enabled successfully! 🔐');
            setEnrollmentData(null);
            setVerificationCode('');
            await loadFactors();
            onComplete?.();
        }
        setLoading(false);
    };

    const handleUnenroll = async (factorId: string) => {
        if (!confirm('Are you sure you want to disable 2FA? This will make your account less secure.')) {
            return;
        }

        setLoading(true);
        const { error } = await unenrollMFA(factorId);

        if (error) {
            toast.error('Failed to disable 2FA', { description: error.message });
        } else {
            toast.success('2FA has been disabled');
            await loadFactors();
        }
        setLoading(false);
    };

    const copySecret = () => {
        if (enrollmentData?.secret) {
            navigator.clipboard.writeText(enrollmentData.secret);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success('Secret key copied to clipboard');
        }
    };

    if (!user) {
        return (
            <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                    Please sign in to manage 2FA settings.
                </CardContent>
            </Card>
        );
    }

    if (loading && factors.length === 0) {
        return (
            <Card>
                <CardContent className="py-10 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </CardContent>
            </Card>
        );
    }

    // Enrollment flow
    if (enrollmentData) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Set Up Extra Security
                    </CardTitle>
                    <CardDescription>
                        Scan the code with your security app (Google Authenticator, etc.)
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* QR Code */}
                    <div className="flex justify-center">
                        <div className="p-4 bg-white rounded-lg border-2 border-dashed">
                            <img
                                src={enrollmentData.qr_code}
                                alt="2FA QR Code"
                                className="w-48 h-48"
                            />
                        </div>
                    </div>

                    {/* Manual Entry */}
                    <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                            Can't scan? Enter this code manually:
                        </Label>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 p-3 bg-muted rounded-md font-mono text-sm break-all">
                                {enrollmentData.secret}
                            </code>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={copySecret}
                            >
                                {copied ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Verification */}
                    <form onSubmit={handleVerifyEnrollment} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="verify-code">
                                Enter the 6-digit code from your app
                            </Label>
                            <Input
                                id="verify-code"
                                name="verification-code"
                                type="text"
                                placeholder="000000"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="text-center text-2xl tracking-[0.5em] font-mono"
                                maxLength={6}
                                required
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                    setEnrollmentData(null);
                                    setVerificationCode('');
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                disabled={loading || verificationCode.length !== 6}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Checking Code...
                                    </>
                                ) : (
                                    'Turn On'
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        );
    }

    // Status view
    const hasMFA = factors.length > 0;

    return (
        <Card className="border-beeyield-gold/20 shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-beeyield-green">
                    {hasMFA ? (
                        <>
                            <ShieldCheck className="h-5 w-5 text-beeyield-green" />
                            Extra Security On
                        </>
                    ) : (
                        <>
                            <ShieldOff className="h-5 w-5 text-beeyield-orange" />
                            Extra Security
                        </>
                    )}
                </CardTitle>
                <CardDescription className="text-beeyield-green/60">
                    {hasMFA
                        ? 'Your account is protected.'
                        : 'Add extra protection to your account.'}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {hasMFA ? (
                    <>
                        <div className="p-4 bg-beeyield-green/5 rounded-lg border border-beeyield-green/20">
                            <p className="text-sm text-beeyield-green font-bold">
                                ✓ Security app is connected
                            </p>
                            <p className="text-xs text-beeyield-green/60 mt-1 font-medium">
                                Added on {new Date(factors[0].created_at).toLocaleDateString()}
                            </p>
                        </div>
                        <Button
                            variant="destructive"
                            className="w-full bg-beeyield-orange/10 hover:bg-beeyield-orange/20 text-beeyield-orange border border-beeyield-orange/20 hover:border-beeyield-orange/50 transition-all font-bold"
                            onClick={() => handleUnenroll(factors[0].id)}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Disabling...
                                </>
                            ) : (
                                <>
                                    <ShieldOff className="mr-2 h-4 w-4" />
                                    Turn Off
                                </>
                            )}
                        </Button>
                    </>
                ) : (
                    <>
                        <div className="p-4 bg-beeyield-orange/5 rounded-lg border border-beeyield-orange/20">
                            <p className="text-sm text-beeyield-orange font-bold">
                                ⚠ Your account is not protected
                            </p>
                            <p className="text-xs text-beeyield-orange/70 mt-1 font-medium">
                                We recommend turning this on to be safe.
                            </p>
                        </div>
                        <Button
                            className="w-full bg-beeyield-green hover:bg-beeyield-green-dark text-white font-bold shadow-soft hover:shadow-glow transition-all"
                            onClick={handleEnroll}
                            disabled={enrolling}
                        >
                            {enrolling ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Setting up...
                                </>
                            ) : (
                                <>
                                    <Shield className="mr-2 h-4 w-4" />
                                    Turn On
                                </>
                            )}
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default TwoFactorSetup;
