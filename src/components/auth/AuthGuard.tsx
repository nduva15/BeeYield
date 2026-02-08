import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
    requireSuperAdmin?: boolean;
}

/**
 * AuthGuard - Secures pages against unauthorized access.
 * Redirects to login if not authenticated, or to dashboard if unauthorized.
 */
const AuthGuard: React.FC<AuthGuardProps> = ({
    children,
    requireAdmin = false,
    requireSuperAdmin = false
}) => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const userRole = user?.user_metadata?.role || 'user';
    const isSuperAdminEmail = ['timothynduva349@gmail.com'].includes(user?.email?.toLowerCase() || '');
    const isAdmin = userRole === 'admin' || userRole === 'super_admin' || isSuperAdminEmail;
    const isSuperAdmin = userRole === 'super_admin' || isSuperAdminEmail;

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Not logged in -> redirect to login with return path
                navigate('/login', { state: { from: location.pathname }, replace: true });
            } else if (requireSuperAdmin && !isSuperAdmin) {
                // Not super admin -> redirect to admin dashboard
                navigate('/admin', { replace: true });
            } else if (requireAdmin && !isAdmin) {
                // Not admin -> redirect to main dashboard or home
                navigate('/beeyield-dashboard', { replace: true });
            }
        }
    }, [user, loading, isAdmin, isSuperAdmin, requireAdmin, requireSuperAdmin, navigate, location]);

    if (loading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-background/50 backdrop-blur-sm">
                <div className="text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4 text-lg font-medium text-muted-foreground">BeeYield Security Protocol: Verifying Identity...</p>
                </div>
            </div>
        );
    }

    // Secondary check to prevent transient rendering before redirect
    if (!user) return null;
    if (requireAdmin && !isAdmin) return null;
    if (requireSuperAdmin && !isSuperAdmin) return null;

    return <>{children}</>;
};

export default AuthGuard;
