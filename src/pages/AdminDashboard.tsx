import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/adminService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Loader2, Plus, RefreshCw, Package, Users, ShoppingBag,
    Database, Trash2, Edit, Shield, Crown, UserMinus,
    CheckCircle2, XCircle, Clock, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AdminDashboard: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    // Role check
    const userRole = user?.user_metadata?.role || 'user';
    const isSuperAdminEmail = user?.email?.toLowerCase() === 'timothy.mathuva@strathmore.edu';
    const isAdmin = userRole === 'admin' || userRole === 'super_admin' || isSuperAdminEmail;
    const isSuperAdmin = userRole === 'super_admin' || isSuperAdminEmail;

    // Data States
    const [orders, setOrders] = useState<any[]>([]);
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    const [systemUsers, setSystemUsers] = useState<any[]>([]);

    // Loading States
    const [isLoading, setIsLoading] = useState(true);

    // Modals
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

    // Form States
    const [productForm, setProductForm] = useState({
        name: '', description: '', category: 'honey', price_kes: 0, stock_quantity: 0, images: ''
    });
    const [batchForm, setBatchForm] = useState({
        honey_type: '', harvest_date: '', quantity_kg: 0, processing_method: 'Raw Filtered'
    });

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/account-settings?redirect=/admin');
        } else if (!authLoading && user && isAdmin) {
            loadAllData();
        }
    }, [user, authLoading, navigate, isAdmin]);

    const loadAllData = async () => {
        setIsLoading(true);
        try {
            const promises: Promise<any>[] = [
                adminService.getOrders(),
                adminService.getNewsletterSubscribers(),
                adminService.getProducts(),
                adminService.getBatches()
            ];

            // Only fetch users if super admin
            if (isSuperAdmin) {
                promises.push(adminService.getUsers().catch(() => []));
            }

            const results = await Promise.all(promises);

            setOrders(results[0] || []);
            setSubscribers(results[1] || []);
            setProducts(results[2] || []);
            setBatches((results[3] || []).reverse()); // newest first

            if (isSuperAdmin) {
                setSystemUsers(results[4] || []);
            }
        } catch (error) {
            console.error("Failed to load admin data:", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateProduct = async () => {
        try {
            const payload = {
                ...productForm,
                images: productForm.images ? [productForm.images] : []
            };
            if (editingProduct) {
                await adminService.updateProduct(editingProduct.id, payload);
                toast.success("Product updated");
            } else {
                await adminService.createProduct(payload);
                toast.success("Product created");
            }
            setIsProductModalOpen(false);
            setEditingProduct(null);
            setProductForm({ name: '', description: '', category: 'honey', price_kes: 0, stock_quantity: 0, images: '' });
            loadAllData();
        } catch (error) {
            toast.error("Failed to save product");
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (confirm("Are you sure you want to delete this product?")) {
            try {
                await adminService.deleteProduct(id);
                toast.success("Product deleted");
                loadAllData();
            } catch (error) {
                toast.error("Failed to delete product");
            }
        }
    };

    const handleEditProduct = (product: any) => {
        setEditingProduct(product);
        setProductForm({
            name: product.name,
            description: product.description,
            category: product.category,
            price_kes: product.variants?.[0]?.price_kes || 0,
            stock_quantity: product.variants?.[0]?.stock_quantity || 0,
            images: product.images?.[0] || ''
        });
        setIsProductModalOpen(true);
    };

    const handleCreateBatch = async () => {
        try {
            await adminService.createBatch(batchForm);
            toast.success("Batch created on Blockchain");
            setIsBatchModalOpen(false);
            setBatchForm({ honey_type: '', harvest_date: '', quantity_kg: 0, processing_method: 'Raw Filtered' });
            loadAllData();
        } catch (error) {
            toast.error("Failed to create batch");
        }
    };

    const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            await adminService.updateOrderStatus(orderId, newStatus);
            toast.success(`Order status updated to ${newStatus}`);
            loadAllData();
        } catch (error) {
            toast.error("Failed to update order status");
        }
    };

    const handleUpdateUserRole = async (userId: string, newRole: string) => {
        try {
            await adminService.updateUserRole(userId, newRole);
            toast.success(`User role updated to ${newRole}`);
            loadAllData();
        } catch (error) {
            toast.error("Failed to update user role");
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (confirm("Permanently delete this user? This cannot be undone.")) {
            try {
                await adminService.deleteUser(userId);
                toast.success("User deleted successfully");
                loadAllData();
            } catch (error) {
                toast.error("Failed to delete user");
            }
        }
    };

    if (authLoading || isLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-muted/10 space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-sm font-medium animate-pulse text-muted-foreground">Authenticating Terminal...</p>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-muted/10 space-y-4">
                <Shield className="h-16 w-16 text-destructive animate-pulse" />
                <h2 className="text-2xl font-black">Restricted Access</h2>
                <p className="text-muted-foreground">This terminal is for authorized administrators only.</p>
                <Button onClick={() => navigate('/')} className="rounded-full px-8 shadow-lg">Return Home</Button>
            </div>
        );
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-200"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
            case 'processing': return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200"><RefreshCw className="w-3 h-3 mr-1" /> Processing</Badge>;
            case 'shipped': return <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-200"><Package className="w-3 h-3 mr-1" /> Shipped</Badge>;
            case 'completed': return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</Badge>;
            case 'cancelled': return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200"><XCircle className="w-3 h-3 mr-1" /> Cancelled</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/5 p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
            {/* Header Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-black tracking-tighter text-foreground">
                            Admin<span className="text-primary italic">Dashboard</span>
                        </h1>
                        {isSuperAdmin && (
                            <Badge className="bg-primary/20 text-primary border-primary/30 py-1 px-3 rounded-full flex gap-1 items-center animate-pulse">
                                <Crown className="w-3 h-3" /> SUPER ADMIN
                            </Badge>
                        )}
                    </div>
                    <p className="text-muted-foreground font-medium mt-1">Command center for the BeeYield platform.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={loadAllData} variant="outline" size="sm" className="rounded-full shadow-soft bg-background/50 backdrop-blur border-border/50">
                        <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                    </Button>
                    {isSuperAdmin && (
                        <Button onClick={() => navigate('/')} variant="ghost" size="sm" className="rounded-full">
                            Exit Terminal
                        </Button>
                    )}
                </div>
            </div>

            {/* Main Tabs System */}
            <Tabs defaultValue="orders" className="w-full space-y-8">
                <div className="overflow-x-auto pb-2 scrollbar-hide">
                    <TabsList className="bg-muted/40 p-1.5 rounded-full backdrop-blur border inline-flex h-auto w-auto gap-2">
                        <TabsTrigger value="orders" className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow transition-all font-bold text-xs uppercase tracking-widest flex gap-2">
                            <Package className="h-4 w-4" /> Orders
                        </TabsTrigger>
                        <TabsTrigger value="products" className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow transition-all font-bold text-xs uppercase tracking-widest flex gap-2">
                            <ShoppingBag className="h-4 w-4" /> Products
                        </TabsTrigger>
                        <TabsTrigger value="batches" className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow transition-all font-bold text-xs uppercase tracking-widest flex gap-2">
                            <Database className="h-4 w-4" /> Honey Chain
                        </TabsTrigger>
                        {isSuperAdmin && (
                            <TabsTrigger value="team" className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow transition-all font-bold text-xs uppercase tracking-widest flex gap-2">
                                <Shield className="h-4 w-4" /> Team Management
                            </TabsTrigger>
                        )}
                        <TabsTrigger value="newsletter" className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow transition-all font-bold text-xs uppercase tracking-widest flex gap-2">
                            <Users className="h-4 w-4" /> Newsletter
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* --- ORDERS TAB --- */}
                <TabsContent value="orders" className="space-y-6">
                    <Card className="border-none shadow-2xl glass bg-white/50 dark:bg-black/20 rounded-3xl overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b border-border/10">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <CardTitle className="text-2xl font-black font-heading">Recent Orders</CardTitle>
                                    <CardDescription>View and manage all customer transactions.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/20 border-border/10">
                                            <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Order #</TableHead>
                                            <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Customer</TableHead>
                                            <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest text-right">Items</TableHead>
                                            <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest text-right">Total (KES)</TableHead>
                                            <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Status</TableHead>
                                            <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orders.length === 0 ? (
                                            <TableRow><TableCell colSpan={6} className="text-center h-48 text-muted-foreground font-medium">No order data synchronized.</TableCell></TableRow>
                                        ) : (
                                            orders.map((order) => (
                                                <TableRow key={order.id} className="hover:bg-muted/20 transition-colors border-border/10">
                                                    <TableCell className="px-6 font-mono font-bold text-primary">{order.order_number || `BY-${order.id.toString().slice(0, 8)}`}</TableCell>
                                                    <TableCell className="px-6">
                                                        <div className="font-semibold">{order.shipping_address?.first_name || 'Anonymous'} {order.shipping_address?.last_name || ''}</div>
                                                        <div className="text-xs text-muted-foreground">{order.customer_email || order.shipping_address?.email}</div>
                                                    </TableCell>
                                                    <TableCell className="px-6 text-right font-medium">{order.items?.length || 0}</TableCell>
                                                    <TableCell className="px-6 text-right font-black italic">{order.total_amount?.toLocaleString()}</TableCell>
                                                    <TableCell className="px-6">
                                                        <Select
                                                            defaultValue={order.status}
                                                            onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                                                        >
                                                            <SelectTrigger className="w-[140px] h-9 text-[10px] font-black uppercase tracking-wider rounded-full bg-background/50 border-border/50">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent className="rounded-xl border-border/50">
                                                                <SelectItem value="pending" className="text-xs font-bold">PENDING</SelectItem>
                                                                <SelectItem value="processing" className="text-xs font-bold">PROCESSING</SelectItem>
                                                                <SelectItem value="shipped" className="text-xs font-bold">SHIPPED</SelectItem>
                                                                <SelectItem value="completed" className="text-xs font-bold">COMPLETED</SelectItem>
                                                                <SelectItem value="cancelled" className="text-xs font-bold">CANCELLED</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell className="px-6 text-xs text-muted-foreground font-medium">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- PRODUCTS TAB --- */}
                <TabsContent value="products" className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-black font-heading tracking-tight">Venture Inventory</h2>
                            <p className="text-muted-foreground font-medium">Manage and deploy products to the digital storefront.</p>
                        </div>
                        <Button onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }} className="rounded-full px-6 py-6 shadow-glow hover:scale-105 transition-all bg-primary font-black uppercase tracking-widest text-xs h-auto">
                            <Plus className="mr-2 h-5 w-5" /> Add New Asset
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <div key={product.id} className="group relative bg-card/50 backdrop-blur hover:bg-card border-border/50 border rounded-3xl p-5 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                                <div className="aspect-square rounded-2xl overflow-hidden bg-muted mb-5 relative">
                                    {product.images?.[0] ? (
                                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full grid place-items-center text-muted-foreground/30"><ShoppingBag className="w-12 h-12" /></div>
                                    )}
                                    <div className="absolute top-3 right-3">
                                        <Badge className="bg-background/80 backdrop-blur-md text-foreground border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest">{product.category}</Badge>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className="font-black text-xl leading-none tracking-tight">{product.name}</h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed h-8">{product.description}</p>
                                    <div className="flex justify-between items-end pt-2">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground mb-1">MSRP</p>
                                            <span className="text-2xl font-black font-heading italic text-primary">KES {product.variants?.[0]?.price_kes?.toLocaleString() || 0}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button size="icon" variant="outline" onClick={() => handleEditProduct(product)} className="rounded-full w-9 h-9 border-border/50 hover:bg-primary/10 hover:text-primary"><Edit className="h-4 w-4" /></Button>
                                            <Button size="icon" variant="outline" className="rounded-full w-9 h-9 border-border/50 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteProduct(product.id)}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 pt-2 text-[10px] font-bold text-muted-foreground border-t border-border/50 mt-2">
                                        <Database className="w-3 h-3" />
                                        <span>Stock: {product.variants?.[0]?.stock_quantity || 0} units</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Product Dialog */}
                    <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
                        <DialogContent className="rounded-3xl border-none shadow-2xl glass sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-3xl font-black tracking-tighter">{editingProduct ? 'Update Asset' : 'Create New Asset'}</DialogTitle>
                                <DialogDescription>Populate the matrix with product configurations.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-5 py-4">
                                <div className="space-y-2">
                                    <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Product Designation</Label>
                                    <Input placeholder="e.g. Amber Infusion VII" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} className="rounded-xl h-12 bg-muted/50 border-border/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Asset Description</Label>
                                    <Textarea placeholder="Describe the sensory profile..." value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} className="rounded-xl min-h-[100px] bg-muted/50 border-border/50" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Classification</Label>
                                        <Input value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} className="rounded-xl h-11 bg-muted/50 border-border/50" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="uppercase text-[10px] font-black tracking-widest ml-1">MSRP (KES)</Label>
                                        <Input type="number" value={productForm.price_kes} onChange={e => setProductForm({ ...productForm, price_kes: parseFloat(e.target.value) })} className="rounded-xl h-11 bg-muted/50 border-border/50" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Initial Reserve</Label>
                                        <Input type="number" value={productForm.stock_quantity} onChange={e => setProductForm({ ...productForm, stock_quantity: parseInt(e.target.value) })} className="rounded-xl h-11 bg-muted/50 border-border/50" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Visual Matrix (URL)</Label>
                                        <Input value={productForm.images} onChange={e => setProductForm({ ...productForm, images: e.target.value })} placeholder="https://..." className="rounded-xl h-11 bg-muted/50 border-border/50 font-mono text-xs" />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button variant="ghost" onClick={() => setIsProductModalOpen(false)} className="rounded-full font-bold">Cancel</Button>
                                <Button onClick={handleCreateProduct} className="rounded-full font-black uppercase tracking-widest text-xs px-8 shadow-glow">{editingProduct ? 'Commit Changes' : 'Initialize Asset'}</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </TabsContent>

                {/* --- BATCHES TAB --- */}
                <TabsContent value="batches" className="space-y-6">
                    <Card className="border-none shadow-2xl glass bg-white/50 dark:bg-black/20 rounded-3xl overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b border-border/10 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-black font-heading">Honey Chain Blocks</CardTitle>
                                <CardDescription>Immutable blockchain ledger of authenticated batches.</CardDescription>
                            </div>
                            <Button onClick={() => setIsBatchModalOpen(true)} className="rounded-full font-black uppercase tracking-widest text-xs py-5 bg-honey hover:bg-honey-dark text-black border-none px-6 shadow-glow transition-all active:scale-95">
                                <Plus className="mr-2 h-4 w-4" /> Mint Block
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/20 border-border/10">
                                            <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Protocol ID</TableHead>
                                            <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Matrix Type</TableHead>
                                            <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Harvest Timestamp</TableHead>
                                            <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest text-right">Mass (KG)</TableHead>
                                            <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Blockchain Verification Hash</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {batches.length === 0 ? (
                                            <TableRow><TableCell colSpan={5} className="text-center h-48 text-muted-foreground font-medium italic">No ledger entries detected.</TableCell></TableRow>
                                        ) : (
                                            batches.map((batch, i) => (
                                                <TableRow key={batch.id || i} className="hover:bg-muted/20 transition-colors border-border/10">
                                                    <TableCell className="px-6">
                                                        <div className="font-black text-primary tracking-tighter flex items-center gap-2">
                                                            <CheckCircle2 className="w-4 h-4" />
                                                            {batch.batch_code || `BC-00${i}`}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-6 font-semibold">{batch.honey_type}</TableCell>
                                                    <TableCell className="px-6 text-sm tabular-nums">{batch.harvest_date}</TableCell>
                                                    <TableCell className="px-6 text-right font-black italic">{batch.quantity_kg}</TableCell>
                                                    <TableCell className="px-6">
                                                        <div className="flex items-center gap-2 group cursor-help" title={batch.block_hash}>
                                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                            <code className="text-[10px] bg-muted px-2 py-1 rounded-md opacity-70 group-hover:opacity-100 transition-opacity truncate max-w-[120px] font-mono">
                                                                {batch.block_hash || '0x00...00'}
                                                            </code>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Batch Creation Dialog */}
                    <Dialog open={isBatchModalOpen} onOpenChange={setIsBatchModalOpen}>
                        <DialogContent className="rounded-3xl border-none shadow-2xl glass">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black">Mint New Ledger Entry</DialogTitle>
                                <DialogDescription>This action will finalize the batch data on the irreversible HoneyChain network.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-5 py-4">
                                <div className="space-y-2">
                                    <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Botanical Profile</Label>
                                    <Input value={batchForm.honey_type} onChange={e => setBatchForm({ ...batchForm, honey_type: e.target.value })} placeholder="e.g. Acacia Noir" className="rounded-xl h-11 bg-muted/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Chronological Stamp</Label>
                                    <Input type="date" value={batchForm.harvest_date} onChange={e => setBatchForm({ ...batchForm, harvest_date: e.target.value })} className="rounded-xl h-11 bg-muted/50" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Yield (Total KG)</Label>
                                        <Input type="number" value={batchForm.quantity_kg} onChange={e => setBatchForm({ ...batchForm, quantity_kg: parseFloat(e.target.value) })} className="rounded-xl h-11 bg-muted/50" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Processing Vector</Label>
                                        <Input value={batchForm.processing_method} onChange={e => setBatchForm({ ...batchForm, processing_method: e.target.value })} className="rounded-xl h-11 bg-muted/50" />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreateBatch} className="w-full rounded-2xl py-6 font-black uppercase tracking-widest text-xs bg-honey hover:bg-honey-dark text-black border-none shadow-glow">Initialize Block Minting</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </TabsContent>

                {/* --- TEAM MANAGEMENT (SUPER ADMIN ONLY) --- */}
                {isSuperAdmin && (
                    <TabsContent value="team" className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black font-heading flex gap-2 items-center">
                                    <Shield className="w-6 h-6 text-primary" /> Admin Command Circle
                                </h2>
                                <p className="text-muted-foreground font-medium">Elevate user privileges or terminate access protocols.</p>
                            </div>
                            <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 rounded-full font-black text-[10px] tracking-tighter">
                                {systemUsers.length} MEMBERS
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {systemUsers.map((userObj) => (
                                <Card key={userObj.id} className="border-border/50 bg-card/60 backdrop-blur rounded-3xl overflow-hidden hover:shadow-xl transition-all border group">
                                    <CardHeader className="pb-3 relative">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-xl relative">
                                                {userObj.email?.[0].toUpperCase()}
                                                {userObj.role === 'super_admin' && (
                                                    <div className="absolute -top-1 -right-1 bg-yellow-400 text-black rounded-full p-0.5 shadow-lg border-2 border-background">
                                                        <Crown className="w-3 h-3" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <CardTitle className="text-lg font-black truncate">{userObj.first_name || 'Anonymous'} {userObj.last_name || ''}</CardTitle>
                                                <CardDescription className="font-mono text-[10px] truncate opacity-80">{userObj.email}</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Clearance Level</span>
                                            <Select
                                                defaultValue={userObj.role}
                                                onValueChange={(value) => handleUpdateUserRole(userObj.id, value)}
                                                disabled={userObj.role === 'super_admin' && userObj.email === user?.email} // Can't de-rank self if last super admin (mock safety)
                                            >
                                                <SelectTrigger className="w-32 h-8 rounded-full text-[10px] font-black uppercase tracking-widest border-none bg-muted/60">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl">
                                                    <SelectItem value="user" className="text-xs font-bold">OPERATIVE (USER)</SelectItem>
                                                    <SelectItem value="admin" className="text-xs font-bold">OVERSEER (ADMIN)</SelectItem>
                                                    <SelectItem value="super_admin" className="text-xs font-bold">ENTITY (SUPER ADMIN)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="flex gap-2 pt-2">
                                            <Button
                                                variant="outline"
                                                className="flex-1 rounded-2xl h-10 border-border/50 text-[10px] font-black uppercase tracking-widest hover:bg-destructive/10 hover:text-destructive group-hover:border-destructive/30"
                                                onClick={() => handleDeleteUser(userObj.id)}
                                                disabled={userObj.email === user?.email} // Can't delete self
                                            >
                                                <UserMinus className="h-4 w-4 mr-2" /> De-Authenticate
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {/* Add User Simulation Card */}
                            <Card className="border-dashed border-2 border-border bg-transparent rounded-3xl flex flex-col items-center justify-center p-8 text-muted-foreground hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all group h-full min-h-[160px]">
                                <Users className="h-10 w-10 mb-4 group-hover:scale-110 transition-transform text-muted-foreground/40 group-hover:text-primary/40" />
                                <h3 className="font-black uppercase tracking-widest text-xs">Awaiting New Operator</h3>
                                <p className="text-[10px] font-medium text-center mt-2 opacity-60">Authentication protocols active</p>
                            </Card>
                        </div>
                    </TabsContent>
                )}

                {/* --- NEWSLETTER TAB --- */}
                <TabsContent value="newsletter" className="space-y-6">
                    <Card className="border-none shadow-2xl glass bg-white/50 dark:bg-black/20 rounded-3xl overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b border-border/10">
                            <CardTitle className="text-2xl font-black">Transmission Subscribers</CardTitle>
                            <CardDescription>Network nodes receiving regular updates.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/20 border-border/10">
                                        <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Endpoint Email</TableHead>
                                        <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Identified Name</TableHead>
                                        <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Sync Timestamp</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {subscribers.length === 0 ? (
                                        <TableRow><TableCell colSpan={3} className="text-center h-48 text-muted-foreground font-medium">No subscriber data found.</TableCell></TableRow>
                                    ) : (
                                        subscribers.map((sub) => (
                                            <TableRow key={sub.id} className="hover:bg-muted/20 transition-colors border-border/10">
                                                <TableCell className="px-6 font-semibold">{sub.email}</TableCell>
                                                <TableCell className="px-6 font-medium text-muted-foreground">{sub.first_name || 'Anonymous Identifier'}</TableCell>
                                                <TableCell className="px-6 text-xs font-mono">{new Date(sub.created_at).toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

const TooltipWrapper = ({ children, text }: { children: React.ReactNode, text: string }) => (
    <div title={text} className="cursor-help">{children}</div>
);

export default AdminDashboard;
