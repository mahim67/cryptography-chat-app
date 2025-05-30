'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useConversations } from '../hooks/useConversations';
import { useSocketConnection } from '../hooks/useSocketConnection';
import { clientAuth } from '@/lib/auth-utils';
import apiClient from '@/lib/api-client';

const ConversationContext = createContext();

export const useConversationContext = () => {
    const context = useContext(ConversationContext);
    if (!context) {
        throw new Error('useConversationContext must be used within a ConversationProvider');
    }
    return context;
};

export const ConversationProvider = ({ children }) => {
    const conversationData = useConversations();
    const [currentUser, setCurrentUser] = useState(null);
    const lastRefreshTime = useRef(0);
    const [onlineUsers, setOnlineUsers] = useState([]);

    // Get current user data
    useEffect(() => {
        const userData = clientAuth.getUser();
        console.log('LOGGED IN USER DATA:', userData);
        if (userData?.user) {
            setCurrentUser(userData.user);
            console.log('CURRENT USER SET:', userData.user);
        }
    }, []);

    // Initialize global socket connection for the logged-in user
    const { socket, socketConnected, socketError } = useSocketConnection(
        currentUser?.id, 
        null, 
        conversationData.refreshConversations
    );

    // Fetch initial online users when socket is connected
    useEffect(() => {
        const fetchOnlineUsers = async () => {
            try {
                if (socketConnected && currentUser) {
                    console.log('Fetching initial online users');
                    // const response = await apiClient.get('/api/online-users');
                    // if (response.data && response.data.online) {
                    //     const onlineUserData = response.data.online.map(user => ({
                    //         userId: user.id.toString(),
                    //         status: 'online',
                    //         timestamp: new Date().toISOString()
                    //     }));
                    //     setOnlineUsers(onlineUserData);
                    //     console.log('Initial online users loaded:', onlineUserData);
                    // }
                }
            } catch (error) {
                console.error('Error fetching online users:', error);
            }
        };

        fetchOnlineUsers();
    }, [socketConnected, currentUser]);

    // Listen for global conversation notifications
    useEffect(() => {
        if (socket && socketConnected) {
            // Smart refresh function that prevents too frequent calls
            const smartRefresh = (eventType, data) => {
                const now = Date.now();
                // Only refresh if at least 2 seconds have passed since last refresh
                if (now - lastRefreshTime.current > 2000) {
                    console.log(`Smart refresh triggered by ${eventType}:`, data);
                    lastRefreshTime.current = now;
                    conversationData.refreshConversations();
                } else {
                    console.log(`Smart refresh skipped for ${eventType} - too soon`);
                }
            };

            // Listen for refresh conversations events
            const handleRefreshConversations = (data) => {
                smartRefresh('refreshConversations', data);
            };

            // Listen for new message notifications
            const handleNewMessage = (data) => {
                smartRefresh('newMessage', data);
            };

            // Single handler for receive message
            const handleReceiveMessage = (data) => {
                smartRefresh('ReceiveMessage', data);
            };

            // Handler for user status updates
            const handleUserStatus = (data) => {
                console.log('User status update received:', data);
                
                if (data.status === 'online') {
                    setOnlineUsers(prev => {
                        // Only add if not already in the list
                        if (!prev.some(user => user.userId.toString() === data.userId.toString())) {
                            const newOnlineUsers = [...prev, data];
                            console.log('UPDATED ONLINE USERS (added):', newOnlineUsers);
                            return newOnlineUsers;
                        }
                        return prev;
                    });
                } else if (data.status === 'offline') {
                    setOnlineUsers(prev => {
                        const filteredUsers = prev.filter(user => user.userId.toString() !== data.userId.toString());
                        console.log('UPDATED ONLINE USERS (removed):', filteredUsers);
                        return filteredUsers;
                    });
                }
            };

            socket.on("refreshConversations", handleRefreshConversations);
            socket.on("newMessage", handleNewMessage);
            socket.on("ReceiveMessage", handleReceiveMessage);
            socket.on("userStatus", handleUserStatus);

            return () => {
                socket.off("refreshConversations", handleRefreshConversations);
                socket.off("newMessage", handleNewMessage);
                socket.off("ReceiveMessage", handleReceiveMessage);
                socket.off("userStatus", handleUserStatus);
            };
        }
    }, [socket, socketConnected, conversationData]);

    const contextValue = {
        ...conversationData,
        socket,
        socketConnected,
        socketError,
        currentUser,
        onlineUsers,
        isUserOnline: (userId) => {
            if (!userId) return false;
            
            // Convert to string for consistent comparison
            const userIdStr = userId.toString();
            
            // Log for debugging purposes
            // console.log(`Checking online status for user ID: ${userIdStr}`);
            // console.log(`Current online users:`, onlineUsers.map(u => u.userId?.toString()));
            
            // Check if user is in online users list
            const isOnline = onlineUsers.some(user => user.userId?.toString() === userIdStr);
            // console.log(`User ${userIdStr} is ${isOnline ? 'online' : 'offline'}`);
            
            return isOnline;
        }
    };

    return (
        <ConversationContext.Provider value={contextValue}>
            {children}
        </ConversationContext.Provider>
    );
};
