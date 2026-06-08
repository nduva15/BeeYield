import { useContext } from 'react';
import AuthContext from '@/contexts/AuthContext';

/**
 * Hook to use Auth context
 * Provides access to authentication state and methods
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default useAuth;
