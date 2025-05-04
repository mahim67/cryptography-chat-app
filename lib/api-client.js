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
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
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
