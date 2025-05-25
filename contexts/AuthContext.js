'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { clientAuth } from '../lib/auth-utils';
import { getCurrentUser, refreshToken } from '../services/auth-service';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check authentication status on mount
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            setLoading(true);
            
            // Check if we have a valid token format
            if (!clientAuth.isAuthenticated()) {
                setUser(null);
                setIsAuthenticated(false);
                setLoading(false);
                return;
            }

            // Directly try to get current user data (this will verify token via API)
            const result = await getCurrentUser();
            
            if (result.success) {
                setUser(result.data);
                setIsAuthenticated(true);
            } else {
                // If profile call fails, try token refresh if available
                if (result.message?.includes('expired') || result.message?.includes('invalid')) {
                    const refreshResult = await refreshToken();
                    
                    if (refreshResult.success) {
                        const userResult = await getCurrentUser();
                        if (userResult.success) {
                            setUser(userResult.data);
                            setIsAuthenticated(true);
                        } else {
                            setUser(null);
                            setIsAuthenticated(false);
                            clientAuth.logout();
                        }
                    } else {
                        setUser(null);
                        setIsAuthenticated(false);
                        clientAuth.logout();
                    }
                } else {
                    setUser(null);
                    setIsAuthenticated(false);
                    clientAuth.logout();
                }
            }
        } catch (error) {
            console.error('Auth check error:', error);
            setUser(null);
            setIsAuthenticated(false);
            clientAuth.logout();
        } finally {
            setLoading(false);
        }
    };

    const login = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
    };

    const logout = () => {
        clientAuth.logout();
        setUser(null);
        setIsAuthenticated(false);
    };

    const updateUser = (updatedUserData) => {
        setUser(prev => ({ ...prev, ...updatedUserData }));
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        updateUser,
        checkAuthStatus
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
