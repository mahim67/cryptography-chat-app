import axios from "axios";
import { clientAuth } from "../lib/auth-utils";

// Helper function to set user data in storage and cookie
const setUserData = (userData) => {
    if (typeof window !== "undefined") {
        // Store in localStorage
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('token', userData.token);
        
        // Set cookie for server-side access with production-ready settings
        const expires = new Date();
        expires.setTime(expires.getTime() + (2 * 24 * 60 * 60 * 1000)); // 2 days to match login form
        
        const isSecure = window.location.protocol === 'https:';
        const cookieValue = `userData=${JSON.stringify({ token: userData.token, privateKey: userData.privateKey })}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${isSecure ? '; Secure' : ''}`;
        document.cookie = cookieValue;
    }
};

export const register = async ({ name, email, password }) => {
    try {
        const response = await axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + "api/register", { 
            name: name, 
            email: email, 
            password: password
        });

        // If registration successful and returns user data with token
        if (response.data && response.data.token) {
            setUserData(response.data);
        }

        return {
            status: response?.status,
            data: response.data
        }

    } catch (error) {
        console.log('Registration error:', error);
        return {
            status: error.response?.status,
            message: error.response?.data?.error || error.message || "Registration failed"
        }
    }
};

export const login = async ({ email, password }) => {
    try {        
        const response = await axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + "api/login", { 
            email: email, 
            password: password 
        });

        // If login successful, store user data
        if (response.data && response.data.token) {
            setUserData(response.data);
        }

        return {
            status: response?.status,
            data: response.data
        }

    } catch (error) {
        console.log('Login error:', error);
        return {
            status: error.response?.status,
            message: error.response?.data?.error || error.message || "Login failed"
        }
    }
};

export const logout = async () => {
    try {
        // Optional: Call logout endpoint if your API has one
        // await axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + "api/logout");
        
        // Clear client storage
        clientAuth.logout();
        
        return { success: true };
    } catch (error) {
        console.log('Logout error:', error);
        // Still clear local data even if API call fails
        clientAuth.logout();
        return { success: true };
    }
};

export const getCurrentUser = async () => {
    try {
        const token = clientAuth.getToken();
        if (!token) {
            return { success: false, error: 'No token found' };
        }

        const response = await axios.get(
            process.env.NEXT_PUBLIC_API_BASE_URL + "api/profile",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.log('Get current user error:', error);
        
        // If unauthorized, clear auth data
        if (error.response?.status === 401) {
            clientAuth.logout();
        }
        
        return {
            success: false,
            message: error.response?.data?.error || error.message || "Failed to get user data"
        };
    }
};

export const refreshToken = async () => {
    try {
        const token = clientAuth.getToken();
        if (!token) {
            return { success: false, error: 'No token to refresh' };
        }

        const response = await axios.post(
            process.env.NEXT_PUBLIC_API_BASE_URL + "api/refresh-token",
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (response.data && response.data.token) {
            setUserData(response.data);
        }

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.log('Token refresh error:', error);
        
        // If refresh fails, logout user
        if (error.response?.status === 401) {
            clientAuth.logout();
        }
        
        return {
            success: false,
            message: error.response?.data?.error || error.message || "Token refresh failed"
        };
    }
};
