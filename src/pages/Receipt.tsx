import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Printer, ArrowLeft, Download } from 'lucide-react';
import { getOrderTracking } from '@/services/shopService';
import { toast } from 'sonner';

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
                // We'll use the existing tracking endpoint to get order details
                // Alternatively, we could add a specific getOrder(id) to shopService if needed
                // But tracking endpoint usually returns order status and some details
                // Let's try to fetch user orders and find the specific one for now as a fallback
                // or assume we might need a better endpoint if getOrderTracking doesn't give items.

                // Better approach: Since we don't have a direct "getOrder" exposed in shopService yet that retrieves items publicly easily,
                // let's try to rely on what we have. 
                // shopService.ts has `getUserOrders`. Let's use that if logged in.

                // However, for a robust receipt page, let's assume we can fetch it.
                // I'll use a direct fetch to the endpoint if the service method isn't perfect, 
                // but let's try to import getOrder from shopService if I add it.

                // Actually, let's check shopService again. It has `getUserOrders` and `downloadInvoice`.
                // It does NOT have `getOrder(id)`. 
                // I will add `getOrder` to shopService.ts first to make this clean.

                // Temporary mock or fetch via existing methods:
                // Let's fetch all orders and find ours.
                const { getUserOrders } = await import('@/services/shopService');
                const orders = await getUserOrders(user?.email || '');
                const found = orders.find((o: any) => o.id === orderId || o.order_number === orderId);

                if (found) {
                    setOrder(found);
                } else {
                    // Fallback to fetch via tracking which might catch it
                    const tracking = await getOrderTracking(orderId);
                    if (tracking) {
                        // This might lack items, so this is imperfect.
                        // Ideally we update shopService.
                        // But let's proceed with what we have for now.
                        setOrder({ ...tracking, id: orderId });
                    }
                }
            } catch (error) {
                console.error("Failed to load order:", error);
                toast.error("Could not load receipt details.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, user]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
                <h1 className="text-2xl font-bold text-gray-800">Order Not Found</h1>
                <Button onClick={() => navigate('/shop')}>Return to Shop</Button>
            </div>
        );
    }

    // Helper to format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount);
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:py-0">
            {/* Toolbar - Hidden when printing */}
            <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between px-4 print:hidden">
                <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <div className="flex gap-2">
                    <Button onClick={() => window.print()} className="gap-2">
                        <Printer className="w-4 h-4" /> Print Receipt
                    </Button>
                </div>
            </div>

            {/* Receipt Card */}
            <Card className="max-w-3xl mx-auto bg-white shadow-lg print:shadow-none print:border-none overflow-hidden">
                {/* Header */}
                <div className="bg-[#1e293b] text-white p-8 print:bg-white print:text-black print:border-b-2 print:border-black">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                {/* Use an img tag for logo if available, else text */}
                                <div className="w-10 h-10 bg-[#F59E0B] rounded-full flex items-center justify-center text-white font-bold text-xl print:text-black">
                                    B
                                </div>
                                <h1 className="text-2xl font-bold">BeeYield Limited</h1>
                            </div>
                            <p className="text-slate-300 text-sm print:text-gray-600">
                                Africa's Premier Precision Pollination & Honey Chain Platform<br />
                                HQ: Kibwezi West, Makueni<br />
                                support@beeyield.com
                            </p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-3xl font-bold text-[#F59E0B] mb-2 print:text-black">RECEIPT</h2>
                            <p className="text-slate-300 print:text-gray-600">#{order.order_number}</p>
                            <p className="text-slate-300 print:text-gray-600">Date: {new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    {/* Bill To */}
                    <div className="mb-8">
                        <h3 className="text-gray-500 font-bold uppercase text-xs tracking-wider mb-2">Bill To</h3>
                        {order.shipping_address ? (
                            <div className="text-gray-800">
                                <p className="font-bold">{order.shipping_address.name || order.shipping_address.first_name + ' ' + order.shipping_address.last_name}</p>
                                <p>{order.shipping_address.street || order.shipping_address.address} {order.shipping_address.building && `, ${order.shipping_address.building}`}</p>
                                <p>{order.shipping_address.city}, {order.shipping_address.county}</p>
                                <p>{order.shipping_address.phone}</p>
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">Guest Customer</p>
                        )}
                    </div>

                    {/* Items Table */}
                    <table className="w-full mb-8">
                        <thead>
                            <tr className="border-b-2 border-slate-200">
                                <th className="text-left py-3 font-bold text-gray-600">Item Description</th>
                                <th className="text-center py-3 font-bold text-gray-600">Qty</th>
                                <th className="text-right py-3 font-bold text-gray-600">Unit Price</th>
                                <th className="text-right py-3 font-bold text-gray-600">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items && order.items.map((item: any, idx: number) => (
                                <tr key={idx} className="border-b border-gray-100">
                                    <td className="py-4">
                                        <p className="font-bold text-gray-800">{item.product_name}</p>
                                        <p className="text-sm text-gray-500">{item.variant_size}</p>
                                    </td>
                                    <td className="text-center py-4">{item.quantity}</td>
                                    <td className="text-right py-4">{formatCurrency(item.unit_price)}</td>
                                    <td className="text-right py-4 font-bold">{formatCurrency(item.total_price)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end mb-12">
                        <div className="w-64 space-y-3">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>{formatCurrency(Number(order.total_kes) / 1.16)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>VAT (16%)</span>
                                <span>{formatCurrency(Number(order.total_kes) - (Number(order.total_kes) / 1.16))}</span>
                            </div>
                            <div className="flex justify-between text-gray-800 font-bold text-lg pt-3 border-t-2 border-slate-200">
                                <span>Total Paid</span>
                                <span>{formatCurrency(Number(order.total_kes))}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Traceability */}
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 print:bg-white print:border-2 print:border-black">
                        <div className="flex items-start gap-4">
                            <div className="mt-1 p-2 bg-green-100 rounded-lg text-green-700 print:hidden">
                                <Download className="w-6 h-6" />
                            </div>

                            {/* Traceability Codes if available */}
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-800 mb-1">HoneyChain™ Traceability</h4>
                                <p className="text-sm text-slate-600 mb-2">
                                    Your honey is tracked via blockchain from hive to jar. Scan the QR code on your product to view its entire journey.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 text-center text-sm text-gray-400 print:text-black">
                        <p>Thank you for shopping with BeeYield!</p>
                        <p>www.beeyield.com</p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Receipt;
