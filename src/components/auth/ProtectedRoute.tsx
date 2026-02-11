import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { SUPER_ADMIN_EMAIL } from '@/config/constants';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireBeeYield?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireBeeYield = false }) => {
    const { user, loading, beeyieldUser, cebaUser } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    // Determine the relevant user for the current path
    // This prevents race conditions where activeBackend hasn't updated yet during navigation
    let effectiveUser = user; // Default to generic user (usually shop)

    // STRICT SEPARATION: Ignore 'user' (which actively switches) and check specific session buckets
    if (location.pathname.includes('beeyield')) {
        effectiveUser = beeyieldUser;
    } else if (location.pathname.includes('ceba') || location.pathname.startsWith('/admin')) {
        effectiveUser = cebaUser;
    }

    if (!effectiveUser) {
        // Redirect to login but save the current location
        let loginPath = '/login';
        if (location.pathname.includes('beeyield')) {
            loginPath = '/beeyield-login';
        } else if (location.pathname.includes('ceba') || location.pathname.startsWith('/admin')) {
            loginPath = '/ceba/login';
        }

        return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    // Special check for BeeYield dashboard if required
    if (requireBeeYield) {
        const isBeeYieldActive =
            !!user?.user_metadata?.beeyield_active ||
            user?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ||
            !!beeyieldUser; // Also accept if user is authenticated on the beeyield backend
        if (!isBeeYieldActive) {
            return <Navigate to="/beeyield-login" replace />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;
