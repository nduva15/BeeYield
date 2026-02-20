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
    let effectiveUser = user;
    let loginPath = '/login';
    const path = location.pathname.toLowerCase();

    if (path.includes('beeyield')) {
        effectiveUser = beeyieldUser;
        loginPath = '/beeyield-login';
    } else if (path.includes('ceba') || path.startsWith('/admin')) {
        effectiveUser = cebaUser;
        loginPath = '/ceba/login';
    }

    if (!effectiveUser) {
        return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    // Special check for BeeYield dashboard if required
    if (requireBeeYield) {
        const isBeeYieldActive =
            !!user?.user_metadata?.beeyield_active ||
            ['timothynduva349@gmail.com', SUPER_ADMIN_EMAIL.toLowerCase()].includes(user?.email?.toLowerCase() || '') ||
            !!beeyieldUser; // Also accept if user is authenticated on the beeyield backend
        if (!isBeeYieldActive) {
            return <Navigate to="/beeyield-login" replace />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;
