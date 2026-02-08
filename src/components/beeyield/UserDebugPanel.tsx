import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, User, Mail, Key, Database } from 'lucide-react';
import { toast } from 'sonner';
import { beeyieldService } from '@/services/beeyieldService';

const UserDebugPanel: React.FC = () => {
    const { user } = useAuth();
    const [apiaries, setApiaries] = useState<any[]>([]);
    const [hives, setHives] = useState<any[]>([]);
    const [dbName, setDbName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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

    if (!user || user.email !== 'timothynduva349@gmail.com') {
        return null;
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Current User Session
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">User ID:</span>
                            <div className="flex items-center gap-2">
                                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                    {user.id}
                                </code>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => copyToClipboard(user.id, 'User ID')}
                                >
                                    <Copy className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Email:</span>
                            <div className="flex items-center gap-2">
                                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                    {user.email || 'Not set'}
                                </code>
                                {user.email && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => copyToClipboard(user.email!, 'Email')}
                                    >
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Name:</span>
                            <span className="text-sm">
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

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Your Data Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-sm text-gray-500">Loading...</p>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <span className="text-sm font-medium">Apiaries (Places):</span>
                                <Badge variant={apiaries.length > 0 ? "default" : "secondary"}>
                                    {apiaries.length}
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <span className="text-sm font-medium">Hives:</span>
                                <Badge variant={hives.length > 0 ? "default" : "secondary"}>
                                    {hives.length}
                                </Badge>
                            </div>

                            {apiaries.length > 0 && (
                                <div className="mt-4 pt-4 border-t">
                                    <h4 className="text-sm font-semibold mb-2">Your Apiaries:</h4>
                                    <ul className="space-y-1">
                                        {apiaries.map((apiary) => (
                                            <li key={apiary.id} className="text-sm text-gray-600 dark:text-gray-400">
                                                • {apiary.name} ({apiary.hive_count || 0} hives)
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {apiaries.length === 0 && (
                                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                        ⚠️ No apiaries found for your account. This means either:
                                    </p>
                                    <ul className="mt-2 text-xs text-yellow-700 dark:text-yellow-300 space-y-1 ml-4 mb-4">
                                        <li>• You haven't created any apiaries yet</li>
                                        <li>• The data was created under a different user ID</li>
                                        <li>• There's a data isolation issue</li>
                                    </ul>

                                    <Button

                                        onClick={async () => {
                                            try {
                                                setLoading(true);

                                                // Direct fetch call safely
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
                                                    // Reload data
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
                                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold"
                                    >
                                        🛠️ Claim "Kibwezi Main Apiary" (Fix Data)
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
