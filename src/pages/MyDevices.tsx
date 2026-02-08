
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Battery, Signal, SignalLow, SignalHigh, WifiOff, HardDrive, Wrench, Plus, MessageSquare } from 'lucide-react';

interface Device {
    serial_number: string;
    name: string;
    model: string;
    status: 'online' | 'offline' | 'maintenance';
    firmware_ver: string;
    battery_level: number;
    last_sync: string;
    linked_apiary_id: string | null;
}

interface Ticket {
    id: string;
    subject: string;
    message: string;
    category: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    created_at: string;
    device_sn: string | null;
}

export default function MyDevices() {
    const [isSupportOpen, setIsSupportOpen] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
    const queryClient = useQueryClient();

    // --- Queries ---

    const { data: devices, isLoading: isLoadingDevices } = useQuery({
        queryKey: ['devices'],
        queryFn: async () => {
            const { data: { user } } = await supabase!.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data, error } = await supabase!
                .from('devices')
                .select('*')
                .eq('user_id', user.id);

            if (error) throw error;
            return data as Device[];
        },
    });

    const { data: tickets, isLoading: isLoadingTickets } = useQuery({
        queryKey: ['support_tickets'],
        queryFn: async () => {
            const { data: { user } } = await supabase!.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data, error } = await supabase!
                .from('support_tickets')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Ticket[];
        },
    });

    // --- Mutations ---

    const createTicketMutation = useMutation({
        mutationFn: async (newTicket: any) => {
            const { data: { user } } = await supabase!.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase!
                .from('support_tickets')
                .insert({ ...newTicket, user_id: user.id });

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['support_tickets'] });
            setIsSupportOpen(false);
            toast.success('Support ticket created successfully');
        },
        onError: (error) => {
            toast.error(`Failed to create ticket: ${error.message}`);
        }
    });

    const updateDeviceMutation = useMutation({
        mutationFn: async ({ serial_number, updates }: { serial_number: string, updates: any }) => {
            const { error } = await supabase!
                .from('devices')
                .update(updates)
                .eq('serial_number', serial_number);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['devices'] });
            toast.success('Device updated');
        },
        onError: (error) => {
            toast.error(`Failed to update device: ${error.message}`);
        }
    });

    // --- UI Helpers ---

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'offline': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'maintenance': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    };

    const getBatteryIcon = (level: number) => {
        if (level > 20) return <Battery className="w-4 h-4 text-green-400" />;
        return <Battery className="w-4 h-4 text-red-500 animate-pulse" />;
    };

    const handleSubmitTicket = (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        createTicketMutation.mutate({
            subject: formData.get('subject') as string,
            message: formData.get('message') as string,
            category: formData.get('category') as string,
            device_sn: formData.get('device_sn') === 'none' ? null : formData.get('device_sn'),
            status: 'open'
        });
    };

    return (
        <div className="container mx-auto p-6 space-y-8 min-h-screen bg-transparent">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent">
                        My Devices
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage your BeeYield Hubs and get support.</p>
                </div>

                <Button
                    onClick={() => setIsSupportOpen(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contact Support
                </Button>
            </div>

            <Tabs defaultValue="devices" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="devices">My Fleet</TabsTrigger>
                    <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
                </TabsList>

                <TabsContent value="devices" className="mt-6 space-y-6">
                    {/* Device Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {isLoadingDevices ? (
                            <p>Loading devices...</p>
                        ) : devices?.length === 0 ? (
                            <Card className="col-span-full bg-white/5 border-dashed border-white/20 p-12 text-center">
                                <div className="flex flex-col items-center justify-center space-y-4">
                                    <HardDrive className="w-12 h-12 text-muted-foreground" />
                                    <h3 className="text-xl font-semibold">No devices found</h3>
                                    <p className="text-muted-foreground">Register a new BeeYield Hub to get started.</p>
                                    <Button variant="outline">Register New Device</Button>
                                </div>
                            </Card>
                        ) : (
                            devices?.map((device) => (
                                <Card key={device.serial_number} className="bg-card/50 backdrop-blur-sm border-white/10 hover:border-amber-500/30 transition-all duration-300">
                                    <CardHeader className="flex flex-row items-start justify-between pb-2">
                                        <div>
                                            <CardTitle className="text-lg font-medium">{device.name}</CardTitle>
                                            <CardDescription className="font-mono text-xs opacity-70">{device.serial_number}</CardDescription>
                                        </div>
                                        <Badge variant="outline" className={getStatusColor(device.status)}>
                                            {device.status.toUpperCase()}
                                        </Badge>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="flex flex-col space-y-1">
                                                <span className="text-muted-foreground text-xs">Model</span>
                                                <span>{device.model}</span>
                                            </div>
                                            <div className="flex flex-col space-y-1">
                                                <span className="text-muted-foreground text-xs">Firmware</span>
                                                <span>v{device.firmware_ver}</span>
                                            </div>
                                            <div className="flex flex-col space-y-1">
                                                <span className="text-muted-foreground text-xs">Battery</span>
                                                <div className="flex items-center gap-2">
                                                    {getBatteryIcon(device.battery_level)}
                                                    <span>{device.battery_level}%</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col space-y-1">
                                                <span className="text-muted-foreground text-xs">Last Sync</span>
                                                <span>{new Date(device.last_sync).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-between pt-2 border-t border-white/5">
                                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
                                            Settings
                                        </Button>
                                        <Button variant="outline" size="sm" className="border-amber-500/20 text-amber-500 hover:bg-amber-500/10">
                                            View Details
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="tickets" className="mt-6">
                    <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                        <CardHeader>
                            <CardTitle>Your Support Tickets</CardTitle>
                            <CardDescription>View and manage your technical support requests.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoadingTickets ? (
                                <div className="text-center py-8">Loading tickets...</div>
                            ) : tickets?.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    No support tickets found. Everything seems to be running smoothly!
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {tickets?.map((ticket) => (
                                        <div key={ticket.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-white">{ticket.subject}</span>
                                                    <Badge variant="secondary" className="text-[10px]">{ticket.category}</Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-1">{ticket.message}</p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                                                    <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                                                    {ticket.device_sn && <span>• {ticket.device_sn}</span>}
                                                </div>
                                            </div>
                                            <Badge className={`
                                        ${ticket.status === 'open' ? 'bg-blue-500/20 text-blue-400' : ''}
                                        ${ticket.status === 'resolved' ? 'bg-green-500/20 text-green-400' : ''}
                                        ${ticket.status === 'closed' ? 'bg-gray-500/20 text-gray-400' : ''}
                                    `}>
                                                {ticket.status.toUpperCase()}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Support Ticket Dialog */}
            <Dialog open={isSupportOpen} onOpenChange={setIsSupportOpen}>
                <DialogContent className="sm:max-w-[425px] bg-[#0F1115] border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Contact Support</DialogTitle>
                        <DialogDescription>
                            Describe your issue below. Our team typically responds within 24 hours.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitTicket} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select name="category" defaultValue="hardware">
                                <SelectTrigger className="bg-white/5 border-white/10">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0F1115] border-white/10 text-white">
                                    <SelectItem value="hardware">Hardware Issue</SelectItem>
                                    <SelectItem value="sync">Sync/Connectivity</SelectItem>
                                    <SelectItem value="billing">Billing & Account</SelectItem>
                                    <SelectItem value="feature">Feature Request</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="device_sn">Related Device (Optional)</Label>
                            <Select name="device_sn" defaultValue="none">
                                <SelectTrigger className="bg-white/5 border-white/10">
                                    <SelectValue placeholder="Select device" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0F1115] border-white/10 text-white">
                                    <SelectItem value="none">None / General Question</SelectItem>
                                    {devices?.map(d => (
                                        <SelectItem key={d.serial_number} value={d.serial_number}>
                                            {d.name} ({d.serial_number})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input id="subject" name="subject" required className="bg-white/5 border-white/10" placeholder="e.g. Hub not connecting" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message">Description</Label>
                            <Textarea id="message" name="message" required className="bg-white/5 border-white/10 min-h-[100px]" placeholder="Please describe the issue..." />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsSupportOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={createTicketMutation.isPending} className="bg-blue-600 hover:bg-blue-500">
                                {createTicketMutation.isPending ? 'Submitting...' : 'Submit Ticket'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
