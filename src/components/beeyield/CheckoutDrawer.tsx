import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    CreditCard,
    Smartphone,
    Shield,
    Lock as LockIcon,
    ChevronRight,
    MapPin,
    AlertCircle,
    CheckCircle2,
    Loader2
} from "lucide-react";
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import beeyieldService from '@/services/beeyieldService';
import { useAuth } from '@/contexts/AuthContext';
import { jsPDF } from 'jspdf';

interface PaymentMethod {
    id: string;
    type: 'card' | 'mpesa';
    last4?: string;
    phone?: string;
    isDefault: boolean;
    provider?: string;
}

interface CheckoutDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    item: {
        name: string;
        price: number;
        currency: string;
        description: string;
    } | null;
    onSuccess?: (txId: string) => void;
}

const CheckoutDrawer: React.FC<CheckoutDrawerProps> = ({ isOpen, onClose, item, onSuccess }) => {
    const { user, beeyieldUser } = useAuth();
    const [step, setStep] = React.useState<'review' | 'payment' | 'processing' | 'success'>('review');
    const [selectedMethod, setSelectedMethod] = React.useState<string>('method_1');
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [receiptRef, setReceiptRef] = React.useState<string | null>(null);
    const [mpesaPhone, setMpesaPhone] = React.useState<string>('');

    const paymentMethods: PaymentMethod[] = [
        { id: 'method_1', type: 'mpesa', phone: mpesaPhone || undefined, isDefault: true, provider: 'Safaricom' },
    ];

    const currentMethod = paymentMethods.find(m => m.id === selectedMethod) || paymentMethods[0];

    const handlePayment = async () => {
        if (!item) return;
        if (!beeyieldUser?.id && !user?.id) {
            toast.error('Please sign in to complete checkout.');
            setStep('payment');
            return;
        }

        if (currentMethod.type === 'mpesa') {
            const phone = (mpesaPhone || '').trim().replace(/\s+/g, '');
            if (!phone) {
                toast.error('Enter your M-Pesa phone number to continue.');
                setStep('payment');
                return;
            }
        }

        setIsProcessing(true);
        setStep('processing');

        const idempotencyKey = crypto.randomUUID();

        try {
            // 1. Initiate Checkout via Oxidized Shop Engine
            const { data, error } = await beeyieldService.checkout({
                user_id: beeyieldUser?.id || user?.id || 'anonymous',
                idempotency_key: idempotencyKey,
                checkout_data: {
                    amount: item.price,
                    currency: item.currency,
                    payment_method: currentMethod.type,
                    phone: currentMethod.type === 'mpesa' ? (mpesaPhone || '').trim().replace(/\s+/g, '') : currentMethod.phone,
                    description: `Order for ${item.name}`
                }
            });

            if (error || (data && !data.success && data.error)) {
                throw new Error(data?.error || 'Checkout initiation failed');
            }

            // 2. If M-Pesa, enter Polling Loop (The "Uber" Experience)
            if (currentMethod.type === 'mpesa') {
                let attempts = 0;
                const maxAttempts = 20; // 60 seconds total

                while (attempts < maxAttempts) {
                    const status = await beeyieldService.getCheckoutStatus(idempotencyKey);
                    if (status.paid) {
                        setStep('success');
                        toast.success("Payment Verified", { description: "Funds secured in vault." });
                        setReceiptRef(status.transaction_id || idempotencyKey);
                        if (onSuccess) onSuccess(status.transaction_id || 'Txn Success');
                        return;
                    }
                    if (status.status === 'failed') {
                        throw new Error('Transaction declined by provider.');
                    }

                    await new Promise(r => setTimeout(r, 3000));
                    attempts++;
                }
                throw new Error('Payment timeout. Please check your phone.');
            } else {
                // Card or other instant success (Stripe handles its own flow)
                setStep('success');
                if (onSuccess) onSuccess('Txn Card Success');
            }
        } catch (error: any) {
            setStep('payment');
            toast.error("Transaction Error", { description: error.message || "We couldn’t confirm the payment. Please try again." });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={!isProcessing ? onClose : undefined}
                        className="fixed inset-0 bg-[#FFF9F0]/80 backdrop-blur-sm z-50 cursor-crosshair"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#000000] border-l border-[#1A1A1A] z-50 flex flex-col font-mono"
                    >
                        {/* Header */}
                        <div className="h-16 flex items-center justify-between px-6 border-b border-[#1A1A1A]">
                            <span className="text-[10px] font-black text-[#1A1A1A]">Secure Checkout</span>
                            <button
                                onClick={onClose}
                                disabled={isProcessing}
                                aria-label="Close checkout"
                                title="Close"
                                className="p-2 text-gray-400 hover:text-[#1A1A1A] transition-colors disabled:opacity-0"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">

                            {step === 'review' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black text-gray-400">Selected Hive Plan</p>
                                        <div className="bg-[#111] border border-[#1A1A1A] p-4">
                                            <h3 className="text-xl font-black text-[#1A1A1A] leading-none">{item?.name}</h3>
                                            <p className="text-[11px] text-gray-600 mt-1.5 leading-relaxed">{item?.description}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-[#111] border border-[#1A1A1A] p-4">
                                            <p className="text-[8px] font-black text-gray-400 tracking-tighter">Amount Due</p>
                                            <p className="text-lg font-black text-[#F59E0B] mt-1">{item?.currency} {item?.price.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-[#111] border border-[#1A1A1A] p-4">
                                            <p className="text-[8px] font-black text-gray-400 tracking-tighter">Tax (16% VAT)</p>
                                            <p className="text-lg font-black text-[#1A1A1A] mt-1">Incl</p>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            onClick={() => setStep('payment')}
                                            disabled={isProcessing}
                                            className="w-full h-14 bg-[#FFF9F0] text-[#1A1A1A] font-black hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            Select Payment
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 'payment' && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                    <div className="space-y-4">
                                        <p className="text-[9px] font-black text-gray-400">Select Method</p>

                                        <div className="space-y-2">
                                            {paymentMethods.map((method) => (
                                                <button
                                                    key={method.id}
                                                    onClick={() => setSelectedMethod(method.id)}
                                                    className={cn(
                                                        "w-full flex items-center justify-between p-4 border transition-all text-left",
                                                        selectedMethod === method.id
                                                            ? "bg-[#111] border-[#F59E0B]"
                                                            : "bg-transparent border-[#1A1A1A] hover:border-[#F4D03F]/20"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-[#F9F7F2] flex items-center justify-center">
                                                            <Smartphone size={20} className="text-[#1B9157]" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[12px] font-bold text-[#1A1A1A]">
                                                                {method.phone || 'Enter phone below'}
                                                            </p>
                                                            <p className="text-[9px] text-gray-400 font-black">{method.provider}</p>
                                                        </div>
                                                    </div>
                                                    {method.isDefault && <span className="text-[8px] font-black text-[#F59E0B] border border-[#F59E0B]/20 px-1.5 py-0.5">Default</span>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black text-gray-400">M-Pesa phone</p>
                                        <input
                                            value={mpesaPhone}
                                            onChange={(e) => setMpesaPhone(e.target.value)}
                                            placeholder="2547XXXXXXXX"
                                            inputMode="tel"
                                            autoComplete="tel"
                                            className="w-full h-12 bg-[#111] border border-[#1A1A1A] px-4 text-[12px] font-bold text-[#1A1A1A] placeholder:text-gray-600 outline-none focus:border-[#F59E0B]"
                                            aria-label="M-Pesa phone number"
                                            title="M-Pesa phone number"
                                        />
                                        <p className="text-[10px] text-gray-500 leading-relaxed font-bold">
                                            Use international format (e.g. 2547…). We’ll prompt on your phone to confirm the payment.
                                        </p>
                                    </div>

                                    <div className="p-4 bg-[#1B9157] border border-[#1B9157] flex gap-3">
                                        <Shield size={16} className="text-[#1B9157] flex-shrink-0 mt-0.5" />
                                        <p className="text-[10px] text-[#1B9157]/80 leading-relaxed font-bold">
                                            Oxidized Security Enabled. This transaction is protected by memory-safe Rust cryptography and strict idempotency checks.
                                        </p>
                                    </div>

                                    <div className="pt-4 flex flex-col gap-3">
                                        <button
                                            onClick={handlePayment}
                                            disabled={isProcessing}
                                            className="w-full h-14 bg-[#F59E0B] text-[#1A1A1A] font-black hover:bg-[#FBBF24] transition-colors flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-wait"
                                        >
                                            {isProcessing ? "Handshaking..." : `Pay ${item?.currency} ${item?.price.toLocaleString()}`}
                                            <LockIcon size={16} className={cn("transition-transform", isProcessing ? "animate-pulse" : "group-hover:translate-y-[-1px]")} />
                                        </button>
                                        <button
                                            onClick={() => setStep('review')}
                                            disabled={isProcessing}
                                            className="w-full h-11 text-gray-400 font-black hover:text-[#1A1A1A] transition-colors text-[10px] disabled:opacity-0"
                                        >
                                            Back to Review
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {(step === 'processing' || step === 'success') && (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 pt-12">
                                    <div className="relative">
                                        {step === 'processing' ? (
                                            <div className="relative">
                                                <div className="w-20 h-20 border-4 border-[#1A1A1A] border-t-[#F59E0B] animate-spin" />
                                                {currentMethod.type === 'mpesa' && (
                                                    <motion.div
                                                        animate={{ opacity: [0.2, 1, 0.2] }}
                                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                                        className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap"
                                                    >
                                                        <span className="text-[9px] font-black text-[#F59E0B]">Awaiting Phone PIN</span>
                                                    </motion.div>
                                                )}
                                            </div>
                                        ) : (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="w-20 h-20 bg-[#1B9157] flex items-center justify-center"
                                            >
                                                <CheckCircle2 size={40} className="text-[#1A1A1A]" />
                                            </motion.div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-xl font-black text-[#1A1A1A] tracking-tight">
                                            {step === 'processing' ? 'Verifying Fund Access' : 'Paid'}
                                        </h3>
                                        <p className="text-[11px] text-gray-500 max-w-[240px] leading-relaxed mx-auto">
                                            {step === 'processing'
                                                ? 'Performing multi-hop handshake with regional payment clusters...'
                                                : `Your ${item?.name} is now active. Receipt has been logged to the ledger.`}
                                        </p>
                                    </div>

                                    {step === 'success' && (
                                        <div className="pt-8 w-full space-y-3">
                                            <button
                                                onClick={() => {
                                                    const tid = toast.loading('Preparing receipt…');
                                                    try {
                                                        const ref = receiptRef || idempotencyKey;
                                                        const doc = new jsPDF();
                                                        doc.setFontSize(18);
                                                        doc.text('BeeYield Receipt', 14, 18);
                                                        doc.setFontSize(10);
                                                        doc.text(`Date: ${new Date().toLocaleString()}`, 14, 28);
                                                        doc.text(`Reference: ${ref}`, 14, 34);
                                                        doc.text(`Item: ${item?.name || 'BeeYield Hub'}`, 14, 42);
                                                        doc.text(`Amount: ${item?.price} ${item?.currency}`, 14, 48);
                                                        doc.text(`Method: ${currentMethod?.type || 'payment'}`, 14, 54);
                                                        doc.text('Status: PAID', 14, 62);
                                                        doc.save(`beeyield-receipt-${String(ref).slice(0, 12)}.pdf`);
                                                        toast.success('Receipt downloaded', { id: tid });
                                                    } catch (e) {
                                                        console.error(e);
                                                        toast.error('Could not generate receipt', { id: tid });
                                                    }
                                                }}
                                                className="w-full h-14 bg-[#F59E0B] text-[#1A1A1A] font-black hover:bg-[#FBBF24] transition-colors flex items-center justify-center gap-2"
                                            >
                                                Download Receipt
                                                <ChevronRight size={16} />
                                            </button>
                                            <button
                                                onClick={onClose}
                                                className="w-full h-12 text-gray-600 font-black hover:text-[#1A1A1A] transition-colors text-[10px]"
                                            >
                                                Return to Vault
                                            </button>
                                            <p className="text-[9px] text-gray-400 font-black">
                                                Ref: {(receiptRef || idempotencyKey || '—').toString().slice(0, 12).toUpperCase()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>

                        {/* Footer Info */}
                        <div className="p-6 bg-[#050505] border-t border-[#1A1A1A] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <LockIcon size={12} className="text-gray-400" />
                                <span className="text-[9px] font-black text-gray-400">256-BIT RSA</span>
                            </div>
                            <span className="text-[9px] font-black text-gray-400">PCI-DSS v4.0</span>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CheckoutDrawer;
