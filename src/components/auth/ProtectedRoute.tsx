import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireBeeYield?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireBeeYield = false }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        // Redirect to login but save the current location
        let loginPath = '/login';
        if (location.pathname.includes('beeyield')) {
            loginPath = '/beeyield-login';
        } else if (location.pathname.includes('ceba')) {
            loginPath = '/ceba/login';
        }

        return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    // Special check for BeeYield dashboard if required
    if (requireBeeYield) {
        const isBeeYieldActive = !!user?.user_metadata?.beeyield_active || user?.email === 'timothynduva349@gmail.com';
        if (!isBeeYieldActive) {
            return <Navigate to="/beeyield-login" replace />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;
