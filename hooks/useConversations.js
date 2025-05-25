'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getAllUsers } from '@/services/chat-list-service';

/**
 * Custom hook for managing conversations list
 * Provides automatic refresh functionality when new conversations are created
 */
export const useConversations = () => {
    const [conversations, setConversations] = useState([]);
    const [filteredConversations, setFilteredConversations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Ref to track if a refresh is already in progress to prevent multiple calls
    const refreshInProgress = useRef(false);
    const debounceTimeout = useRef(null);
    const lastRefreshTime = useRef(0);

    // Function to fetch conversations
    const fetchConversations = useCallback(async () => {
        // Prevent multiple simultaneous refresh calls
        if (refreshInProgress.current) {
            console.log("Refresh already in progress, skipping...");
            return;
        }
        
        refreshInProgress.current = true;
        setError(null);
        
        try {
            const response = await getAllUsers();
            if (response.status === 200) {
                setConversations(response.data);
                setFilteredConversations(response.data);
            } else {
                setError(response.message || 'Failed to fetch conversations');
            }
        } catch (err) {
            setError(err.message || 'Error fetching conversations');
            console.error('Error fetching conversations:', err);
        } finally {
            refreshInProgress.current = false;
        }
    }, []);

    // Debounced refresh function to prevent multiple rapid calls
    const refreshConversations = useCallback(() => {
        const now = Date.now();
        
        // If a refresh happened less than 1 second ago, skip it
        if (now - lastRefreshTime.current < 1000) {
            console.log("Refresh called too soon, skipping...");
            return;
        }
        
        // Clear any existing timeout
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        
        // Set a new timeout to debounce the refresh
        debounceTimeout.current = setTimeout(() => {
            lastRefreshTime.current = Date.now();
            fetchConversations();
        }, 500); // 500ms debounce
    }, [fetchConversations]);

    // Function to handle search
    const handleSearch = useCallback((query) => {
        setSearchQuery(query);
        const lowerQuery = query.toLowerCase();
        
        if (!query.trim()) {
            setFilteredConversations(conversations);
        } else {
            const filtered = conversations.filter(user => 
                user?.participants?.name?.toLowerCase().includes(lowerQuery) ||
                user?.participants?.email?.toLowerCase().includes(lowerQuery)
            );
            setFilteredConversations(filtered);
        }
    }, [conversations]);

    // Function to add a new conversation to the list (optimistic update)
    const addConversation = useCallback((newConversation) => {
        setConversations(prev => {
            // Check if conversation already exists
            const exists = prev.some(conv => 
                conv.participants?.id === newConversation.participants?.id
            );
            
            if (!exists) {
                const updated = [newConversation, ...prev];
                setFilteredConversations(updated);
                return updated;
            }
            return prev;
        });
    }, []);

    // Function to update existing conversation (when new message received)
    const updateConversation = useCallback((conversationId, updates) => {
        setConversations(prev => {
            const updated = prev.map(conv => 
                conv.id === conversationId 
                    ? { ...conv, ...updates }
                    : conv
            );
            setFilteredConversations(updated);
            return updated;
        });
    }, []);

    // Initial fetch
    useEffect(() => {
        const userData = localStorage.getItem("userData");
        if (userData) {
            const { privateKey } = JSON.parse(userData);
            if (privateKey) {
                fetchConversations();
            }
        }
    }, [fetchConversations]);

    // Re-filter when search query changes
    useEffect(() => {
        handleSearch(searchQuery);
    }, [searchQuery, handleSearch]);

    // Cleanup debounce timeout on unmount
    useEffect(() => {
        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, []);

    return {
        conversations: filteredConversations,
        allConversations: conversations,
        loading,
        error,
        searchQuery,
        setSearchQuery,
        fetchConversations,
        refreshConversations,
        handleSearch,
        addConversation,
        updateConversation
    };
};
