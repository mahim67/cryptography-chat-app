import axios from "axios";

export const getAllUsers = async () => {
    try {
        const { token } = JSON.parse(localStorage.getItem("userData") ?? ''); // Retrieve token from localStorage
        if (!token) {
            return {
                status: 401,
                message: "Unauthorized"
            }
        }
        const response = await axios.get(process.env.NEXT_PUBLIC_API_BASE_URL + "api/users", {
            headers: {
                Authorization: `Bearer ${token}` // Add Authorization header
            }
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

export const getMessagesByConversationId = async (conversationId) => {
    try {
        const { token } = JSON.parse(localStorage.getItem("userData")); // Retrieve token
        if (!token) {
            return {
                status: 401,
                message: "Unauthorized",
            };
        }
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}api/messages?conversationId=${conversationId}`, // Pass conversationId as a query parameter
            {
                headers: {
                    Authorization: `Bearer ${token}`, // Add Authorization header
                },
            }
        );

        return {
            status: response?.status,
            data: response.data,
        };
    } catch (error) {
        console.error("Error fetching messages:", error);
        return {
            status: error.response?.status,
            message: error.response?.data?.error || error.message || "Unknown error occurred",
        };
    }
};

export const getConversationByUserId = async (userId) => {
    try {
        const { token } = JSON.parse(localStorage.getItem("userData")); // Retrieve token
        if (!token) {
            return {
                status: 401,
                message: "Unauthorized",
            };
        }
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}api/conversation`,
            { recipientId: userId }, // Pass recipientId in the request body
            {
                headers: {
                    Authorization: `Bearer ${token}`, // Add Authorization header
                },
            }
        );

        return {
            status: response?.status,
            data: response.data,
        };
    } catch (error) {
        console.error("Error fetching conversation:", error);
        return {
            status: error.response?.status,
            message: error.response?.data?.error || error.message || "Unknown error occurred",
        };
    }
};

export const sendMessageToServer = async (messageData) => {
    try {
        const { token } = JSON.parse(localStorage.getItem("userData"));
        if (!token) {
            return {
                status: 401,
                message: "Unauthorized",
            };
        }
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}api/send`,
            messageData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return {
            status: response?.status,
            data: response.data,
        };
    } catch (error) {
        console.error("Error sending message:", error);
        return {
            status: error.response?.status,
            message: error.response?.data?.error || error.message || "Unknown error occurred",
        };
    }
};