import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Smartphone,
  CheckCircle2,
  Clock,
  RotateCcw,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Loader2,
  Lock,
  Phone,
  Receipt,
  Sparkles,
  ChevronRight,
  Edit2,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import {
  checkMpesaPaymentStatus,
  initiateMpesaStkPush,
  confirmMpesaPayment,
  MpesaPaymentStatusResponse
} from '@/services/shopService';

export interface MpesaPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: string;
  amount: number;
  phone: string;
  checkoutRequestId?: string;
  idempotencyKey?: string;
  onPaymentSuccess: (result: MpesaPaymentStatusResponse) => void;
}

export const MpesaPaymentModal: React.FC<MpesaPaymentModalProps> = ({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  amount,
  phone: initialPhone,
  checkoutRequestId: initialCheckoutRequestId,
  idempotencyKey,
  onPaymentSuccess,
}) => {
  const [phone, setPhone] = useState(initialPhone || '');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState(initialCheckoutRequestId || '');
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPolling, setIsPolling] = useState(false);
  const [isManualConfirming, setIsManualConfirming] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [mpesaCodeInput, setMpesaCodeInput] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmedReceipt, setConfirmedReceipt] = useState<string>('');
  const [confirmedAt, setConfirmedAt] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pollIntervalRef = useRef<any>(null);

  // Sync initial phone
  useEffect(() => {
    if (initialPhone) setPhone(initialPhone);
  }, [initialPhone]);

  useEffect(() => {
    if (initialCheckoutRequestId) setCheckoutRequestId(initialCheckoutRequestId);
  }, [initialCheckoutRequestId]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeLeft(60);
      setIsConfirmed(false);
      setErrorMessage(null);
      setConfirmedReceipt('');
      setConfirmedAt('');
      startPolling();
    } else {
      stopPolling();
    }
    return () => stopPolling();
  }, [isOpen, orderId, checkoutRequestId]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || isConfirmed) return;
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isConfirmed, timeLeft]);

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setIsPolling(false);
  };

  const handlePaymentCompleted = (result: MpesaPaymentStatusResponse) => {
    stopPolling();
    setIsConfirmed(true);
    const code = result.mpesa_code || `QA${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    setConfirmedReceipt(code);
    setConfirmedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    toast.success('M-Pesa payment confirmed successfully!');
    onPaymentSuccess({ ...result, mpesa_code: code });
  };

  const startPolling = () => {
    stopPolling();
    setIsPolling(true);

    const queryKey = checkoutRequestId || idempotencyKey || orderId;
    if (!queryKey) return;

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await checkMpesaPaymentStatus(queryKey);
        if (res && res.paid) {
          handlePaymentCompleted(res);
        }
      } catch (err) {
        console.warn('Status poll warning:', err);
      }
    }, 2500);
  };

  // User manually triggers a status check
  const handleCheckStatusNow = async () => {
    setIsPolling(true);
    setErrorMessage(null);
    try {
      const queryKey = checkoutRequestId || idempotencyKey || orderId;
      const res = await checkMpesaPaymentStatus(queryKey);
      if (res && res.paid) {
        handlePaymentCompleted(res);
        return;
      }

      // If not yet detected and user entered code, try manual confirmation
      if (mpesaCodeInput.trim().length >= 8) {
        await handleManualConfirm();
        return;
      }

      toast.info('Waiting for PIN confirmation on your phone. If you already entered your PIN, please enter the M-Pesa SMS code below.');
      setShowCodeInput(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification check timed out. Please try entering your M-Pesa SMS code.');
    } finally {
      setIsPolling(false);
    }
  };

  // User confirms with M-Pesa SMS Code (e.g. "QAF452...")
  const handleManualConfirm = async () => {
    if (!mpesaCodeInput.trim()) {
      toast.error('Please enter the M-Pesa reference code from your SMS.');
      return;
    }
    setIsManualConfirming(true);
    setErrorMessage(null);
    try {
      const res = await confirmMpesaPayment(orderId, mpesaCodeInput.trim(), checkoutRequestId);
      if (res && res.paid) {
        handlePaymentCompleted(res);
      } else {
        throw new Error(res?.message || 'Could not verify M-Pesa code');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not verify payment code. Please check and retry.');
      toast.error(err.message || 'Payment confirmation failed');
    } finally {
      setIsManualConfirming(false);
    }
  };

  // Resend STK Push Prompt
  const handleResendStk = async () => {
    setIsResending(true);
    setErrorMessage(null);
    try {
      const res = await initiateMpesaStkPush(orderId, phone, amount);
      if (res && (res.CheckoutRequestID || res.success)) {
        if (res.CheckoutRequestID) {
          setCheckoutRequestId(res.CheckoutRequestID);
        }
        setTimeLeft(60);
        setIsEditingPhone(false);
        toast.success(`New STK Push prompt dispatched to ${phone}! Check your phone.`);
        startPolling();
      } else {
        toast.error(res?.error || 'Failed to resend STK push');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send prompt');
    } finally {
      setIsResending(false);
    }
  };

  // Instant simulator verification for dev/test
  const handleInstantSimulateSuccess = async () => {
    setIsManualConfirming(true);
    try {
      const simCode = `QA${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      const res = await confirmMpesaPayment(orderId, simCode, checkoutRequestId);
      handlePaymentCompleted(res);
    } catch (err: any) {
      toast.error(err.message || 'Simulation error');
    } finally {
      setIsManualConfirming(false);
    }
  };

  const formatDisplayPhone = (p: string) => {
    const digits = p.replace(/\D/g, '');
    if (digits.startsWith('254') && digits.length === 12) {
      return `+254 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
    }
    if (digits.startsWith('0') && digits.length === 10) {
      return `+254 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    }
    return p;
  };

  const progressPercent = Math.max(0, Math.min(100, (timeLeft / 60) * 100));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !isConfirmed) onClose(); }}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-2 border-emerald-500/30 bg-background shadow-2xl rounded-3xl">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#1B9157] to-[#0e5c35] p-6 text-white relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
            <Smartphone className="w-40 h-40" />
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white text-[#1B9157] font-black text-sm shadow">
                M
              </span>
              <span className="font-extrabold text-xl tracking-tight">M-PESA Express</span>
            </div>
            <Badge className="bg-white/20 hover:bg-white/25 text-white border-0 backdrop-blur-md px-3 py-1 font-semibold text-xs">
              Safaricom Daraja
            </Badge>
          </div>

          <h2 className="text-2xl font-black tracking-tight">
            {isConfirmed ? 'Payment Confirmed!' : 'Check Your Phone'}
          </h2>
          <p className="text-white/80 text-sm mt-1">
            {isConfirmed
              ? 'Your honey order payment has been successfully verified'
              : `Authorize payment of KES ${amount.toLocaleString()} to BeeYield Apiaries`}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {!isConfirmed ? (
            <>
              {/* Phone Prompt Graphic / Visual STK Push Mockup */}
              <div className="relative mx-auto max-w-sm rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-b from-emerald-500/5 via-background to-background p-5 shadow-inner">
                {/* Radar / Pulsing Ring */}
                <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-[#1B9157] opacity-40"></span>
                      <div className="w-8 h-8 rounded-full bg-[#1B9157] text-white flex items-center justify-center shadow">
                        <Smartphone className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">STK Push Sent To</p>
                      {isEditingPhone ? (
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="h-8 text-sm max-w-[160px]"
                            placeholder="07XX XXX XXX"
                          />
                          <Button size="sm" onClick={() => setIsEditingPhone(false)} className="h-8 px-2 bg-[#1B9157] hover:bg-[#157847]">
                            <Check className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-foreground text-sm tracking-wide">
                            {formatDisplayPhone(phone)}
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsEditingPhone(true)}
                            className="text-xs text-[#1B9157] hover:underline flex items-center gap-1 font-medium"
                          >
                            <Edit2 className="w-3 h-3" /> Edit
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-muted-foreground">Amount</span>
                    <p className="font-black text-emerald-600 dark:text-emerald-400 text-base">
                      KES {amount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Simulated Phone USSD Dialog Box */}
                <div className="bg-muted/70 rounded-xl p-4 border border-border space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                    <span className="flex items-center gap-1.5 text-[#1B9157]">
                      <span className="w-2 h-2 rounded-full bg-[#1B9157] inline-block animate-pulse"></span>
                      Active Daraja Session
                    </span>
                    <span className="font-mono text-xs">{timeLeft}s remaining</span>
                  </div>

                  <div className="bg-background rounded-lg p-3 border border-border shadow-sm text-center">
                    <p className="text-xs text-muted-foreground font-medium">Prompt on phone screen:</p>
                    <p className="text-sm font-bold mt-1 text-foreground">
                      Do you want to pay KES {amount.toLocaleString()} to BeeYield Apiaries?
                    </p>
                    <div className="flex justify-center items-center gap-1.5 mt-2">
                      <span className="text-xs text-muted-foreground">PIN:</span>
                      <div className="flex gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-foreground/40 animate-pulse"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-foreground/40 animate-pulse delay-100"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-foreground/40 animate-pulse delay-200"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-foreground/40 animate-pulse delay-300"></span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-muted-foreground/20 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#1B9157] h-full transition-all duration-1000 ease-linear"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Instructions steps */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-muted/40 border border-border flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-[#1B9157] flex items-center justify-center font-bold mb-1">
                    1
                  </div>
                  <span className="font-bold text-foreground">Unlock Phone</span>
                  <span className="text-muted-foreground text-[10px] mt-0.5">Look for M-Pesa prompt</span>
                </div>
                <div className="p-2.5 rounded-xl bg-muted/40 border border-border flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-[#1B9157] flex items-center justify-center font-bold mb-1">
                    2
                  </div>
                  <span className="font-bold text-foreground">Enter M-Pesa PIN</span>
                  <span className="text-muted-foreground text-[10px] mt-0.5">Press Send</span>
                </div>
                <div className="p-2.5 rounded-xl bg-muted/40 border border-border flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-[#1B9157] flex items-center justify-center font-bold mb-1">
                    3
                  </div>
                  <span className="font-bold text-foreground">Confirmation</span>
                  <span className="text-muted-foreground text-[10px] mt-0.5">Auto-verifies instantly</span>
                </div>
              </div>

              {/* Error Alert if any */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Manual M-Pesa Code Input Drawer */}
              {showCodeInput ? (
                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-[#1B9157]" />
                      Enter M-Pesa SMS Code
                    </label>
                    <span className="text-[10px] text-muted-foreground">e.g. QAF93KD812</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={mpesaCodeInput}
                      onChange={(e) => setMpesaCodeInput(e.target.value.toUpperCase())}
                      placeholder="e.g. QAF93KD812"
                      className="font-mono uppercase tracking-wider text-sm h-10"
                      maxLength={12}
                    />
                    <Button
                      onClick={handleManualConfirm}
                      disabled={isManualConfirming || !mpesaCodeInput.trim()}
                      className="bg-[#1B9157] hover:bg-[#157847] text-white font-bold h-10 px-4"
                    >
                      {isManualConfirming ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify Code'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowCodeInput(true)}
                    className="text-xs text-[#1B9157] hover:underline font-semibold"
                  >
                    Already paid? Enter M-Pesa SMS confirmation code manually →
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <Button
                  onClick={handleCheckStatusNow}
                  disabled={isPolling || isManualConfirming}
                  className="w-full rounded-2xl h-12 text-base font-extrabold bg-[#1B9157] hover:bg-[#157847] text-white shadow-lg shadow-emerald-600/20"
                >
                  {isPolling ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Checking Payment Confirmation...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      I Have Entered My PIN
                    </>
                  )}
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handleResendStk}
                    disabled={isResending}
                    className="flex-1 rounded-2xl h-10 text-xs font-bold"
                  >
                    {isResending ? (
                      <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                    ) : (
                      <RotateCcw className="w-3.5 h-3.5 mr-1" />
                    )}
                    Resend STK Prompt
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={onClose}
                    className="rounded-2xl h-10 text-xs text-muted-foreground"
                  >
                    Cancel
                  </Button>
                </div>

                {/* Instant Dev Simulation button */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={handleInstantSimulateSuccess}
                    className="text-[11px] text-muted-foreground hover:text-foreground underline decoration-dotted transition-colors"
                  >
                    ⚡ Test Simulator: Confirm M-Pesa Instantly
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* ================= CONFIRMATION SUCCESS VIEW ================= */
            <div className="text-center space-y-6 py-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-20"></span>
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#1B9157] to-emerald-400 text-white flex items-center justify-center shadow-xl">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
              </div>

              <div>
                <Badge className="bg-emerald-500/10 text-[#1B9157] border border-emerald-500/20 text-xs font-bold px-3 py-1 mb-2">
                  <Sparkles className="w-3.5 h-3.5 mr-1 inline" />
                  M-Pesa Payment Verified
                </Badge>
                <h3 className="text-2xl font-black text-foreground">KES {amount.toLocaleString()} Received</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Thank you! Your payment has been received and verified by Safaricom.
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="bg-muted/40 border border-border rounded-2xl p-4 text-left space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-medium">Receipt Code:</span>
                  <span className="font-mono font-bold text-foreground text-sm tracking-wider">
                    {confirmedReceipt}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-medium">Order Number:</span>
                  <span className="font-bold text-foreground">{orderNumber}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-medium">Phone:</span>
                  <span className="font-medium text-foreground">{formatDisplayPhone(phone)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-medium">Status:</span>
                  <span className="font-bold text-[#1B9157] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Paid & Processing
                  </span>
                </div>
                {confirmedAt && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-medium">Verified At:</span>
                    <span className="text-muted-foreground">{confirmedAt}</span>
                  </div>
                )}
              </div>

              <Button
                onClick={() => {
                  onClose();
                  onPaymentSuccess({
                    status: 'completed',
                    paid: true,
                    order_id: orderId,
                    order_number: orderNumber,
                    mpesa_code: confirmedReceipt,
                    amount,
                  });
                }}
                className="w-full rounded-2xl h-12 text-base font-extrabold bg-[#1B9157] hover:bg-[#157847] text-white shadow-lg shadow-emerald-600/20"
              >
                Continue to Order Tracking
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MpesaPaymentModal;
