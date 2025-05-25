// API Health Check and User Profile utilities
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

/**
 * Check if API server is reachable
 * @returns {Object} - Object with success boolean and message
 */
export async function checkApiHealth() {
  try {
    const response = await axios.get(`${API_BASE_URL}api/health`, {
      timeout: 5000
    });
    
    return { 
      success: true, 
      message: 'API server is reachable',
      data: response.data 
    };
  } catch (error) {
    console.error('API health check failed:', error.message);
    return { 
      success: false, 
      message: `API server not reachable: ${error.message}`,
      error: error.code || error.message
    };
  }
}

/**
 * Get user profile with token verification
 * @param {string} token - JWT token
 * @returns {Object} - Object with success boolean and user data
 */
export async function getUserProfile(token) {
  try {
    if (!token) {
      return { success: false, error: 'No token provided' };
    }

    const response = await axios.get(`${API_BASE_URL}api/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout for profile calls
    });

    if (response.status === 200 && response.data) {
      return { 
        success: true, 
        data: response.data 
      };
    }

    return { success: false, error: 'Invalid response from API' };
  } catch (error) {
    console.error('Get profile error:', error.message);
    
    if (error.response?.status === 401) {
      return { success: false, error: 'Unauthorized - Token expired or invalid' };
    }
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return { success: false, error: 'API server not reachable' };
    }
    
    if (error.code === 'ECONNABORTED') {
      return { success: false, error: 'Request timeout' };
    }
    
    return { 
      success: false, 
      error: error.response?.data?.error || error.message || 'Profile fetch failed' 
    };
  }
}
