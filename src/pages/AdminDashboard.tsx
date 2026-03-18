import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    adminService,
    HoneyBatchInput,
    ProductInput,
    ApiaryInput,
    HiveInput,
    FarmerInput
} from '@/services/adminService';
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
    LogOut, Search, MapPin, Eye, Phone, Leaf, Building2, Share2, CreditCard, FileText, Maximize2, Minus,
    Briefcase, Globe
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminLayout from '@/components/admin/AdminLayout';
import AdminMetricCard from '@/components/admin/AdminMetricCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { ActivityLogTab } from '@/components/admin/tabs/ActivityLogTab';
import { TracingHistoryTab } from '@/components/admin/tabs/TracingHistoryTab';
import { DocumentsRegistryTab } from '@/components/admin/tabs/DocumentsRegistryTab';
import { PaymentsTab } from '@/components/admin/tabs/PaymentsTab';
import { AccountsTab } from '@/components/admin/tabs/AccountsTab';
import { InvoicesTab } from '@/components/admin/tabs/InvoicesTab';
import { RecruitmentTab } from '@/components/admin/tabs/RecruitmentTab';
import { Container, Grid, Col, Section } from '@/components/ui/layout';
import ContentDashboard from '@/components/beeyield/ContentDashboard';
import { SUPER_ADMIN_EMAIL } from '@/config/constants';
import { BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';

const AdminDashboard: React.FC = () => {
    const { user, loading: authLoading, signOut } = useAuth();
    const navigate = useNavigate();

    // Role check
    const userRole = user?.user_metadata?.role || 'user';
    const isSuperAdminEmail = [SUPER_ADMIN_EMAIL].includes(user?.email?.toLowerCase() || '');
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
    const [batchForm, setBatchForm] = useState<HoneyBatchInput>({
        honey_type: '', harvest_date: '', packaged_date: '', quantity_kg: 0, processing_method: 'Raw Filtered',
        farmer_name: '', farmer_phone: '', location_county: '', apiary_name: '',
        beekeeper_name: '', beekeeper_id: '', location_region: '', latitude: 0, longitude: 0,
        quality_grade: 'A', moisture_content: 0, color_grade: '', status: 'verified'
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
    const [farmerForm, setFarmerForm] = useState<FarmerInput>({
        name: '', phone: '', email: '', id_number: '', experience_years: 0,
        story: '', latitude: -1.286389, longitude: 36.817223, location_name: '',
        region: '', county: '', ward: '', certification_status: 'Pending', status: 'active'
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
        totalAcres: 0,
        totalUsers: 0,
        totalApiaries: 0,
        totalHives: 0,
        totalFarmers: 0,
        categoryCounts: {
            honey: 0,
            learn: 0,
            sensors: 0,
            merch: 0
        }
    });

    const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set());

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
            navigate('/ceba/login');
        } else if (!authLoading && user && isAdmin) {
            initDashboard();
        }
    }, [user, authLoading, navigate, isAdmin]);

    useEffect(() => {
        if (isAdmin && activeTab !== 'overview' && !loadedTabs.has(activeTab)) {
            loadTabData(activeTab);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, isAdmin, loadedTabs]);

    const initDashboard = async () => {
        setIsLoading(true);
        try {
            // AUTOMATIC DEEP SYNC: Guaranteed data freshness on entry
            await Promise.allSettled([
                adminService.syncAll()
            ]);

            // Also preload orders, products, and batches for Overview tab logic
            const [ordersData, productsData, batchesData] = await Promise.all([
                adminService.getOrders(),
                adminService.getProducts(),
                adminService.getBatches()
            ]);
            setOrders(ordersData);
            setProducts(productsData);
            setBatches(batchesData.reverse());

            const stats = await adminService.getDashboardStats();
            if (stats) {
                setDashboardStats({
                    totalRevenue: stats.total_revenue_kes || 0,
                    pendingOrders: stats.pending_orders || 0,
                    totalHoneyKg: stats.total_honey_kg || 0,
                    totalAcres: stats.total_acres || 0,
                    totalUsers: stats.total_users || 0,
                    totalApiaries: stats.total_apiaries || 0,
                    totalHives: stats.total_hives || 0,
                    totalFarmers: (stats as any).total_farmers || 0,
                    categoryCounts: (stats as any).category_counts || {
                        honey: 0, learn: 0, sensors: 0, merch: 0
                    }
                });
            }
            setLoadedTabs(prev => new Set(prev).add('overview'));
        } catch (error) {
            console.error("Failed to load initial stats:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadTabData = async (tab: string) => {
        // Individual tab loading logic
        try {
            // console.log(`[Admin] Loading data for tab: ${tab}`);
            switch (tab) {
                case 'orders': {
                    const ordersData = await adminService.getOrders();
                    setOrders(ordersData);
                    break;
                }
                case 'products': {
                    const [productsData, stockData] = await Promise.all([
                        adminService.getProducts(),
                        adminService.getStockMovements()
                    ]);
                    setProducts(productsData);
                    setStockMovements(stockData);
                    break;
                }
                case 'batches': {
                    const batchesData = await adminService.getBatches();
                    setBatches(batchesData.reverse());
                    break;
                }
                case 'farmers': {
                    const farmersData = await adminService.getFarmers();
                    setFarmers(farmersData);
                    break;
                }
                case 'apiaries':
                case 'hives': {
                    // These are interdependent, load both
                    const [apiariesData, hivesData] = await Promise.all([
                        adminService.getApiaries(),
                        adminService.getHives()
                    ]);
                    setApiaries(apiariesData);
                    setHives(hivesData);
                    // Also load farmers if they're needed for joins in UI
                    if (farmers.length === 0) {
                        const farmersData = await adminService.getFarmers();
                        setFarmers(farmersData);
                        setLoadedTabs(prev => new Set(prev).add('farmers'));
                    }
                    setLoadedTabs(prev => {
                        const next = new Set(prev);
                        next.add('apiaries');
                        next.add('hives');
                        return next;
                    });
                    break;
                }
                case 'pollination': {
                    const pollinationData = await adminService.getPollinationRequests();
                    setPollinationRequests(pollinationData);
                    break;
                }
                case 'contact': {
                    const contactData = await adminService.getContactRequests();
                    setContacts(contactData);
                    break;
                }
                case 'newsletter': {
                    const subscribersData = await adminService.getNewsletterSubscribers();
                    setSubscribers(subscribersData);
                    break;
                }
                case 'team': {
                    if (isSuperAdmin) {
                        const usersData = await adminService.getUsers();
                        setSystemUsers(usersData);
                    }
                    break;
                }
            }
            setLoadedTabs(prev => new Set(prev).add(tab));
        } catch (error) {
            console.error(`Failed to load data for tab ${tab}:`, error);
            toast.error(`Failed to load ${tab} data`);
        }
    };

    const loadAllData = async () => {
        setIsLoading(true);
        await initDashboard();
        // If we force a full refresh, clear loaded tabs and reload current
        setLoadedTabs(new Set(['overview']));
        if (activeTab !== 'overview') {
            await loadTabData(activeTab);
        }
        setIsLoading(false);
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

                // Log product deletion
                adminService.logActivity({
                    activity_type: 'inventory',
                    action: 'deleted',
                    entity_type: 'product',
                    entity_reference: id
                }).catch(() => { });

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

                // Log batch update
                adminService.logActivity({
                    activity_type: 'traceability',
                    action: 'updated',
                    entity_type: 'batch',
                    entity_reference: editingBatchId,
                    metadata: { honey_type: batchForm.honey_type }
                }).catch(() => { });

                toast.success("Batch record updated");
            } else {
                await adminService.createBatch(batchForm);

                // Log batch creation
                adminService.logActivity({
                    activity_type: 'traceability',
                    action: 'created',
                    entity_type: 'batch',
                    entity_reference: batchForm.apiary_name,
                    metadata: { honey_type: batchForm.honey_type }
                }).catch(() => { });

                toast.success("Batch record created");
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
        if (confirm("Permanently remove this batch history?")) {
            try {
                await adminService.deleteBatch(id);

                // Log batch deletion
                adminService.logActivity({
                    activity_type: 'traceability',
                    action: 'deleted',
                    entity_type: 'batch',
                    entity_reference: id
                }).catch(() => { });

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

            // Log order status update
            adminService.logActivity({
                activity_type: 'commerce',
                action: 'updated',
                entity_type: 'order_status',
                entity_reference: orderId,
                metadata: { new_status: newStatus }
            }).catch(() => { });

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

            // Log user role update
            adminService.logActivity({
                activity_type: 'account',
                action: 'updated',
                entity_type: 'user_role',
                entity_reference: userId,
                metadata: { new_role: newRole }
            }).catch(() => { });

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

                // Log user deletion
                adminService.logActivity({
                    activity_type: 'account',
                    action: 'deleted',
                    entity_type: 'user',
                    entity_reference: userId
                }).catch(() => { });

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

                // Log user update
                adminService.logActivity({
                    activity_type: 'account',
                    action: 'updated',
                    entity_type: 'user',
                    entity_reference: editingUser.id
                }).catch(() => { });

                toast.success("User updated successfully");
            } else {
                await adminService.createUser(userForm);

                // Log user creation
                adminService.logActivity({
                    activity_type: 'account',
                    action: 'created',
                    entity_type: 'user',
                    entity_reference: userForm.email
                }).catch(() => { });

                toast.success("New team member added");
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

                // Log farmer update
                adminService.logActivity({
                    activity_type: 'directory',
                    action: 'updated',
                    entity_type: 'farmer',
                    entity_reference: editingFarmer.id,
                    metadata: { name: farmerForm.name }
                }).catch(() => { });

                toast.success("Farmer profile updated");
            } else {
                await adminService.createFarmer(farmerForm);

                // Log farmer creation
                adminService.logActivity({
                    activity_type: 'directory',
                    action: 'created',
                    entity_type: 'farmer',
                    entity_reference: farmerForm.id_number,
                    metadata: { name: farmerForm.name }
                }).catch(() => { });

                toast.success("Farmer registration complete");
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
            toast.error(editingFarmer ? "Failed to update profile" : "Failed to register farmer");
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

                // Log farmer deletion
                adminService.logActivity({
                    activity_type: 'directory',
                    action: 'deleted',
                    entity_type: 'farmer',
                    entity_reference: id
                }).catch(() => { });

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

                // Log apiary update
                adminService.logActivity({
                    activity_type: 'directory',
                    action: 'updated',
                    entity_type: 'apiary',
                    entity_reference: editingApiary.id,
                    metadata: { name: apiaryForm.name }
                }).catch(() => { });

                toast.success("Apiary updated");
            } else {
                await adminService.createApiary(apiaryForm);

                // Log apiary creation
                adminService.logActivity({
                    activity_type: 'directory',
                    action: 'created',
                    entity_type: 'apiary',
                    entity_reference: apiaryForm.name
                }).catch(() => { });

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

                // Log apiary deletion
                adminService.logActivity({
                    activity_type: 'directory',
                    action: 'deleted',
                    entity_type: 'apiary',
                    entity_reference: id
                }).catch(() => { });

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

                // Log hive update
                adminService.logActivity({
                    activity_type: 'directory',
                    action: 'updated',
                    entity_type: 'hive',
                    entity_reference: editingHive.id,
                    metadata: { hive_code: hiveForm.hive_code }
                }).catch(() => { });

                toast.success("Hive record updated");
            } else {
                await adminService.createHive(hiveForm);

                // Log hive creation
                adminService.logActivity({
                    activity_type: 'directory',
                    action: 'created',
                    entity_type: 'hive',
                    entity_reference: hiveForm.hive_code
                }).catch(() => { });

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

                // Log hive deletion
                adminService.logActivity({
                    activity_type: 'directory',
                    action: 'deleted',
                    entity_type: 'hive',
                    entity_reference: id
                }).catch(() => { });

                toast.success("Hive decommissioned");
                loadAllData();
            } catch (error) {
                toast.error("Failed to decommission hive");
            }
        }
    };


    if (authLoading || isLoading) {
        return (
            <BeeYieldPageShell className="flex flex-col justify-center items-center h-screen bg-muted/10 space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-sm font-medium animate-pulse text-muted-foreground">Loading dashboard...</p>
            </BeeYieldPageShell>
        );
    }

    if (!isAdmin) {
        return (
            <BeeYieldPageShell className="flex flex-col justify-center items-center h-screen bg-muted/10 space-y-4">
                <Shield className="h-16 w-16 text-destructive animate-pulse" />
                <h2 className="text-2xl font-black">Restricted Access</h2>
                <p className="text-muted-foreground">You do not have permission to access administration pages.</p>
                <Button onClick={() => navigate('/')} className="rounded-xl px-8 shadow-lg">Return Home</Button>
            </BeeYieldPageShell>
        );
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-200"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
            case 'processing': return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200"><RefreshCw className="w-3 h-3 mr-1" /> Processing</Badge>;
            case 'shipped': return <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-200"><Package className="w-3 h-3 mr-1" /> Shipped</Badge>;
            case 'completed': return <Badge variant="outline" className="bg-[#1B9157] text-[#1B9157] border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</Badge>;
            case 'cancelled': return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200"><XCircle className="w-3 h-3 mr-1" /> Cancelled</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };



    const navItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            children: [
                { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                { id: 'activity', label: 'Activity Log', icon: History },
                { id: 'tracing', label: 'History', icon: Search },
            ]
        },
        {
            id: 'commerce',
            label: 'Commerce',
            icon: ShoppingBag,
            children: [
                { id: 'orders', label: 'Orders', icon: Package },
                { id: 'invoices', label: 'Invoices', icon: FileText },
                { id: 'payments', label: 'Payments', icon: CreditCard },
                { id: 'products', label: 'Shop', icon: ShoppingBag },
            ]
        },
        {
            id: 'directory',
            label: 'Directory',
            icon: Database,
            children: [
                { id: 'farmers', label: 'Farmers', icon: Users },
                { id: 'apiaries', label: 'Apiaries', icon: MapPin },
                { id: 'hives', label: 'Hives', icon: Leaf },
                { id: 'accounts', label: 'User Accounts', icon: Users },
            ]
        },
        {
            id: 'content',
            label: 'Content',
            icon: MessageSquare,
            children: [
                { id: 'pollination', label: 'Pollination', icon: Bug },
                { id: 'contact', label: 'Contact', icon: MessageSquare },
                { id: 'newsletter', label: 'Newsletter', icon: Mail },
                { id: 'documents', label: 'Documents', icon: FileText },
            ]
        },
        {
            id: 'recruitment',
            label: 'Recruitment',
            icon: Briefcase,
            children: [
                { id: 'recruitment', label: 'Job Board', icon: Briefcase },
                { id: 'recruitment', label: 'Applications', icon: Users },
            ]
        },
        { id: 'batches', label: 'History', icon: Database },
        ...(isSuperAdmin ? [{ id: 'team', label: 'Team', icon: Shield }] : [])
    ];

    return (
        <BeeYieldPageShell className="p-0">
            <AdminLayout
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onLogout={signOut}
                navItems={navItems}
            >
            <div className="space-y-8 animate-in fade-in duration-700">
                {/* Header Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-beeyield-green tracking-tightest">Admin <span className="text-beeyield-gold italic">Dashboard</span></h1>
                        <p className="text-beeyield-green/40 font-black text-[10px] mt-2">Management Console</p>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-10">
                    {/* Hide original TabsList as we use Sidebar */}
                    <div className="hidden">
                        <TabsList>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="orders">Orders</TabsTrigger>
                            <TabsTrigger value="products">Shop</TabsTrigger>
                            <TabsTrigger value="batches">History</TabsTrigger>
                            <TabsTrigger value="farmers">Farmers</TabsTrigger>
                            <TabsTrigger value="apiaries">Apiaries</TabsTrigger>
                            <TabsTrigger value="hives">Hives</TabsTrigger>
                            <TabsTrigger value="pollination">Pollination</TabsTrigger>
                            <TabsTrigger value="contact">Contact</TabsTrigger>
                            <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
                            {isSuperAdmin && <TabsTrigger value="team">Team</TabsTrigger>}
                        </TabsList>
                    </div>

                    {/* Announcement Banner */}
                    <div className="bg-gradient-to-r from-beeyield-gold to-beeyield-orange rounded-[20px] px-6 py-3.5 flex items-center justify-between text-beeyield-green text-sm mb-4 shadow-lg shadow-beeyield-gold/20">
                        <div className="flex items-center gap-3">
                            <span className="text-xl">🐝</span>
                            <span className="font-bold tracking-tight">Welcome to the new BeeYield dashboard. Updates are rolling out now.</span>
                        </div>
                        <button className="text-beeyield-green/60 hover:text-beeyield-green transition-colors">✕</button>
                    </div>

                    <TabsContent value="overview" className="space-y-10">
                        {/* Row 1: General Report + Visitors + Users By Age */}
                        <Grid cols={12} gap="lg">
                            {/* General Report Section */}
                            <Col span={4} className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-black text-beeyield-green/30">Overview</h3>
                                    <select aria-label="Report period" className="text-[10px] font-black bg-beeyield-green/5 border-none rounded-full px-4 py-2 text-beeyield-green outline-none focus:ring-2 focus:ring-beeyield-gold/20">
                                        <option>Daily</option>
                                        <option>Weekly</option>
                                        <option>Monthly</option>
                                    </select>
                                </div>

                                {/* Stats Card */}
                                <AdminMetricCard
                                    title="Total Orders"
                                    value={(dashboardStats as any).total_orders || orders.length}
                                    icon={CreditCard}
                                    description={`${dashboardStats.pendingOrders} processing`}
                                    className="h-auto"
                                />

                                <AdminMetricCard
                                    title="Total Revenue"
                                    value={`KES ${dashboardStats.totalRevenue.toLocaleString()}`}
                                    icon={CreditCard}
                                    description="All time revenue"
                                    className="h-auto"
                                />

                                <div className="flex gap-3">
                                    <div className="flex-1 bg-[#FFF9F0] border border-beeyield-green/5 rounded-[24px] p-5 shadow-sm shadow-beeyield-green/5">
                                        <p className="text-[9px] font-black text-beeyield-green/20">Gross Revenue</p>
                                        <p className="text-md font-black text-beeyield-green mt-1">KES {dashboardStats.totalRevenue.toLocaleString()}</p>
                                    </div>
                                    <div className="flex-1 bg-[#FFF9F0] border border-beeyield-green/5 rounded-[24px] p-5 shadow-sm shadow-beeyield-green/5">
                                        <p className="text-[9px] font-black text-beeyield-green/20">Net Profit</p>
                                        <p className="text-md font-black text-beeyield-green mt-1">KES {Math.round(dashboardStats.totalRevenue * 0.65).toLocaleString()}</p>
                                    </div>
                                </div>

                                <Button onClick={loadAllData} className="w-full h-14 rounded-[24px] shadow-xl shadow-beeyield-gold/20">
                                    <RefreshCw className="w-4 h-4 mr-2" /> Refresh Data
                                </Button>
                            </Col>

                            {/* Visitors Section */}
                            <Col span={4} className="space-y-6">
                                <h3 className="text-xs font-black text-beeyield-green/30">Platform Metrics</h3>

                                <Card className="bg-[#FFF9F0] border-beeyield-green/5 rounded-[32px] p-8 shadow-2xl shadow-beeyield-green/[0.02] border-none">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <p className="text-[10px] font-black text-beeyield-green/30">Total Users</p>
                                            <p className="text-5xl font-black text-beeyield-green tracking-tighter mt-1">{dashboardStats.totalUsers}</p>
                                        </div>
                                        {/* Hz Sync removed */}
                                    </div>

                                    {/* Mini Chart */}
                                    <div className="h-20 w-full mb-6">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={[
                                                { t: '1', v: 50 }, { t: '2', v: 80 }, { t: '3', v: 60 },
                                                { t: '4', v: 90 }, { t: '5', v: 70 }, { t: '6', v: 100 },
                                                { t: '7', v: 85 }
                                            ]}>
                                                <defs>
                                                    <linearGradient id="visitorsGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#F4D03F" stopOpacity={0.4} />
                                                        <stop offset="95%" stopColor="#F4D03F" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <Area type="monotone" dataKey="v" stroke="#F4D03F" fill="url(#visitorsGrad)" strokeWidth={3} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-muted-foreground">System Health</p>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Apiaries Connected</span>
                                            <span className="font-medium text-[#1B9157]">{dashboardStats.totalApiaries}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Active Hives</span>
                                            <span className="font-medium text-[#F4D03F]">{dashboardStats.totalHives}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Total Honey</span>
                                            <span className="font-medium text-blue-500">{dashboardStats.totalHoneyKg} kg</span>
                                        </div>
                                    </div>
                                    <Button variant="link" className="text-[#F4D03F] text-xs p-0 h-auto mt-2">
                                        Real-Time Report →
                                    </Button>
                                </Card>
                            </Col>

                            {/* Platform Audience Section */}
                            <Col span={4} className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-foreground">Platform Audience</h3>
                                    <span className="text-xs text-muted-foreground">Show More</span>
                                </div>

                                <Card className="bg-card border-border rounded-2xl p-5 shadow-sm">
                                    <div className="flex gap-2 mb-4">
                                        <Button size="sm" className="rounded-full bg-[#F4D03F] text-[#1A1A1A] text-xs px-4 h-7">Active</Button>
                                        <Button size="sm" variant="outline" className="rounded-full text-xs px-4 h-7">Inactive</Button>
                                    </div>

                                    {/* Donut Chart */}
                                    <div className="relative w-36 h-36 mx-auto mb-4">
                                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                            {/* Background circle */}
                                            <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="12" className="dark:stroke-gray-700" />
                                            {/* Amber segment - 60% */}
                                            <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="12"
                                                strokeDasharray="150.8 251.2" strokeLinecap="round" />
                                            {/* Green segment - 25% */}
                                            <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="12"
                                                strokeDasharray="62.8 251.2" strokeDashoffset="-150.8" strokeLinecap="round" />
                                            {/* Gray segment - 15% */}
                                            <circle cx="50" cy="50" r="40" fill="none" stroke="#94a3b8" strokeWidth="12"
                                                strokeDasharray="37.7 251.2" strokeDashoffset="-213.6" strokeLinecap="round" />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-2xl font-bold">{dashboardStats.totalUsers}</span>
                                            <span className="text-[10px] text-muted-foreground">Active Users</span>
                                        </div>
                                    </div>

                                    {/* Legend */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-[#F4D03F]"></div>
                                                <span className="text-muted-foreground">Verified Farmers</span>
                                            </div>
                                            <span className="font-medium">{dashboardStats.totalFarmers}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                <span className="text-muted-foreground">Subscribers</span>
                                            </div>
                                            <span className="font-medium">{subscribers.length}</span>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        </Grid>

                        {/* Row 2: Map + Weekly Best Sellers */}
                        <Grid cols={12} gap="lg">
                            {/* Map Section */}
                            <Col span={8}>
                                <Card className="bg-card border-border rounded-2xl overflow-hidden shadow-sm h-full flex flex-col">
                                    <div className="p-4 border-b border-border bg-card z-10">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-bold">Official Store</h3>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" className="rounded-lg text-xs h-8 gap-2 bg-[#FFF9F0]">
                                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Filter by city
                                                </Button>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">{dashboardStats.totalApiaries || 0} Apiaries actively managed across Kenya.</p>
                                    </div>

                                    {/* Interactive Map Styles */}
                                    <div className="flex-1 relative bg-[#F4D03F]/10 min-h-[350px]">
                                        {/* Map Controls */}
                                        <div className="absolute top-4 left-4 z-10 flex bg-[#FFF9F0] rounded-lg shadow-sm border border-[#F4D03F]/20 overflow-hidden">
                                            <button className="px-3 py-1.5 text-xs font-medium hover:bg-[#F9F7F2] border-r border-[#F4D03F]/20">Map</button>
                                            <button className="px-3 py-1.5 text-xs font-medium hover:bg-[#F9F7F2] text-muted-foreground">Satellite</button>
                                        </div>

                                        <div className="absolute top-4 right-4 z-10 bg-[#FFF9F0] rounded-lg p-1.5 shadow-sm border border-[#F4D03F]/20 hover:bg-[#F9F7F2] cursor-pointer">
                                            <Maximize2 className="w-4 h-4 text-gray-500" />
                                        </div>

                                        <div className="absolute bottom-8 left-4 z-10 flex flex-col bg-[#FFF9F0] rounded-lg shadow-sm border border-[#F4D03F]/20 overflow-hidden">
                                            <button aria-label="Zoom in" className="p-1.5 hover:bg-[#F9F7F2] border-b border-[#F4D03F]/20"><Plus className="w-4 h-4 text-gray-600" /></button>
                                            <button aria-label="Zoom out" className="p-1.5 hover:bg-[#F9F7F2]"><Minus className="w-4 h-4 text-gray-600" /></button>
                                        </div>

                                        {/* Map Background Pattern */}
                                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]"></div>

                                        {/* Dynamic Map Markers */}
                                        {apiaries.slice(0, 10).map((apiary, idx) => {
                                            // Simple pseudo-random positioning if no lat/long, or use real if available
                                            // Focusing on Kenya region
                                            const left = apiary.longitude ? ((apiary.longitude - 34) / 8) * 100 : (20 + (idx * 15) % 60);
                                            const top = apiary.latitude ? ((1 - (apiary.latitude + 4) / 10)) * 100 : (30 + (idx * 20) % 50);

                                            return (
                                                <div
                                                    key={apiary.id}
                                                    className="absolute group cursor-pointer"
                                                    style={{
                                                        left: `${Math.max(5, Math.min(95, left))}%`,
                                                        top: `${Math.max(5, Math.min(95, top))}%`,
                                                        transform: 'translate(-50%, -50%)'
                                                    }}
                                                >
                                                    <div className="w-6 h-6 bg-[#F4D03F] rounded-full flex items-center justify-center animate-pulse absolute"></div>
                                                    <div className="relative w-6 h-6">
                                                        <div className="w-6 h-6 bg-amber-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-[#1A1A1A] font-bold text-[10px]">
                                                            {idx + 1}
                                                        </div>
                                                    </div>
                                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-[#FFF9F0] px-2 py-0.5 rounded shadow-lg text-[10px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
                                                        {apiary.name}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {apiaries.length === 0 && (
                                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm font-medium">
                                                No apiaries registered yet
                                            </div>
                                        )}

                                        {/* Watermark */}
                                        <div className="absolute bottom-1 left-2 text-[10px] text-gray-400 font-sans">Google</div>
                                    </div>
                                </Card>
                            </Col>

                            {/* Weekly Best Sellers */}
                            <Col span={4}>
                                <Card className="bg-card border-border rounded-2xl p-5 shadow-sm h-full flex flex-col">
                                    <h3 className="text-lg font-bold mb-6">Weekly Best Sellers</h3>

                                    <div className="space-y-6 flex-1">
                                        <div className="flex flex-col items-center justify-center h-full text-center py-8">
                                            <TrendingUp className="w-12 h-12 text-muted-foreground/30 mb-4" />
                                            <p className="text-sm font-medium text-muted-foreground">Sales analysis pending</p>
                                            <p className="text-[10px] text-muted-foreground/60">Best seller metrics will appear after order threshold is met.</p>
                                        </div>
                                    </div>

                                    <Button variant="secondary" className="w-full mt-4 bg-[#F4D03F]/10 hover:bg-gray-200 text-gray-600 text-xs font-medium h-9 rounded-xl">
                                        View More
                                    </Button>
                                </Card>
                            </Col>
                        </Grid>

                        {/* Row 3: Promotional Banners */}
                        <Grid cols={2} gap="lg">
                            {/* Activity Overview Summary */}
                            <Col span={1}>
                                <Card className="bg-amber-600 rounded-2xl p-6 text-[#1A1A1A] relative overflow-hidden flex flex-col justify-center h-48">
                                    <div className="relative z-10 max-w-xs">
                                        <h3 className="text-lg font-bold mb-1 leading-tight">Farmer Network Expansion</h3>
                                        <p className="text-[#F4D03F] text-xs mb-4">Monitor and support our master beekeepers.</p>
                                        <Button onClick={() => setActiveTab('farmers')} size="sm" className="bg-[#FFF9F0] text-[#F4D03F] hover:bg-amber-50 rounded-lg font-bold text-xs h-8 px-4">
                                            Manage Farmers
                                        </Button>
                                    </div>
                                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                        <Users className="w-24 h-24 text-[#F4D03F]/30" />
                                    </div>
                                </Card>
                            </Col>
                            <Col span={1}>

                                <Card className="bg-indigo-600 rounded-2xl p-6 text-[#1A1A1A] relative overflow-hidden flex flex-col justify-center h-48">
                                    <div className="relative z-10 max-w-xs">
                                        <h3 className="text-lg font-bold mb-1 leading-tight">Log</h3>
                                        <p className="text-indigo-100 text-xs mb-4">View honey batch records.</p>
                                        <Button onClick={() => setActiveTab('batches')} size="sm" className="bg-[#FFF9F0] text-indigo-600 hover:bg-indigo-50 rounded-lg font-bold text-xs h-8 px-4">
                                            View batches
                                        </Button>
                                    </div>
                                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                        <Database className="w-24 h-24 text-indigo-400/30" />
                                    </div>
                                </Card>
                            </Col>
                        </Grid>

                        {/* Row 4: Weekly Top Products Table */}
                        <Card className="bg-card border-border rounded-2xl shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-border flex items-center justify-between">
                                <h3 className="text-lg font-bold">Weekly Top Products</h3>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" className="rounded-lg text-xs h-8 gap-2">
                                        <Package className="w-3 h-3" /> Export to Excel
                                    </Button>
                                    <Button size="sm" variant="outline" className="rounded-lg text-xs h-8 gap-2">
                                        <FileText className="w-3 h-3" /> Export to PDF
                                    </Button>
                                </div>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30">
                                        <TableHead className="font-bold text-xs">Images</TableHead>
                                        <TableHead className="font-bold text-xs">Product Name</TableHead>
                                        <TableHead className="font-bold text-xs text-right">Stock</TableHead>
                                        <TableHead className="font-bold text-xs">Status</TableHead>
                                        <TableHead className="font-bold text-xs text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.length > 0 ? products.slice(0, 5).map((product, i) => (
                                        <TableRow key={product.id || i} className="hover:bg-muted/10 border-b border-border/50">
                                            <TableCell className="py-3">
                                                <div className="w-10 h-10 rounded-lg bg-[#F4D03F]/10 overflow-hidden border border-border">
                                                    {product.images?.[0] ? (
                                                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-amber-50">
                                                            <Package className="w-5 h-5 text-[#F4D03F]" />
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <p className="font-bold text-sm text-foreground">{product.name}</p>
                                                <p className="text-[11px] text-muted-foreground">{product.category}</p>
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-sm">{product.variants?.[0]?.stock_quantity ?? 0}</TableCell>
                                            <TableCell>
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded text-[10px] font-bold border flex items-center w-fit gap-1",
                                                    (product.variants?.[0]?.stock_quantity || 0) > 10
                                                        ? "text-[#1B9157] border-green-200 bg-green-50"
                                                        : "text-red-500 border-red-200 bg-red-50"
                                                )}>
                                                    {(product.variants?.[0]?.stock_quantity || 0) > 10 ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                    {(product.variants?.[0]?.stock_quantity || 0) > 10 ? 'Active' : 'Inactive'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button className="text-gray-400 hover:text-[#F4D03F] flex items-center gap-1 text-[11px] font-medium transition-colors">
                                                        <Edit className="w-3.5 h-3.5" /> Edit
                                                    </button>
                                                    <button className="text-gray-400 hover:text-red-500 flex items-center gap-1 text-[11px] font-medium transition-colors">
                                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-20 text-muted-foreground font-medium">
                                                No products found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            <div className="p-4 border-t border-border flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Button size="sm" variant="outline" className="w-8 h-8 rounded-lg">&lt;</Button>
                                    <Button size="sm" className="w-8 h-8 rounded-lg bg-[#F4D03F] text-[#1A1A1A]">1</Button>
                                    <Button size="sm" variant="outline" className="w-8 h-8 rounded-lg">2</Button>
                                    <Button size="sm" variant="outline" className="w-8 h-8 rounded-lg">3</Button>
                                    <Button size="sm" variant="outline" className="w-8 h-8 rounded-lg">&gt;</Button>
                                </div>
                                <select aria-label="Rows per page" className="text-xs bg-transparent border border-border rounded-lg px-3 py-1.5">
                                    <option>10 per page</option>
                                    <option>25 per page</option>
                                    <option>50 per page</option>
                                </select>
                            </div>
                        </Card>

                        {/* Row 5: Important Notes */}
                        <Card className="bg-card border-border rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold">Important Notes</h3>
                                <div className="flex gap-2">
                                    <Button size="icon" variant="outline" className="w-8 h-8 rounded-lg">
                                        <ChevronRight className="w-4 h-4 rotate-180" />
                                    </Button>
                                    <Button size="icon" variant="outline" className="w-8 h-8 rounded-lg">
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="bg-muted/30 rounded-xl p-4">
                                <h4 className="font-bold text-sm mb-1">Welcome to BeeYield Admin Dashboard</h4>
                                <p className="text-[10px] text-muted-foreground mb-2">24 hours ago</p>
                                <p className="text-sm text-muted-foreground">
                                    This dashboard gives you a complete overview of your beekeeping network metrics.
                                    Monitor honey production, track farmer performance, and manage your product inventory all in one place.
                                </p>
                                <Button variant="link" className="text-[#F4D03F] text-xs p-0 h-auto mt-2">
                                    View Notes →
                                </Button>
                            </div>
                        </Card>

                        {/* Row 6: Bottom Widgets - Schedules, Recent Activities, Transactions */}
                        <Grid cols={12} gap="lg">
                            {/* Schedules / Calendar */}
                            <Col span={4}><Card className="bg-card border-border rounded-2xl p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold">Schedules</h3>
                                    <Button size="sm" variant="outline" className="rounded-lg text-xs h-7 gap-1">
                                        <Plus className="w-3 h-3" /> Add New Schedules
                                    </Button>
                                </div>

                                {/* Simple Calendar */}
                                <div className="grid grid-cols-7 gap-1 text-center text-xs mb-4">
                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                        <div key={d} className="font-medium text-muted-foreground py-1">{d}</div>
                                    ))}
                                    {Array.from({ length: 35 }, (_, i) => {
                                        const day = i - 3;
                                        const isCurrentMonth = day >= 1 && day <= 30;
                                        const isToday = day === 16;
                                        const hasEvent = [7, 8, 9, 10, 23, 24].includes(day);
                                        return (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "py-1.5 rounded-lg",
                                                    !isCurrentMonth && "text-muted-foreground/30",
                                                    isToday && "bg-[#F4D03F] text-[#1A1A1A] font-bold",
                                                    hasEvent && !isToday && "bg-amber-100 text-[#F4D03F] font-medium"
                                                )}
                                            >
                                                {isCurrentMonth ? day : day <= 0 ? 30 + day : day - 30}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Schedule Items Placeholder */}
                                <div className="flex flex-col items-center justify-center h-48 text-center bg-muted/20 rounded-xl">
                                    <Clock className="w-8 h-8 text-muted-foreground/30 mb-2" />
                                    <p className="text-xs font-medium text-muted-foreground">No upcoming inspections</p>
                                </div>
                            </Card></Col>

                            {/* Recent Activities */}
                            <Col span={4}><Card className="bg-card border-border rounded-2xl p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold">Recent Activities</h3>
                                    <Button variant="link" className="text-[#F4D03F] text-xs p-0 h-auto">Show More</Button>
                                </div>

                                <div className="space-y-4">
                                    {orders.slice(0, 4).map((order, i) => (
                                        <div key={order.id || i} className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[#F4D03F] flex items-center justify-center text-[#1A1A1A] text-xs font-bold">
                                                O
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">Order {order.order_number || order.id.slice(0, 8)}</p>
                                                <p className="text-[10px] text-muted-foreground">Status: {order.status}</p>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">{new Date(order.created_at).toLocaleDateString()}</span>
                                        </div>
                                    ))}
                                    {batches.slice(0, 2).map((batch, i) => (
                                        <div key={batch.id || i} className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-[#1A1A1A] text-xs font-bold">
                                                B
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">Batch {batch.batch_code}</p>
                                                <p className="text-[10px] text-muted-foreground">{batch.honey_type}</p>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">{new Date(batch.created_at || Date.now()).toLocaleDateString()}</span>
                                        </div>
                                    ))}
                                    {orders.length === 0 && batches.length === 0 && (
                                        <p className="text-xs text-muted-foreground text-center py-10">No recent activity</p>
                                    )}
                                </div>
                            </Card></Col>

                            {/* Transactions */}
                            <Col span={4}><Card className="bg-card border-border rounded-2xl p-5 shadow-sm">
                                <h3 className="font-bold mb-4">Transactions</h3>

                                <div className="space-y-4">
                                    {orders.slice(0, 4).map((order, i) => (
                                        <div key={order.id || i} className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-[#1A1A1A] text-xs font-bold">
                                                {order.shipping_address?.first_name?.charAt(0) || 'U'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {order.shipping_address?.first_name || 'Customer'} {order.shipping_address?.last_name || ''}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span className={cn(
                                                "text-xs font-bold",
                                                order.status === 'completed' ? "text-[#1B9157]" : "text-[#F4D03F]"
                                            )}>
                                                +KES {order.total_amount?.toLocaleString() || '0'}
                                            </span>
                                        </div>
                                    ))}
                                    {orders.length === 0 && (
                                        <p className="text-sm text-muted-foreground text-center py-4">No transactions yet</p>
                                    )}
                                </div>

                                <Button variant="link" className="text-[#F4D03F] text-xs p-0 h-auto mt-4">
                                    View More →
                                </Button>
                            </Card></Col>
                        </Grid>

                        {/* Quick Actions Removed */}
                    </TabsContent>

                    {/* --- ORDERS TAB --- */}
                    <TabsContent value="orders" className="space-y-6">
                        <Card className="bg-card border-border rounded-2xl overflow-hidden shadow-sm">
                            <CardHeader className="border-b border-border bg-muted/30">
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
                                            <TableRow className="border-b border-border bg-muted/20">
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Order #</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Customer</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px] text-right">Items</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px] text-right">Total (KES)</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Status</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Date</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px] text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {orders.length === 0 ? (
                                                <TableRow><TableCell colSpan={7} className="text-center h-48 text-muted-foreground font-medium">No orders found.</TableCell></TableRow>
                                            ) : (
                                                orders.map((order) => (
                                                    <TableRow key={order.id} className="hover:bg-muted/20 transition-colors border-border/10">
                                                        <TableCell className="px-6 font-mono font-bold text-primary">{order.order_number || `BY-${order.id.toString().slice(0, 8)}`}</TableCell>
                                                        <TableCell className="px-6">
                                                            <div className="font-semibold">{order.shipping_address?.first_name || 'Anonymous'} {order.shipping_address?.last_name || ''}</div>
                                                            <div className="text-xs text-muted-foreground">{order.customer_email || order.shipping_address?.email}</div>
                                                        </TableCell>
                                                        <TableCell className="px-6 text-right font-medium">{order.items?.length || 0}</TableCell>
                                                        <TableCell className="px-6 text-right font-black">{order.total_amount?.toLocaleString()}</TableCell>
                                                        <TableCell className="px-6">
                                                            <Select
                                                                defaultValue={order.status}
                                                                onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                                                            >
                                                                <SelectTrigger className="w-[140px] h-9 text-[10px] font-black tracking-wider rounded-xl bg-background/50 border-border/50">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent className="rounded-xl border-border/50">
                                                                    <SelectItem value="pending" className="text-xs font-bold">Pending</SelectItem>
                                                                    <SelectItem value="processing" className="text-xs font-bold">Processing</SelectItem>
                                                                    <SelectItem value="shipped" className="text-xs font-bold">Shipped</SelectItem>
                                                                    <SelectItem value="completed" className="text-xs font-bold">Completed</SelectItem>
                                                                    <SelectItem value="cancelled" className="text-xs font-bold">Cancelled</SelectItem>
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
                                    <DialogDescription>Order details and items.</DialogDescription>
                                </DialogHeader>
                                {selectedOrder && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-muted-foreground">Order ID</p>
                                                <p className="font-mono font-bold">{selectedOrder.order_number || selectedOrder.id}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-muted-foreground">Status</p>
                                                <Badge variant="outline">{selectedOrder.status}</Badge>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-muted-foreground">Customer</p>
                                                <p className="font-bold">{selectedOrder.shipping_address?.first_name} {selectedOrder.shipping_address?.last_name}</p>
                                                <p className="text-muted-foreground">{selectedOrder.customer_email}</p>
                                                <p className="text-muted-foreground">{selectedOrder.shipping_address?.phone}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-muted-foreground">Shipping Address</p>
                                                <p className="whitespace-pre-wrap">{selectedOrder.shipping_address?.address}, {selectedOrder.shipping_address?.city}</p>
                                                <p>{selectedOrder.shipping_address?.postal_code}, {selectedOrder.shipping_address?.country}</p>
                                            </div>
                                        </div>

                                        <div className="border-t border-border/10 pt-4">
                                            <p className="text-[10px] font-black text-muted-foreground mb-3">Items Manifest</p>
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
                                                <p className="text-[10px] font-black text-muted-foreground">Total Value</p>
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
                                <h2 className="text-xl font-bold tracking-tight">Product Inventory</h2>
                                <p className="text-muted-foreground font-medium">Manage products listed in the online shop.</p>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }} className="rounded-xl px-6 py-6 shadow-glow hover:scale-105 transition-all bg-primary font-black text-xs h-auto">
                                    <Plus className="mr-2 h-5 w-5" /> Add Product
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <div key={product.id} className="group relative bg-card hover:shadow-xl border-border border rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1">
                                    <div className="aspect-square rounded-2xl overflow-hidden bg-muted mb-5 relative">
                                        {product.images?.[0] ? (
                                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full grid place-items-center text-muted-foreground/30"><ShoppingBag className="w-12 h-12" /></div>
                                        )}
                                        <div className="absolute top-3 right-3">
                                            <Badge className="bg-background/80 backdrop-blur-md text-foreground border-none px-3 py-1 text-[10px] font-black">{product.category}</Badge>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-start gap-2">
                                            <h3 className="font-black text-xl leading-none tracking-tight">{product.name}</h3>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed h-8">{product.description}</p>
                                        <div className="flex justify-between items-end pt-2">
                                            <div>
                                                <p className="text-[10px] font-black tracking-tighter text-muted-foreground mb-1">Price</p>
                                                <span className="text-xl font-bold text-primary">KES {product.variants?.[0]?.price_kes?.toLocaleString() || 0}</span>
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
                                    <DialogTitle className="text-3xl font-black tracking-tighter">{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
                                    <DialogDescription>Fill in the product details below.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-5 py-4">
                                    <div className="space-y-2">
                                        <Label className=" text-[10px] font-black ml-1">Product Name</Label>
                                        <Input
                                            id="product-name"
                                            name="product-name"
                                            placeholder="e.g. Amber Infusion VII"
                                            value={productForm.name}
                                            onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                                            className="rounded-xl h-12 bg-muted/50 border-border/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className=" text-[10px] font-black ml-1">Description</Label>
                                        <Textarea
                                            id="product-description"
                                            name="product-description"
                                            placeholder="Describe the sensory profile..."
                                            value={productForm.description}
                                            onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                                            className="rounded-xl min-h-[100px] bg-muted/50 border-border/50"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className=" text-[10px] font-black ml-1">Category</Label>
                                            <Input
                                                id="product-category"
                                                name="product-category"
                                                value={productForm.category}
                                                onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                                                className="rounded-xl h-11 bg-muted/50 border-border/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className=" text-[10px] font-black ml-1">Price (KES)</Label>
                                            <Input
                                                id="product-price"
                                                name="product-price"
                                                type="number"
                                                value={productForm.price_kes}
                                                onChange={e => setProductForm({ ...productForm, price_kes: parseFloat(e.target.value) })}
                                                className="rounded-xl h-11 bg-muted/50 border-border/50"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className=" text-[10px] font-black ml-1">Stock Quantity</Label>
                                            <Input
                                                id="product-stock"
                                                name="product-stock"
                                                type="number"
                                                value={productForm.stock_quantity}
                                                onChange={e => setProductForm({ ...productForm, stock_quantity: parseInt(e.target.value) })}
                                                className="rounded-xl h-11 bg-muted/50 border-border/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className=" text-[10px] font-black ml-1">Image URL</Label>
                                            <Input
                                                id="product-images"
                                                name="product-images"
                                                value={productForm.images}
                                                onChange={e => setProductForm({ ...productForm, images: e.target.value })}
                                                placeholder="https://..."
                                                className="rounded-xl h-11 bg-muted/50 border-border/50 font-mono text-xs"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter className="gap-2 sm:gap-0">
                                    <Button variant="ghost" onClick={() => setIsProductModalOpen(false)} className="rounded-xl font-bold">Cancel</Button>
                                    <Button onClick={handleCreateProduct} className="rounded-xl font-black text-xs px-8 shadow-glow">{editingProduct ? 'Save changes' : 'Add product'}</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* Stock Movements Section */}
                        <Card className="bg-card border-border rounded-2xl overflow-hidden mt-8 shadow-sm">
                            <CardHeader className="border-b border-border bg-muted/30">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="text-xl font-black flex items-center gap-2">
                                            <History className="w-5 h-5" /> Stock Movements
                                        </CardTitle>
                                        <CardDescription>Track inventory additions, removals, and adjustments.</CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Badge className="bg-[#1B9157] text-[#1B9157] border-green-200 px-4 py-1.5 rounded-xl font-black text-[10px]">
                                            {stockMovements.length} RECORDS
                                        </Badge>
                                        <Button onClick={() => setIsStockModalOpen(true)} size="sm" className="rounded-xl h-8 px-4 font-black text-[10px]">
                                            <Plus className="w-3 h-3 mr-1" /> New Movement
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-border bg-muted/20">
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Product</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Type</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px] text-right">Quantity</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Reason</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Date</TableHead>
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
                                                            <Badge variant="outline" className={mov.type === 'addition' ? 'bg-[#1B9157] text-[#1B9157] border-green-200' : 'bg-red-500/10 text-red-600 border-red-200'}>
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
                                        <Label className=" text-[10px] font-black ml-1">Product</Label>
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
                                            <Label className=" text-[10px] font-black ml-1">Movement Type</Label>
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
                                            <Label className=" text-[10px] font-black ml-1">Quantity</Label>
                                            <Input
                                                id="stock-quantity"
                                                name="stock-quantity"
                                                type="number"
                                                value={stockForm.quantity}
                                                onChange={e => setStockForm({ ...stockForm, quantity: parseInt(e.target.value) || 0 })}
                                                className="rounded-xl h-12 bg-muted/50 border-border/50"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className=" text-[10px] font-black ml-1">Reason</Label>
                                        <Input
                                            id="stock-reason"
                                            name="stock-reason"
                                            placeholder="e.g. New harvest arrival"
                                            value={stockForm.reason}
                                            onChange={e => setStockForm({ ...stockForm, reason: e.target.value })}
                                            className="rounded-xl h-12 bg-muted/50 border-border/50"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleCreateStockMovement} className="w-full h-14 rounded-2xl shadow-glow font-black transition-all hover:scale-[1.02]">
                                        Record Movement
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </TabsContent>

                    {/* --- BATCHES TAB --- */}
                    <TabsContent value="batches" className="space-y-6">
                        <Card className="bg-card border-border rounded-2xl overflow-hidden shadow-sm">
                            <CardHeader className="border-b border-border bg-muted/30 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-bold">Honey batches</CardTitle>
                                    <CardDescription>Verifiable records for each batch.</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={() => setIsBatchModalOpen(true)} className="rounded-xl font-black text-[10px] py-5 bg-[#F4D03F] hover:bg-[#F4D03F]-dark text-[#1A1A1A] border-none px-6 shadow-glow transition-all active:scale-95">
                                        <Plus className="mr-2 h-4 w-4" /> Add batch
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-border bg-muted/20">
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Batch Code</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Honey Type</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Origin</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Farmer / Beekeeper</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Harvest Date</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px] text-right">Quantity (KG)</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Record ID</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {batches.length === 0 ? (
                                                <TableRow><TableCell colSpan={8} className="text-center h-48 text-muted-foreground font-medium">No honey batches yet.</TableCell></TableRow>
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
                                                                        <span className="text-[10px] text-muted-foreground tracking-wider">Farmer</span>
                                                                        <span className="font-semibold text-xs">{batch.farmer_name}</span>
                                                                    </div>
                                                                )}
                                                                {batch.beekeeper_name && (
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[10px] text-muted-foreground tracking-wider">Beekeeper</span>
                                                                        <span className="font-semibold text-xs">{batch.beekeeper_name}</span>
                                                                    </div>
                                                                )}
                                                                <span className="text-[10px] text-muted-foreground pt-1 border-t border-border/10">
                                                                    {batch.farmer_phone || batch.beekeeper_id || '-'}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="px-6 text-sm tabular-nums">{batch.harvest_date}</TableCell>
                                                        <TableCell className="px-6 text-right font-black">{batch.quantity_kg}</TableCell>
                                                        <TableCell className="px-6">
                                                            <div className="flex items-center gap-2 group cursor-help" title={batch.block_hash}>
                                                                <div className="w-2 h-2 rounded-xl bg-green-500 animate-pulse" />
                                                                <code className="text-[10px] bg-muted px-2 py-1 rounded-md opacity-70 group-hover:opacity-100 transition-opacity truncate max-w-[120px] font-mono">
                                                                    {batch.block_hash || '0x00...00'}
                                                                </code>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="px-6">
                                                            <div className="flex items-center gap-1">
                                                                <Button size="icon" variant="outline" className="rounded-xl w-8 h-8 border-border/50 text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); handleDeleteBatch(batch.id); }}>
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                                <Button size="icon" variant="outline" className="rounded-xl w-8 h-8 border-border/50 text-blue-500 hover:bg-blue-500/10" onClick={(e) => { e.stopPropagation(); handleViewBatch(batch); }}>
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                                <Button size="icon" variant="outline" className="rounded-xl w-8 h-8 border-border/50 text-primary hover:bg-primary/10" onClick={(e) => { e.stopPropagation(); handleEditBatch(batch); }}>
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                {batch.batch_code && (
                                                                    <Button
                                                                        size="icon"
                                                                        variant="outline"
                                                                        className="rounded-xl w-8 h-8 border-border/50 text-[#F4D03F] hover:bg-[#F4D03F]"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            window.open(`/trace?code=${batch.batch_code}`, '_blank');
                                                                        }}
                                                                        title="View public record"
                                                                    >
                                                                        <Globe className="h-4 w-4" />
                                                                    </Button>
                                                                )}
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
                            <DialogContent className="rounded-3xl border-none shadow-2xl glass max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black">New History Entry</DialogTitle>
                                    <DialogDescription>Enter the details for this honey batch record.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-6 py-4">
                                    {/* Basic Info */}
                                    <div className="space-y-4">
                                        <h4 className="font-black text-xs text-primary border-b border-[#F4D03F]/20 pb-2">Batch Details</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className=" text-[10px] font-black ml-1">Honey Variety</Label>
                                                <Input
                                                    id="batch-honey-type"
                                                    name="batch-honey-type"
                                                    value={batchForm.honey_type}
                                                    onChange={e => setBatchForm({ ...batchForm, honey_type: e.target.value })}
                                                    placeholder="e.g. Acacia Noir"
                                                    className="rounded-xl h-11 bg-muted/50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className=" text-[10px] font-black ml-1">Harvest Date</Label>
                                                <Input
                                                    id="batch-harvest-date"
                                                    name="batch-harvest-date"
                                                    type="date"
                                                    value={batchForm.harvest_date}
                                                    onChange={e => setBatchForm({ ...batchForm, harvest_date: e.target.value })}
                                                    className="rounded-xl h-11 bg-muted/50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className=" text-[10px] font-black ml-1">Packaged Date</Label>
                                                <Input
                                                    id="batch-packaged-date"
                                                    name="batch-packaged-date"
                                                    type="date"
                                                    value={(batchForm as any).packaged_date || ''}
                                                    onChange={e => setBatchForm({ ...batchForm, packaged_date: e.target.value } as any)}
                                                    className="rounded-xl h-11 bg-muted/50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className=" text-[10px] font-black ml-1">Harvest Quantity (KG)</Label>
                                                <Input
                                                    id="batch-quantity"
                                                    name="batch-quantity"
                                                    type="number"
                                                    value={batchForm.quantity_kg}
                                                    onChange={e => setBatchForm({ ...batchForm, quantity_kg: parseFloat(e.target.value) })}
                                                    className="rounded-xl h-11 bg-muted/50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className=" text-[10px] font-black ml-1">Processing Method</Label>
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
                                        <h4 className="font-black text-xs text-primary border-b border-[#F4D03F]/20 pb-2">Source Origin</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className=" text-[10px] font-black ml-1">Farmer Name</Label>
                                                <Input
                                                    id="batch-farmer-name"
                                                    name="batch-farmer-name"
                                                    value={(batchForm as any).farmer_name || ''}
                                                    onChange={e => setBatchForm({ ...batchForm, farmer_name: e.target.value } as any)}
                                                    placeholder="e.g. John Doe"
                                                    className="rounded-xl h-11 bg-muted/50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className=" text-[10px] font-black ml-1">Contact Phone</Label>
                                                <Input
                                                    id="batch-farmer-phone"
                                                    name="batch-farmer-phone"
                                                    value={(batchForm as any).farmer_phone || ''}
                                                    onChange={e => setBatchForm({ ...batchForm, farmer_phone: e.target.value } as any)}
                                                    placeholder="+254..."
                                                    className="rounded-xl h-11 bg-muted/50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className=" text-[10px] font-black ml-1">Beekeeper Name</Label>
                                                <Input
                                                    id="batch-beekeeper-name"
                                                    name="batch-beekeeper-name"
                                                    value={(batchForm as any).beekeeper_name || ''}
                                                    onChange={e => setBatchForm({ ...batchForm, beekeeper_name: e.target.value } as any)}
                                                    placeholder="e.g. Jane Smith"
                                                    className="rounded-xl h-11 bg-muted/50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className=" text-[10px] font-black ml-1">Beekeeper ID</Label>
                                                <Input
                                                    id="batch-beekeeper-id"
                                                    name="batch-beekeeper-id"
                                                    value={(batchForm as any).beekeeper_id || ''}
                                                    onChange={e => setBatchForm({ ...batchForm, beekeeper_id: e.target.value } as any)}
                                                    placeholder="ID-..."
                                                    className="rounded-xl h-11 bg-muted/50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className=" text-[10px] font-black ml-1">County</Label>
                                                <Input
                                                    id="batch-county"
                                                    name="batch-county"
                                                    value={(batchForm as any).location_county || ''}
                                                    onChange={e => setBatchForm({ ...batchForm, location_county: e.target.value } as any)}
                                                    placeholder="e.g. Kitui"
                                                    className="rounded-xl h-11 bg-muted/50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className=" text-[10px] font-black ml-1">Region</Label>
                                                <Input
                                                    id="batch-region"
                                                    name="batch-region"
                                                    value={(batchForm as any).location_region || ''}
                                                    onChange={e => setBatchForm({ ...batchForm, location_region: e.target.value } as any)}
                                                    placeholder="e.g. Mwingi North"
                                                    className="rounded-xl h-11 bg-muted/50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className=" text-[10px] font-black ml-1">Apiary Name</Label>
                                                <Input
                                                    id="batch-apiary-name"
                                                    name="batch-apiary-name"
                                                    value={(batchForm as any).apiary_name || ''}
                                                    onChange={e => setBatchForm({ ...batchForm, apiary_name: e.target.value } as any)}
                                                    placeholder="e.g. Acacia Grove"
                                                    className="rounded-xl h-11 bg-muted/50"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className=" text-[10px] font-black ml-1">Lat</Label>
                                                    <Input
                                                        id="batch-latitude"
                                                        name="batch-latitude"
                                                        type="number" step="any"
                                                        value={(batchForm as any).latitude || ''}
                                                        onChange={e => setBatchForm({ ...batchForm, latitude: parseFloat(e.target.value) } as any)}
                                                        placeholder="-1.23"
                                                        className="rounded-xl h-11 bg-muted/50"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className=" text-[10px] font-black ml-1">Long</Label>
                                                    <Input
                                                        id="batch-longitude"
                                                        name="batch-longitude"
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
                                        <h4 className="font-black text-xs text-primary border-b border-[#F4D03F]/20 pb-2">Quality Assurance</h4>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label className=" text-[10px] font-black ml-1">Grade</Label>
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
                                                <Label className=" text-[10px] font-black ml-1">Moisture Level (%)</Label>
                                                <Input
                                                    id="batch-moisture"
                                                    name="batch-moisture"
                                                    type="number"
                                                    step="0.1"
                                                    value={(batchForm as any).moisture_content || ''}
                                                    onChange={e => setBatchForm({ ...batchForm, moisture_content: parseFloat(e.target.value) } as any)}
                                                    placeholder="18.5"
                                                    className="rounded-xl h-11 bg-muted/50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className=" text-[10px] font-black ml-1">Color Grade</Label>
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
                                    <Button onClick={handleSaveBatch} className="w-full rounded-2xl py-6 font-black text-xs bg-[#F4D03F] hover:bg-[#F4D03F]-dark text-[#1A1A1A] border-none shadow-glow">Save</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* Batch Details Dialog */}
                        <Dialog open={isBatchDetailsOpen} onOpenChange={setIsBatchDetailsOpen}>
                            <DialogContent className="rounded-3xl border-none shadow-2xl glass max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black flex items-center gap-2">
                                        <Shield className="w-6 h-6 text-[#1B9157]" />
                                        Batch Verification
                                    </DialogTitle>
                                    <DialogDescription className="font-mono text-xs">
                                        Record ID: {selectedBatch?.block_hash}
                                    </DialogDescription>
                                </DialogHeader>

                                {selectedBatch && (
                                    <div className="space-y-8 py-4">
                                        {/* Header Status Card */}
                                        <div className="bg-muted/30 p-4 rounded-2xl flex justify-between items-center border border-border/50">
                                            <div>
                                                <p className="text-[10px] font-black text-muted-foreground">Batch Code</p>
                                                <p className="text-xl font-black font-mono text-primary">{selectedBatch.batch_code}</p>
                                            </div>
                                            <Badge className="bg-[#1B9157] text-[#1B9157] px-4 py-1 h-8 rounded-xl font-black border-none">
                                                VERIFIED HISTORY
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <h4 className="font-black text-xs border-b border-border/50 pb-2 flex items-center gap-2">
                                                    <Package className="w-4 h-4" /> Product Details
                                                </h4>
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-[10px] text-muted-foreground font-bold">Honey Type</p>
                                                        <p className="font-semibold">{selectedBatch.honey_type}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-muted-foreground font-bold">Quantity</p>
                                                        <p className="font-semibold">{selectedBatch.quantity_kg} KG</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-muted-foreground font-bold">Processing</p>
                                                        <p className="font-semibold">{selectedBatch.processing_method}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-muted-foreground font-bold">Harvest Date</p>
                                                        <p className="font-mono text-sm">{selectedBatch.harvest_date}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h4 className="font-black text-xs border-b border-border/50 pb-2 flex items-center gap-2">
                                                    <Users className="w-4 h-4" /> Origin Source
                                                </h4>
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-[10px] text-muted-foreground font-bold">Farmer</p>
                                                        <p className="font-semibold">{selectedBatch.farmer_name || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-muted-foreground font-bold">Beekeeper</p>
                                                        <p className="font-semibold">{selectedBatch.beekeeper_name || 'N/A'}</p>
                                                        <p className="text-xs text-muted-foreground">{selectedBatch.beekeeper_id}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-muted-foreground font-bold">Location</p>
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
                                                        <p className="text-[10px] text-muted-foreground font-bold">Contact</p>
                                                        <p className="font-mono text-sm">{selectedBatch.farmer_phone || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="font-black text-xs border-b border-border/50 pb-2 flex items-center gap-2">
                                                <Shield className="w-4 h-4" /> Quality Assurance
                                            </h4>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="bg-muted/30 p-3 rounded-xl text-center">
                                                    <p className="text-[10px] text-muted-foreground font-bold">Grade</p>
                                                    <p className="text-lg font-black">{selectedBatch.quality_grade || 'A'}</p>
                                                </div>
                                                <div className="bg-muted/30 p-3 rounded-xl text-center">
                                                    <p className="text-[10px] text-muted-foreground font-bold">Moisture</p>
                                                    <p className="text-lg font-black">{selectedBatch.moisture_content || 0}%</p>
                                                </div>
                                                <div className="bg-muted/30 p-3 rounded-xl text-center">
                                                    <p className="text-[10px] text-muted-foreground font-bold">Color</p>
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
                        <Card className="bg-card border-border rounded-2xl overflow-hidden shadow-sm">
                            <CardHeader className="border-b border-border bg-muted/30 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-bold">Agricultural Partners</CardTitle>
                                    <CardDescription>Manage registered beekeepers and farmers.</CardDescription>
                                </div>
                                <Button
                                    onClick={() => setIsFarmerModalOpen(true)}
                                    variant="outline"
                                    className="rounded-xl font-black text-xs h-auto py-4 border-dashed border-primary/30"
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Register Farmer
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-border bg-muted/20">
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Farmer</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Contact</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Location</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Experience</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Status</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px] text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {farmers.length === 0 ? (
                                                <TableRow><TableCell colSpan={6} className="text-center h-48 text-muted-foreground font-medium">No registered farmers found.</TableCell></TableRow>
                                            ) : (
                                                farmers.map((farmer) => (
                                                    <TableRow key={farmer.id} className="hover:bg-muted/20 transition-colors border-border/10">
                                                        <TableCell className="px-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-xl bg-[#F4D03F]/20 flex items-center justify-center font-black text-[#F4D03F]">
                                                                    {farmer.name?.[0]?.toUpperCase() || 'F'}
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="font-bold">{farmer.name}</span>
                                                                    <span className="text-[10px] text-muted-foreground font-mono">{farmer.farmer_id || 'ID-PENDING'}</span>
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
                                                            <Badge className={farmer.certification_status === 'Certified' ? 'bg-[#1B9157] text-[#1B9157] border-none' : 'bg-[#F4D03F] text-[#F4D03F] border-none'}>
                                                                {farmer.certification_status || 'Pending'}
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
                                    <DialogDescription>{editingFarmer ? 'Update beekeeper credentials.' : 'Add a new beekeeper to the directory.'}</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-6 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className=" text-[10px] font-black ml-1">Full Name</Label>
                                            <Input
                                                id="farmer-fullname"
                                                name="farmer-fullname"
                                                placeholder="Timothy Nduva"
                                                value={farmerForm.name}
                                                onChange={e => setFarmerForm({ ...farmerForm, name: e.target.value })}
                                                className="rounded-xl h-12 bg-muted/50 border-border/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className=" text-[10px] font-black ml-1">Phone Number</Label>
                                            <Input
                                                id="farmer-phone"
                                                name="farmer-phone"
                                                placeholder="+254 7XX XXX XXX"
                                                value={farmerForm.phone}
                                                onChange={e => setFarmerForm({ ...farmerForm, phone: e.target.value })}
                                                className="rounded-xl h-12 bg-muted/50 border-border/50"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className=" text-[10px] font-black ml-1">Email Address</Label>
                                            <Input
                                                id="farmer-email"
                                                name="farmer-email"
                                                type="email"
                                                placeholder="timothy@beeyield.com"
                                                value={farmerForm.email}
                                                onChange={e => setFarmerForm({ ...farmerForm, email: e.target.value })}
                                                className="rounded-xl h-12 bg-muted/50 border-border/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className=" text-[10px] font-black ml-1">ID Number</Label>
                                            <Input
                                                id="farmer-id-number"
                                                name="farmer-id-number"
                                                placeholder="National ID or Passport"
                                                value={farmerForm.id_number}
                                                onChange={e => setFarmerForm({ ...farmerForm, id_number: e.target.value })}
                                                className="rounded-xl h-12 bg-muted/50 border-border/50"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label className=" text-[10px] font-black ml-1">County</Label>
                                            <Input
                                                id="farmer-county"
                                                name="farmer-county"
                                                placeholder="Makueni"
                                                value={farmerForm.county}
                                                onChange={e => setFarmerForm({ ...farmerForm, county: e.target.value })}
                                                className="rounded-xl h-12 bg-muted/50 border-border/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className=" text-[10px] font-black ml-1">Region</Label>
                                            <Input
                                                id="farmer-region"
                                                name="farmer-region"
                                                placeholder="Eastern"
                                                value={farmerForm.region}
                                                onChange={e => setFarmerForm({ ...farmerForm, region: e.target.value })}
                                                className="rounded-xl h-12 bg-muted/50 border-border/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className=" text-[10px] font-black ml-1">Years Experience</Label>
                                            <Input
                                                id="farmer-experience"
                                                name="farmer-experience"
                                                type="number"
                                                value={farmerForm.experience_years}
                                                onChange={e => setFarmerForm({ ...farmerForm, experience_years: parseInt(e.target.value) || 0 })}
                                                className="rounded-xl h-12 bg-muted/50 border-border/50"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className=" text-[10px] font-black ml-1">Location Details / Ward</Label>
                                        <Input
                                            id="farmer-location"
                                            name="farmer-location"
                                            placeholder="Kibwezi East, Mtito Andei"
                                            value={farmerForm.location_name}
                                            onChange={e => setFarmerForm({ ...farmerForm, location_name: e.target.value })}
                                            className="rounded-xl h-12 bg-muted/50 border-border/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className=" text-[10px] font-black ml-1">The Beekeeper's Story</Label>
                                        <Textarea
                                            id="farmer-story"
                                            name="farmer-story"
                                            placeholder="Brief background about the farmer..."
                                            value={farmerForm.story}
                                            onChange={e => setFarmerForm({ ...farmerForm, story: e.target.value })}
                                            className="rounded-xl min-h-[100px] bg-muted/50 border-border/50"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleSaveFarmer} className="w-full h-14 rounded-2xl shadow-glow font-black transition-all hover:scale-[1.02]">
                                        {editingFarmer ? 'Update Partner Records' : 'Register Farmer'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </TabsContent>

                    {/* --- APIARIES TAB --- */}
                    <TabsContent value="apiaries" className="space-y-6">
                        <Card className="bg-card border-border rounded-2xl overflow-hidden shadow-sm">
                            <CardHeader className="border-b border-border bg-muted/30 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-bold">Apiary Locations</CardTitle>
                                    <CardDescription>Manage apiaries and their locations.</CardDescription>
                                </div>
                                <Button
                                    onClick={() => setIsApiaryModalOpen(true)}
                                    variant="outline"
                                    className="rounded-xl font-black text-xs h-auto py-4 border-dashed border-primary/30"
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Register Apiary
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-border bg-muted/20">
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Name</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Farmer</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Location</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px] text-right">Hives</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Status</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px] text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {apiaries.length === 0 ? (
                                                <TableRow><TableCell colSpan={6} className="text-center h-48 text-muted-foreground font-medium">No apiaries registered yet.</TableCell></TableRow>
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
                                                            <Badge variant="outline" className={apiary.status === 'active' ? "bg-[#1B9157] text-[#1B9157] border-green-200" : "bg-muted text-muted-foreground"}>
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
                                    <DialogTitle className="text-3xl font-black tracking-tighter">{editingApiary ? 'Edit Apiary' : 'Add Apiary'}</DialogTitle>
                                    <DialogDescription>Set apiary details and assign a farmer.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-6 py-4">
                                    <div className="space-y-2">
                                        <Label className=" text-[10px] font-black ml-1">Apiary Name</Label>
                                        <Input
                                            id="apiary-name"
                                            name="apiary-name"
                                            placeholder="Kibwezi East Cluster A"
                                            value={apiaryForm.name}
                                            onChange={e => setApiaryForm({ ...apiaryForm, name: e.target.value })}
                                            className="rounded-xl h-12 bg-muted/50 border-border/50"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className=" text-[10px] font-black ml-1">County</Label>
                                            <Input
                                                id="apiary-county"
                                                name="apiary-county"
                                                placeholder="Makueni"
                                                value={apiaryForm.county}
                                                onChange={e => setApiaryForm({ ...apiaryForm, county: e.target.value })}
                                                className="rounded-xl h-12 bg-muted/50 border-border/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className=" text-[10px] font-black ml-1">Region</Label>
                                            <Input
                                                id="apiary-region"
                                                name="apiary-region"
                                                placeholder="Eastern"
                                                value={apiaryForm.region}
                                                onChange={e => setApiaryForm({ ...apiaryForm, region: e.target.value })}
                                                className="rounded-xl h-12 bg-muted/50 border-border/50"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className=" text-[10px] font-black ml-1">Assigned Farmer</Label>
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
                                            <Label className=" text-[10px] font-black ml-1">Latitude</Label>
                                            <Input
                                                id="apiary-latitude"
                                                name="apiary-latitude"
                                                type="number" step="any"
                                                value={apiaryForm.latitude}
                                                onChange={e => setApiaryForm({ ...apiaryForm, latitude: parseFloat(e.target.value) })}
                                                className="rounded-xl h-12 bg-muted/50 border-border/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className=" text-[10px] font-black ml-1">Longitude</Label>
                                            <Input
                                                id="apiary-longitude"
                                                name="apiary-longitude"
                                                type="number" step="any"
                                                value={apiaryForm.longitude}
                                                onChange={e => setApiaryForm({ ...apiaryForm, longitude: parseFloat(e.target.value) })}
                                                className="rounded-xl h-12 bg-muted/50 border-border/50"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleSaveApiary} className="w-full h-14 rounded-2xl shadow-glow font-black transition-all hover:scale-[1.02]">
                                        {editingApiary ? 'Update Production Site' : 'Save Apiary'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </TabsContent>

                    {/* --- HIVES TAB --- */}
                    <TabsContent value="hives" className="space-y-6">
                        <Card className="bg-card border-border rounded-2xl overflow-hidden shadow-sm">
                            <CardHeader className="border-b border-border bg-muted/30 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-bold">Hives</CardTitle>
                                    <CardDescription>Inventory and health status of individual colony units.</CardDescription>
                                </div>
                                <Button
                                    onClick={() => setIsHiveModalOpen(true)}
                                    variant="outline"
                                    className="rounded-xl font-black text-xs h-auto py-4 border-dashed border-primary/30"
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Add hive
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-border bg-muted/20">
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Hive Code</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Apiary</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Type</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Installed</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Status</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px] text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {hives.length === 0 ? (
                                                <TableRow><TableCell colSpan={6} className="text-center h-48 text-muted-foreground font-medium">No hives registered yet.</TableCell></TableRow>
                                            ) : (
                                                hives.map((hive) => (
                                                    <TableRow key={hive.id} className="hover:bg-muted/20 transition-colors border-border/10">
                                                        <TableCell className="px-6 font-mono font-bold text-primary">{hive.hive_code}</TableCell>
                                                        <TableCell className="px-6 font-semibold">{hive.apiaries?.name || 'Assigned Site'}</TableCell>
                                                        <TableCell className="px-6">{hive.type}</TableCell>
                                                        <TableCell className="px-6 text-sm text-muted-foreground">{new Date(hive.installation_date).toLocaleDateString()}</TableCell>
                                                        <TableCell className="px-6">
                                                            <Badge variant="outline" className={hive.status === 'active' ? "bg-[#1B9157] text-[#1B9157] border-green-200" : "bg-yellow-500/10 text-yellow-600 border-yellow-200"}>
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

                        {/* Hive Modal */}
                        <Dialog open={isHiveModalOpen} onOpenChange={(open) => { setIsHiveModalOpen(open); if (!open) setEditingHive(null); }}>
                            <DialogContent className="rounded-3xl border-none shadow-2xl glass max-w-xl">
                                <DialogHeader>
                                    <DialogTitle className="text-3xl font-black tracking-tighter">{editingHive ? 'Edit Hive' : 'Add Hive'}</DialogTitle>
                                    <DialogDescription>Enter the hive details below.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-6 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className=" text-[10px] font-black ml-1">Hive Code</Label>
                                            <Input
                                                id="hive-code"
                                                name="hive-code"
                                                placeholder="HIVE-KIB-001"
                                                value={hiveForm.hive_code}
                                                onChange={e => setHiveForm({ ...hiveForm, hive_code: e.target.value })}
                                                className="rounded-xl h-12 bg-muted/50 border-border/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className=" text-[10px] font-black ml-1">Hive Type</Label>
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
                                        <Label className=" text-[10px] font-black ml-1">Target Apiary</Label>
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
                                            <Label className=" text-[10px] font-black ml-1">Installation Date</Label>
                                            <Input
                                                id="hive-install-date"
                                                name="hive-install-date"
                                                type="date"
                                                value={hiveForm.installation_date}
                                                onChange={e => setHiveForm({ ...hiveForm, installation_date: e.target.value })}
                                                className="rounded-xl h-12 bg-muted/50 border-border/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className=" text-[10px] font-black ml-1">Health Status</Label>
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
                                        <Label className=" text-[10px] font-black ml-1">Notes</Label>
                                        <Textarea
                                            id="hive-notes"
                                            name="hive-notes"
                                            placeholder="Condition of the box, queen status, etc."
                                            value={hiveForm.notes}
                                            onChange={e => setHiveForm({ ...hiveForm, notes: e.target.value })}
                                            className="rounded-xl bg-muted/50 border-border/50"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleSaveHive} className="w-full h-14 rounded-2xl shadow-glow font-black transition-all hover:scale-[1.02]">
                                        {editingHive ? 'Sync Unit Parameters' : 'Save Hive'}
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
                                            <Shield className="w-6 h-6 text-primary" /> Team management
                                        </h2>
                                        <p className="text-muted-foreground font-medium">Manage users and permissions.</p>
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
                                                            <div className="absolute -top-1 -right-1 bg-yellow-400 text-[#1A1A1A] rounded-xl p-0.5 shadow-lg border-2 border-background">
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
                                                    <span className="text-[10px] font-black text-muted-foreground">Role</span>
                                                    <Select
                                                        defaultValue={userObj.role}
                                                        onValueChange={(value) => handleUpdateUserRole(userObj.id, value)}
                                                        disabled={userObj.role === 'super_admin' && userObj.email === user?.email} // Can't de-rank self if last super admin (mock safety)
                                                    >
                                                        <SelectTrigger className="w-32 h-8 rounded-xl text-[10px] font-black border-none bg-muted/60">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-xl">
                                                            <SelectItem value="user" className="text-xs font-bold">User</SelectItem>
                                                            <SelectItem value="admin" className="text-xs font-bold">Admin</SelectItem>
                                                            <SelectItem value="super_admin" className="text-xs font-bold">Super Admin</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="flex gap-2 pt-2">
                                                    <Button
                                                        variant="outline"
                                                        className="flex-1 rounded-2xl h-10 border-border/50 text-[10px] font-black hover:bg-primary/10 hover:text-primary transition-colors"
                                                        onClick={() => handleEditUser(userObj)}
                                                    >
                                                        <Edit className="h-4 w-4 mr-2" /> Modify
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        className="flex-1 rounded-2xl h-10 border-border/50 text-[10px] font-black hover:bg-destructive/10 hover:text-destructive group-hover:border-destructive/30 transition-colors"
                                                        onClick={() => handleDeleteUser(userObj.id)}
                                                        disabled={userObj.email === user?.email} // Can't delete self
                                                    >
                                                        <UserMinus className="h-4 w-4 mr-2" /> Remove User
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
                                        <h3 className="font-black text-xs">Add a team member</h3>
                                        <p className="text-[10px] font-medium text-center mt-2 opacity-60">Create an account and set permissions</p>
                                    </Card>
                                </div>

                                {/* User CRUD Dialog */}
                                <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
                                    <DialogContent className="rounded-3xl border-none shadow-2xl glass sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle className="text-3xl font-black tracking-tighter">{editingUser ? 'Edit user' : 'Add user'}</DialogTitle>
                                            <DialogDescription>Set access and permissions.</DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-5 py-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className=" text-[10px] font-black ml-1">First Name</Label>
                                                    <Input
                                                        id="user-firstname"
                                                        name="user-firstname"
                                                        placeholder="John"
                                                        value={userForm.first_name}
                                                        onChange={e => setUserForm({ ...userForm, first_name: e.target.value })}
                                                        className="rounded-xl h-12 bg-muted/50 border-border/50"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className=" text-[10px] font-black ml-1">Last Name</Label>
                                                    <Input
                                                        id="user-lastname"
                                                        name="user-lastname"
                                                        placeholder="Doe"
                                                        value={userForm.last_name}
                                                        onChange={e => setUserForm({ ...userForm, last_name: e.target.value })}
                                                        className="rounded-xl h-12 bg-muted/50 border-border/50"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className=" text-[10px] font-black ml-1">Email Address</Label>
                                                <Input
                                                    id="user-email"
                                                    name="user-email"
                                                    type="email"
                                                    placeholder="operator@beeyield.com"
                                                    value={userForm.email}
                                                    onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                                                    className="rounded-xl h-12 bg-muted/50 border-border/50"
                                                />
                                            </div>
                                            {!editingUser && (
                                                <div className="space-y-2">
                                                    <Label className=" text-[10px] font-black ml-1">Access Password</Label>
                                                    <Input
                                                        id="user-password"
                                                        name="user-password"
                                                        type="password"
                                                        placeholder="••••••••"
                                                        value={userForm.password}
                                                        onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                                                        className="rounded-xl h-12 bg-muted/50 border-border/50"
                                                    />
                                                </div>
                                            )}
                                            <div className="space-y-2">
                                                <Label className=" text-[10px] font-black ml-1">Role</Label>
                                                <Select value={userForm.role} onValueChange={(val) => setUserForm({ ...userForm, role: val })}>
                                                    <SelectTrigger className="w-full h-12 rounded-xl bg-muted/50 border-border/50">
                                                        <SelectValue placeholder="Select Role" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl">
                                                        <SelectItem value="user" className="font-bold">User</SelectItem>
                                                        <SelectItem value="admin" className="font-bold">Admin</SelectItem>
                                                        <SelectItem value="super_admin" className="font-bold">Super Admin</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button onClick={handleSaveUser} className="w-full h-14 rounded-2xl shadow-glow font-black transition-all hover:scale-[1.02]">
                                                {editingUser ? 'Save Changes' : 'Add User'}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>

                            </TabsContent>
                        )
                    }

                    {/* --- POLLINATION REQUESTS TAB --- */}
                    <TabsContent value="pollination" className="space-y-6">
                        <Card className="bg-card border-border rounded-2xl overflow-hidden shadow-sm">
                            <CardHeader className="border-b border-border bg-muted/30">
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
                                            <TableRow className="border-b border-border bg-muted/20">
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Name</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Email</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Phone</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Crop Type</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Farm Size</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Location</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Date</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Status</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px] text-right">Actions</TableHead>
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
                                                        <TableCell className="px-6 text-sm">{req.farm_size || req.acreage || req.farm_size_acres} acres</TableCell>
                                                        <TableCell className="px-6 text-sm text-muted-foreground">{req.location || req.county}</TableCell>
                                                        <TableCell className="px-6 text-xs font-mono">
                                                            {req.contract_start_date
                                                                ? `${new Date(req.contract_start_date).toLocaleDateString()} - ${new Date(req.contract_end_date).toLocaleDateString()}`
                                                                : new Date(req.created_at).toLocaleDateString()
                                                            }
                                                        </TableCell>
                                                        <TableCell className="px-6">
                                                            <Select defaultValue={req.status || 'pending'} onValueChange={(val) => adminService.updatePollinationRequestStatus(req.id, val).then(() => { toast.success('Status updated'); loadAllData(); })}>
                                                                <SelectTrigger className="h-8 w-[120px] rounded-xl text-[10px] font-black"><SelectValue /></SelectTrigger>
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
                                                <p className="text-[10px] font-black text-muted-foreground">Farmer</p>
                                                <p className="font-bold">{selectedPollination.name || selectedPollination.first_name}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-muted-foreground">Contact</p>
                                                <p className="text-xs">{selectedPollination.email}</p>
                                                <p className="text-xs font-mono">{selectedPollination.phone}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-muted-foreground">Crop</p>
                                                <Badge variant="secondary">{selectedPollination.crop_type || selectedPollination.crop}</Badge>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-muted-foreground">Size</p>
                                                <p className="font-bold">{selectedPollination.farm_size || selectedPollination.acreage} Acres</p>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-muted-foreground">Location</p>
                                            <p className="font-medium">{selectedPollination.location || selectedPollination.county}</p>
                                        </div>
                                        <div className="space-y-1 pt-2 border-t border-border/10">
                                            <p className="text-[10px] font-black text-muted-foreground">Additional Notes</p>
                                            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-xl">
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
                        <Card className="bg-card border-border rounded-2xl overflow-hidden shadow-sm">
                            <CardHeader className="border-b border-border bg-muted/30">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="text-2xl font-black">Contact Submissions</CardTitle>
                                        <CardDescription>Messages received through the contact form.</CardDescription>
                                    </div>
                                    <Badge className="bg-[#F4D03F] text-[#F4D03F] border-amber-200 px-4 py-1.5 rounded-xl font-black text-[10px]">
                                        {contacts.length} MESSAGES
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-border bg-muted/20">
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Name</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Email</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Subject</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px] max-w-md">Message</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Date</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Status</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px] text-right">Actions</TableHead>
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
                                                                <SelectTrigger className="h-8 w-[100px] rounded-xl text-[10px] font-black"><SelectValue /></SelectTrigger>
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
                                                    <Badge className="bg-primary/10 text-primary border-none text-[10px] tracking-wider">
                                                        {selectedContact.inquiry_type || 'General'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Location & Context */}
                                        <div className="grid grid-cols-2 gap-4">
                                            {(selectedContact.city || selectedContact.state || selectedContact.country) && (
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-muted-foreground">Location</p>
                                                    <p className="text-sm font-medium">
                                                        {[selectedContact.city, selectedContact.state, selectedContact.country].filter(Boolean).join(', ')}
                                                    </p>
                                                </div>
                                            )}
                                            {selectedContact.company && (
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-muted-foreground">Company</p>
                                                    <p className="text-sm font-medium">{selectedContact.company}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Grower Specifics */}
                                        {(selectedContact.farm_name || selectedContact.crop_type) && (
                                            <div className="bg-muted/30 p-3 rounded-xl space-y-3">
                                                <p className="text-[10px] font-black text-primary flex items-center gap-2">
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
                                                <p className="text-[10px] font-black text-primary flex items-center gap-2">
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
                                            <p className="text-[10px] font-black text-muted-foreground">
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
                        <Card className="border-none shadow-2xl glass bg-background/50 rounded-3xl overflow-hidden">
                            <CardHeader className="bg-muted/30 border-b border-border/10">
                                <CardTitle className="text-2xl font-black">Newsletter Subscribers</CardTitle>
                                <CardDescription>All email subscribers to the BeeYield newsletter.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/20 border-border/10">
                                            <TableHead className="py-4 px-6 font-black text-[10px]">Email</TableHead>
                                            <TableHead className="py-4 px-6 font-black text-[10px]">Name</TableHead>
                                            <TableHead className="py-4 px-6 font-black text-[10px]">Subscribed On</TableHead>
                                            <TableHead className="py-4 px-6 font-black text-[10px] text-right">Actions</TableHead>
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

                    {/* --- NEW EXTENDED TABS --- */}
                    <TabsContent value="activity">
                        <ActivityLogTab />
                    </TabsContent>

                    <TabsContent value="tracing">
                        <TracingHistoryTab />
                    </TabsContent>

                    <TabsContent value="documents">
                        <DocumentsRegistryTab />
                    </TabsContent>

                    <TabsContent value="payments">
                        <PaymentsTab />
                    </TabsContent>

                    <TabsContent value="accounts">
                        <AccountsTab />
                    </TabsContent>

                    <TabsContent value="invoices">
                        <InvoicesTab />
                    </TabsContent>

                    <TabsContent value="content" className="h-[calc(100vh-200px)]">
                        <ContentDashboard />
                    </TabsContent>

                    <TabsContent value="recruitment">
                        <RecruitmentTab />
                    </TabsContent>
                </Tabs>
            </div>
            </AdminLayout>
        </BeeYieldPageShell>
    );
};

const TooltipWrapper = ({ children, text }: { children: React.ReactNode, text: string }) => (
    <div title={text} className="cursor-help">{children}</div>
);

export default AdminDashboard;
