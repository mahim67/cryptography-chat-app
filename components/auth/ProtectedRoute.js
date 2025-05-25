'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

/**
 * Higher Order Component for protecting routes
 * @param {Component} WrappedComponent - Component to protect
 * @param {Object} options - Protection options
 * @returns {Component} Protected component
 */
export const withAuth = (WrappedComponent, options = {}) => {
    const {
        redirectTo = '/login',
        requireAuth = true,
        allowedRoles = [],
        onUnauthorized = null
    } = options;

    return function AuthenticatedComponent(props) {
        const { isAuthenticated, user, loading } = useAuth();
        const router = useRouter();

        useEffect(() => {
            if (loading) return; // Wait for auth check to complete

            if (requireAuth && !isAuthenticated) {
                const currentPath = window.location.pathname;
                const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
                router.push(redirectUrl);
                return;
            }

            if (allowedRoles.length > 0 && user) {
                const userRole = user.role || 'user';
                if (!allowedRoles.includes(userRole)) {
                    if (onUnauthorized) {
                        onUnauthorized();
                    } else {
                        router.push('/unauthorized');
                    }
                    return;
                }
            }
        }, [isAuthenticated, user, loading, router]);

        // Show loading while checking authentication
        if (loading) {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
                </div>
            );
        }

        // Don't render component if not authenticated (will redirect)
        if (requireAuth && !isAuthenticated) {
            return null;
        }

        // Check role authorization
        if (allowedRoles.length > 0 && user) {
            const userRole = user.role || 'user';
            if (!allowedRoles.includes(userRole)) {
                return (
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
                            <p className="text-gray-600">You don't have permission to access this page.</p>
                        </div>
                    </div>
                );
            }
        }

        return <WrappedComponent {...props} />;
    };
};

/**
 * Hook for protecting routes in functional components
 * @param {Object} options - Protection options
 */
export const useAuthGuard = (options = {}) => {
    const {
        redirectTo = '/login',
        requireAuth = true,
        allowedRoles = [],
        onUnauthorized = null
    } = options;

    const { isAuthenticated, user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        if (requireAuth && !isAuthenticated) {
            const currentPath = window.location.pathname;
            const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
            router.push(redirectUrl);
            return;
        }

        if (allowedRoles.length > 0 && user) {
            const userRole = user.role || 'user';
            if (!allowedRoles.includes(userRole)) {
                if (onUnauthorized) {
                    onUnauthorized();
                } else {
                    router.push('/unauthorized');
                }
                return;
            }
        }
    }, [isAuthenticated, user, loading, router, requireAuth, allowedRoles, redirectTo, onUnauthorized]);

    return {
        isAuthenticated,
        user,
        loading,
        isAuthorized: allowedRoles.length === 0 || (user && allowedRoles.includes(user.role || 'user'))
    };
};
