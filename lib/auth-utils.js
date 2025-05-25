// Authentication utilities for Next.js app
import { getUserProfile } from './api-health';

/**
 * Verify JWT token by calling profile API
 * @param {string} token - JWT token to verify
 * @returns {Object} - Object with valid boolean and user data if valid
 */
export async function verifyJwtToken(token) {
  try {
    if (!token) {
      return { valid: false, error: 'No token provided' };
    }

    const result = await getUserProfile(token);
    
    if (result.success) {
      return { 
        valid: true, 
        payload: result.data,
        user: result.data 
      };
    }

    return { valid: false, error: result.error || 'Token verification failed' };
  } catch (error) {
    console.log('Token verification error:', error.message);
    return { valid: false, error: error.message || 'Token verification failed' };
  }
}

/**
 * Get user data from request headers (set by middleware)
 * @param {Request} request - Next.js request object
 * @returns {Object} - User information
 */
export function getUserFromHeaders(request) {
  const headers = request.headers;
  
  return {
    id: headers.get('x-user-id'),
    email: headers.get('x-user-email'),
    name: headers.get('x-user-name')
  };
}

/**
 * Client-side auth utilities
 */
export const clientAuth = {
  /**
   * Get user data from localStorage
   * @returns {Object|null} - User data or null if not found
   */
  getUser: () => {
    if (typeof window === 'undefined') return null;
    
    try {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  /**
   * Get auth token
   * @returns {string|null} - Auth token or null
   */
  getToken: () => {
    const user = clientAuth.getUser();
    return user?.token || null;
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} - True if authenticated
   */
  isAuthenticated: () => {
    const token = clientAuth.getToken();
    if (!token) return false;

    try {
      // Basic token format check - more thorough verification happens via API call
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      // Try to decode payload for expiration check
      const payload = JSON.parse(atob(parts[1]));
      if (!payload || !payload.exp) return false;
      
      // Check if token is expired
      return payload.exp > Date.now() / 1000;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  },

  /**
   * Logout user
   */
  logout: () => {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('userData');
    
    // Remove cookie
    document.cookie = 'userData=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    
    // Redirect to login
    window.location.href = '/login';
  },

  /**
   * Get authorization header for API requests
   * @returns {Object} - Authorization header object
   */
  getAuthHeader: () => {
    const token = clientAuth.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
};

/**
 * Server-side auth utilities for API routes
 */
export const serverAuth = {
  /**
   * Verify token by calling profile API
   * @param {Request} request - API request object
   * @returns {Object} - Object with success boolean and user data
   */
  verifyRequest: async (request) => {
    try {
      const authHeader = request.headers.get('authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { success: false, error: 'No valid authorization header' };
      }

      const token = authHeader.split(' ')[1];
      const verification = await verifyJwtToken(token);
      
      if (!verification.valid) {
        return { success: false, error: verification.error };
      }

      return { success: true, user: verification.payload || verification.user };
    } catch (error) {
      console.error('Request verification error:', error);
      return { success: false, error: 'Internal server error' };
    }
  }
};
