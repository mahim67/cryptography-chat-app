import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for managing loading states with debouncing
 * Prevents rapid loading state changes that cause UI flickering
 */
export const useLoadingState = (initialState = false, debounceMs = 200) => {
    const [loading, setLoading] = useState(initialState);
    const [debouncedLoading, setDebouncedLoading] = useState(initialState);
    const timeoutRef = useRef(null);

    useEffect(() => {
        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // If setting loading to true, show immediately
        if (loading) {
            setDebouncedLoading(true);
        } else {
            // If setting loading to false, debounce it to prevent flickering
            timeoutRef.current = setTimeout(() => {
                setDebouncedLoading(false);
            }, debounceMs);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [loading, debounceMs]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return [debouncedLoading, setLoading];
};
