import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Checkout = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading) {
            if (user) {
                navigate('/buyer-dashboard?tab=checkout');
            } else {
                navigate('/login?redirect=checkout');
            }
        }
    }, [user, loading, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );
};

export default Checkout;
