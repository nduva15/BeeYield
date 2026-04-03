import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Printer, ArrowLeft, Download, CheckCircle2, MapPin, Phone, Mail, Globe, ShieldCheck, Package } from 'lucide-react';
import { getOrder, downloadInvoice } from '@/services/shopService';
import { toast } from 'sonner';
import logo from '@/assets/Logo.png';
import { BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';

const Receipt = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) return;
            try {
                const data = await getOrder(orderId);
                if (data) {
                    setOrder(data);
                } else {
                    toast.error("Order not found.");
                }
            } catch (error) {
                console.error("Failed to load order:", error);
                toast.error("Could not load receipt details.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    if (loading) {
        return (
        <BeeYieldPageShell className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] m-0">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <p className="text-slate-500 font-medium">Preparing your receipt...</p>
            </BeeYieldPageShell>
        );
    }

    if (!order) {
        return (
        <BeeYieldPageShell className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#F8FAFC] m-0">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                    <ShieldCheck className="w-10 h-10" />
                </div>
                <div className="text-center">
                    <h1 className="text-3xl font-black text-[#1A1A1A] mb-2">Order Not Found</h1>
                    <p className="text-slate-500 max-w-xs mx-auto">We couldn't locate the order details for the provided ID. Please verify and try again.</p>
                </div>
                <Button onClick={() => navigate('/shop')} className="rounded-full px-8 h-12">Return to Shop</Button>
            </BeeYieldPageShell>
        );
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount);
    };

    const handleDownloadPDF = async () => {
        try {
            await downloadInvoice(order.id, order.order_number || order.id);
        } catch (error) {
            toast.error("Failed to download PDF. Try printing instead.");
        }
    };

    const subtotal = Number(order.total_kes) / 1.16;
    const vat = Number(order.total_kes) - subtotal;

    return (
        <BeeYieldPageShell className="min-h-screen bg-[#F1F5F9] py-12 px-4 print:bg-[#FFF9F0] print:py-0 print:px-0 p-0 m-0">
            {/* Toolbar */}
            <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between print:hidden">
                <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 text-slate-600 hover:text-[#1A1A1A] group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                </Button>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => window.print()} className="gap-2 rounded-full border-slate-200 shadow-sm">
                        <Printer className="w-4 h-4" /> Print
                    </Button>
                    <Button onClick={handleDownloadPDF} className="gap-2 rounded-full shadow-glow">
                        <Download className="w-4 h-4" /> Download PDF
                    </Button>
                </div>
            </div>

            {/* Receipt Card */}
            <Card className="max-w-4xl mx-auto bg-[#FFF9F0] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-none overflow-hidden rounded-[2rem] print:shadow-none print:rounded-none">
                {/* Status Bar */}
                <div className="bg-primary/10 py-3 px-8 flex justify-between items-center print:hidden">
                    <div className="flex items-center gap-2 text-primary font-bold text-sm">
                        <CheckCircle2 className="w-4 h-4" /> {order.status}
                    </div>
                    <div className="text-slate-500 text-xs font-medium">
                        Payment via <span className="text-[#1A1A1A] uppercase">{order.payment_method}</span>
                    </div>
                </div>

                {/* Header */}
                <CardContent className="p-0">
                    <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-8 bg-gradient-to-br from-white to-slate-50/50">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <img src={logo} alt="BeeYield" className="h-16 w-auto" />
                                <div>
                                    <h1 className="text-2xl font-black text-[#1A1A1A] tracking-tight">BeeYield Limited</h1>
                                    <p className="text-sm font-semibold text-primary/80">Sustainable Beekeeping</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                                <div className="space-y-2">
                                    <h3 className="text-xs font-black tracking-tighter text-slate-400">Our Headquarters</h3>
                                    <div className="text-slate-600 space-y-1">
                                        <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-primary" /> Kibwezi West, Makueni, KE</p>
                                        <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-primary" /> +254 742 004 187</p>
                                        <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-primary" /> shop@beeyield.com</p>
                                        <p className="flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-primary" /> www.beeyield.com</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xs font-black tracking-tighter text-slate-400">Bill To</h3>
                                    {order.shipping_address ? (
                                        <div className="text-[#1A1A1A] font-bold space-y-1">
                                            <p className="text-lg">{order.shipping_address.name || order.shipping_address.first_name + ' ' + order.shipping_address.last_name}</p>
                                            <p className="text-slate-600 font-medium">{order.shipping_address.street || order.shipping_address.address}</p>
                                            <p className="text-slate-600 font-medium">{order.shipping_address.city}, {order.shipping_address.county}</p>
                                            <p className="text-slate-600 font-medium flex items-center gap-2"><Phone className="w-3.5 h-3.5 opacity-50" /> {order.shipping_address.phone}</p>
                                        </div>
                                    ) : (
                                        <p className="text-slate-500">Guest Customer</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="md:text-right flex flex-col justify-between items-start md:items-end">
                            <div>
                                <h2 className="text-5xl font-black text-slate-200 mb-4 tracking-tighter print:text-slate-300">Receipt</h2>
                                <div className="space-y-1">
                                    <p className="text-sm text-slate-500">Transaction ID</p>
                                    <p className="text-lg font-black text-[#1A1A1A]">#{order.order_number}</p>
                                </div>
                            </div>
                            <div className="mt-6 md:mt-0">
                                <p className="text-sm text-slate-500">Date Issued</p>
                                <p className="text-lg font-black text-[#1A1A1A]">{new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="p-10">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-slate-100">
                                        <th className="pb-4 pt-0 font-black text-slate-400 text-[10px]">Item Detail</th>
                                        <th className="pb-4 pt-0 font-black text-slate-400 text-[10px] text-center">Qty</th>
                                        <th className="pb-4 pt-0 font-black text-slate-400 text-[10px] text-right">Unit Price</th>
                                        <th className="pb-4 pt-0 font-black text-slate-400 text-[10px] text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items && order.items.map((item: any, idx: number) => (
                                        <tr key={idx} className="group transition-colors border-b border-slate-50 last:border-0">
                                            <td className="py-8 pr-4">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-20 h-20 bg-[#F4D03F]/10 rounded-2xl overflow-hidden flex-shrink-0 relative group-hover:scale-110 transition-transform duration-500">
                                                        {item.product_image ? (
                                                            <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                                                                <Package className="w-8 h-8" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h4 className="font-black text-[#1A1A1A] text-lg leading-tight tracking-tight">{item.product_name}</h4>
                                                        <p className="text-sm font-bold text-primary">{item.variant_size || 'Standard Jar'}</p>
                                                        <p className="text-xs text-slate-400 max-w-xs line-clamp-1">Natural honey product from Makueni.</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-8 px-4 text-center font-black text-[#1A1A1A] text-xl">{item.quantity}</td>
                                            <td className="py-8 px-4 text-right font-bold text-slate-500">{formatCurrency(item.unit_price)}</td>
                                            <td className="py-8 pl-4 text-right font-black text-[#1A1A1A] text-xl">{formatCurrency(item.total_price)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals Section */}
                        <div className="mt-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                            {/* Notes / Footer Text */}
                            <div className="max-w-md bg-[#F9F7F2] rounded-[1.5rem] p-6 border border-slate-100 text-slate-500 text-sm leading-relaxed">
                                This receipt confirms your order for BeeYield products. 50% of our profits directly support smallholder farmers in Makueni. Thank you for being part of our sustainable honey project.
                            </div>

                            {/* Calculation Table */}
                            <div className="w-full md:w-80 space-y-4">
                                <div className="flex justify-between items-center text-slate-500 font-medium">
                                    <span>Subtotal (Net)</span>
                                    <span className="font-bold">{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-500 font-medium">
                                    <div className="flex items-center gap-1.5">
                                        VAT <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">16%</span>
                                    </div>
                                    <span className="font-bold">{formatCurrency(vat)}</span>
                                </div>
                                <div className="pt-6 border-t font-black text-[#1A1A1A]">
                                    <div className="flex justify-between items-center text-2xl tracking-tighter">
                                        <span>Total Paid</span>
                                        <span className="text-primary">{formatCurrency(Number(order.total_kes))}</span>
                                    </div>
                                    <p className="text-right text-[10px] text-slate-400 mt-2">Inclusive of all taxes</p>
                                </div>
                            </div>
                        </div>

                        {/* Traceability Seal */}
                        <div className="mt-16 bg-[#1e293b] rounded-[2rem] p-8 text-[#1A1A1A] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000" />

                            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                                <div className="w-24 h-24 bg-[#F4D03F]/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-[#F4D03F]/40">
                                    <div className="w-16 h-16 bg-[#FFF9F0] rounded-lg flex items-center justify-center">
                                        {/* Mock QR */}
                                        <div className="grid grid-cols-2 gap-1 p-2">
                                            <div className="w-4 h-4 bg-[#FFF9F0]" />
                                            <div className="w-4 h-4 bg-[#FFF9F0]" />
                                            <div className="w-4 h-4 bg-[#FFF9F0]" />
                                            <div className="w-4 h-4 border-2 border-slate-900" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-xl font-black mb-2 flex items-center justify-center md:justify-start gap-2">
                                        Honey History Verification <ShieldCheck className="w-5 h-5 text-primary" />
                                    </h3>
                                    <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                                        This honey is verified through our system. Scan the QR code or use the Transaction ID to trace your jar's journey from our hives in Kibwezi to your doorstep.
                                        <span className="text-primary font-bold block mt-1 hover:underline cursor-pointer">View Verified Journey →</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="text-center mt-12 text-slate-400 text-sm font-medium print:hidden">
                <p>&copy; {new Date().getFullYear()} BeeYield Limited. All Rights Reserved.</p>
                <div className="flex justify-center gap-6 mt-4 opacity-50">
                    <span>Privacy Policy</span>
                    <span>•</span>
                    <span>Terms of Service</span>
                    <span>•</span>
                    <span>Support</span>
                </div>
            </div>
        </BeeYieldPageShell>
    );
};

export default Receipt;
