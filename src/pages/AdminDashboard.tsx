import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { ReferenceLibraryTab } from '@/components/admin/tabs/ReferenceLibraryTab';
import { Container, Grid, Col, Section } from '@/components/ui/layout';
import ContentDashboard from '@/components/beeyield/ContentDashboard';
import { SUPER_ADMIN_EMAIL } from '@/config/constants';
import { BeeYieldPageShell } from '@/components/beeyield/BeeYieldUI';
import { glass, PageHeader, GlassStatCard } from '@/components/beeyield/GlassTheme';
import { motion } from 'framer-motion';

const AdminDashboard: React.FC = () => {
    const { user, loading: authLoading, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

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
    const [harvests, setHarvests] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [batchYearFilter, setBatchYearFilter] = useState('all');
    const [batchHiveFilter, setBatchHiveFilter] = useState('');

    // Loading States
    const [isLoading, setIsLoading] = useState(true);

    // Modals
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [isApiaryModalOpen, setIsApiaryModalOpen] = useState(false);
    const [isHiveModalOpen, setIsHiveModalOpen] = useState(false);
    const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false);

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

    const [editingHarvest, setEditingHarvest] = useState<any | null>(null);
    const [harvestForm, setHarvestForm] = useState({
        hive_id: '',
        harvest_date: new Date().toISOString().split('T')[0],
        quantity_kg: 0,
        quality_score: 95,
        notes: '',
        farmer_id: ''
    });

    const [productVariantSizes, setProductVariantSizes] = useState<Record<string, string>>({});

    const [dashboardStats, setDashboardStats] = useState({
        totalRevenue: 0,
        pendingOrders: 0,
        totalHoneyKg: 0,
        totalAcres: 0,
        totalUsers: 0,
        totalApiaries: 0,
        totalHives: 0,
        totalFarmers: 0,
        totalHarvests: 0,
        categoryCounts: {
            honey: 0,
            learn: 0,
            sensors: 0
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

    const enrichAndSortBatches = React.useCallback((batchRows: any[], harvestRows: any[]) => {
        const harvestByCode = new Map(
            harvestRows
                .filter((row) => row?.batch_code)
                .map((row) => [row.batch_code, row])
        );

        return batchRows
            .map((batch) => {
                const harvest = harvestByCode.get(batch.batch_code);
                const harvestDate = harvest?.harvest_date || harvest?.date || batch.harvest_date;
                return {
                    ...batch,
                    hive_code: batch.hive_code || harvest?.hive?.hive_code || harvest?.hive_code || 'N/A',
                    harvest_year: harvestDate ? new Date(harvestDate).getFullYear() : null,
                    h_date: harvestDate,
                };
            })
            .sort((left, right) => new Date(right.h_date || 0).getTime() - new Date(left.h_date || 0).getTime());
    }, []);

    const farmerNameById = React.useMemo(
        () => Object.fromEntries(farmers.filter((row) => row?.id).map((row) => [row.id, row.name])),
        [farmers]
    );

    const apiaryNameById = React.useMemo(
        () => Object.fromEntries(apiaries.filter((row) => row?.id).map((row) => [row.id, row.name])),
        [apiaries]
    );

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/ceba/login');
        } else if (!authLoading && user && isAdmin) {
            initDashboard();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, authLoading, navigate, isAdmin]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab) {
            setActiveTab(tab);
        }
    }, [location.search]);

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

            // Preload all critical data for automatic population on entry
            const [
                ordersData, productsData, batchesData,
                apiariesData, hivesData, harvestsData,
                farmersData
            ] = await Promise.all([
                adminService.getOrders(),
                adminService.getProducts(),
                adminService.getBatches(),
                adminService.getApiaries(),
                adminService.getHives(),
                adminService.getHarvests(),
                adminService.getFarmers()
            ]);

            // Enrich batches with Hive info from harvests (linked by batch_code)
            setOrders(ordersData);
            setProducts(productsData);
            setBatches(enrichAndSortBatches(batchesData, harvestsData));
            setApiaries(apiariesData);
            setHives(hivesData);
            setHarvests(harvestsData);
            setFarmers(farmersData);

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
                    totalHarvests: (stats as any).total_harvests || 0,
                    categoryCounts: (stats as any).category_counts || {
                        honey: 0, learn: 0, sensors: 0
                    }
                });
            }

            setLoadedTabs(prev => {
                const next = new Set(prev);
                ['overview', 'apiaries', 'hives', 'harvests', 'farmers', 'orders', 'products', 'batches'].forEach(t => next.add(t));
                return next;
            });
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
                    const [batchesData, harvestsData] = await Promise.all([
                        adminService.getBatches(),
                        adminService.getHarvests()
                    ]);
                    setHarvests(harvestsData);
                    setBatches(enrichAndSortBatches(batchesData, harvestsData));
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
                case 'harvests': {
                    const [harvestsData, hivesData, farmersData, batchesData] = await Promise.all([
                        adminService.getHarvests(),
                        adminService.getHives(),
                        adminService.getFarmers(),
                        adminService.getBatches()
                    ]);
                    setHarvests(harvestsData);
                    setHives(hivesData);
                    setFarmers(farmersData);
                    setBatches(enrichAndSortBatches(batchesData, harvestsData));
                    setLoadedTabs(prev => {
                        const next = new Set(prev);
                        next.add('harvests');
                        next.add('hives');
                        next.add('farmers');
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

    const handleSaveHarvest = async () => {
        try {
            if (editingHarvest) {
                await adminService.updateHarvest(editingHarvest.id, harvestForm);
                toast.success("Harvest record updated");
            } else {
                await adminService.createHarvest(harvestForm);
                toast.success("New harvest recorded");
            }
            setIsHarvestModalOpen(false);
            setEditingHarvest(null);
            setHarvestForm({
                hive_id: '',
                harvest_date: new Date().toISOString().split('T')[0],
                quantity_kg: 0,
                quality_score: 95,
                notes: '',
                farmer_id: ''
            });
            loadAllData();
        } catch (error) {
            toast.error(editingHarvest ? "Failed to update harvest" : "Failed to record harvest");
        }
    };

    const handleEditHarvest = (harvest: any) => {
        setEditingHarvest(harvest);
        setHarvestForm({
            hive_id: harvest.hive_id || '',
            harvest_date: harvest.harvest_date || harvest.date || new Date().toISOString().split('T')[0],
            quantity_kg: harvest.quantity_kg || harvest.weight_kg || 0,
            quality_score: harvest.quality_score || 95,
            notes: harvest.notes || '',
            farmer_id: harvest.farmer_id || ''
        });
        setIsHarvestModalOpen(true);
    };

    const handleDeleteHarvest = async (id: string) => {
        if (confirm("Permanently delete this harvest record?")) {
            try {
                await adminService.deleteHarvest(id);
                toast.success("Harvest record deleted");
                loadAllData();
            } catch (error) {
                toast.error("Failed to delete harvest record");
            }
        }
    };


    if (authLoading || isLoading) {
        return (
            <BeeYieldPageShell className="flex flex-col justify-center items-center h-screen bg-muted/10 space-y-4 m-0">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-sm font-medium animate-pulse text-muted-foreground">Loading dashboard...</p>
            </BeeYieldPageShell>
        );
    }

    if (!isAdmin) {
        return (
            <BeeYieldPageShell className="flex flex-col justify-center items-center h-screen bg-muted/10 space-y-4 m-0">
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
                { id: 'harvests', label: 'Harvests', icon: History },
                { id: 'accounts', label: 'User Accounts', icon: Users },
            ]
        },
        {
            id: 'content',
            label: 'Content',
            icon: MessageSquare,
            children: [
                { id: 'reference-library', label: 'Reference Library', icon: Database },
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
        <BeeYieldPageShell className="p-0 m-0">
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
                                <TabsTrigger value="reference-library">Reference Library</TabsTrigger>
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

                        <TabsContent value="overview" className="space-y-6">
                            <PageHeader
                                icon={LayoutDashboard}
                                label="Management Console"
                                title="Admin Overview"
                                subtitle="Welcome to your centralized intelligence hub. Monitor network activity and store performance."
                                actions={
                                    <button onClick={loadAllData} className={glass.btnSecondary}>
                                        <RefreshCw className="w-4 h-4" /> Refresh Data
                                    </button>
                                }
                            />

                            {/* KPIs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                <GlassStatCard
                                    label="Total Revenue (KES)"
                                    value={dashboardStats.totalRevenue.toLocaleString()}
                                    icon={CreditCard}
                                    color="text-[#1B9157]"
                                />
                                <GlassStatCard
                                    label="Pending Orders"
                                    value={dashboardStats.pendingOrders}
                                    icon={Package}
                                    color="text-[#F4D03F]"
                                    index={1}
                                />
                                <GlassStatCard
                                    label="Active Apiaries"
                                    value={dashboardStats.totalApiaries}
                                    icon={MapPin}
                                    color="text-amber-500"
                                    index={2}
                                />
                                <GlassStatCard
                                    label="Total Honey Processed"
                                    value={`${dashboardStats.totalHoneyKg} kg`}
                                    icon={Database}
                                    color="text-blue-500"
                                    index={3}
                                />
                                <GlassStatCard
                                    label="Total Harvests"
                                    value={dashboardStats.totalHarvests}
                                    icon={History}
                                    color="text-purple-500"
                                    index={4}
                                />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Platform Audience */}
                                <div className="lg:col-span-4">
                                    <div className={cn(glass.section, "p-6 h-full flex flex-col justify-center")}>
                                        <h3 className={glass.sectionTitle}>Network Status</h3>
                                        <p className="text-xs text-muted-foreground mb-6">Real-time counts of active participants.</p>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center p-3 rounded-lg bg-[#F9F7F2] border border-[#F4D03F]/10">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-[#1B9157]/10 flex items-center justify-center text-[#1B9157]">
                                                        <Users className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold">Total Users</p>
                                                        <p className="text-[10px] text-muted-foreground">Registered accounts</p>
                                                    </div>
                                                </div>
                                                <span className="text-xl font-black">{dashboardStats.totalUsers}</span>
                                            </div>

                                            <div className="flex justify-between items-center p-3 rounded-lg bg-[#F9F7F2] border border-[#F4D03F]/10">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-[#F4D03F]/10 flex items-center justify-center text-amber-600">
                                                        <Leaf className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold">Verified Farmers</p>
                                                        <p className="text-[10px] text-muted-foreground">Master beekeepers</p>
                                                    </div>
                                                </div>
                                                <span className="text-xl font-black">{dashboardStats.totalFarmers}</span>
                                            </div>

                                            <div className="flex justify-between items-center p-3 rounded-lg bg-[#F9F7F2] border border-[#F4D03F]/10">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                        <Mail className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold">Subscribers</p>
                                                        <p className="text-[10px] text-muted-foreground">Newsletter audience</p>
                                                    </div>
                                                </div>
                                                <span className="text-xl font-black">{subscribers.length}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Activities */}
                                <div className="lg:col-span-4">
                                    <div className={cn(glass.section, "p-6 h-full")}>
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className={glass.sectionTitle}>Recent Orders</h3>
                                            <button onClick={() => setActiveTab('orders')} className="text-[#F4D03F] text-xs font-bold hover:underline">View All</button>
                                        </div>

                                        <div className="space-y-4">
                                            {orders.slice(0, 5).map((order, i) => (
                                                <div key={order.id || i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#F9F7F2] transition-colors border border-transparent hover:border-[#F4D03F]/10">
                                                    <div className="w-8 h-8 rounded-md bg-[#F4D03F]/10 flex items-center justify-center text-[#1A1A1A] font-bold text-xs">
                                                        {order.shipping_address?.first_name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-[#1A1A1A] truncate">
                                                            {order.shipping_address?.first_name || 'Customer'} {order.shipping_address?.last_name || ''}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground truncate">
                                                            Order {order.order_number || order.id.slice(0, 8)}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={cn(
                                                            "text-xs font-black block",
                                                            order.status === 'completed' ? "text-[#1B9157]" : "text-[#F4D03F]"
                                                        )}>
                                                            KES {order.total_amount?.toLocaleString() || '0'}
                                                        </span>
                                                        <span className="text-[9px] text-muted-foreground uppercase">{order.status}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {orders.length === 0 && (
                                                <p className="text-sm text-muted-foreground text-center py-10">No recent orders</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Batches */}
                                <div className="lg:col-span-4">
                                    <div className={cn(glass.section, "p-6 h-full")}>
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className={glass.sectionTitle}>Latest Traceability</h3>
                                            <button onClick={() => setActiveTab('batches')} className="text-[#F4D03F] text-xs font-bold hover:underline">View All</button>
                                        </div>

                                        <div className="space-y-4">
                                            {batches.slice(0, 5).map((batch, i) => (
                                                <div key={batch.id || i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#F9F7F2] transition-colors border border-transparent hover:border-[#F4D03F]/10">
                                                    <div className="w-8 h-8 rounded-md bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold">
                                                        <Database className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-[#1A1A1A] truncate">{batch.batch_code}</p>
                                                        <p className="text-[10px] text-muted-foreground truncate">{batch.honey_type} • {batch.quantity_kg}kg</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-[10px] font-mono text-muted-foreground block truncate max-w-[80px]">
                                                            {batch.block_hash ? batch.block_hash.slice(0, 8) + '...' : 'Pending'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                            {batches.length === 0 && (
                                                <p className="text-sm text-muted-foreground text-center py-10">No recent batches</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Interactive Map (Refined) */}
                            <div className={cn(glass.section, "p-0 overflow-hidden")}>
                                <div className="p-6 border-b border-[#F4D03F]/10 flex items-center justify-between bg-white z-10 relative">
                                    <div>
                                        <h3 className={glass.sectionTitle}>Global Apiary Network</h3>
                                        <p className="text-xs text-muted-foreground mt-1">Live tracking of {apiaries.length} distribution zones.</p>
                                    </div>
                                </div>
                                <div className="relative bg-[#F4D03F]/5 min-h-[400px]">
                                    {/* Map Background Pattern */}
                                    <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#1A1A1A_1px,transparent_1px)] [background-size:20px_20px]"></div>

                                    {/* Dynamic Map Markers */}
                                    {apiaries.length > 0 ? apiaries.map((apiary, idx) => {
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
                                                <div className="w-8 h-8 bg-[#F4D03F]/60 rounded-full flex items-center justify-center animate-ping absolute -ml-1 -mt-1 opacity-75"></div>
                                                <div className="relative z-10 w-6 h-6 bg-amber-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-[10px]">
                                                    {idx + 1}
                                                </div>
                                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white px-3 py-1.5 rounded-lg shadow-xl border border-[#F4D03F]/20 text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all z-50 pointer-events-none">
                                                    {apiary.name}
                                                    <span className="block text-[9px] text-muted-foreground font-normal">{apiary.location_county || 'Unknown Location'}</span>
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm font-medium">
                                            Map data gathering...
                                        </div>
                                    )}
                                </div>
                            </div>

                        </TabsContent>

                        {/* --- ORDERS TAB --- */}
                        <TabsContent value="orders" className="space-y-6">
                            <PageHeader
                                icon={Package}
                                label="Store Management"
                                title="Orders & Transactions"
                                subtitle="View and manage all customer transactions and fulfillment status."
                            />
                            <div className={cn(glass.section, "p-0 overflow-hidden")}>
                                <div className="p-6 border-b border-[#F4D03F]/10 flex items-center justify-between">
                                    <div>
                                        <h3 className={glass.sectionTitle}>Order Log</h3>
                                        <p className="text-xs text-muted-foreground mt-1">Complete history of platform purchases.</p>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-[#F4D03F]/10 bg-muted/20">
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
                                                    <TableRow key={order.id} className="hover:bg-muted/10 transition-colors border-b border-[#F4D03F]/10">
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
                            </div>

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
                            <PageHeader
                                icon={ShoppingBag}
                                label="Product Catalog"
                                title="Shop Inventory"
                                subtitle="Manage honey varieties and apiary products for the online store."
                                actions={
                                    <Button onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }} className={glass.btnPrimary}>
                                        <Plus className="mr-2 h-4 w-4" /> Add Product
                                    </Button>
                                }
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {products.map((product) => {
                                    const selectedSize = productVariantSizes[product.id] || product.variants?.[0]?.size;
                                    const selectedVariant = product.variants?.find(v => v.size === selectedSize) || product.variants?.[0];

                                    return (
                                        <div key={product.id} className={cn(glass.card, "group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 p-5 border border-transparent hover:border-[#F4D03F]/20")}>
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

                                                {/* Variant Selector */}
                                                {product.variants && product.variants.length > 1 && (
                                                    <div className="pt-1">
                                                        <Select
                                                            value={selectedSize}
                                                            onValueChange={(val) => setProductVariantSizes(prev => ({ ...prev, [product.id]: val }))}
                                                        >
                                                            <SelectTrigger className="w-full h-8 text-[10px] font-black rounded-lg bg-muted/30 border-none">
                                                                <SelectValue placeholder="Select Size" />
                                                            </SelectTrigger>
                                                            <SelectContent className="rounded-xl border-none shadow-glow">
                                                                {product.variants.map(v => (
                                                                    <SelectItem key={v.id} value={v.size} className="text-[10px] font-bold">
                                                                        {v.size} {v.batch_code ? `(${v.batch_code})` : ''}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                )}

                                                <div className="flex justify-between items-end pt-2">
                                                    <div>
                                                        <p className="text-[10px] font-black tracking-tighter text-muted-foreground mb-1">Price</p>
                                                        <span className="text-xl font-bold text-primary">KES {selectedVariant?.price_kes?.toLocaleString() || 0}</span>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <Button size="icon" variant="outline" onClick={() => handleEditProduct(product)} className="rounded-xl w-9 h-9 border-border/50 hover:bg-primary/10 hover:text-primary"><Edit className="h-4 w-4" /></Button>
                                                        <Button size="icon" variant="outline" className="rounded-xl w-9 h-9 border-border/50 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteProduct(product.id)}><Trash2 className="h-4 w-4" /></Button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 pt-2 text-[10px] font-bold text-muted-foreground border-t border-border/50 mt-2">
                                                    <Database className="w-3 h-3" />
                                                    <span>Stock: {selectedVariant?.stock_quantity || 0} units</span>
                                                    {selectedSize && <Badge variant="outline" className="ml-auto text-[8px] h-4 py-0 leading-none">{selectedSize}</Badge>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
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
                                            <Label htmlFor="product-name" className=" text-[10px] font-black ml-1">Product Name</Label>
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
                                            <Label htmlFor="product-description" className=" text-[10px] font-black ml-1">Description</Label>
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
                                                <Label htmlFor="product-category" className=" text-[10px] font-black ml-1">Category</Label>
                                                <Input
                                                    id="product-category"
                                                    name="product-category"
                                                    value={productForm.category}
                                                    onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                                                    className="rounded-xl h-11 bg-muted/50 border-border/50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="product-price" className=" text-[10px] font-black ml-1">Price (KES)</Label>
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
                                                <Label htmlFor="product-stock" className=" text-[10px] font-black ml-1">Stock Quantity</Label>
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
                                                <Label htmlFor="product-images" className=" text-[10px] font-black ml-1">Image URL</Label>
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
                            <div className="flex justify-between items-center mt-12 mb-6 px-2">
                                <div>
                                    <h3 className={glass.sectionTitle}>Stock Movements</h3>
                                    <p className="text-xs text-muted-foreground mt-1">Track inventory additions, removals, and adjustments.</p>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <Badge className="bg-[#1B9157]/10 text-[#1B9157] border-[#1B9157]/20 px-4 py-1.5 rounded-xl font-black text-[10px]">
                                        {stockMovements.length} RECORDS
                                    </Badge>
                                    <Button onClick={() => setIsStockModalOpen(true)} size="sm" className={cn(glass.btnSecondary, "h-8 px-4")}>
                                        <Plus className="w-3 h-3 mr-1" /> New Movement
                                    </Button>
                                </div>
                            </div>

                            <div className={cn(glass.section, "p-0 overflow-hidden")}>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-[#F4D03F]/10 bg-muted/20">
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
                            </div>

                            {/* Stock Movement Dialog */}
                            <Dialog open={isStockModalOpen} onOpenChange={setIsStockModalOpen}>
                                <DialogContent className="rounded-3xl border-none shadow-2xl glass sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle className="text-3xl font-black tracking-tighter text-foreground">Record Movement</DialogTitle>
                                        <DialogDescription>Register an addition or removal from product inventory.</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-5 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="stock-product" className=" text-[10px] font-black ml-1">Product</Label>
                                            <Select value={stockForm.product_id} onValueChange={(val) => setStockForm({ ...stockForm, product_id: val })}>
                                                <SelectTrigger id="stock-product" className="rounded-xl h-12 bg-muted/50 border-border/50">
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
                                                <Label htmlFor="stock-type" className=" text-[10px] font-black ml-1">Movement Type</Label>
                                                <Select value={stockForm.type} onValueChange={(val) => setStockForm({ ...stockForm, type: val })}>
                                                    <SelectTrigger id="stock-type" className="rounded-xl h-12 bg-muted/50 border-border/50">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl">
                                                        <SelectItem value="addition" className="font-bold">ADDITION (+)</SelectItem>
                                                        <SelectItem value="removal" className="font-bold">REMOVAL (-)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="stock-quantity" className=" text-[10px] font-black ml-1">Quantity</Label>
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
                                            <Label htmlFor="stock-reason" className=" text-[10px] font-black ml-1">Reason</Label>
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
                            <PageHeader
                                icon={History}
                                label="Verification Protocol"
                                title="Honey Batches"
                                subtitle="Verifiable production records and harvest history."
                                actions={
                                    <Button onClick={() => setIsBatchModalOpen(true)} className={glass.btnPrimary}>
                                        <Plus className="mr-2 h-4 w-4" /> Add Batch
                                    </Button>
                                }
                            />

                            <div className={cn(glass.section, "p-0 overflow-hidden")}>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-[#F4D03F]/10 bg-muted/20">
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Batch Code</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Honey Type</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Origin</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Farmer / Beekeeper</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Harvest Date</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px] text-right">Quantity (KG)</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Record ID</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px] text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {batches.length === 0 ? (
                                                <TableRow><TableCell colSpan={8} className="text-center h-48 text-muted-foreground font-medium">No honey batches yet.</TableCell></TableRow>
                                            ) : (
                                                batches.map((batch, i) => (
                                                    <TableRow
                                                        key={batch.id || i}
                                                        className="hover:bg-muted/10 transition-colors border-b border-[#F4D03F]/10 cursor-pointer"
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
                                                            <div className="flex items-center justify-end gap-1">
                                                                {batch.batch_code && (
                                                                    <Button
                                                                        size="icon"
                                                                        variant="outline"
                                                                        className="rounded-xl w-8 h-8 border-border/50 text-[#F4D03F] hover:bg-[#F4D03F] hover:text-[#1A1A1A]"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            window.open(`/trace?code=${batch.batch_code}`, '_blank');
                                                                        }}
                                                                        title="View public record"
                                                                    >
                                                                        <Globe className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                                <Button size="icon" variant="outline" className="rounded-xl w-8 h-8 border-border/50 text-blue-500 hover:bg-blue-500/10" onClick={(e) => { e.stopPropagation(); handleEditBatch(batch); }}>
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button size="icon" variant="outline" className="rounded-xl w-8 h-8 border-border/50 text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); handleDeleteBatch(batch.id); }}>
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
                            </div>

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
                            <PageHeader
                                icon={Users}
                                label="Agricultural Partners"
                                title="Partners & Producers"
                                subtitle="Directory of certified beekeepers and registered farmers."
                                actions={
                                    <Button
                                        onClick={() => setIsFarmerModalOpen(true)}
                                        className={glass.btnPrimary}
                                    >
                                        <Plus className="mr-2 h-4 w-4" /> Register Farmer
                                    </Button>
                                }
                            />

                            <div className={cn(glass.section, "p-0 overflow-hidden")}>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-[#F4D03F]/10 bg-muted/20">
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
                                                    <TableRow key={farmer.id} className="hover:bg-muted/10 transition-colors border-b border-[#F4D03F]/10">
                                                        <TableCell className="px-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-xl bg-[#F4D03F]/20 flex items-center justify-center font-black text-[#F4D03F]">
                                                                    {farmer.name?.[0]?.toUpperCase() || 'F'}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="font-bold truncate">{farmer.name}</div>
                                                                    <div className="text-[10px] text-muted-foreground font-mono truncate">{farmer.farmer_id || 'ID-PENDING'}</div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="px-6">
                                                            <div className="text-sm font-medium">{farmer.phone}</div>
                                                            <div className="text-[10px] text-muted-foreground">{farmer.email || 'No email'}</div>
                                                        </TableCell>
                                                        <TableCell className="px-6">
                                                            <div className="text-sm font-bold">{farmer.county || 'N/A'}</div>
                                                            <div className="text-[10px] text-muted-foreground">{farmer.region || farmer.location_name || ''}</div>
                                                        </TableCell>
                                                        <TableCell className="px-6">
                                                            <Badge variant="outline" className="bg-blue-500/5 text-blue-600 border-blue-200/50 rounded-lg">
                                                                {farmer.experience_years} Years
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="px-6">
                                                            <Badge className={cn(
                                                                "rounded-lg border-none px-3 py-1 text-[10px] font-black",
                                                                farmer.certification_status === 'Certified'
                                                                    ? 'bg-[#1B9157]/10 text-[#1B9157]'
                                                                    : 'bg-[#F4D03F]/10 text-[#F4D03F]'
                                                            )}>
                                                                {farmer.certification_status || 'Pending'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="px-6 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button size="icon" variant="outline" className="rounded-xl w-8 h-8 border-border/50 text-primary hover:bg-primary/10" onClick={() => handleEditFarmer(farmer)}>
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
                            </div>

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
                                                <Label htmlFor="farmer-fullname" className=" text-[10px] font-black ml-1">Full Name</Label>
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
                                                <Label htmlFor="farmer-phone" className=" text-[10px] font-black ml-1">Phone Number</Label>
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
                                                <Label htmlFor="farmer-email" className=" text-[10px] font-black ml-1">Email Address</Label>
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
                                                <Label htmlFor="farmer-id-number" className=" text-[10px] font-black ml-1">ID Number</Label>
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
                                                <Label htmlFor="farmer-county" className=" text-[10px] font-black ml-1">County</Label>
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
                                                <Label htmlFor="farmer-region" className=" text-[10px] font-black ml-1">Region</Label>
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
                                                <Label htmlFor="farmer-experience" className=" text-[10px] font-black ml-1">Years Experience</Label>
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
                                            <Label htmlFor="farmer-location" className=" text-[10px] font-black ml-1">Location Details / Ward</Label>
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
                                            <Label htmlFor="farmer-story" className=" text-[10px] font-black ml-1">The Beekeeper's Story</Label>
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
                        {/* --- APIARIES TAB --- */}
                        <TabsContent value="apiaries" className="space-y-6">
                            <PageHeader
                                icon={MapPin}
                                label="Production Capacity"
                                title="Apiary Locations"
                                subtitle="Strategic honey production sites and cluster management."
                                actions={
                                    <Button
                                        onClick={() => setIsApiaryModalOpen(true)}
                                        className={glass.btnPrimary}
                                    >
                                        <Plus className="mr-2 h-4 w-4" /> Register Apiary
                                    </Button>
                                }
                            />

                            <div className={cn(glass.section, "p-0 overflow-hidden")}>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-[#F4D03F]/10 bg-muted/20">
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Apiary Name</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Assigned Partner</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Coordination</TableHead>
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
                                                    <TableRow key={apiary.id} className="hover:bg-muted/10 transition-colors border-b border-[#F4D03F]/10">
                                                        <TableCell className="px-6 font-black text-primary tracking-tight">{apiary.name}</TableCell>
                                                        <TableCell className="px-6">
                                                            <div className="font-semibold text-sm">{apiary.farmers?.name || apiary.farmer?.name || farmerNameById[apiary.farmer_id] || 'Assigned Partner'}</div>
                                                        </TableCell>
                                                        <TableCell className="px-6">
                                                            <div className="text-sm font-bold">{apiary.location_name || apiary.county}</div>
                                                            <div className="text-[10px] text-muted-foreground">{apiary.region}</div>
                                                        </TableCell>
                                                        <TableCell className="px-6 text-right font-black">
                                                            <Badge variant="outline" className="rounded-lg font-black border-primary/20 bg-primary/5">
                                                                {hives.filter(h => h.apiary_id === apiary.id).length} UNITS
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="px-6">
                                                            <Badge className={cn(
                                                                "rounded-lg border-none px-3 py-1 text-[10px] font-black",
                                                                apiary.status === 'active'
                                                                    ? "bg-[#1B9157]/10 text-[#1B9157]"
                                                                    : "bg-muted text-muted-foreground"
                                                            )}>
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
                            </div>

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
                            <PageHeader
                                icon={Database}
                                label="Inventory Asset"
                                title="Hive Registry"
                                subtitle="Detailed tracking of individual hive units and health metrics."
                                actions={
                                    <Button
                                        onClick={() => setIsHiveModalOpen(true)}
                                        className={glass.btnPrimary}
                                    >
                                        <Plus className="mr-2 h-4 w-4" /> Register Hive
                                    </Button>
                                }
                            />

                            <div className={cn(glass.section, "p-0 overflow-hidden")}>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-[#F4D03F]/10 bg-muted/20">
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
                                                    <TableRow key={hive.id} className="hover:bg-muted/10 transition-colors border-b border-[#F4D03F]/10">
                                                        <TableCell className="px-6 font-mono font-black text-primary tracking-tighter">{hive.hive_code}</TableCell>
                                                        <TableCell className="px-6 font-semibold">{hive.apiaries?.name || hive.apiary?.name || apiaryNameById[hive.apiary_id] || 'Assigned Site'}</TableCell>
                                                        <TableCell className="px-6">
                                                            <Badge variant="outline" className="rounded-lg text-[10px] font-black">{hive.type || 'Standard'}</Badge>
                                                        </TableCell>
                                                        <TableCell className="px-6 text-sm text-muted-foreground tabular-nums opacity-70">{new Date(hive.installation_date).toLocaleDateString()}</TableCell>
                                                        <TableCell className="px-6">
                                                            <Badge className={cn(
                                                                "rounded-lg border-none px-3 py-1 text-[10px] font-black",
                                                                hive.status === 'active'
                                                                    ? "bg-[#1B9157]/10 text-[#1B9157]"
                                                                    : "bg-[#F4D03F]/10 text-[#F4D03F]"
                                                            )}>
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
                            </div>

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

                        {/* --- HARVESTS TAB --- */}
                        <TabsContent value="harvests" className="space-y-6">
                            <PageHeader
                                icon={History}
                                label="Production Yield"
                                title="Honey Harvests"
                                subtitle="Automated tracking of honey extraction across the network."
                                actions={
                                    <Button
                                        onClick={() => setIsHarvestModalOpen(true)}
                                        className={glass.btnPrimary}
                                    >
                                        <Plus className="mr-2 h-4 w-4" /> Record Harvest
                                    </Button>
                                }
                            />

                            <div className={cn(glass.section, "p-0 overflow-hidden")}>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-[#F4D03F]/10 bg-muted/20">
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Date</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Hive</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Farmer</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px] text-right">Yield (KG)</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Grade</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px] text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {harvests.length === 0 ? (
                                                <TableRow><TableCell colSpan={6} className="text-center h-48 text-muted-foreground font-medium">No harvest records available.</TableCell></TableRow>
                                            ) : (
                                                harvests.map((harvest) => (
                                                    <TableRow key={harvest.id} className="hover:bg-muted/10 transition-colors border-b border-[#F4D03F]/10">
                                                        <TableCell className="px-6 font-mono font-black text-primary tabular-nums">{new Date(harvest.harvest_date || harvest.date).toLocaleDateString()}</TableCell>
                                                        <TableCell className="px-6 font-semibold">{harvest.hive?.hive_code || harvest.hive_code || 'N/A'}</TableCell>
                                                        <TableCell className="px-6 font-medium opacity-80">{harvest.farmer?.name || farmerNameById[harvest.farmer_id] || harvest.harvester_name || 'N/A'}</TableCell>
                                                        <TableCell className="px-6 text-right font-black text-primary">{harvest.quantity_kg || harvest.weight_kg} KG</TableCell>
                                                        <TableCell className="px-6">
                                                            <Badge className={cn(
                                                                "rounded-lg border-none px-3 py-1 text-[10px] font-black",
                                                                (harvest.quality_score || 0) >= 90 ? "bg-[#1B9157]/10 text-[#1B9157]" : "bg-[#F4D03F]/10 text-[#F4D03F]"
                                                            )}>
                                                                SCORE {harvest.quality_score || harvest.quality_grade || 'N/A'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="px-6 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button size="icon" variant="outline" className="rounded-xl w-8 h-8 border-border/50 hover:bg-primary/10 hover:text-primary" onClick={() => handleEditHarvest(harvest)}>
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button size="icon" variant="outline" className="rounded-xl w-8 h-8 border-border/50 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteHarvest(harvest.id)}>
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
                            </div>

                            {/* Traceability Batches Section */}
                            <div className="mt-12 space-y-6">
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                    <PageHeader
                                        icon={Package}
                                        label="Traceability"
                                        title="Honey Batches"
                                        subtitle="Immutable traceability records per hive per harvest across all years."
                                    />
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <Label className="text-[10px] uppercase font-black opacity-50">Hive:</Label>
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                                                <Input
                                                    className="w-[140px] pl-8 h-9 rounded-xl border-none glass text-xs font-bold"
                                                    placeholder="Search Hive..."
                                                    value={batchHiveFilter}
                                                    onChange={(e) => setBatchHiveFilter(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Label className="text-[10px] uppercase font-black opacity-50">Year:</Label>
                                            <Select
                                                defaultValue={batchYearFilter}
                                                onValueChange={setBatchYearFilter}
                                            >
                                                <SelectTrigger className="w-[110px] h-9 rounded-xl border-none glass text-xs font-bold">
                                                    <SelectValue placeholder="All Years" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-none glass shadow-2xl">
                                                    <SelectItem value="all">All Years</SelectItem>
                                                    <SelectItem value="2026">2026</SelectItem>
                                                    <SelectItem value="2025">2025</SelectItem>
                                                    <SelectItem value="2024">2024</SelectItem>
                                                    <SelectItem value="2023">2023</SelectItem>
                                                    <SelectItem value="2022">2022</SelectItem>
                                                    <SelectItem value="2021">2021</SelectItem>
                                                    <SelectItem value="2020">2020</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                <div className={cn(glass.section, "p-0 overflow-hidden")}>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-b border-[#F4D03F]/10 bg-muted/20">
                                                    <TableHead className="py-4 px-6 font-black text-[10px]">Batch Code</TableHead>
                                                    <TableHead className="py-4 px-6 font-black text-[10px]">Hive</TableHead>
                                                    <TableHead className="py-4 px-6 font-black text-[10px]">Harvest Date</TableHead>
                                                    <TableHead className="py-4 px-6 font-black text-[10px]">Honey Type</TableHead>
                                                    <TableHead className="py-4 px-6 font-black text-[10px] text-right">Quantity (KG)</TableHead>
                                                    <TableHead className="py-4 px-6 font-black text-[10px]">Grade</TableHead>
                                                    <TableHead className="py-4 px-6 font-black text-[10px]">Blockchain Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {batches
                                                    .filter(b => batchYearFilter === 'all' || b.harvest_year?.toString() === batchYearFilter)
                                                    .filter(b => !batchHiveFilter || b.hive_code?.toLowerCase().includes(batchHiveFilter.toLowerCase()))
                                                    .length === 0 ? (
                                                    <TableRow><TableCell colSpan={7} className="text-center h-48 text-muted-foreground font-medium">No traceability batches found for this criteria.</TableCell></TableRow>
                                                ) : (
                                                    batches
                                                        .filter(b => batchYearFilter === 'all' || b.harvest_year?.toString() === batchYearFilter)
                                                        .filter(b => !batchHiveFilter || b.hive_code?.toLowerCase().includes(batchHiveFilter.toLowerCase()))
                                                        .map((batch) => (
                                                            <TableRow key={batch.id} className="hover:bg-muted/10 transition-colors border-b border-[#F4D03F]/10">
                                                                <TableCell className="px-6 font-mono font-black text-primary tabular-nums">{batch.batch_code}</TableCell>
                                                                <TableCell className="px-6 font-semibold text-primary/80">{batch.hive_code}</TableCell>
                                                                <TableCell className="px-6 font-semibold">{new Date(batch.harvest_date).toLocaleDateString()}</TableCell>
                                                                <TableCell className="px-6 font-medium opacity-80">{batch.honey_type || 'N/A'}</TableCell>
                                                                <TableCell className="px-6 text-right font-black text-primary">{batch.quantity_kg} KG</TableCell>
                                                                <TableCell className="px-6">
                                                                    <Badge className={cn(
                                                                        "rounded-lg border-none px-3 py-1 text-[10px] font-black",
                                                                        batch.quality_grade === 'A' ? "bg-[#1B9157]/10 text-[#1B9157]" : "bg-[#F4D03F]/10 text-[#F4D03F]"
                                                                    )}>
                                                                        GRADE {batch.quality_grade || 'N/A'}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="px-6">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                                                        <span className="font-mono text-[9px] opacity-60 truncate max-w-[120px]" title={batch.block_hash}>{batch.block_hash || 'Pending...'}</span>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </div>

                            {/* Harvest Modal */}
                            <Dialog open={isHarvestModalOpen} onOpenChange={(open) => { setIsHarvestModalOpen(open); if (!open) setEditingHarvest(null); }}>
                                <DialogContent className="rounded-3xl border-none shadow-2xl glass max-w-xl">
                                    <DialogHeader>
                                        <DialogTitle className="text-3xl font-black tracking-tighter">{editingHarvest ? 'Edit Harvest' : 'Record Harvest'}</DialogTitle>
                                        <DialogDescription>Log honey yield from a specific hive.</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-6 py-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className=" text-[10px] font-black ml-1">Target Hive</Label>
                                                <Select value={harvestForm.hive_id} onValueChange={val => setHarvestForm({ ...harvestForm, hive_id: val })}>
                                                    <SelectTrigger className="rounded-xl h-12 bg-muted/50 border-border/50">
                                                        <SelectValue placeholder="Select Hive" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl border-border/50">
                                                        {hives.map(h => (
                                                            <SelectItem key={h.id} value={h.id}>{h.hive_code}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className=" text-[10px] font-black ml-1">Harvest Date</Label>
                                                <Input
                                                    id="harvest-date"
                                                    name="harvest-date"
                                                    type="date"
                                                    value={harvestForm.harvest_date}
                                                    onChange={e => setHarvestForm({ ...harvestForm, harvest_date: e.target.value })}
                                                    className="rounded-xl h-12 bg-muted/50 border-border/50"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className=" text-[10px] font-black ml-1">Yield (KG)</Label>
                                                <Input
                                                    id="harvest-weight"
                                                    name="harvest-weight"
                                                    type="number"
                                                    step="0.1"
                                                    value={harvestForm.quantity_kg}
                                                    onChange={e => setHarvestForm({ ...harvestForm, quantity_kg: parseFloat(e.target.value) || 0 })}
                                                    className="rounded-xl h-12 bg-muted/50 border-border/50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className=" text-[10px] font-black ml-1">Quality Score</Label>
                                                <Input
                                                    id="harvest-quality"
                                                    name="harvest-quality"
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={harvestForm.quality_score}
                                                    onChange={e => setHarvestForm({ ...harvestForm, quality_score: parseInt(e.target.value) || 0 })}
                                                    className="rounded-xl h-12 bg-muted/50 border-border/50"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className=" text-[10px] font-black ml-1">Assigned Partner / Farmer</Label>
                                            <Select value={harvestForm.farmer_id} onValueChange={val => setHarvestForm({ ...harvestForm, farmer_id: val })}>
                                                <SelectTrigger className="rounded-xl h-12 bg-muted/50 border-border/50">
                                                    <SelectValue placeholder="Select Farmer" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-border/50">
                                                    {farmers.map(f => (
                                                        <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className=" text-[10px] font-black ml-1">Notes</Label>
                                            <Textarea
                                                id="harvest-notes"
                                                name="harvest-notes"
                                                placeholder="Specific observations during harvest..."
                                                value={harvestForm.notes}
                                                onChange={e => setHarvestForm({ ...harvestForm, notes: e.target.value })}
                                                className="rounded-xl bg-muted/50 border-border/50"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleSaveHarvest} className="w-full h-14 rounded-2xl shadow-glow font-black transition-all hover:scale-[1.02]">
                                            {editingHarvest ? 'Update Yield Records' : 'Record Yield'}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </TabsContent>

                        {/* --- TEAM MANAGEMENT (SUPER ADMIN ONLY) --- */}
                        {
                            isSuperAdmin && (
                                <TabsContent value="team" className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                                    <PageHeader
                                        icon={Shield}
                                        label="Administrative Control"
                                        title="Team Management"
                                        subtitle="Define administrative roles and control system permissions."
                                        actions={
                                            <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 rounded-xl font-black text-[10px] tracking-tighter">
                                                {systemUsers.length} MEMBERS
                                            </Badge>
                                        }
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {systemUsers.map((userObj) => (
                                            <div key={userObj.id} className={cn(glass.card, "group overflow-hidden")}>
                                                <div className="p-6 relative">
                                                    <div className="flex justify-between items-start mb-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary text-xl relative shadow-glow">
                                                                {userObj.email?.[0].toUpperCase()}
                                                                {userObj.role === 'super_admin' && (
                                                                    <div className="absolute -top-1 -right-1 bg-[#F4D03F] text-[#1A1A1A] rounded-xl p-0.5 shadow-lg border-2 border-[#1A1A1A]">
                                                                        <Crown className="w-3 h-3" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-lg font-black tracking-tighter truncate">{userObj.first_name || 'Anonymous'} {userObj.last_name || ''}</div>
                                                                <div className="font-mono text-[9px] truncate opacity-50 uppercase tracking-widest">{userObj.email}</div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4 pt-4 border-t border-[#F4D03F]/10">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Authority</span>
                                                            <Select
                                                                defaultValue={userObj.role}
                                                                onValueChange={(value) => handleUpdateUserRole(userObj.id, value)}
                                                                disabled={userObj.role === 'super_admin' && userObj.email === user?.email}
                                                            >
                                                                <SelectTrigger className="w-32 h-8 rounded-xl text-[10px] font-black border-none bg-background/50">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent className="rounded-xl">
                                                                    <SelectItem value="user">User</SelectItem>
                                                                    <SelectItem value="admin">Admin</SelectItem>
                                                                    <SelectItem value="super_admin">Super Admin</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div className="flex gap-2 pt-2">
                                                            <Button
                                                                variant="outline"
                                                                className="flex-1 rounded-xl h-10 border-border/50 text-[10px] font-black hover:bg-primary/10 hover:text-primary transition-all active:scale-95"
                                                                onClick={() => handleEditUser(userObj)}
                                                            >
                                                                <Edit className="h-4 w-4 mr-2" /> Modify
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                className="flex-1 rounded-xl h-10 border-border/50 text-[10px] font-black hover:bg-destructive/10 hover:text-destructive group-hover:border-destructive/30 transition-all active:scale-95"
                                                                onClick={() => handleDeleteUser(userObj.id)}
                                                                disabled={userObj.email === user?.email}
                                                            >
                                                                <UserMinus className="h-4 w-4 mr-2" /> Revoke
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        <div
                                            onClick={() => { setEditingUser(null); setUserForm({ first_name: '', last_name: '', email: '', password: '', role: 'user' }); setIsUserModalOpen(true); }}
                                            className="border-dashed border-2 border-[#F4D03F]/20 bg-background/20 rounded-3xl flex flex-col items-center justify-center p-8 text-muted-foreground hover:border-[#F4D03F]/50 hover:bg-[#F4D03F]/5 cursor-pointer transition-all group h-full min-h-[220px]"
                                        >
                                            <div className="p-4 rounded-full bg-[#F4D03F]/10 mb-4 group-hover:scale-110 transition-transform">
                                                <Users className="h-8 w-8 text-[#F4D03F]/50" />
                                            </div>
                                            <h3 className="font-black text-xs text-[#F4D03F]">Add Member</h3>
                                            <p className="text-[10px] font-medium text-center mt-2 opacity-60">Initialize new account parameters</p>
                                        </div>
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
                                                        <Label htmlFor="user-firstname" className=" text-[10px] font-black ml-1">First Name</Label>
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
                                                        <Label htmlFor="user-lastname" className=" text-[10px] font-black ml-1">Last Name</Label>
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
                                                    <Label htmlFor="user-email" className=" text-[10px] font-black ml-1">Email Address</Label>
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
                                                        <Label htmlFor="user-password" className=" text-[10px] font-black ml-1">Access Password</Label>
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
                            <PageHeader
                                icon={Bug}
                                label="Ecosystem Services"
                                title="Pollination Requests"
                                subtitle="Inbound service requests for crop pollination and hive placement."
                                actions={
                                    <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 rounded-xl font-black text-[10px]">
                                        {pollinationRequests.length} REQUESTS
                                    </Badge>
                                }
                            />

                            <div className={cn(glass.section, "p-0 overflow-hidden")}>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-[#F4D03F]/10 bg-muted/20">
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
                                                    <TableRow key={req.id} className="hover:bg-muted/10 transition-colors border-b border-[#F4D03F]/10">
                                                        <TableCell className="px-6 font-bold">{req.name || req.first_name}</TableCell>
                                                        <TableCell className="px-6 text-sm">{req.email}</TableCell>
                                                        <TableCell className="px-6 text-[10px] font-mono tracking-tighter">{req.phone}</TableCell>
                                                        <TableCell className="px-6">
                                                            <Badge variant="outline" className="rounded-lg bg-primary/5 text-primary border-primary/10">
                                                                {req.crop_type || req.crop}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="px-6">
                                                            <div className="font-black text-xs">{req.farm_size || req.acreage || req.farm_size_acres} <span className="text-[8px] opacity-70">ACRES</span></div>
                                                        </TableCell>
                                                        <TableCell className="px-6 text-[10px] font-medium text-muted-foreground">{req.location || req.county}</TableCell>
                                                        <TableCell className="px-6 text-[10px] font-mono opacity-70">
                                                            {req.contract_start_date
                                                                ? `${new Date(req.contract_start_date).toLocaleDateString()} - ${new Date(req.contract_end_date).toLocaleDateString()}`
                                                                : new Date(req.created_at).toLocaleDateString()
                                                            }
                                                        </TableCell>
                                                        <TableCell className="px-6">
                                                            <Select defaultValue={req.status || 'pending'} onValueChange={(val) => adminService.updatePollinationRequestStatus(req.id, val).then(() => { toast.success('Status updated'); loadAllData(); })}>
                                                                <SelectTrigger className="h-8 w-[110px] rounded-xl text-[9px] font-black bg-background/50 border-none">
                                                                    <SelectValue />
                                                                </SelectTrigger>
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
                            </div>

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
                            <PageHeader
                                icon={MessageSquare}
                                label="Public Relations"
                                title="Contact Submissions"
                                subtitle="Inbound messages and inquiries from the official portal."
                                actions={
                                    <Badge className={cn(glass.badge, "px-4 py-1.5 bg-[#F4D03F]/20 text-[#1A1A1A] border-[#F4D03F]/40")}>
                                        {contacts.length} MESSAGES
                                    </Badge>
                                }
                            />

                            <div className={cn(glass.section, "p-0 overflow-hidden")}>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-[#F4D03F]/10 bg-muted/20">
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Sender</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Contact Info</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px]">Subject</TableHead>
                                                <TableHead className="py-4 px-6 font-black text-[10px] max-w-md">Message Preview</TableHead>
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
                                                    <TableRow key={contact.id} className="hover:bg-muted/10 transition-colors border-b border-[#F4D03F]/10">
                                                        <TableCell className="px-6">
                                                            <div className="font-bold text-sm tracking-tight">{contact.name || `${contact.first_name} ${contact.last_name}`}</div>
                                                        </TableCell>
                                                        <TableCell className="px-6">
                                                            <div className="text-[10px] font-medium opacity-80">{contact.email}</div>
                                                            <div className="text-[9px] font-mono text-muted-foreground">{contact.phone || ''}</div>
                                                        </TableCell>
                                                        <TableCell className="px-6">
                                                            <Badge variant="outline" className="rounded-lg text-[9px] font-black tracking-widest bg-muted/30">
                                                                {contact.subject?.toUpperCase() || 'GENERAL'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="px-6 text-[11px] text-muted-foreground max-w-md truncate font-medium">
                                                            {contact.message}
                                                        </TableCell>
                                                        <TableCell className="px-6 text-[10px] font-mono opacity-70">
                                                            {new Date(contact.created_at).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell className="px-6">
                                                            <Select defaultValue={contact.status || 'new'} onValueChange={(val) => adminService.updateContactRequestStatus(contact.id, val).then(() => { toast.success('Status updated'); loadAllData(); })}>
                                                                <SelectTrigger className="h-8 w-[90px] rounded-xl text-[9px] font-black bg-background/50 border-none">
                                                                    <SelectValue />
                                                                </SelectTrigger>
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
                            </div>

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
                            <PageHeader
                                icon={Mail}
                                label="Audience Growth"
                                title="Newsletter Subscribers"
                                subtitle="Directory of active email subscriptions and mailing lists."
                            />

                            <div className={cn(glass.section, "p-0 overflow-hidden")}>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-b border-[#F4D03F]/10 bg-muted/20">
                                            <TableHead className="py-4 px-6 font-black text-[10px]">Email Address</TableHead>
                                            <TableHead className="py-4 px-6 font-black text-[10px]">Subscriber Name</TableHead>
                                            <TableHead className="py-4 px-6 font-black text-[10px]">Subscription Date</TableHead>
                                            <TableHead className="py-4 px-6 font-black text-[10px] text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {subscribers.length === 0 ? (
                                            <TableRow><TableCell colSpan={4} className="text-center h-48 text-muted-foreground font-medium">No subscribers yet.</TableCell></TableRow>
                                        ) : (
                                            subscribers.map((sub) => (
                                                <TableRow key={sub.id} className="hover:bg-muted/10 transition-colors border-b border-[#F4D03F]/10">
                                                    <TableCell className="px-6">
                                                        <div className="font-bold text-primary tracking-tight">{sub.email}</div>
                                                    </TableCell>
                                                    <TableCell className="px-6 font-medium text-muted-foreground">
                                                        {sub.first_name || <span className="text-[10px] font-black opacity-50">ANONYMOUS</span>}
                                                    </TableCell>
                                                    <TableCell className="px-6 text-[10px] font-mono opacity-70">
                                                        {new Date(sub.created_at).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="px-6 text-right">
                                                        <Button size="icon" variant="outline" className="rounded-xl w-8 h-8 border-border/50 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteSubscriber(sub.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
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

                        <TabsContent value="reference-library" className="space-y-6">
                            <ReferenceLibraryTab />
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
