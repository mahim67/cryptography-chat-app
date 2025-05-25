import axios from "axios";

const ApiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    credentials: 'include',
    withCredentials: false,
});

// Automatically attach Authorization Token
ApiClient.interceptors.request.use((config) => {
    // Try to get token from localStorage first, then from cookie
    let token = null;
    
    if (typeof window !== "undefined") {
        // Try localStorage first
        token = localStorage.getItem("token");
        
        // If no token in localStorage, try to get from userData
        if (!token) {
            const userData = localStorage.getItem("userData");
            if (userData) {
                try {
                    const parsedData = JSON.parse(userData);
                    token = parsedData.token;
                } catch (error) {
                    console.error('Error parsing userData:', error);
                }
            }
        }
    }
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

// Response Interceptor (Handle Global Errors)
ApiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const errorMessage = error.response?.data?.message || error.message || "Unknown error occurred";
        const errorStatus = error.response?.status || "No status available";
        const errorData = error.response?.data || "No response data";

        // Handle 401 Unauthorized errors
        if (error.response?.status === 401) {
            if (typeof window !== "undefined") {
                // Clear local storage
                localStorage.removeItem("token");
                localStorage.removeItem("userData");
                
                // Clear cookie
                document.cookie = 'userData=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                
                // Redirect to login if not already there
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
                }
            }
        }

        // Attach additional error details to the error object for better debugging
        error.customMessage = errorMessage;
        error.customStatus = errorStatus;
        error.customData = errorData;

        return Promise.reject(error);
    }
);

// Function for GET request (with Query Parameters)
export const getRequest = async (endpoint, params = {}) => {
    try {
        const response = await ApiClient.get(endpoint, { params });        
        return response;
        
    } catch (error) {
        console.error(`GET ${endpoint} failed:`, error);
        throw error;
    }
};

// Function for POST request
export const postRequest = async (endpoint, data = {}) => {
    try {
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`,
            data,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("token") : ""}`,
                },
                withCredentials: false,
            }
        );
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "Unknown error occurred";
        const errorStatus = error.response?.status || "No status available";
        const errorData = error.response?.data || "No response data";

        if (errorStatus === 400) {
            console.error(`POST ${endpoint} failed with status 400: Bad Request`, {
                message: errorMessage,
                data: errorData,
            });
        } else {
            console.error(`POST ${endpoint} failed:`, {
                message: errorMessage,
                status: errorStatus,
                data: errorData,
            });
        }
        throw error;
    }
};

export default ApiClient;
