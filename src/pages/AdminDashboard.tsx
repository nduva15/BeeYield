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
import { Loader2, Plus, RefreshCw, Package, Users, ShoppingBag, Database, Trash2, Edit, Shield } from 'lucide-react';
import { toast } from 'sonner';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AdminDashboard: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    // Role check
    const isAdmin = user?.user_metadata?.role === 'admin';

    // Data States
    const [orders, setOrders] = useState<any[]>([]);
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);

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
            navigate('/auth?redirect=/admin');
        } else if (!authLoading && user && isAdmin) {
            loadAllData();
        }
    }, [user, authLoading, navigate, isAdmin]);

    const loadAllData = async () => {
        setIsLoading(true);
        try {
            const [ordersData, subsData, prodsData, batchesData] = await Promise.all([
                adminService.getOrders(),
                adminService.getNewsletterSubscribers(),
                adminService.getProducts(),
                adminService.getBatches()
            ]);
            setOrders(ordersData || []);
            setSubscribers(subsData || []);
            setProducts(prodsData || []);
            setBatches(batchesData.reverse() || []); // newest first
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

    if (authLoading || isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-muted/10">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-muted/10 space-y-4">
                <Shield className="h-16 w-16 text-destructive animate-pulse" />
                <h2 className="text-2xl font-black">Restricted Access</h2>
                <p className="text-muted-foreground">This terminal is for administrators only.</p>
                <Button onClick={() => navigate('/')}>Return Home</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/5 p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-foreground">Admin<span className="text-primary italic">Dashboard</span></h1>
                    <p className="text-muted-foreground font-medium">Manage your hive empire from one place.</p>
                </div>
                <Button onClick={loadAllData} variant="outline" size="icon" className="rounded-full"><RefreshCw className="h-4 w-4" /></Button>
            </div>

            <Tabs defaultValue="orders" className="w-full space-y-6">
                <TabsList className="bg-muted/40 p-1.5 rounded-full backdrop-blur border inline-flex h-auto w-auto gap-2">
                    <TabsTrigger value="orders" className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all font-bold text-xs uppercase tracking-widest"><Package className="mr-2 h-4 w-4" /> Orders</TabsTrigger>
                    <TabsTrigger value="newsletter" className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all font-bold text-xs uppercase tracking-widest"><Users className="mr-2 h-4 w-4" /> Newsletter</TabsTrigger>
                    <TabsTrigger value="products" className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all font-bold text-xs uppercase tracking-widest"><ShoppingBag className="mr-2 h-4 w-4" /> Products</TabsTrigger>
                    <TabsTrigger value="batches" className="rounded-full px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all font-bold text-xs uppercase tracking-widest"><Database className="mr-2 h-4 w-4" /> Honey Chain</TabsTrigger>
                </TabsList>

                {/* --- ORDERS TAB --- */}
                <TabsContent value="orders">
                    <Card className="border-none shadow-xl glass bg-white/40 dark:bg-black/20">
                        <CardHeader>
                            <CardTitle>Recent Orders</CardTitle>
                            <CardDescription>View and manage customer orders.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order #</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Items</TableHead>
                                        <TableHead>Total (KES)</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.length === 0 ? (
                                        <TableRow><TableCell colSpan={6} className="text-center h-24 text-muted-foreground">No orders found.</TableCell></TableRow>
                                    ) : (
                                        orders.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-mono">{order.order_number}</TableCell>
                                                <TableCell>{order.shipping_address?.first_name} {order.shipping_address?.last_name}</TableCell>
                                                <TableCell>{order.items?.length || 0} items</TableCell>
                                                <TableCell>{order.total_kes?.toLocaleString()}</TableCell>
                                                <TableCell>
                                                    <Select
                                                        defaultValue={order.status}
                                                        onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                                                    >
                                                        <SelectTrigger className="w-[130px] h-8 text-xs font-bold uppercase tracking-widest rounded-full">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="pending">Pending</SelectItem>
                                                            <SelectItem value="processing">Processing</SelectItem>
                                                            <SelectItem value="shipped">Shipped</SelectItem>
                                                            <SelectItem value="completed">Completed</SelectItem>
                                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- NEWSLETTER TAB --- */}
                <TabsContent value="newsletter">
                    <Card className="border-none shadow-xl glass bg-white/40 dark:bg-black/20">
                        <CardHeader>
                            <CardTitle>Subscribers</CardTitle>
                            <CardDescription>People who want to hear from us.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Subscribed At</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {subscribers.length === 0 ? (
                                        <TableRow><TableCell colSpan={3} className="text-center h-24 text-muted-foreground">No subscribers yet.</TableCell></TableRow>
                                    ) : (
                                        subscribers.map((sub) => (
                                            <TableRow key={sub.id}>
                                                <TableCell>{sub.email}</TableCell>
                                                <TableCell>{sub.first_name || 'N/A'}</TableCell>
                                                <TableCell>{new Date(sub.created_at).toLocaleDateString()}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- PRODUCTS TAB --- */}
                <TabsContent value="products">
                    <Card className="border-none shadow-xl glass bg-white/40 dark:bg-black/20">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Products Inventory</CardTitle>
                                <CardDescription>Manage your shop items.</CardDescription>
                            </div>
                            <Button onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }} className="rounded-full shadow-lg hover:shadow-glow"><Plus className="mr-2 h-4 w-4" /> Add Product</Button>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map((product) => (
                                    <div key={product.id} className="group relative bg-card hover:bg-muted/50 border rounded-2xl p-4 transition-all duration-300 hover:shadow-lg">
                                        <div className="aspect-square rounded-xl overflow-hidden bg-muted mb-4">
                                            {product.images?.[0] ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> : <div className="w-full h-full grid place-items-center text-muted-foreground"><ShoppingBag /></div>}
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-lg leading-tight">{product.name}</h3>
                                                <Badge variant="outline">{product.category}</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                                            <div className="flex justify-between items-center pt-2">
                                                <span className="font-mono font-bold">KES {product.variants?.[0]?.price_kes || 0}</span>
                                                <div className="flex gap-2">
                                                    <Button size="icon" variant="ghost" onClick={() => handleEditProduct(product)}><Edit className="h-4 w-4" /></Button>
                                                    <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteProduct(product.id)}><Trash2 className="h-4 w-4" /></Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Add/Edit Product Dialog */}
                    <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label>Name</Label>
                                    <Input value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Description</Label>
                                    <Textarea value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Category</Label>
                                        <Input value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Price (KES)</Label>
                                        <Input type="number" value={productForm.price_kes} onChange={e => setProductForm({ ...productForm, price_kes: parseFloat(e.target.value) })} />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Stock</Label>
                                    <Input type="number" value={productForm.stock_quantity} onChange={e => setProductForm({ ...productForm, stock_quantity: parseInt(e.target.value) })} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Image URL</Label>
                                    <Input value={productForm.images} onChange={e => setProductForm({ ...productForm, images: e.target.value })} placeholder="https://..." />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreateProduct}>{editingProduct ? 'Update' : 'Create'}</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </TabsContent>

                {/* --- BATCHES TAB --- */}
                <TabsContent value="batches">
                    <Card className="border-none shadow-xl glass bg-white/40 dark:bg-black/20">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Honey Chain Blocks</CardTitle>
                                <CardDescription>Blockchain verified honey batches.</CardDescription>
                            </div>
                            <Button onClick={() => setIsBatchModalOpen(true)} className="rounded-full shadow-lg hover:shadow-glow bg-honey hover:bg-honey-dark text-black"><Plus className="mr-2 h-4 w-4" /> Create Batch</Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Batch ID</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Harvest Date</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Blockchain Hash</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {batches.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No batches recorded.</TableCell></TableRow>
                                    ) : (
                                        batches.map((batch, i) => (
                                            <TableRow key={i}>
                                                <TableCell className="font-mono font-bold text-primary">{batch.batch_code || 'N/A'}</TableCell>
                                                <TableCell>{batch.honey_type}</TableCell>
                                                <TableCell>{batch.harvest_date}</TableCell>
                                                <TableCell>{batch.quantity_kg} kg</TableCell>
                                                <TableCell>
                                                    <TooltipWrapper text={batch.block_hash || 'Pending...'}>
                                                        <span className="font-mono text-xs opacity-50 truncate max-w-[150px] block">{batch.block_hash || 'Pending...'}</span>
                                                    </TooltipWrapper>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Dialog open={isBatchModalOpen} onOpenChange={setIsBatchModalOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Batch</DialogTitle>
                                <DialogDescription>This will mint a new block on HoneyChain.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label>Honey Type</Label>
                                    <Input value={batchForm.honey_type} onChange={e => setBatchForm({ ...batchForm, honey_type: e.target.value })} placeholder="e.g. Acacia, Wildflower" />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Harvest Date</Label>
                                    <Input type="date" value={batchForm.harvest_date} onChange={e => setBatchForm({ ...batchForm, harvest_date: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Quantity (KG)</Label>
                                        <Input type="number" value={batchForm.quantity_kg} onChange={e => setBatchForm({ ...batchForm, quantity_kg: parseFloat(e.target.value) })} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Processing</Label>
                                        <Input value={batchForm.processing_method} onChange={e => setBatchForm({ ...batchForm, processing_method: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreateBatch}>Mint Batch</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </TabsContent>
            </Tabs>
        </div>
    );
};

const TooltipWrapper = ({ children, text }: { children: React.ReactNode, text: string }) => (
    <div title={text} className="cursor-help">{children}</div>
);

export default AdminDashboard;
