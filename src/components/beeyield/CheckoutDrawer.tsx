import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    CreditCard,
    Smartphone,
    Shield,
    Lock,
    ChevronRight,
    MapPin,
    AlertCircle,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
    const [step, setStep] = React.useState<'review' | 'payment' | 'processing' | 'success'>('review');
    const [selectedMethod, setSelectedMethod] = React.useState<string>('method_1');
    const [isProcessing, setIsProcessing] = React.useState(false);

    const paymentMethods: PaymentMethod[] = [
        { id: 'method_1', type: 'mpesa', phone: '254700***123', isDefault: true, provider: 'Safaricom' },
        { id: 'method_2', type: 'card', last4: '4242', isDefault: false, provider: 'Visa' },
    ];

    const currentMethod = paymentMethods.find(m => m.id === selectedMethod) || paymentMethods[0];

    const handlePayment = async () => {
        setIsProcessing(true);
        setStep('processing');

        // Generate idempotency key for Rust backend validation
        const idempotencyKey = crypto.randomUUID();

        try {
            // Simulated Rust-Core Payment Execution
            // In reality: await beeyieldService.checkout({ item_id: item.id, method_id: selectedMethod, key: idempotencyKey })
            await new Promise(resolve => setTimeout(resolve, 2400));

            setStep('success');
            toast.success("Payment Verified", { description: "Receipt sent to terminal." });
            if (onSuccess) onSuccess('TXN_' + Math.random().toString(36).toUpperCase().slice(2, 10));
        } catch (error) {
            setStep('payment');
            toast.error("Transaction Failed", { description: "Insufficient funds or gateway timeout." });
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
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 cursor-crosshair"
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
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Secure Checkout</span>
                            <button
                                onClick={onClose}
                                disabled={isProcessing}
                                className="p-2 text-white/20 hover:text-white transition-colors disabled:opacity-0"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">

                            {step === 'review' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Selected Hive Plan</p>
                                        <div className="bg-[#111] border border-[#1A1A1A] p-4">
                                            <h3 className="text-xl font-black text-white leading-none">{item?.name}</h3>
                                            <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">{item?.description}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-[#111] border border-[#1A1A1A] p-4">
                                            <p className="text-[8px] font-black text-white/20 uppercase tracking-tighter">Amount Due</p>
                                            <p className="text-lg font-black text-[#F59E0B] mt-1">{item?.currency} {item?.price.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-[#111] border border-[#1A1A1A] p-4">
                                            <p className="text-[8px] font-black text-white/20 uppercase tracking-tighter">Tax (16% VAT)</p>
                                            <p className="text-lg font-black text-white mt-1">INCL</p>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            onClick={() => setStep('payment')}
                                            className="w-full h-14 bg-white text-black font-black uppercase tracking-[0.15em] hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
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
                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Select Method</p>

                                        <div className="space-y-2">
                                            {paymentMethods.map((method) => (
                                                <button
                                                    key={method.id}
                                                    onClick={() => setSelectedMethod(method.id)}
                                                    className={cn(
                                                        "w-full flex items-center justify-between p-4 border transition-all text-left",
                                                        selectedMethod === method.id
                                                            ? "bg-[#111] border-[#F59E0B]"
                                                            : "bg-transparent border-[#1A1A1A] hover:border-white/10"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-white/5 flex items-center justify-center">
                                                            {method.type === 'card' ? <CreditCard size={20} className="text-white/40" /> : <Smartphone size={20} className="text-emerald-400" />}
                                                        </div>
                                                        <div>
                                                            <p className="text-[12px] font-bold text-white">
                                                                {method.type === 'card' ? `•••• ${method.last4}` : method.phone}
                                                            </p>
                                                            <p className="text-[9px] text-white/20 uppercase font-black">{method.provider}</p>
                                                        </div>
                                                    </div>
                                                    {method.isDefault && <span className="text-[8px] font-black text-[#F59E0B] border border-[#F59E0B]/20 px-1.5 py-0.5">DEFAULT</span>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 flex gap-3">
                                        <Shield size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-[10px] text-emerald-500/80 leading-relaxed font-bold">
                                            Oxidized Security Enabled. This transaction is protected by memory-safe Rust cryptography and strict idempotency checks.
                                        </p>
                                    </div>

                                    <div className="pt-4 flex flex-col gap-3">
                                        <button
                                            onClick={handlePayment}
                                            className="w-full h-14 bg-[#F59E0B] text-black font-black uppercase tracking-[0.15em] hover:bg-[#FBBF24] transition-colors flex items-center justify-center gap-2 group"
                                        >
                                            Pay {item?.currency} {item?.price.toLocaleString()}
                                            <Lock size={16} className="group-hover:translate-y-[-1px] transition-transform" />
                                        </button>
                                        <button
                                            onClick={() => setStep('review')}
                                            className="w-full h-11 text-white/20 font-black uppercase tracking-[0.1em] hover:text-white transition-colors text-[10px]"
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
                                                        <span className="text-[9px] font-black text-[#F59E0B] uppercase tracking-widest">Awaiting Phone PIN</span>
                                                    </motion.div>
                                                )}
                                            </div>
                                        ) : (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="w-20 h-20 bg-emerald-500 flex items-center justify-center"
                                            >
                                                <CheckCircle2 size={40} className="text-black" />
                                            </motion.div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-xl font-black text-white uppercase tracking-tight">
                                            {step === 'processing' ? 'Verifying Fund Access' : 'Paid'}
                                        </h3>
                                        <p className="text-[11px] text-white/30 max-w-[240px] leading-relaxed mx-auto">
                                            {step === 'processing'
                                                ? 'Performing multi-hop handshake with regional payment clusters...'
                                                : `Your ${item?.name} is now active. Receipt has been logged to the ledger.`}
                                        </p>
                                    </div>

                                    {step === 'success' && (
                                        <div className="pt-8 w-full space-y-3">
                                            <button
                                                onClick={() => toast.info("Generating Paper Trail...", { description: "Rust Invoicing Engine starting up." })}
                                                className="w-full h-14 bg-[#F59E0B] text-black font-black uppercase tracking-[0.15em] hover:bg-[#FBBF24] transition-colors flex items-center justify-center gap-2"
                                            >
                                                Download Receipt
                                                <ChevronRight size={16} />
                                            </button>
                                            <button
                                                onClick={onClose}
                                                className="w-full h-12 text-white/40 font-black uppercase tracking-[0.1em] hover:text-white transition-colors text-[10px]"
                                            >
                                                Return to Vault
                                            </button>
                                            <p className="text-[9px] text-white/10 uppercase tracking-widest font-black">Ref: OX-7729-A12</p>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>

                        {/* Footer Info */}
                        <div className="p-6 bg-[#050505] border-t border-[#1A1A1A] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Lock size={12} className="text-white/20" />
                                <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.1em]">256-BIT RSA</span>
                            </div>
                            <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.1em]">PCI-DSS v4.0</span>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CheckoutDrawer;
