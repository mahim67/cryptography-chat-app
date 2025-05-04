import axios from "axios";

export const register = async ({ name, email, password }) => {
    try {
        const response = await axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + "api/register", { 
            name: name, 
            email: email, 
            password: password
        });

        return {
            status: response?.status,
            data: response.data
        }

    } catch (error) {
        console.log('catch ' + error);
        return {
            status : error.response?.status,
            message: error.response?.data?.error || error.message || "Unknown error occurred"
        }
    }
};

export const login = async ({ email, password }) => {
    try {        
        const response = await axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + "api/login", { 
            email: email, 
            password: password 
        });

        return {
            status: response?.status,
            data: response.data
        }

    } catch (error) {
        console.log('catch ' + error);
        return {
            status: error.response?.status,
            message: error.response?.data?.error || error.message || "Unknown error occurred"
        }
    }
};