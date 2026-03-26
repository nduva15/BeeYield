import React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import beeyieldService from '@/services/beeyieldService';

const LS_STATE_KEY = 'beeyield_integration_oauth_state_v1';

function getStoredState(platform: string) {
    try {
        const raw = sessionStorage.getItem(LS_STATE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Record<string, string>;
        return parsed[platform] || null;
    } catch {
        return null;
    }
}

function clearStoredState(platform: string) {
    try {
        const raw = sessionStorage.getItem(LS_STATE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as Record<string, string>;
        delete parsed[platform];
        sessionStorage.setItem(LS_STATE_KEY, JSON.stringify(parsed));
    } catch {
        // ignore
    }
}

const IntegrationCallback: React.FC = () => {
    const navigate = useNavigate();
    const { platform } = useParams();
    const [params] = useSearchParams();

    React.useEffect(() => {
        const run = async () => {
            const p = (platform || '').toLowerCase();
            if (p !== 'quickbooks' && p !== 'shopify') {
                toast.error('Unknown integration');
                navigate('/beeyield-dashboard', { replace: true });
                return;
            }

            const state = params.get('state') || '';
            const expectedState = getStoredState(p);
            if (!state || !expectedState || state !== expectedState) {
                toast.error('Login verification failed. Please try connecting again.');
                navigate('/beeyield-dashboard', { replace: true });
                return;
            }

            try {
                if (p === 'quickbooks') {
                    const code = params.get('code') || '';
                    const realmId = params.get('realmId');
                    if (!code) throw new Error('Missing code');
                    await beeyieldService.completeQuickBooksOAuth({ code, realmId, state });
                } else {
                    // Send the raw query string to backend for proper HMAC validation.
                    // Use a safe way to get the search string to avoid malformed URI issues
                    let query = '';
                    try {
                        query = window.location.search.startsWith('?')
                            ? window.location.search.slice(1)
                            : window.location.search;
                    } catch (e) {
                        console.warn('[IntegrationCallback] Failed to parse raw search string:', e);
                        // Fallback to a very safe but potentially incomplete query
                        query = window.location.href.split('?')[1] || '';
                    }

                    if (!query) throw new Error('Missing callback parameters');
                    await beeyieldService.completeShopifyOAuth({ query });
                }

                toast.success('Integration connected');
            } catch (e: any) {
                console.error(e);
                toast.error('Could not finish connecting. Please try again.');
            } finally {
                clearStoredState(p);
                // Send user back to the integrations tab
                navigate('/beeyield-dashboard', {
                    replace: true,
                    state: { tab: 'integrations' }
                });
            }
        };

        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center p-8">
            <div className="max-w-md w-full bg-white rounded-2xl border border-[#F4D03F]/20 shadow-sm p-8 text-center space-y-3">
                <h1 className="text-xl font-bold text-[#1A1A1A]">Finishing connection…</h1>
                <p className="text-sm text-gray-500">Please wait. You will be redirected back to the dashboard.</p>
            </div>
        </div>
    );
};

export default IntegrationCallback;

