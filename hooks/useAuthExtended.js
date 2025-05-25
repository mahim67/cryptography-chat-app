'use client';

import { useAuth } from '../contexts/AuthContext';
import { checkApiHealth } from '../lib/api-health';
import { clientAuth } from '../lib/auth-utils';
import { useEffect, useState } from 'react';

/**
 * Enhanced auth hook with additional utilities
 */
export const useAuthExtended = () => {
    const authContext = useAuth();
    const [apiStatus, setApiStatus] = useState({ connected: null, checking: false });

    // Check API connectivity
    const checkApiConnection = async () => {
        setApiStatus({ connected: null, checking: true });
        
        try {
            const result = await checkApiHealth();
            setApiStatus({ 
                connected: result.success, 
                checking: false,
                message: result.message 
            });
            return result.success;
        } catch (error) {
            setApiStatus({ 
                connected: false, 
                checking: false,
                message: 'Failed to check API connection' 
            });
            return false;
        }
    };

    // Auto-check API connection on mount
    useEffect(() => {
        checkApiConnection();
    }, []);

    // Get auth header for manual API calls
    const getAuthHeader = () => {
        return clientAuth.getAuthHeader();
    };

    // Force logout with cleanup
    const forceLogout = () => {
        clientAuth.logout();
        authContext.logout();
    };

    // Validate current session
    const validateSession = async () => {
        if (!authContext.isAuthenticated) {
            return false;
        }

        try {
            await authContext.checkAuthStatus();
            return authContext.isAuthenticated;
        } catch (error) {
            console.error('Session validation failed:', error);
            return false;
        }
    };

    return {
        // Original auth context
        ...authContext,
        
        // Extended utilities
        apiStatus,
        checkApiConnection,
        getAuthHeader,
        forceLogout,
        validateSession,
        
        // Convenience properties
        token: clientAuth.getToken(),
        hasValidToken: clientAuth.isAuthenticated(),
    };
};
