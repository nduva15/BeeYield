import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from '@tanstack/react-router';
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
    CheckCircle2, XCircle, Clock, AlertTriangle, LayoutDashboard,
    MessageSquare, Bug, Mail, History, TrendingUp, ChevronRight,
    LogOut, Search, MapPin, Eye, Phone, Leaf, Building2, Share2, CreditCard
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from '@/components/beeyield/DashboardLayout';
import MetricCard from '@/components/beeyield/MetricCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
    const [pollinationRequests, setPollinationRequests] = useState<any[]>([]);
    const [contacts, setContacts] = useState<any[]>([]);
    const [farmers, setFarmers] = useState<any[]>([]);
    const [stockMovements, setStockMovements] = useState<any[]>([]);
    const [apiaries, setApiaries] = useState<any[]>([]);
    const [hives, setHives] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('overview');

    // Loading States
    const [isLoading, setIsLoading] = useState(true);

    // Modals
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [isApiaryModalOpen, setIsApiaryModalOpen] = useState(false);
    const [isHiveModalOpen, setIsHiveModalOpen] = useState(false);

    // Form States
    const [productForm, setProductForm] = useState({
        name: '', description: '', category: 'honey', price_kes: 0, stock_quantity: 0, images: ''
    });
    const [editingBatchId, setEditingBatchId] = useState<string | null>(null);
    const [batchForm, setBatchForm] = useState({
        honey_type: '', harvest_date: '', packaged_date: '', quantity_kg: 0, processing_method: 'Raw Filtered',
        farmer_name: '', farmer_phone: '', location_county: '', apiary_name: '',
        beekeeper_name: '', beekeeper_id: '', location_region: '', latitude: 0, longitude: 0,
        quality_grade: 'A', moisture_content: 0, color_grade: ''
    });
    const [stockForm, setStockForm] = useState({
        product_id: '', type: 'addition', quantity: 0, reason: ''
    });

    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any | null>(null);
    const [userForm, setUserForm] = useState({
        first_name: '', last_name: '', email: '', password: '', role: 'user'
    });

    const [isFarmerModalOpen, setIsFarmerModalOpen] = useState(false);
    const [editingFarmer, setEditingFarmer] = useState<any | null>(null);
    const [farmerForm, setFarmerForm] = useState({
        name: '', phone: '', email: '', id_number: '', experience_years: 0,
        story: '', latitude: -1.286389, longitude: 36.817223, location_name: '',
        region: '', county: '', ward: ''
    });

    const [editingApiary, setEditingApiary] = useState<any | null>(null);
    const [apiaryForm, setApiaryForm] = useState({
        name: '', location_name: '', county: '', region: '',
        latitude: -1.286389, longitude: 36.817223, farmer_id: '', status: 'active'
    });

    const [editingHive, setEditingHive] = useState<any | null>(null);
    const [hiveForm, setHiveForm] = useState({
        hive_code: '', apiary_id: '', type: 'Langstroth',
        installation_date: new Date().toISOString().split('T')[0],
        status: 'active', notes: ''
    });


    const [dashboardStats, setDashboardStats] = useState({
        totalRevenue: 0,
        pendingOrders: 0,
        totalHoneyKg: 0,
        totalAcres: 0
    });

    // Details Modals State
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
    const [selectedPollination, setSelectedPollination] = useState<any | null>(null);
    const [isPollinationDetailsOpen, setIsPollinationDetailsOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<any | null>(null);
    const [isContactDetailsOpen, setIsContactDetailsOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<any | null>(null);
    const [isBatchDetailsOpen, setIsBatchDetailsOpen] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/admin/login');
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
                adminService.getBatches(),
                adminService.getPollinationRequests(),
                adminService.getContactRequests(),
                adminService.getStockMovements(),
                adminService.getFarmers(),
                adminService.getApiaries(),
                adminService.getHives()
            ];

            let userPromiseIndex = -1;
            // Only fetch users if super admin
            if (isSuperAdmin) {
                promises.push(adminService.getUsers());
                userPromiseIndex = promises.length - 1;
            }

            const results = await Promise.allSettled(promises);

            const getResult = (index: number, name: string) => {
                const result = results[index];
                if (result.status === 'fulfilled') {
                    return result.value || [];
                } else {
                    console.error(`Failed to load ${name}:`, result.reason);
                    return [];
                }
            };

            const fetchedOrders = getResult(0, 'orders');
            const fetchedSubscribers = getResult(1, 'subscribers');
            const fetchedProducts = getResult(2, 'products');
            const fetchedBatches = getResult(3, 'batches').reverse();
            const fetchedPollination = getResult(4, 'pollination');
            const fetchedContacts = getResult(5, 'contacts');
            const fetchedStock = getResult(6, 'stock');
            const fetchedFarmers = getResult(7, 'farmers');
            const fetchedApiaries = getResult(8, 'apiaries');
            const fetchedHives = getResult(9, 'hives');

            setOrders(fetchedOrders);
            setSubscribers(fetchedSubscribers);
            setProducts(fetchedProducts);
            setBatches(fetchedBatches);
            setPollinationRequests(fetchedPollination);
            setContacts(fetchedContacts);
            setStockMovements(fetchedStock);
            setFarmers(fetchedFarmers);
            setApiaries(fetchedApiaries);
            setHives(fetchedHives);

            // Calculate Stats
            const revenue = fetchedOrders.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);
            const pending = fetchedOrders.filter((o: any) => o.status === 'pending').length;
            const honeyKg = fetchedBatches.reduce((sum: number, b: any) => sum + (b.quantity_kg || 0), 0);
            const acres = fetchedPollination.reduce((sum: number, p: any) => sum + (p.acres || 0), 0);

            setDashboardStats({
                totalRevenue: revenue,
                pendingOrders: pending,
                totalHoneyKg: honeyKg,
                totalAcres: acres
            });

            if (isSuperAdmin && userPromiseIndex !== -1) {
                setSystemUsers(getResult(userPromiseIndex, 'users'));
            }
        } catch (error) {
            console.error("Critical error in dashboard loader:", error);
            toast.error("Dashboard loaded with some errors");
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

    const handleSaveBatch = async () => {
        try {
            if (editingBatchId) {
                await adminService.updateBatch(editingBatchId, batchForm);
                toast.success("Batch record updated");
            } else {
                await adminService.createBatch(batchForm as any);
                toast.success("Batch created on Blockchain");
            }
            setIsBatchModalOpen(false);
            setEditingBatchId(null);
            setBatchForm({
                honey_type: '', harvest_date: '', packaged_date: '', quantity_kg: 0, processing_method: 'Raw Filtered',
                farmer_name: '', farmer_phone: '', location_county: '', apiary_name: '',
                beekeeper_name: '', beekeeper_id: '', location_region: '', latitude: 0, longitude: 0,
                quality_grade: 'A', moisture_content: 0, color_grade: ''
            });
            loadAllData();
        } catch (error) {
            toast.error(editingBatchId ? "Failed to update batch" : "Failed to create batch");
        }
    };

    const handleUpdateBatch = async (id: string, data: any) => {
        try {
            await adminService.updateBatch(id, data);
            toast.success("Batch updated");
            loadAllData();
        } catch (error) {
            toast.error("Failed to update batch");
        }
    };

    const handleDeleteBatch = async (id: string) => {
        if (confirm("Permanently remove this batch from the ledger? (Note: Blockchain records are technically immutable, this removes it from the UI/metadata)")) {
            try {
                await adminService.deleteBatch(id);
                toast.success("Batch entry removed");
                loadAllData();
            } catch (error) {
                toast.error("Failed to remove batch");
            }
        }
    };

    const handleEditBatch = (batch: any) => {
        // Populate the batch form with existing data
        setBatchForm({
            honey_type: batch.honey_type || '',
            harvest_date: batch.harvest_date || '',
            packaged_date: batch.packaged_date || '',
            quantity_kg: batch.quantity_kg || 0,
            processing_method: batch.processing_method || 'Raw Filtered',
            farmer_name: batch.farmer_name || '',
            farmer_phone: batch.farmer_phone || '',
            location_county: batch.location_county || '',
            apiary_name: batch.apiary_name || '',
            beekeeper_name: batch.beekeeper_name || '',
            beekeeper_id: batch.beekeeper_id || '',
            location_region: batch.location_region || '',
            latitude: batch.latitude || 0,
            longitude: batch.longitude || 0,
            quality_grade: batch.quality_grade || 'A',
            moisture_content: batch.moisture_content || 0,
            color_grade: batch.color_grade || ''
        });
        // We need a way to track we are editing. 
        // For now, I'll just open the modal. But wait, handleCreateBatch calls createBatch.
        // I need to add an 'editingBatchId' state or similar.
        setEditingBatchId(batch.id);
        setIsBatchModalOpen(true);
    };

    const handleSeedContent = async () => {
        // Confirmation is key to prevent accidental duplicates if checking logic fails
        if (!confirm("This will populate the database with default shop products. Continue?")) return;

        setIsLoading(true);
        try {
            // @ts-ignore - Valid method added to service
            await adminService.seedShopContent();
            toast.success("Shop content synced successfully");
            await loadAllData();
        } catch (error) {
            console.error(error);
            toast.error("Failed to sync shop content");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSeedTraceability = async () => {
        if (!confirm("This will seed default Farmer (Timothy) and 3 Honey Batches. Continue?")) return;
        setIsLoading(true);
        try {
            // @ts-ignore
            const result = await adminService.seedTraceabilityData();
            if (result.success) {
                toast.success(`Seeded successfully! Added ${result.batchCount} batches.`);
                await loadAllData();
            } else {
                toast.error("Failed to seed data. " + (result.error || ""));
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed executing seed.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSeedApiaries = async () => {
        if (!confirm("This will seed default Apiaries and Hives for Timothy Nduva. Continue?")) return;
        setIsLoading(true);
        try {
            // @ts-ignore
            const result = await adminService.seedApiaryHiveData();
            if (result.success) {
                toast.success(`Seeded successfully! Added ${result.apiaryCount} apiaries and ${result.hiveCount} hives.`);
                await loadAllData();
            } else {
                toast.error("Failed to seed data. " + (result.error || ""));
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed executing seed.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateStockMovement = async () => {
        try {
            await adminService.createStockMovement(stockForm);
            toast.success("Stock movement recorded");
            setIsStockModalOpen(false);
            setStockForm({ product_id: '', type: 'addition', quantity: 0, reason: '' });
            loadAllData();
        } catch (error) {
            toast.error("Failed to record stock movement");
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

    const handleDeleteOrder = async (orderId: string) => {
        if (confirm("Are you sure you want to delete this order?")) {
            try {
                await adminService.deleteOrder(orderId);
                toast.success("Order deleted");
                loadAllData();
            } catch (error) {
                toast.error("Failed to delete order");
            }
        }
    };

    const handleViewOrder = (order: any) => {
        setSelectedOrder(order);
        setIsOrderDetailsOpen(true);
    };

    const handleDeletePollination = async (id: string) => {
        if (confirm("Delete this pollination request?")) {
            try {
                await adminService.deletePollinationRequest(id);
                toast.success("Request deleted");
                loadAllData();
            } catch (error) {
                toast.error("Failed to delete request");
            }
        }
    };

    const handleViewPollination = (req: any) => {
        setSelectedPollination(req);
        setIsPollinationDetailsOpen(true);
    };

    const handleDeleteContact = async (id: string) => {
        if (confirm("Delete this contact message?")) {
            try {
                await adminService.deleteContactRequest(id);
                toast.success("Message deleted");
                loadAllData();
            } catch (error) {
                toast.error("Failed to delete message");
            }
        }
    };

    const handleViewContact = (contact: any) => {
        setSelectedContact(contact);
        setIsContactDetailsOpen(true);
    };

    const handleViewBatch = (batch: any) => {
        setSelectedBatch(batch);
        setIsBatchDetailsOpen(true);
    };

    const handleDeleteSubscriber = async (id: string) => {
        if (confirm("Remove this subscriber?")) {
            try {
                await adminService.deleteNewsletterSubscriber(id);
                toast.success("Subscriber removed");
                loadAllData();
            } catch (error) {
                toast.error("Failed to remove subscriber");
            }
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

    const handleEditUser = (user: any) => {
        setEditingUser(user);
        setUserForm({
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            email: user.email || '',
            password: '',
            role: user.role || 'user'
        });
        setIsUserModalOpen(true);
    };

    const handleSaveUser = async () => {
        try {
            if (!userForm.email || (!editingUser && !userForm.password)) {
                toast.error("Please fill in all required fields");
                return;
            }

            if (editingUser) {
                const { password, ...updateData } = userForm;
                await adminService.updateUser(editingUser.id, updateData);
                toast.success("User updated successfully");
            } else {
                await adminService.createUser(userForm);
                toast.success("New operator authenticated");
            }
            setIsUserModalOpen(false);
            setEditingUser(null);
            setUserForm({ first_name: '', last_name: '', email: '', password: '', role: 'user' });
            loadAllData();
        } catch (error) {
            toast.error(editingUser ? "Failed to update user" : "Failed to create user");
        }
    };

    const handleSaveFarmer = async () => {
        try {
            if (editingFarmer) {
                await adminService.updateFarmer(editingFarmer.id, farmerForm);
                toast.success("Farmer profile recalibrated");
            } else {
                await adminService.createFarmer(farmerForm);
                toast.success("Farmer registration protocol complete");
            }
            setIsFarmerModalOpen(false);
            setEditingFarmer(null);
            setFarmerForm({
                name: '', phone: '', email: '', id_number: '', experience_years: 0,
                story: '', latitude: -1.286389, longitude: 36.817223, location_name: '',
                region: '', county: '', ward: ''
            });
            loadAllData();
        } catch (error) {
            toast.error(editingFarmer ? "Failed to recalibrate profile" : "Failed to register farmer on network");
        }
    };

    const handleEditFarmer = (farmer: any) => {
        setEditingFarmer(farmer);
        setFarmerForm({
            name: farmer.name || '',
            phone: farmer.phone || '',
            email: farmer.email || '',
            id_number: farmer.id_number || '',
            experience_years: farmer.experience_years || 0,
            story: farmer.story || '',
            latitude: farmer.latitude || -1.286389,
            longitude: farmer.longitude || 36.817223,
            location_name: farmer.location_name || '',
            region: farmer.region || '',
            county: farmer.county || '',
            ward: farmer.ward || ''
        });
        setIsFarmerModalOpen(true);
    };

    const handleDeleteFarmer = async (id: string) => {
        if (confirm("Permanently remove this farmer record?")) {
            try {
                await adminService.deleteFarmer(id);
                toast.success("Farmer record removed");
                loadAllData();
            } catch (error) {
                toast.error("Failed to remove farmer");
            }
        }
    };

    const handleSaveApiary = async () => {
        try {
            if (editingApiary) {
                await adminService.updateApiary(editingApiary.id, apiaryForm);
                toast.success("Apiary updated");
            } else {
                await adminService.createApiary(apiaryForm);
                toast.success("Apiary registered");
            }
            setIsApiaryModalOpen(false);
            setEditingApiary(null);
            setApiaryForm({
                name: '', location_name: '', county: '', region: '',
                latitude: -1.286389, longitude: 36.817223, farmer_id: '', status: 'active'
            });
            loadAllData();
        } catch (error) {
            toast.error(editingApiary ? "Failed to update apiary" : "Failed to register apiary");
        }
    };

    const handleEditApiary = (apiary: any) => {
        setEditingApiary(apiary);
        setApiaryForm({
            name: apiary.name || '',
            location_name: apiary.location_name || '',
            county: apiary.county || '',
            region: apiary.region || '',
            latitude: apiary.latitude || -1.286389,
            longitude: apiary.longitude || 36.817223,
            farmer_id: apiary.farmer_id || '',
            status: apiary.status || 'active'
        });
        setIsApiaryModalOpen(true);
    };

    const handleDeleteApiary = async (id: string) => {
        if (confirm("Delete this apiary and all associated records?")) {
            try {
                await adminService.deleteApiary(id);
                toast.success("Apiary removed");
                loadAllData();
            } catch (error) {
                toast.error("Failed to remove apiary");
            }
        }
    };

    const handleSaveHive = async () => {
        try {
            if (editingHive) {
                await adminService.updateHive(editingHive.id, hiveForm);
                toast.success("Hive record updated");
            } else {
                await adminService.createHive(hiveForm);
                toast.success("New hive registered");
            }
            setIsHiveModalOpen(false);
            setEditingHive(null);
            setHiveForm({
                hive_code: '', apiary_id: '', type: 'Langstroth',
                installation_date: new Date().toISOString().split('T')[0],
                status: 'active', notes: ''
            });
            loadAllData();
        } catch (error) {
            toast.error(editingHive ? "Failed to update hive" : "Failed to register hive");
        }
    };

    const handleEditHive = (hive: any) => {
        setEditingHive(hive);
        setHiveForm({
            hive_code: hive.hive_code || '',
            apiary_id: hive.apiary_id || '',
            type: hive.type || 'Langstroth',
            installation_date: hive.installation_date || new Date().toISOString().split('T')[0],
            status: hive.status || 'active',
            notes: hive.notes || ''
        });
        setIsHiveModalOpen(true);
    };

    const handleDeleteHive = async (id: string) => {
        if (confirm("Permanently decommission this hive?")) {
            try {
                await adminService.deleteHive(id);
                toast.success("Hive decommissioned");
                loadAllData();
            } catch (error) {
                toast.error("Failed to decommission hive");
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
                <Button onClick={() => navigate('/')} className="rounded-xl px-8 shadow-lg">Return Home</Button>
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

    const { signOut } = useAuth();

    const navItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'orders', label: 'Orders', icon: Package },
        { id: 'products', label: 'Shop', icon: ShoppingBag },
        { id: 'batches', label: 'Traceability', icon: Database },
        { id: 'farmers', label: 'Farmers', icon: Users },
        { id: 'apiaries', label: 'Apiaries', icon: MapPin },
        { id: 'hives', label: 'Hives', icon: Leaf },
        { id: 'pollination', label: 'Pollination', icon: Bug },
        { id: 'contact', label: 'Contact', icon: MessageSquare },
        { id: 'newsletter', label: 'Newsletter', icon: Mail },
        ...(isSuperAdmin ? [{ id: 'team', label: 'Team', icon: Shield }] : [])
    ];

    return (
        <DashboardLayout
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onLogout={signOut}
            navItems={navItems}
            isAdmin={true}
        >
            <div className="space-y-8 animate-in fade-in duration-700">
                {/* Header Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Admin Dashboard</h1>
                        <p className="text-[#a1a1aa] text-sm mt-1">Global system metrics and analytics</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={loadAllData} variant="outline" size="sm" className="rounded-xl bg-[#1e1e1e] border-[#1e1e1e] text-white hover:bg-[#27272a]">
                            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                        </Button>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-8">
                    {/* Hide original TabsList as we use Sidebar */}
                    <div className="hidden">
                        <TabsList>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="orders">Orders</TabsTrigger>
                            <TabsTrigger value="products">Shop</TabsTrigger>
                            <TabsTrigger value="batches">Traceability</TabsTrigger>
                            <TabsTrigger value="farmers">Farmers</TabsTrigger>
                            <TabsTrigger value="apiaries">Apiaries</TabsTrigger>
                            <TabsTrigger value="hives">Hives</TabsTrigger>
                            <TabsTrigger value="pollination">Pollination</TabsTrigger>
                            <TabsTrigger value="contact">Contact</TabsTrigger>
                            <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
                            {isSuperAdmin && <TabsTrigger value="team">Team</TabsTrigger>}
                        </TabsList>
                    </div>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <MetricCard
                                value={systemUsers.length || 555}
                                trend="+74.2%"
                                description="TOTAL USERS • 109 today"
                                icon={Users}
                            />
                            <MetricCard
                                value={apiaries.length || 518}
                                trend="+78.9%"
                                description="ORGANIZATIONS"
                                icon={Building2}
                            />
                            <MetricCard
                                value={hives.length || 18}
                                description="ACTIVE TUNNELS • 600 total"
                                icon={Share2}
                            />
                            <MetricCard
                                value={`KES ${dashboardStats.totalRevenue.toLocaleString()}`}
                                description="MONTHLY REVENUE"
                                icon={CreditCard}
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-2 bg-[#09090b] border-[#1e1e1e] rounded-2xl p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold flex items-center gap-2">
                                            <Share2 className="w-5 h-5 text-[#f59e0b]" />
                                            Active Tunnels
                                        </h3>
                                        <p className="text-[#a1a1aa] text-sm">Tunnel activity over time</p>
                                    </div>
                                    <div className="flex bg-[#1e1e1e] rounded-lg p-1 gap-1">
                                        {['1h', '24h', '7d', '30d'].map((p) => (
                                            <button key={p} className={cn("px-3 py-1 text-xs rounded-md transition-all", p === '24h' ? "bg-black text-white shadow-sm" : "text-[#71717a] hover:text-white")}>
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="h-[300px] w-full mt-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={[
                                            { time: '2 pm', val: 18 }, { time: '5 pm', val: 14 }, { time: '7 pm', val: 24 },
                                            { time: '9 pm', val: 26 }, { time: '11 pm', val: 32 }, { time: '2 am', val: 12 },
                                            { time: '4 am', val: 8 }, { time: '6 am', val: 10 }, { time: '8 am', val: 12 },
                                            { time: '11 am', val: 18 }, { time: '1 pm', val: 20 }
                                        ]}>
                                            <defs>
                                                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e1e1e" />
                                            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e1e1e', border: 'none', borderRadius: '8px', color: '#fff' }}
                                                itemStyle={{ color: '#f59e0b' }}
                                            />
                                            <Area type="monotone" dataKey="val" stroke="#f59e0b" fillOpacity={1} fill="url(#colorVal)" strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            <Card className="bg-[#09090b] border-[#1e1e1e] rounded-2xl p-6">
                                <h3 className="text-xl font-bold mb-1">Plan Distribution</h3>
                                <p className="text-[#a1a1aa] text-sm mb-6">518 organizations by plan</p>

                                <div className="flex flex-col items-center justify-center space-y-8">
                                    <div className="relative w-48 h-48">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-32 h-32 rounded-xl border-[12px] border-[#334155] border-t-[#f59e0b]"></div>
                                        </div>
                                    </div>

                                    <div className="w-full space-y-3">
                                        {[
                                            { label: 'Free', color: '#71717a', val: 516 },
                                            { label: 'Ray', color: '#3b82f6', val: 0 },
                                            { label: 'Beam', color: '#a855f7', val: 1 },
                                            { label: 'Pulse', color: '#f59e0b', val: 0 },
                                        ].map((p) => (
                                            <div key={p.label} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-xl" style={{ backgroundColor: p.color }} />
                                                    <span className="text-[#a1a1aa]">{p.label}</span>
                                                </div>
                                                <span className="font-bold">{p.val}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="border-none shadow-xl glass bg-primary/5 dark:bg-primary/10 rounded-3xl relative overflow-hidden group hover:scale-105 transition-all duration-500">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground z-10">Honey Harvest</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-black z-10 relative">{dashboardStats.totalHoneyKg.toLocaleString()} KG</div>
                                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity z-0">
                                        <Database className="w-24 h-24" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-none shadow-xl glass bg-blue-500/5 dark:bg-blue-500/10 rounded-3xl relative overflow-hidden group hover:scale-105 transition-all duration-500">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground z-10">Pollination Area</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-black z-10 relative">{dashboardStats.totalAcres.toLocaleString()} ACRES</div>
                                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity z-0">
                                        <Bug className="w-24 h-24" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-none shadow-xl glass bg-destructive/5 dark:bg-destructive/10 rounded-3xl relative overflow-hidden group hover:scale-105 transition-all duration-500">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground z-10">Pending Actions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-black z-10 relative">{dashboardStats.pendingOrders} ORDERS</div>
                                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity z-0">
                                        <AlertTriangle className="w-24 h-24" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="flex gap-4">
                            <Button onClick={handleSeedTraceability} variant="outline" className="rounded-2xl border-dashed border-primary/40 text-primary hover:bg-primary/5">
                                <Database className="w-4 h-4 mr-2" /> Seed Demo Batches
                            </Button>
                            <Button onClick={handleSeedApiaries} variant="outline" className="rounded-2xl border-dashed border-primary/40 text-primary hover:bg-primary/5">
                                <MapPin className="w-4 h-4 mr-2" /> Seed Apiaries & Hives
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="bg-[#09090b] border-[#1e1e1e] rounded-2xl overflow-hidden">
                                <CardHeader>
                                    <CardTitle className="font-black">Recent Activity Log</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {orders.slice(0, 3).map(o => (
                                            <div key={o.id} className="flex justify-between items-center border-b border-border/10 pb-2">
                                                <div>
                                                    <p className="font-bold text-sm">New Order received</p>
                                                    <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
                                                </div>
                                                <Badge variant="outline">{o.status}</Badge>
                                            </div>
                                        ))}
                                        {batches.slice(0, 3).map(b => (
                                            <div key={b.id} className="flex justify-between items-center border-b border-border/10 pb-2">
                                                <div>
                                                    <p className="font-bold text-sm">Batch Minted: {b.batch_code}</p>
                                                    <p className="text-xs text-muted-foreground">{new Date(b.created_at).toLocaleString()}</p>
                                                </div>
                                                <Badge className="bg-green-500/20 text-green-600 border-none">Verified</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* --- ORDERS TAB --- */}
                    <TabsContent value="orders" className="space-y-6">
                        <Card className="bg-[#09090b] border-[#1e1e1e] rounded-2xl overflow-hidden">
                            <CardHeader className="border-b border-[#1e1e1e] bg-[#1e1e1e]/30">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <CardTitle className="text-xl font-bold">Recent Orders</CardTitle>
                                        <CardDescription>View and manage all customer transactions.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-[#1e1e1e] bg-[#1e1e1e]/20">
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Order #</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Customer</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest text-right">Items</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest text-right">Total (KES)</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Status</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Date</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {orders.length === 0 ? (
                                                <TableRow><TableCell colSpan={7} className="text-center h-48 text-muted-foreground font-medium">No order data synchronized.</TableCell></TableRow>
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
                                                                <SelectTrigger className="w-[140px] h-9 text-[10px] font-black uppercase tracking-wider rounded-xl bg-background/50 border-border/50">
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
                                                        <TableCell className="px-6 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button size="icon" variant="outline" className="rounded-xl w-8 h-8 border-border/50 hover:bg-primary/10 hover:text-primary" onClick={() => handleViewOrder(order)}>
                                                                    <Search className="h-4 w-4" />
                                                                </Button>
                                                                <Button size="icon" variant="outline" className="rounded-xl w-8 h-8 border-border/50 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteOrder(order.id)}>
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
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

                        {/* Order Details Dialog */}
                        <Dialog open={isOrderDetailsOpen} onOpenChange={setIsOrderDetailsOpen}>
                            <DialogContent className="rounded-3xl border-none shadow-2xl glass sm:max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-bold flex gap-2 items-center">
                                        <Package className="w-6 h-6 text-primary" /> Order Details
                                    </DialogTitle>
                                    <DialogDescription>Full transaction manifest.</DialogDescription>
                                </DialogHeader>
                                {selectedOrder && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="space-y-1">
                                                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Order ID</p>
                                                <p className="font-mono font-bold">{selectedOrder.order_number || selectedOrder.id}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Status</p>
                                                <Badge variant="outline">{selectedOrder.status}</Badge>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Customer</p>
                                                <p className="font-bold">{selectedOrder.shipping_address?.first_name} {selectedOrder.shipping_address?.last_name}</p>
                                                <p className="text-muted-foreground">{selectedOrder.customer_email}</p>
                                                <p className="text-muted-foreground">{selectedOrder.shipping_address?.phone}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Shipping Address</p>
                                                <p className="whitespace-pre-wrap">{selectedOrder.shipping_address?.address}, {selectedOrder.shipping_address?.city}</p>
                                                <p>{selectedOrder.shipping_address?.postal_code}, {selectedOrder.shipping_address?.country}</p>
                                            </div>
                                        </div>

                                        <div className="border-t border-border/10 pt-4">
                                            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-3">Items Manifest</p>
                                            <div className="space-y-2">
                                                {selectedOrder.items?.map((item: any, i: number) => (
                                                    <div key={i} className="flex justify-between items-center bg-muted/30 p-2 rounded-lg">
                                                        <div className="flex gap-3 items-center">
                                                            <div className="w-8 h-8 rounded bg-background flex items-center justify-center text-xs font-bold border border-border/20">
                                                                {item.quantity}x
                                                            </div>
                                                            <span className="font-medium text-sm">{item.product_name || 'Product'}</span>
                                                        </div>
                                                        <span className="font-mono font-bold text-sm">KES {item.price_at_purchase?.toLocaleString()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="border-t border-border/10 pt-4 flex justify-between items-end">
                                            <div className="text-xs text-muted-foreground">
                                                <p>Placed on: {new Date(selectedOrder.created_at).toLocaleString()}</p>
                                                <p>Payment Method: {selectedOrder.payment_method || 'Stripe'}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Total Value</p>
                                                <p className="text-xl font-bold text-primary">KES {selectedOrder.total_amount?.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </DialogContent>
                        </Dialog>
                    </TabsContent>

                    {/* --- PRODUCTS TAB --- */}
                    <TabsContent value="products" className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h2 className="text-xl font-bold tracking-tight">Venture Inventory</h2>
                                <p className="text-muted-foreground font-medium">Manage and deploy products to the digital storefront.</p>
                            </div>
                            <div className="flex gap-2">
                                {products.length === 0 && (
                                    <Button onClick={handleSeedContent} variant="outline" className="rounded-xl px-6 py-6 border-dashed border-primary/30 font-black uppercase tracking-widest text-xs h-auto hover:bg-primary/5">
                                        <RefreshCw className="mr-2 h-4 w-4" /> Sync Default Content
                                    </Button>
                                )}
                                <Button onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }} className="rounded-xl px-6 py-6 shadow-glow hover:scale-105 transition-all bg-primary font-black uppercase tracking-widest text-xs h-auto">
                                    <Plus className="mr-2 h-5 w-5" /> Add New Asset
                                </Button>
                            </div>
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
                                                <span className="text-xl font-bold italic text-primary">KES {product.variants?.[0]?.price_kes?.toLocaleString() || 0}</span>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button size="icon" variant="outline" onClick={() => handleEditProduct(product)} className="rounded-xl w-9 h-9 border-border/50 hover:bg-primary/10 hover:text-primary"><Edit className="h-4 w-4" /></Button>
                                                <Button size="icon" variant="outline" className="rounded-xl w-9 h-9 border-border/50 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteProduct(product.id)}><Trash2 className="h-4 w-4" /></Button>
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
                                    <Button variant="ghost" onClick={() => setIsProductModalOpen(false)} className="rounded-xl font-bold">Cancel</Button>
                                    <Button onClick={handleCreateProduct} className="rounded-xl font-black uppercase tracking-widest text-xs px-8 shadow-glow">{editingProduct ? 'Commit Changes' : 'Initialize Asset'}</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* Stock Movements Section */}
                        <Card className="bg-[#09090b] border-[#1e1e1e] rounded-2xl overflow-hidden mt-8">
                            <CardHeader className="border-b border-[#1e1e1e] bg-[#1e1e1e]/30">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="text-xl font-black flex items-center gap-2">
                                            <History className="w-5 h-5" /> Stock Movements
                                        </CardTitle>
                                        <CardDescription>Track inventory additions, removals, and adjustments.</CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Badge className="bg-green-500/10 text-green-600 border-green-200 px-4 py-1.5 rounded-xl font-black text-[10px]">
                                            {stockMovements.length} RECORDS
                                        </Badge>
                                        <Button onClick={() => setIsStockModalOpen(true)} size="sm" className="rounded-xl h-8 px-4 font-black uppercase tracking-widest text-[10px]">
                                            <Plus className="w-3 h-3 mr-1" /> New Movement
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-[#1e1e1e] bg-[#1e1e1e]/20">
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Product</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Type</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest text-right">Quantity</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Reason</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Date</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {stockMovements.length === 0 ? (
                                                <TableRow><TableCell colSpan={5} className="text-center h-32 text-muted-foreground font-medium">No stock movements recorded yet.</TableCell></TableRow>
                                            ) : (
                                                stockMovements.map((mov) => (
                                                    <TableRow key={mov.id} className="hover:bg-muted/20 transition-colors border-border/10">
                                                        <TableCell className="px-6 font-semibold">{mov.products?.name || 'Unknown Product'}</TableCell>
                                                        <TableCell className="px-6">
                                                            <Badge variant="outline" className={mov.type === 'addition' ? 'bg-green-500/10 text-green-600 border-green-200' : 'bg-red-500/10 text-red-600 border-red-200'}>
                                                                {mov.type === 'addition' ? <TrendingUp className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                                                                {mov.type}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="px-6 text-right font-black">{mov.type === 'addition' ? '+' : '-'}{mov.quantity}</TableCell>
                                                        <TableCell className="px-6 text-sm text-muted-foreground">{mov.reason || 'N/A'}</TableCell>
                                                        <TableCell className="px-6 text-xs font-mono">{new Date(mov.created_at).toLocaleDateString()}</TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Stock Movement Dialog */}
                        <Dialog open={isStockModalOpen} onOpenChange={setIsStockModalOpen}>
                            <DialogContent className="rounded-3xl border-none shadow-2xl glass sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="text-3xl font-black tracking-tighter text-foreground">Record Movement</DialogTitle>
                                    <DialogDescription>Register an addition or removal from product inventory.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-5 py-4">
                                    <div className="space-y-2">
                                        <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Asset Selection</Label>
                                        <Select value={stockForm.product_id} onValueChange={(val) => setStockForm({ ...stockForm, product_id: val })}>
                                            <SelectTrigger className="rounded-xl h-12 bg-muted/50 border-border/50">
                                                <SelectValue placeholder="Select Product" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                {products.map(p => (
                                                    <SelectItem key={p.id} value={p.id} className="font-bold">{p.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Movement Type</Label>
                                            <Select value={stockForm.type} onValueChange={(val) => setStockForm({ ...stockForm, type: val })}>
                                                <SelectTrigger className="rounded-xl h-12 bg-muted/50 border-border/50">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl">
                                                    <SelectItem value="addition" className="font-bold">ADDITION (+)</SelectItem>
                                                    <SelectItem value="removal" className="font-bold">REMOVAL (-)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Quantity</Label>
                                            <Input type="number" value={stockForm.quantity} onChange={e => setStockForm({ ...stockForm, quantity: parseInt(e.target.value) || 0 })} className="rounded-xl h-12 bg-muted/50 border-border/50" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Protocol Reasoning</Label>
                                        <Input placeholder="e.g. New harvest arrival" value={stockForm.reason} onChange={e => setStockForm({ ...stockForm, reason: e.target.value })} className="rounded-xl h-12 bg-muted/50 border-border/50" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleCreateStockMovement} className="w-full h-14 rounded-2xl shadow-glow font-black uppercase tracking-widest transition-all hover:scale-[1.02]">
                                        Commit Inventory Update
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </TabsContent>

                    {/* --- BATCHES TAB --- */}
                    <TabsContent value="batches" className="space-y-6">
                        <Card className="bg-[#09090b] border-[#1e1e1e] rounded-2xl overflow-hidden">
                            <CardHeader className="border-b border-[#1e1e1e] bg-[#1e1e1e]/30 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-bold">Honey Chain Blocks</CardTitle>
                                    <CardDescription>Immutable blockchain ledger of authenticated batches.</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={handleSeedTraceability} className="rounded-xl font-black uppercase tracking-widest text-xs py-5 bg-blue-500 hover:bg-blue-600 text-white border-none px-6 shadow-glow transition-all active:scale-95">
                                        <Database className="mr-2 h-4 w-4" /> Seed Demo
                                    </Button>
                                    <Button onClick={() => setIsBatchModalOpen(true)} className="rounded-xl font-black uppercase tracking-widest text-xs py-5 bg-honey hover:bg-honey-dark text-black border-none px-6 shadow-glow transition-all active:scale-95">
                                        <Plus className="mr-2 h-4 w-4" /> Mint Block
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-[#1e1e1e] bg-[#1e1e1e]/20">
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Batch Code</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Honey Type</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Origin</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Farmer / Beekeeper</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Harvest Date</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest text-right">Quantity (KG)</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Block Hash</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {batches.length === 0 ? (
                                                <TableRow><TableCell colSpan={8} className="text-center h-48 text-muted-foreground font-medium italic">No honey batches in the blockchain yet.</TableCell></TableRow>
                                            ) : (
                                                batches.map((batch, i) => (
                                                    <TableRow
                                                        key={batch.id || i}
                                                        className="hover:bg-muted/20 transition-colors border-border/10 cursor-pointer"
                                                        onClick={() => handleViewBatch(batch)}
                                                    >
                                                        <TableCell className="px-6">
                                                            <div className="font-black text-primary tracking-tighter flex items-center gap-2">
                                                                <CheckCircle2 className="w-4 h-4" />
                                                                {batch.batch_code || `BC-00${i}`}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="px-6 font-semibold">{batch.honey_type}</TableCell>
                                                        <TableCell className="px-6 text-sm">
                                                            {(batch.location_county || batch.location_region) ? (
                                                                <div className="flex flex-col gap-0.5">
                                                                    <span className="font-bold text-xs">{batch.location_county}</span>
                                                                    <span className="text-[10px] text-muted-foreground">{batch.location_region || batch.apiary_name}</span>
                                                                    {batch.latitude && batch.longitude && (
                                                                        <a
                                                                            href={`https://www.google.com/maps?q=${batch.latitude},${batch.longitude}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="flex items-center gap-1 text-[10px] text-blue-500 hover:text-blue-400 hover:underline mt-1 transition-colors"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        >
                                                                            <MapPin className="w-3 h-3" /> View Map
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            ) : <span className="text-muted-foreground">-</span>}
                                                        </TableCell>
                                                        <TableCell className="px-6 text-sm">
                                                            <div className="flex flex-col gap-1">
                                                                {batch.farmer_name && (
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Farmer</span>
                                                                        <span className="font-semibold text-xs">{batch.farmer_name}</span>
                                                                    </div>
                                                                )}
                                                                {batch.beekeeper_name && (
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Beekeeper</span>
                                                                        <span className="font-semibold text-xs">{batch.beekeeper_name}</span>
                                                                    </div>
                                                                )}
                                                                <span className="text-[10px] text-muted-foreground pt-1 border-t border-border/10">
                                                                    {batch.farmer_phone || batch.beekeeper_id || '-'}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="px-6 text-sm tabular-nums">{batch.harvest_date}</TableCell>
                                                        <TableCell className="px-6 text-right font-black italic">{batch.quantity_kg}</TableCell>
                                                        <TableCell className="px-6">
                                                            <div className="flex items-center gap-2 group cursor-help" title={batch.block_hash}>
                                                                <div className="w-2 h-2 rounded-xl bg-green-500 animate-pulse" />
                                                                <code className="text-[10px] bg-muted px-2 py-1 rounded-md opacity-70 group-hover:opacity-100 transition-opacity truncate max-w-[120px] font-mono">
                                                                    {batch.block_hash || '0x00...00'}
                                                                </code>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="px-6">
                                                            <Button size="icon" variant="outline" className="rounded-xl w-8 h-8 border-border/50 text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); handleDeleteBatch(batch.id); }}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                            <Button size="icon" variant="outline" className="rounded-xl w-8 h-8 border-border/50 text-blue-500 hover:bg-blue-500/10 ml-1" onClick={(e) => { e.stopPropagation(); handleViewBatch(batch); }}>
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button size="icon" variant="outline" className="rounded-xl w-8 h-8 border-border/50 text-primary hover:bg-primary/10 ml-1" onClick={(e) => { e.stopPropagation(); handleEditBatch(batch); }}>
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
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
                            <DialogContent className="rounded-3xl border-none shadow-2xl glass max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black">Mint New Ledger Entry</DialogTitle>
                                    <DialogDescription>This action will finalize the batch data on the irreversible HoneyChain network.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-6 py-4">
                                    {/* Basic Info */}
                                    <div className="space-y-4">
                                        <h4 className="font-black uppercase tracking-widest text-xs text-primary border-b border-white/10 pb-2">Batch Details</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Botanical Profile</Label>
                                                <Input value={batchForm.honey_type} onChange={e => setBatchForm({ ...batchForm, honey_type: e.target.value })} placeholder="e.g. Acacia Noir" className="rounded-xl h-11 bg-muted/50" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Harvest Date</Label>
                                                <Input type="date" value={batchForm.harvest_date} onChange={e => setBatchForm({ ...batchForm, harvest_date: e.target.value })} className="rounded-xl h-11 bg-muted/50" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Packaged Date</Label>
                                                <Input type="date" value={(batchForm as any).packaged_date || ''} onChange={e => setBatchForm({ ...batchForm, packaged_date: e.target.value } as any)} className="rounded-xl h-11 bg-muted/50" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Yield (Total KG)</Label>
                                                <Input type="number" value={batchForm.quantity_kg} onChange={e => setBatchForm({ ...batchForm, quantity_kg: parseFloat(e.target.value) })} className="rounded-xl h-11 bg-muted/50" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Processing Method</Label>
                                                <Select onValueChange={(val) => setBatchForm({ ...batchForm, processing_method: val })} defaultValue={batchForm.processing_method}>
                                                    <SelectTrigger className="rounded-xl h-11 bg-muted/50">
                                                        <SelectValue placeholder="Select Method" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Raw Filtered">Raw Filtered</SelectItem>
                                                        <SelectItem value="Creamed">Creamed</SelectItem>
                                                        <SelectItem value="Pasteurized">Pasteurized</SelectItem>
                                                        <SelectItem value="Comb Honey">Comb Honey</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Source Info */}
                                    <div className="space-y-4">
                                        <h4 className="font-black uppercase tracking-widest text-xs text-primary border-b border-white/10 pb-2">Source Origin</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Farmer Name</Label>
                                                <Input
                                                    value={(batchForm as any).farmer_name || ''}
                                                    onChange={e => setBatchForm({ ...batchForm, farmer_name: e.target.value } as any)}
                                                    placeholder="e.g. John Doe"
                                                    className="rounded-xl h-11 bg-muted/50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Contact Phone</Label>
                                                <Input
                                                    value={(batchForm as any).farmer_phone || ''}
                                                    onChange={e => setBatchForm({ ...batchForm, farmer_phone: e.target.value } as any)}
                                                    placeholder="+254..."
                                                    className="rounded-xl h-11 bg-muted/50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Beekeeper Name</Label>
                                                <Input
                                                    value={(batchForm as any).beekeeper_name || ''}
                                                    onChange={e => setBatchForm({ ...batchForm, beekeeper_name: e.target.value } as any)}
                                                    placeholder="e.g. Jane Smith"
                                                    className="rounded-xl h-11 bg-muted/50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Beekeeper ID</Label>
                                                <Input
                                                    value={(batchForm as any).beekeeper_id || ''}
                                                    onChange={e => setBatchForm({ ...batchForm, beekeeper_id: e.target.value } as any)}
                                                    placeholder="ID-..."
                                                    className="rounded-xl h-11 bg-muted/50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="uppercase text-[10px] font-black tracking-widest ml-1">County</Label>
                                                <Input
                                                    value={(batchForm as any).location_county || ''}
                                                    onChange={e => setBatchForm({ ...batchForm, location_county: e.target.value } as any)}
                                                    placeholder="e.g. Kitui"
                                                    className="rounded-xl h-11 bg-muted/50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Region</Label>
                                                <Input
                                                    value={(batchForm as any).location_region || ''}
                                                    onChange={e => setBatchForm({ ...batchForm, location_region: e.target.value } as any)}
                                                    placeholder="e.g. Mwingi North"
                                                    className="rounded-xl h-11 bg-muted/50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Apiary Name</Label>
                                                <Input
                                                    value={(batchForm as any).apiary_name || ''}
                                                    onChange={e => setBatchForm({ ...batchForm, apiary_name: e.target.value } as any)}
                                                    placeholder="e.g. Acacia Grove"
                                                    className="rounded-xl h-11 bg-muted/50"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-2">
                                                    <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Lat</Label>
                                                    <Input
                                                        type="number" step="any"
                                                        value={(batchForm as any).latitude || ''}
                                                        onChange={e => setBatchForm({ ...batchForm, latitude: parseFloat(e.target.value) } as any)}
                                                        placeholder="-1.23"
                                                        className="rounded-xl h-11 bg-muted/50"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Long</Label>
                                                    <Input
                                                        type="number" step="any"
                                                        value={(batchForm as any).longitude || ''}
                                                        onChange={e => setBatchForm({ ...batchForm, longitude: parseFloat(e.target.value) } as any)}
                                                        placeholder="36.8"
                                                        className="rounded-xl h-11 bg-muted/50"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quality Metrics */}
                                    <div className="space-y-4">
                                        <h4 className="font-black uppercase tracking-widest text-xs text-primary border-b border-white/10 pb-2">Quality Assurance</h4>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Grade</Label>
                                                <Select onValueChange={(val) => setBatchForm({ ...batchForm, quality_grade: val } as any)} defaultValue="A">
                                                    <SelectTrigger className="rounded-xl h-11 bg-muted/50">
                                                        <SelectValue placeholder="Grade" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="A">Grade A (Premium)</SelectItem>
                                                        <SelectItem value="B">Grade B (Standard)</SelectItem>
                                                        <SelectItem value="C">Grade C (Industrial)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Moisture (%)</Label>
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    value={(batchForm as any).moisture_content || ''}
                                                    onChange={e => setBatchForm({ ...batchForm, moisture_content: parseFloat(e.target.value) } as any)}
                                                    placeholder="18.5"
                                                    className="rounded-xl h-11 bg-muted/50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Color Grade</Label>
                                                <Select onValueChange={(val) => setBatchForm({ ...batchForm, color_grade: val } as any)}>
                                                    <SelectTrigger className="rounded-xl h-11 bg-muted/50">
                                                        <SelectValue placeholder="Select Color" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Water White">Water White</SelectItem>
                                                        <SelectItem value="Extra White">Extra White</SelectItem>
                                                        <SelectItem value="White">White</SelectItem>
                                                        <SelectItem value="Extra Light Amber">Extra Light Amber</SelectItem>
                                                        <SelectItem value="Light Amber">Light Amber</SelectItem>
                                                        <SelectItem value="Amber">Amber</SelectItem>
                                                        <SelectItem value="Dark Amber">Dark Amber</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleSaveBatch} className="w-full rounded-2xl py-6 font-black uppercase tracking-widest text-xs bg-honey hover:bg-honey-dark text-black border-none shadow-glow">Initialize Block Minting</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* Batch Details Dialog */}
                        <Dialog open={isBatchDetailsOpen} onOpenChange={setIsBatchDetailsOpen}>
                            <DialogContent className="rounded-3xl border-none shadow-2xl glass max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black flex items-center gap-2">
                                        <Shield className="w-6 h-6 text-green-500" />
                                        Batch Verification
                                    </DialogTitle>
                                    <DialogDescription className="font-mono text-xs">
                                        BLOCKCHAIN ID: {selectedBatch?.block_hash}
                                    </DialogDescription>
                                </DialogHeader>

                                {selectedBatch && (
                                    <div className="space-y-8 py-4">
                                        {/* Header Status Card */}
                                        <div className="bg-muted/30 p-4 rounded-2xl flex justify-between items-center border border-border/50">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Batch Code</p>
                                                <p className="text-xl font-black font-mono text-primary">{selectedBatch.batch_code}</p>
                                            </div>
                                            <Badge className="bg-green-500/20 text-green-600 px-4 py-1 h-8 rounded-xl font-black uppercase tracking-widest border-none">
                                                VERIFIED ON LEDGER
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <h4 className="font-black uppercase tracking-widest text-xs border-b border-border/50 pb-2 flex items-center gap-2">
                                                    <Package className="w-4 h-4" /> Product Details
                                                </h4>
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-[10px] uppercase text-muted-foreground font-bold">Honey Type</p>
                                                        <p className="font-semibold">{selectedBatch.honey_type}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] uppercase text-muted-foreground font-bold">Quantity</p>
                                                        <p className="font-semibold">{selectedBatch.quantity_kg} KG</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] uppercase text-muted-foreground font-bold">Processing</p>
                                                        <p className="font-semibold">{selectedBatch.processing_method}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] uppercase text-muted-foreground font-bold">Harvest Date</p>
                                                        <p className="font-mono text-sm">{selectedBatch.harvest_date}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h4 className="font-black uppercase tracking-widest text-xs border-b border-border/50 pb-2 flex items-center gap-2">
                                                    <Users className="w-4 h-4" /> Origin Source
                                                </h4>
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-[10px] uppercase text-muted-foreground font-bold">Farmer</p>
                                                        <p className="font-semibold">{selectedBatch.farmer_name || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] uppercase text-muted-foreground font-bold">Beekeeper</p>
                                                        <p className="font-semibold">{selectedBatch.beekeeper_name || 'N/A'}</p>
                                                        <p className="text-xs text-muted-foreground">{selectedBatch.beekeeper_id}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] uppercase text-muted-foreground font-bold">Location</p>
                                                        <p className="font-semibold">{selectedBatch.location_county || 'N/A'}, {selectedBatch.location_region || ''}</p>
                                                        <p className="text-xs text-muted-foreground">{selectedBatch.apiary_name}</p>
                                                        {selectedBatch.latitude && (
                                                            <a
                                                                href={`https://www.google.com/maps?q=${selectedBatch.latitude},${selectedBatch.longitude}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-[10px] text-blue-500 hover:underline flex items-center gap-1 mt-1"
                                                            >
                                                                <MapPin className="w-3 h-3" /> View Map
                                                            </a>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] uppercase text-muted-foreground font-bold">Contact</p>
                                                        <p className="font-mono text-sm">{selectedBatch.farmer_phone || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="font-black uppercase tracking-widest text-xs border-b border-border/50 pb-2 flex items-center gap-2">
                                                <Shield className="w-4 h-4" /> Quality Assurance
                                            </h4>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="bg-muted/30 p-3 rounded-xl text-center">
                                                    <p className="text-[10px] uppercase text-muted-foreground font-bold">Grade</p>
                                                    <p className="text-lg font-black">{selectedBatch.quality_grade || 'A'}</p>
                                                </div>
                                                <div className="bg-muted/30 p-3 rounded-xl text-center">
                                                    <p className="text-[10px] uppercase text-muted-foreground font-bold">Moisture</p>
                                                    <p className="text-lg font-black">{selectedBatch.moisture_content || 0}%</p>
                                                </div>
                                                <div className="bg-muted/30 p-3 rounded-xl text-center">
                                                    <p className="text-[10px] uppercase text-muted-foreground font-bold">Color</p>
                                                    <p className="text-sm font-black mt-1">{selectedBatch.color_grade || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <DialogFooter>
                                    <Button onClick={() => setIsBatchDetailsOpen(false)} className="rounded-xl w-full">Close Verification</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </TabsContent>

                    {/* --- FARMERS TAB --- */}
                    <TabsContent value="farmers" className="space-y-6">
                        <Card className="bg-[#09090b] border-[#1e1e1e] rounded-2xl overflow-hidden">
                            <CardHeader className="border-b border-[#1e1e1e] bg-[#1e1e1e]/30 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-bold">Agricultural Partners</CardTitle>
                                    <CardDescription>Authenticated network of honey harvesters and growers.</CardDescription>
                                </div>
                                <Button
                                    onClick={() => setIsFarmerModalOpen(true)}
                                    variant="outline"
                                    className="rounded-xl font-black uppercase tracking-widest text-xs h-auto py-4 border-dashed border-primary/30"
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Register Farmer
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-[#1e1e1e] bg-[#1e1e1e]/20">
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Farmer</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Contact</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Location</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Experience</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Status</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {farmers.length === 0 ? (
                                                <TableRow><TableCell colSpan={6} className="text-center h-48 text-muted-foreground font-medium italic">No registered farmers found.</TableCell></TableRow>
                                            ) : (
                                                farmers.map((farmer) => (
                                                    <TableRow key={farmer.id} className="hover:bg-muted/20 transition-colors border-border/10">
                                                        <TableCell className="px-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-xl bg-honey/20 flex items-center justify-center font-black text-honey">
                                                                    {farmer.name?.[0]?.toUpperCase() || 'F'}
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="font-bold">{farmer.name}</span>
                                                                    <span className="text-[10px] text-muted-foreground uppercase font-mono">{farmer.farmer_id || 'ID-PENDING'}</span>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="px-6">
                                                            <div className="text-sm font-medium">{farmer.phone}</div>
                                                            <div className="text-[10px] text-muted-foreground">{farmer.email || 'No email'}</div>
                                                        </TableCell>
                                                        <TableCell className="px-6">
                                                            <div className="text-sm">{farmer.county || 'N/A'}</div>
                                                            <div className="text-[10px] text-muted-foreground">{farmer.region || farmer.location_name || ''}</div>
                                                        </TableCell>
                                                        <TableCell className="px-6">
                                                            <Badge variant="outline" className="bg-blue-500/5 text-blue-600 border-blue-200">
                                                                {farmer.experience_years} Years
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="px-6">
                                                            <Badge className={farmer.certification_status === 'CERTIFIED' ? 'bg-green-500/10 text-green-600 border-none' : 'bg-amber-500/10 text-amber-600 border-none'}>
                                                                {farmer.certification_status || 'PENDING'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="px-6 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button size="icon" variant="outline" className="rounded-xl w-8 h-8 border-border/50 text-primary hover:bg-primary/10 ml-1" onClick={() => handleEditFarmer(farmer)}>
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button size="icon" variant="outline" className="rounded-xl w-8 h-8 border-border/50 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteFarmer(farmer.id)}>
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
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

                        {/* Farmer Registration Dialog */}
                        <Dialog open={isFarmerModalOpen} onOpenChange={(open) => { setIsFarmerModalOpen(open); if (!open) setEditingFarmer(null); }}>
                            <DialogContent className="rounded-3xl border-none shadow-2xl glass max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle className="text-3xl font-black tracking-tighter">{editingFarmer ? 'Modify Partner' : 'Register Partner'}</DialogTitle>
                                    <DialogDescription>{editingFarmer ? 'Update beekeeper credentials and parameters.' : 'Initialize a new beekeeper record on the BeeYield network.'}</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-6 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Full Name</Label>
                                            <Input placeholder="Timothy Nduva" value={farmerForm.name} onChange={e => setFarmerForm({ ...farmerForm, name: e.target.value })} className="rounded-xl h-12 bg-muted/50 border-border/50" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Phone Number</Label>
                                            <Input placeholder="+254 7XX XXX XXX" value={farmerForm.phone} onChange={e => setFarmerForm({ ...farmerForm, phone: e.target.value })} className="rounded-xl h-12 bg-muted/50 border-border/50" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Email Address</Label>
                                            <Input type="email" placeholder="timothy@beeyield.com" value={farmerForm.email} onChange={e => setFarmerForm({ ...farmerForm, email: e.target.value })} className="rounded-xl h-12 bg-muted/50 border-border/50" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="uppercase text-[10px] font-black tracking-widest ml-1">ID Number</Label>
                                            <Input placeholder="National ID or Passport" value={farmerForm.id_number} onChange={e => setFarmerForm({ ...farmerForm, id_number: e.target.value })} className="rounded-xl h-12 bg-muted/50 border-border/50" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label className="uppercase text-[10px] font-black tracking-widest ml-1">County</Label>
                                            <Input placeholder="Makueni" value={farmerForm.county} onChange={e => setFarmerForm({ ...farmerForm, county: e.target.value })} className="rounded-xl h-12 bg-muted/50 border-border/50" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Region</Label>
                                            <Input placeholder="Eastern" value={farmerForm.region} onChange={e => setFarmerForm({ ...farmerForm, region: e.target.value })} className="rounded-xl h-12 bg-muted/50 border-border/50" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Years Experience</Label>
                                            <Input type="number" value={farmerForm.experience_years} onChange={e => setFarmerForm({ ...farmerForm, experience_years: parseInt(e.target.value) || 0 })} className="rounded-xl h-12 bg-muted/50 border-border/50" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Location Details / Ward</Label>
                                        <Input placeholder="Kibwezi East, Mtito Andei" value={farmerForm.location_name} onChange={e => setFarmerForm({ ...farmerForm, location_name: e.target.value })} className="rounded-xl h-12 bg-muted/50 border-border/50" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="uppercase text-[10px] font-black tracking-widest ml-1">The Beekeeper's Story</Label>
                                        <Textarea
                                            placeholder="Brief background about the farmer..."
                                            value={farmerForm.story}
                                            onChange={e => setFarmerForm({ ...farmerForm, story: e.target.value })}
                                            className="rounded-xl min-h-[100px] bg-muted/50 border-border/50"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleSaveFarmer} className="w-full h-14 rounded-2xl shadow-glow font-black uppercase tracking-widest transition-all hover:scale-[1.02]">
                                        {editingFarmer ? 'Update Partner Records' : 'Complete Network Registration'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </TabsContent>

                    {/* --- APIARIES TAB --- */}
                    <TabsContent value="apiaries" className="space-y-6">
                        <Card className="bg-[#09090b] border-[#1e1e1e] rounded-2xl overflow-hidden">
                            <CardHeader className="border-b border-[#1e1e1e] bg-[#1e1e1e]/30 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-bold">Apiary Locations</CardTitle>
                                    <CardDescription>Geospatial management of hive clusters and honey production sites.</CardDescription>
                                </div>
                                <Button
                                    onClick={() => setIsApiaryModalOpen(true)}
                                    variant="outline"
                                    className="rounded-xl font-black uppercase tracking-widest text-xs h-auto py-4 border-dashed border-primary/30"
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Register Apiary
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-[#1e1e1e] bg-[#1e1e1e]/20">
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Name</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Farmer</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Location</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest text-right">Hives</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Status</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {apiaries.length === 0 ? (
                                                <TableRow><TableCell colSpan={6} className="text-center h-48 text-muted-foreground font-medium">No apiaries registered on the BeeYield grid.</TableCell></TableRow>
                                            ) : (
                                                apiaries.map((apiary) => (
                                                    <TableRow key={apiary.id} className="hover:bg-muted/20 transition-colors border-border/10">
                                                        <TableCell className="px-6 font-bold">{apiary.name}</TableCell>
                                                        <TableCell className="px-6">{apiary.farmers?.name || 'Assigned Partner'}</TableCell>
                                                        <TableCell className="px-6">
                                                            <div className="text-sm font-medium">{apiary.location_name || apiary.county}</div>
                                                            <div className="text-[10px] text-muted-foreground">{apiary.region}</div>
                                                        </TableCell>
                                                        <TableCell className="px-6 text-right font-black">
                                                            {hives.filter(h => h.apiary_id === apiary.id).length}
                                                        </TableCell>
                                                        <TableCell className="px-6">
                                                            <Badge variant="outline" className={apiary.status === 'active' ? "bg-green-500/10 text-green-600 border-green-200" : "bg-muted text-muted-foreground"}>
                                                                {apiary.status?.toUpperCase()}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="px-6 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button size="icon" variant="outline" className="rounded-xl w-8 h-8 border-border/50 hover:bg-primary/10 hover:text-primary" onClick={() => handleEditApiary(apiary)}>
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button size="icon" variant="outline" className="rounded-xl w-8 h-8 border-border/50 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteApiary(apiary.id)}>
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
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

                        {/* Apiary Modal */}
                        <Dialog open={isApiaryModalOpen} onOpenChange={(open) => { setIsApiaryModalOpen(open); if (!open) setEditingApiary(null); }}>
                            <DialogContent className="rounded-3xl border-none shadow-2xl glass max-w-xl">
                                <DialogHeader>
                                    <DialogTitle className="text-3xl font-black tracking-tighter">{editingApiary ? 'Calibrate Apiary' : 'Map New Apiary'}</DialogTitle>
                                    <DialogDescription>Define production site parameters and associate with agricultural partners.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-6 py-4">
                                    <div className="space-y-2">
                                        <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Apiary Name</Label>
                                        <Input placeholder="Kibwezi East Cluster A" value={apiaryForm.name} onChange={e => setApiaryForm({ ...apiaryForm, name: e.target.value })} className="rounded-xl h-12 bg-muted/50 border-border/50" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="uppercase text-[10px] font-black tracking-widest ml-1">County</Label>
                                            <Input placeholder="Makueni" value={apiaryForm.county} onChange={e => setApiaryForm({ ...apiaryForm, county: e.target.value })} className="rounded-xl h-12 bg-muted/50 border-border/50" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Region</Label>
                                            <Input placeholder="Eastern" value={apiaryForm.region} onChange={e => setApiaryForm({ ...apiaryForm, region: e.target.value })} className="rounded-xl h-12 bg-muted/50 border-border/50" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Assigned Farmer</Label>
                                        <Select value={apiaryForm.farmer_id} onValueChange={val => setApiaryForm({ ...apiaryForm, farmer_id: val })}>
                                            <SelectTrigger className="rounded-xl h-12 bg-muted/50 border-border/50">
                                                <SelectValue placeholder="Select Partner" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-border/50">
                                                {farmers.map(f => (
                                                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Latitude</Label>
                                            <Input type="number" step="any" value={apiaryForm.latitude} onChange={e => setApiaryForm({ ...apiaryForm, latitude: parseFloat(e.target.value) })} className="rounded-xl h-12 bg-muted/50 border-border/50" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Longitude</Label>
                                            <Input type="number" step="any" value={apiaryForm.longitude} onChange={e => setApiaryForm({ ...apiaryForm, longitude: parseFloat(e.target.value) })} className="rounded-xl h-12 bg-muted/50 border-border/50" />
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleSaveApiary} className="w-full h-14 rounded-2xl shadow-glow font-black uppercase tracking-widest transition-all hover:scale-[1.02]">
                                        {editingApiary ? 'Update Production Site' : 'Authenticate Site Registration'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </TabsContent>

                    {/* --- HIVES TAB --- */}
                    <TabsContent value="hives" className="space-y-6">
                        <Card className="bg-[#09090b] border-[#1e1e1e] rounded-2xl overflow-hidden">
                            <CardHeader className="border-b border-[#1e1e1e] bg-[#1e1e1e]/30 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-bold">Smart Hive Ledger</CardTitle>
                                    <CardDescription>Inventory and health status of individual colony units.</CardDescription>
                                </div>
                                <Button
                                    onClick={() => setIsHiveModalOpen(true)}
                                    variant="outline"
                                    className="rounded-xl font-black uppercase tracking-widest text-xs h-auto py-4 border-dashed border-primary/30"
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Deploy Hive
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-[#1e1e1e] bg-[#1e1e1e]/20">
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Hive Code</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Apiary</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Type</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Installed</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Status</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {hives.length === 0 ? (
                                                <TableRow><TableCell colSpan={6} className="text-center h-48 text-muted-foreground font-medium">No hives deployed in the honeycomb network.</TableCell></TableRow>
                                            ) : (
                                                hives.map((hive) => (
                                                    <TableRow key={hive.id} className="hover:bg-muted/20 transition-colors border-border/10">
                                                        <TableCell className="px-6 font-mono font-bold text-primary">{hive.hive_code}</TableCell>
                                                        <TableCell className="px-6 font-semibold">{hive.apiaries?.name || 'Assigned Site'}</TableCell>
                                                        <TableCell className="px-6">{hive.type}</TableCell>
                                                        <TableCell className="px-6 text-sm text-muted-foreground">{new Date(hive.installation_date).toLocaleDateString()}</TableCell>
                                                        <TableCell className="px-6">
                                                            <Badge variant="outline" className={hive.status === 'active' ? "bg-green-500/10 text-green-600 border-green-200" : "bg-yellow-500/10 text-yellow-600 border-yellow-200"}>
                                                                {hive.status?.toUpperCase()}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="px-6 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button size="icon" variant="outline" className="rounded-xl w-8 h-8 border-border/50 hover:bg-primary/10 hover:text-primary" onClick={() => handleEditHive(hive)}>
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button size="icon" variant="outline" className="rounded-xl w-8 h-8 border-border/50 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteHive(hive.id)}>
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
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

                        {/* --- ORDERS TAB --- */}
                        <TabsContent value="orders" className="space-y-6">
                            <Card className="bg-[#09090b] border-[#1e1e1e] rounded-2xl overflow-hidden">
                                <CardHeader className="border-b border-[#1e1e1e] bg-[#1e1e1e]/30">
                                    <CardTitle className="text-xl font-bold">Recent Orders ({orders.length})</CardTitle>
                                    <CardDescription className="text-[#a1a1aa]">Manage and track all customer orders.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-[#1e1e1e] bg-[#1e1e1e]/20">
                                                <TableHead className="text-[#a1a1aa] font-bold uppercase text-[10px] tracking-wider px-6 py-4">Status</TableHead>
                                                <TableHead className="text-[#a1a1aa] font-bold uppercase text-[10px] tracking-wider px-6 py-4">Order ID</TableHead>
                                                <TableHead className="text-[#a1a1aa] font-bold uppercase text-[10px] tracking-wider px-6 py-4">Customer</TableHead>
                                                <TableHead className="text-[#a1a1aa] font-bold uppercase text-[10px] tracking-wider px-6 py-4">Amount</TableHead>
                                                <TableHead className="text-[#a1a1aa] font-bold uppercase text-[10px] tracking-wider px-6 py-4">Date</TableHead>
                                                <TableHead className="text-[#a1a1aa] font-bold uppercase text-[10px] tracking-wider text-right px-6 py-4">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {orders.length === 0 ? (
                                                <TableRow><TableCell colSpan={6} className="text-center h-32 text-[#71717a]">No orders found protocol.</TableCell></TableRow>
                                            ) : (
                                                orders.map((order) => (
                                                    <TableRow key={order.id} className="border-b border-[#1e1e1e] hover:bg-[#1e1e1e]/50 transition-colors">
                                                        <TableCell className="px-6 py-4">{getStatusLabel(order.status)}</TableCell>
                                                        <TableCell className="px-6 py-4 font-mono text-xs text-[#a1a1aa]">{order.id.slice(0, 8)}...</TableCell>
                                                        <TableCell className="px-6 py-4 font-medium">{order.shipping_address?.first_name || 'Guest'} {order.shipping_address?.last_name || ''}</TableCell>
                                                        <TableCell className="px-6 py-4">KES {order.total_amount?.toLocaleString()}</TableCell>
                                                        <TableCell className="px-6 py-4 text-[#a1a1aa]">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                                                        <TableCell className="px-6 py-4 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-[#a1a1aa] hover:text-white" onClick={() => handleViewOrder(order)}><Eye className="h-4 w-4" /></Button>
                                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500/50 hover:text-red-500" onClick={() => handleDeleteOrder(order.id)}><Trash2 className="h-4 w-4" /></Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Hive Modal */}
                        <Dialog open={isHiveModalOpen} onOpenChange={(open) => { setIsHiveModalOpen(open); if (!open) setEditingHive(null); }}>
                            <DialogContent className="rounded-3xl border-none shadow-2xl glass max-w-xl">
                                <DialogHeader>
                                    <DialogTitle className="text-3xl font-black tracking-tighter">{editingHive ? 'Sync Hive Sensors' : 'Deploy New Unit'}</DialogTitle>
                                    <DialogDescription>Register individual colony components and their mechanical signatures.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-6 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Hive Code</Label>
                                            <Input placeholder="HIVE-KIB-001" value={hiveForm.hive_code} onChange={e => setHiveForm({ ...hiveForm, hive_code: e.target.value })} className="rounded-xl h-12 bg-muted/50 border-border/50" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Hive Type</Label>
                                            <Select value={hiveForm.type} onValueChange={val => setHiveForm({ ...hiveForm, type: val })}>
                                                <SelectTrigger className="rounded-xl h-12 bg-muted/50 border-border/50">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-border/50">
                                                    <SelectItem value="Langstroth">Langstroth</SelectItem>
                                                    <SelectItem value="KTB">Kenya Top Bar (KTB)</SelectItem>
                                                    <SelectItem value="Traditional">Traditional Log</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Target Apiary</Label>
                                        <Select value={hiveForm.apiary_id} onValueChange={val => setHiveForm({ ...hiveForm, apiary_id: val })}>
                                            <SelectTrigger className="rounded-xl h-12 bg-muted/50 border-border/50">
                                                <SelectValue placeholder="Select Site" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-border/50">
                                                {apiaries.map(a => (
                                                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Installation Date</Label>
                                            <Input type="date" value={hiveForm.installation_date} onChange={e => setHiveForm({ ...hiveForm, installation_date: e.target.value })} className="rounded-xl h-12 bg-muted/50 border-border/50" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Health Status</Label>
                                            <Select value={hiveForm.status} onValueChange={val => setHiveForm({ ...hiveForm, status: val })}>
                                                <SelectTrigger className="rounded-xl h-12 bg-muted/50 border-border/50">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-border/50">
                                                    <SelectItem value="active">Active & Healthy</SelectItem>
                                                    <SelectItem value="weak">Weak Colony</SelectItem>
                                                    <SelectItem value="abandoned">Abandoned</SelectItem>
                                                    <SelectItem value="harvested">Recently Harvested</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Mechanical Notes</Label>
                                        <Textarea placeholder="Condition of the box, queen status, etc." value={hiveForm.notes} onChange={e => setHiveForm({ ...hiveForm, notes: e.target.value })} className="rounded-xl bg-muted/50 border-border/50" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleSaveHive} className="w-full h-14 rounded-2xl shadow-glow font-black uppercase tracking-widest transition-all hover:scale-[1.02]">
                                        {editingHive ? 'Sync Unit Parameters' : 'Authorize Deployment'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </TabsContent>

                    {/* --- TEAM MANAGEMENT (SUPER ADMIN ONLY) --- */}
                    {
                        isSuperAdmin && (
                            <TabsContent value="team" className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-xl font-bold flex gap-2 items-center">
                                            <Shield className="w-6 h-6 text-primary" /> Admin Command Circle
                                        </h2>
                                        <p className="text-muted-foreground font-medium">Elevate user privileges or terminate access protocols.</p>
                                    </div>
                                    <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 rounded-xl font-black text-[10px] tracking-tighter">
                                        {systemUsers.length} MEMBERS
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {systemUsers.map((userObj) => (
                                        <Card key={userObj.id} className="border-border/50 bg-card/60 backdrop-blur rounded-3xl overflow-hidden hover:shadow-xl transition-all border group">
                                            <CardHeader className="pb-3 relative">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary text-xl relative">
                                                        {userObj.email?.[0].toUpperCase()}
                                                        {userObj.role === 'super_admin' && (
                                                            <div className="absolute -top-1 -right-1 bg-yellow-400 text-black rounded-xl p-0.5 shadow-lg border-2 border-background">
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
                                                        <SelectTrigger className="w-32 h-8 rounded-xl text-[10px] font-black uppercase tracking-widest border-none bg-muted/60">
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
                                                        className="flex-1 rounded-2xl h-10 border-border/50 text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-colors"
                                                        onClick={() => handleEditUser(userObj)}
                                                    >
                                                        <Edit className="h-4 w-4 mr-2" /> Modify
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        className="flex-1 rounded-2xl h-10 border-border/50 text-[10px] font-black uppercase tracking-widest hover:bg-destructive/10 hover:text-destructive group-hover:border-destructive/30 transition-colors"
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
                                    <Card
                                        onClick={() => { setEditingUser(null); setUserForm({ first_name: '', last_name: '', email: '', password: '', role: 'user' }); setIsUserModalOpen(true); }}
                                        className="border-dashed border-2 border-border bg-transparent rounded-3xl flex flex-col items-center justify-center p-8 text-muted-foreground hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all group h-full min-h-[160px]"
                                    >
                                        <Users className="h-10 w-10 mb-4 group-hover:scale-110 transition-transform text-muted-foreground/40 group-hover:text-primary/40" />
                                        <h3 className="font-black uppercase tracking-widest text-xs">Awaiting New Operator</h3>
                                        <p className="text-[10px] font-medium text-center mt-2 opacity-60">Initialize authentication protocols</p>
                                    </Card>
                                </div>

                                {/* User CRUD Dialog */}
                                <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
                                    <DialogContent className="rounded-3xl border-none shadow-2xl glass sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle className="text-3xl font-black tracking-tighter">{editingUser ? 'Modify Operator' : 'Initialize Operator'}</DialogTitle>
                                            <DialogDescription>Configure system access and identity parameters.</DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-5 py-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="uppercase text-[10px] font-black tracking-widest ml-1">First Name</Label>
                                                    <Input placeholder="John" value={userForm.first_name} onChange={e => setUserForm({ ...userForm, first_name: e.target.value })} className="rounded-xl h-12 bg-muted/50 border-border/50" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Last Name</Label>
                                                    <Input placeholder="Doe" value={userForm.last_name} onChange={e => setUserForm({ ...userForm, last_name: e.target.value })} className="rounded-xl h-12 bg-muted/50 border-border/50" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Email Address</Label>
                                                <Input type="email" placeholder="operator@beeyield.com" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} className="rounded-xl h-12 bg-muted/50 border-border/50" />
                                            </div>
                                            {!editingUser && (
                                                <div className="space-y-2">
                                                    <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Access Password</Label>
                                                    <Input type="password" placeholder="••••••••" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} className="rounded-xl h-12 bg-muted/50 border-border/50" />
                                                </div>
                                            )}
                                            <div className="space-y-2">
                                                <Label className="uppercase text-[10px] font-black tracking-widest ml-1">Clearance Level</Label>
                                                <Select value={userForm.role} onValueChange={(val) => setUserForm({ ...userForm, role: val })}>
                                                    <SelectTrigger className="w-full h-12 rounded-xl bg-muted/50 border-border/50">
                                                        <SelectValue placeholder="Select Role" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl">
                                                        <SelectItem value="user" className="font-bold">OPERATIVE (USER)</SelectItem>
                                                        <SelectItem value="admin" className="font-bold">OVERSEER (ADMIN)</SelectItem>
                                                        <SelectItem value="super_admin" className="font-bold">ENTITY (SUPER ADMIN)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button onClick={handleSaveUser} className="w-full h-14 rounded-2xl shadow-glow font-black uppercase tracking-widest transition-all hover:scale-[1.02]">
                                                {editingUser ? 'Update Operator' : 'Finalize Authentication'}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>

                            </TabsContent>
                        )
                    }

                    {/* --- POLLINATION REQUESTS TAB --- */}
                    <TabsContent value="pollination" className="space-y-6">
                        <Card className="bg-[#09090b] border-[#1e1e1e] rounded-2xl overflow-hidden">
                            <CardHeader className="border-b border-[#1e1e1e] bg-[#1e1e1e]/30">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="text-2xl font-black">Pollination Requests</CardTitle>
                                        <CardDescription>All incoming pollination service requests from farmers.</CardDescription>
                                    </div>
                                    <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 rounded-xl font-black text-[10px]">
                                        {pollinationRequests.length} REQUESTS
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-[#1e1e1e] bg-[#1e1e1e]/20">
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Name</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Email</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Phone</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Crop Type</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Farm Size</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Location</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Date</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Status</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {pollinationRequests.length === 0 ? (
                                                <TableRow><TableCell colSpan={9} className="text-center h-48 text-muted-foreground font-medium">No pollination requests yet.</TableCell></TableRow>
                                            ) : (
                                                pollinationRequests.map((req) => (
                                                    <TableRow key={req.id} className="hover:bg-muted/20 transition-colors border-border/10">
                                                        <TableCell className="px-6 font-semibold">{req.name || req.first_name}</TableCell>
                                                        <TableCell className="px-6 text-sm">{req.email}</TableCell>
                                                        <TableCell className="px-6 text-sm font-mono">{req.phone}</TableCell>
                                                        <TableCell className="px-6"><Badge variant="outline" className="rounded-xl">{req.crop_type || req.crop}</Badge></TableCell>
                                                        <TableCell className="px-6 text-sm">{req.farm_size || req.acreage} acres</TableCell>
                                                        <TableCell className="px-6 text-sm text-muted-foreground">{req.location || req.county}</TableCell>
                                                        <TableCell className="px-6 text-xs font-mono">{new Date(req.created_at).toLocaleDateString()}</TableCell>
                                                        <TableCell className="px-6">
                                                            <Select defaultValue={req.status || 'pending'} onValueChange={(val) => adminService.updatePollinationRequestStatus(req.id, val).then(() => { toast.success('Status updated'); loadAllData(); })}>
                                                                <SelectTrigger className="h-8 w-[120px] rounded-xl text-[10px] font-black uppercase"><SelectValue /></SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="pending">Pending</SelectItem>
                                                                    <SelectItem value="contacted">Contacted</SelectItem>
                                                                    <SelectItem value="completed">Completed</SelectItem>
                                                                    <SelectItem value="rejected">Rejected</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </TableCell>
                                                        <TableCell className="px-6 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button size="icon" variant="outline" className="rounded-xl w-8 h-8 border-border/50 hover:bg-primary/10 hover:text-primary" onClick={() => handleViewPollination(req)}>
                                                                    <Search className="h-4 w-4" />
                                                                </Button>
                                                                <Button size="icon" variant="outline" className="rounded-xl w-8 h-8 border-border/50 text-destructive hover:bg-destructive/10" onClick={() => handleDeletePollination(req.id)}>
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
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

                        {/* Pollination Details Dialog */}
                        <Dialog open={isPollinationDetailsOpen} onOpenChange={setIsPollinationDetailsOpen}>
                            <DialogContent className="rounded-3xl border-none shadow-2xl glass sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black flex gap-2 items-center">
                                        <Bug className="w-6 h-6 text-primary" /> Service Request
                                    </DialogTitle>
                                </DialogHeader>
                                {selectedPollination && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Farmer</p>
                                                <p className="font-bold">{selectedPollination.name || selectedPollination.first_name}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Contact</p>
                                                <p className="text-xs">{selectedPollination.email}</p>
                                                <p className="text-xs font-mono">{selectedPollination.phone}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Crop</p>
                                                <Badge variant="secondary">{selectedPollination.crop_type || selectedPollination.crop}</Badge>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Size</p>
                                                <p className="font-bold">{selectedPollination.farm_size || selectedPollination.acreage} Acres</p>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Location</p>
                                            <p className="font-medium">{selectedPollination.location || selectedPollination.county}</p>
                                        </div>
                                        <div className="space-y-1 pt-2 border-t border-border/10">
                                            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Additional Notes</p>
                                            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-xl italic">
                                                "{selectedPollination.notes || selectedPollination.message || 'No additional notes provided.'}"
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </DialogContent>
                        </Dialog>
                    </TabsContent>

                    {/* --- CONTACT REQUESTS TAB --- */}
                    <TabsContent value="contact" className="space-y-6">
                        <Card className="bg-[#09090b] border-[#1e1e1e] rounded-2xl overflow-hidden">
                            <CardHeader className="border-b border-[#1e1e1e] bg-[#1e1e1e]/30">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="text-2xl font-black">Contact Submissions</CardTitle>
                                        <CardDescription>Messages received through the contact form.</CardDescription>
                                    </div>
                                    <Badge className="bg-amber-500/10 text-amber-600 border-amber-200 px-4 py-1.5 rounded-xl font-black text-[10px]">
                                        {contacts.length} MESSAGES
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-[#1e1e1e] bg-[#1e1e1e]/20">
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Name</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Email</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Subject</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest max-w-md">Message</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Date</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Status</TableHead>
                                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {contacts.length === 0 ? (
                                                <TableRow><TableCell colSpan={7} className="text-center h-48 text-muted-foreground font-medium">No contact messages yet.</TableCell></TableRow>
                                            ) : (
                                                contacts.map((contact) => (
                                                    <TableRow key={contact.id} className="hover:bg-muted/20 transition-colors border-border/10">
                                                        <TableCell className="px-6 font-semibold">{contact.name || `${contact.first_name} ${contact.last_name}`}</TableCell>
                                                        <TableCell className="px-6 text-sm">{contact.email}</TableCell>
                                                        <TableCell className="px-6"><Badge variant="outline" className="rounded-xl">{contact.subject || 'General'}</Badge></TableCell>
                                                        <TableCell className="px-6 text-sm text-muted-foreground max-w-md truncate">{contact.message}</TableCell>
                                                        <TableCell className="px-6 text-xs font-mono">{new Date(contact.created_at).toLocaleDateString()}</TableCell>
                                                        <TableCell className="px-6">
                                                            <Select defaultValue={contact.status || 'new'} onValueChange={(val) => adminService.updateContactRequestStatus(contact.id, val).then(() => { toast.success('Status updated'); loadAllData(); })}>
                                                                <SelectTrigger className="h-8 w-[100px] rounded-xl text-[10px] font-black uppercase"><SelectValue /></SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="new">New</SelectItem>
                                                                    <SelectItem value="read">Read</SelectItem>
                                                                    <SelectItem value="replied">Replied</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </TableCell>
                                                        <TableCell className="px-6 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button size="icon" variant="outline" className="rounded-xl w-8 h-8 border-border/50 hover:bg-primary/10 hover:text-primary" onClick={() => handleViewContact(contact)}>
                                                                    <Search className="h-4 w-4" />
                                                                </Button>
                                                                <Button size="icon" variant="outline" className="rounded-xl w-8 h-8 border-border/50 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteContact(contact.id)}>
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
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

                        {/* Contact Details Dialog */}
                        <Dialog open={isContactDetailsOpen} onOpenChange={setIsContactDetailsOpen}>
                            <DialogContent className="rounded-3xl border-none shadow-2xl glass sm:max-w-xl max-h-[85vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black flex gap-2 items-center">
                                        <MessageSquare className="w-6 h-6 text-primary" /> Message Details
                                    </DialogTitle>
                                </DialogHeader>
                                {selectedContact && (
                                    <div className="space-y-6">
                                        {/* Header Section */}
                                        <div className="flex justify-between items-start border-b border-border/10 pb-4">
                                            <div>
                                                <p className="font-bold text-lg">{selectedContact.name || `${selectedContact.first_name} ${selectedContact.last_name}`}</p>
                                                <div className="flex flex-col gap-0.5 mt-1">
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Mail className="w-3 h-3" /> {selectedContact.email}
                                                    </div>
                                                    {selectedContact.phone && (
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <Phone className="w-3 h-3" /> {selectedContact.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="outline" className="mb-2">{new Date(selectedContact.created_at).toLocaleDateString()}</Badge>
                                                <div className="flex justify-end">
                                                    <Badge className="bg-primary/10 text-primary border-none uppercase text-[10px] tracking-wider">
                                                        {selectedContact.inquiry_type || 'General'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Location & Context */}
                                        <div className="grid grid-cols-2 gap-4">
                                            {(selectedContact.city || selectedContact.state || selectedContact.country) && (
                                                <div className="space-y-1">
                                                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Location</p>
                                                    <p className="text-sm font-medium">
                                                        {[selectedContact.city, selectedContact.state, selectedContact.country].filter(Boolean).join(', ')}
                                                    </p>
                                                </div>
                                            )}
                                            {selectedContact.company && (
                                                <div className="space-y-1">
                                                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Company</p>
                                                    <p className="text-sm font-medium">{selectedContact.company}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Grower Specifics */}
                                        {(selectedContact.farm_name || selectedContact.crop_type) && (
                                            <div className="bg-muted/30 p-3 rounded-xl space-y-3">
                                                <p className="text-[10px] uppercase font-black tracking-widest text-primary flex items-center gap-2">
                                                    <Leaf className="w-3 h-3" /> Farm Details
                                                </p>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    {selectedContact.farm_name && (
                                                        <div><span className="text-muted-foreground text-xs block">Farm Name</span>{selectedContact.farm_name}</div>
                                                    )}
                                                    {selectedContact.crop_type && (
                                                        <div><span className="text-muted-foreground text-xs block">Crop</span>{selectedContact.crop_type}</div>
                                                    )}
                                                    {selectedContact.acres && (
                                                        <div><span className="text-muted-foreground text-xs block">Size</span>{selectedContact.acres} Acres</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Beekeeper Specifics */}
                                        {(selectedContact.apiary_name || selectedContact.hive_count) && (
                                            <div className="bg-muted/30 p-3 rounded-xl space-y-3">
                                                <p className="text-[10px] uppercase font-black tracking-widest text-primary flex items-center gap-2">
                                                    <Database className="w-3 h-3" /> Apiary Details
                                                </p>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    {selectedContact.apiary_name && (
                                                        <div><span className="text-muted-foreground text-xs block">Apiary Name</span>{selectedContact.apiary_name}</div>
                                                    )}
                                                    {selectedContact.hive_count && (
                                                        <div><span className="text-muted-foreground text-xs block">Hive Count</span>{selectedContact.hive_count}</div>
                                                    )}
                                                    {selectedContact.experience_years && (
                                                        <div><span className="text-muted-foreground text-xs block">Experience</span>{selectedContact.experience_years} Years</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Message Body */}
                                        <div className="space-y-2">
                                            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                                                {selectedContact.topic || selectedContact.subject || 'Message'}
                                            </p>
                                            <div className="bg-muted/20 p-4 rounded-xl border border-border/50">
                                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedContact.message}</p>
                                            </div>
                                        </div>

                                        <div className="pt-2 flex justify-end">
                                            <Button variant="outline" className="rounded-full text-xs font-bold" onClick={() => window.open(`mailto:${selectedContact.email}`)}>
                                                <Mail className="w-3 h-3 mr-2" /> Reply via Email
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </DialogContent>
                        </Dialog>
                    </TabsContent>

                    {/* --- NEWSLETTER TAB --- */}
                    <TabsContent value="newsletter" className="space-y-6">
                        <Card className="border-none shadow-2xl glass bg-white/50 dark:bg-black/20 rounded-3xl overflow-hidden">
                            <CardHeader className="bg-muted/30 border-b border-border/10">
                                <CardTitle className="text-2xl font-black">Newsletter Subscribers</CardTitle>
                                <CardDescription>All email subscribers to the BeeYield newsletter.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/20 border-border/10">
                                            <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Email</TableHead>
                                            <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Name</TableHead>
                                            <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest">Subscribed On</TableHead>
                                            <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {subscribers.length === 0 ? (
                                            <TableRow><TableCell colSpan={4} className="text-center h-48 text-muted-foreground font-medium">No subscribers yet.</TableCell></TableRow>
                                        ) : (
                                            subscribers.map((sub) => (
                                                <TableRow key={sub.id} className="hover:bg-muted/20 transition-colors border-border/10">
                                                    <TableCell className="px-6 font-semibold">{sub.email}</TableCell>
                                                    <TableCell className="px-6 font-medium text-muted-foreground">{sub.first_name || 'Anonymous'}</TableCell>
                                                    <TableCell className="px-6 text-xs font-mono">{new Date(sub.created_at).toLocaleString()}</TableCell>
                                                    <TableCell className="px-6 text-right">
                                                        <Button size="icon" variant="outline" className="rounded-full w-8 h-8 border-border/50 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteSubscriber(sub.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs >
            </div >
        </DashboardLayout >
    );
};

const TooltipWrapper = ({ children, text }: { children: React.ReactNode, text: string }) => (
    <div title={text} className="cursor-help">{children}</div>
);

export default AdminDashboard;
