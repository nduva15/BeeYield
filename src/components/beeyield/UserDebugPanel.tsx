import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, User, Mail, Key, Database, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import beeyieldService from '@/services/beeyieldService';
import { SUPER_ADMIN_EMAIL } from '@/config/constants';

const UserDebugPanel: React.FC = () => {
    const { user } = useAuth();
    const [apiaries, setApiaries] = React.useState<any[]>([]);
    const [hives, setHives] = React.useState<any[]>([]);
    const [dbName, setDbName] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const loadData = async () => {
            if (!user) return;

            setLoading(true);
            try {
                const [apiariesData, hivesData] = await Promise.all([
                    beeyieldService.getApiaries(),
                    beeyieldService.getHives()
                ]);
                setApiaries(apiariesData);
                setHives(hivesData);

                // Fetch real name from database
                if (!supabase) return;

                const { data: farmerData } = await supabase
                    .from('farmers')
                    .select('name')
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (farmerData?.name) {
                    setDbName(farmerData.name);
                } else {
                    // Try profiles table
                    const { data: profileData } = await supabase
                        .from('profiles')
                        .select('first_name, last_name')
                        .eq('id', user.id)
                        .maybeSingle();
                    if (profileData) {
                        const fullName = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim();
                        if (fullName) setDbName(fullName);
                    }
                }
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user]);

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
    };

    if (!user || (SUPER_ADMIN_EMAIL && user.email !== SUPER_ADMIN_EMAIL)) {
        return null;
    }

    return (
        <div className="space-y-4 pb-12">
            <Card className="rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <CardHeader className="bg-[#F9F7F2] border-b border-slate-100">
                    <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-wider">
                        <User className="h-4 w-4 text-[#F4D03F]" />
                        Current User Session
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">User ID:</span>
                            <div className="flex items-center gap-2">
                                <code className="text-[10px] bg-[#F9F7F2] border border-slate-100 px-3 py-1 rounded-lg font-mono text-slate-600">
                                    {user.id}
                                </code>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 rounded-lg hover:bg-[#F9F7F2]"
                                    onClick={() => copyToClipboard(user.id, 'User ID')}
                                >
                                    <Copy className="h-3 w-3 text-slate-400" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email:</span>
                            <div className="flex items-center gap-2">
                                <code className="text-[10px] bg-[#F9F7F2] border border-slate-100 px-3 py-1 rounded-lg font-mono text-slate-600">
                                    {user.email || 'Not set'}
                                </code>
                                {user.email && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 rounded-lg hover:bg-[#F9F7F2]"
                                        onClick={() => copyToClipboard(user.email!, 'Email')}
                                    >
                                        <Copy className="h-3 w-3 text-slate-400" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Name:</span>
                            <span className="text-sm font-bold text-slate-800">
                                {dbName ||
                                    user.user_metadata?.full_name ||
                                    user.user_metadata?.name ||
                                    (user.user_metadata?.first_name ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim() : null) ||
                                    'Not set'}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <CardHeader className="bg-[#F9F7F2] border-b border-slate-100">
                    <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-wider">
                        <Database className="h-4 w-4 text-[#1B9157]" />
                        Account Data
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {loading ? (
                        <p className="text-xs font-bold text-slate-400 text-center py-4">Loading Data...</p>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-[#F9F7F2] border border-slate-100 rounded-xl">
                                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Apiaries Found:</span>
                                <Badge className="bg-amber-100 text-[#F4D03F] border-none font-bold">
                                    {apiaries.length}
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-[#F9F7F2] border border-slate-100 rounded-xl">
                                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Hive Units:</span>
                                <Badge className="bg-green-100 text-[#1B9157] border-none font-bold">
                                    {hives.length}
                                </Badge>
                            </div>

                            {apiaries.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-slate-100">
                                    <h4 className="text-[10px] font-bold text-slate-400 tracking-wider mb-4">Linked Apiaries:</h4>
                                    <div className="grid gap-2">
                                        {apiaries.map((apiary) => (
                                            <div key={apiary.id} className="text-sm font-bold text-slate-700 flex items-center justify-between p-3 bg-[#FFF9F0] border border-slate-50 rounded-lg">
                                                <span>{apiary.name}</span>
                                                <span className="text-[10px] text-slate-400">{apiary.hive_count || 0} Hives</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {apiaries.length === 0 && (
                                <div className="mt-4 p-5 bg-amber-50 border border-amber-100 rounded-2xl">
                                    <p className="text-sm text-slate-800 font-bold mb-3 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-[#F4D03F]" />
                                        No Data Linked
                                    </p>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">
                                        No apiaries are linked to your current authentication ID. This is likely due to account creation inconsistencies.
                                    </p>

                                    <Button
                                        onClick={async () => {
                                            try {
                                                setLoading(true);
                                                const { supabase } = await import('@/lib/supabase');
                                                if (!supabase) throw new Error("Supabase client not initialized");
                                                const { data: { session } } = await supabase.auth.getSession();
                                                if (!session) throw new Error("No session");

                                                const res = await fetch(`${import.meta.env.VITE_API_URL}/beeyield/fix-ownership`, {
                                                    method: 'POST',
                                                    headers: {
                                                        'Authorization': `Bearer ${session.access_token}`,
                                                        'Content-Type': 'application/json'
                                                    }
                                                });

                                                const data = await res.json();
                                                if (res.ok) {
                                                    toast.success("Ownership Fixed!", { description: data.message });
                                                    const [a, h] = await Promise.all([
                                                        beeyieldService.getApiaries(),
                                                        beeyieldService.getHives()
                                                    ]);
                                                    setApiaries(a);
                                                    setHives(h);
                                                } else {
                                                    toast.error("Fix failed", { description: data.detail || "Unknown error" });
                                                }
                                            } catch (e) {
                                                console.error(e);
                                                toast.error("Error running fix");
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                        className="w-full bg-[#F4D03F] hover:bg-amber-600 text-[#1A1A1A] font-bold h-12 rounded-xl shadow-lg shadow-amber-500/20 tracking-wider text-[10px]"
                                    >
                                        Claim BeeYield Apiary
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default UserDebugPanel;
