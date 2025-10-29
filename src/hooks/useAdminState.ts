import { useEffect, useState, useCallback } from 'react';
import { useLocation, useParams } from 'react-router-dom';

/**
 * Custom hook for admin page state management
 * Ensures admin pages maintain their state on refresh and handle URL changes properly
 */
export function useAdminState<T>(
    initialState: T,
    stateKey?: string
) {
    const location = useLocation();
    const params = useParams();
    const [state, setState] = useState<T>(initialState);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get current admin section from URL
    const getCurrentSection = useCallback(() => {
        const pathParts = location.pathname.split('/').filter(Boolean);
        if (pathParts[0] === 'admin') {
            return pathParts[1] || 'dashboard';
        }
        return null;
    }, [location.pathname]);

    // Get URL parameters
    const getUrlParams = useCallback(() => {
        const pathParts = location.pathname.split('/').filter(Boolean);
        const urlParams: Record<string, string> = {};

        if (pathParts[0] === 'admin') {
            if (pathParts[1] === 'courses' && pathParts[2] === 'groups' && pathParts[3]) {
                urlParams.groupId = pathParts[3];
                if (pathParts[4] === 'courses' && pathParts[5]) {
                    urlParams.courseId = pathParts[5];
                }
            }
        }

        return { ...urlParams, ...params };
    }, [location.pathname, params]);

    // Check if we're on a specific admin page
    const isOnPage = useCallback((page: string) => {
        return location.pathname === `/admin/${page}`;
    }, [location.pathname]);

    // Check if we're on a specific admin section
    const isOnSection = useCallback((section: string) => {
        return location.pathname.startsWith(`/admin/${section}`);
    }, [location.pathname]);

    // Save state to localStorage if stateKey is provided
    const saveState = useCallback((newState: T) => {
        if (stateKey) {
            try {
                localStorage.setItem(`admin_${stateKey}`, JSON.stringify(newState));
            } catch (error) {
                console.warn('Failed to save state to localStorage:', error);
            }
        }
    }, [stateKey]);

    // Update state and save to localStorage
    const updateState = useCallback((newState: T | ((prevState: T) => T)) => {
        setState(prevState => {
            const updatedState = typeof newState === 'function' ? newState(prevState) : newState;
            saveState(updatedState);
            return updatedState;
        });
    }, [saveState]);

    // Reset state to initial state
    const resetState = useCallback(() => {
        if (stateKey) {
            localStorage.removeItem(`admin_${stateKey}`);
        }
        // Reset to the current initialState value, but don't track it as dependency
        setState(() => initialState);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stateKey]);

    // Load state on mount only
    useEffect(() => {
        if (stateKey) {
            try {
                const savedState = localStorage.getItem(`admin_${stateKey}`);
                if (savedState) {
                    const parsedState = JSON.parse(savedState);
                    setState(parsedState);
                }
            } catch (error) {
                console.warn('Failed to load state from localStorage:', error);
            }
        }
        setIsLoading(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stateKey]); // Only run on mount or when stateKey changes

    // Handle URL parameter changes
    useEffect(() => {
        // You can add logic here to handle URL parameter changes
        // For example, if groupId changes, refetch data
        // Currently just tracking params without causing re-renders
    }, [location.pathname, params]);

    return {
        state,
        setState: updateState,
        isLoading,
        error,
        setError,
        setIsLoading,
        resetState,
        getCurrentSection,
        getUrlParams,
        isOnPage,
        isOnSection,
        currentPath: location.pathname,
        searchParams: new URLSearchParams(location.search)
    };
}

/**
 * Hook for admin data fetching with state management
 */
export function useAdminData<T>(
    fetchFunction: () => Promise<T>,
    dependencies: any[] = [],
    stateKey?: string
) {
    const {
        state: data,
        setState: setData,
        isLoading,
        error,
        setError,
        setIsLoading,
        getUrlParams
    } = useAdminState<T | null>(null, stateKey);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await fetchFunction();
            setData(result);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch data');
            console.error('Error fetching data:', err);
        } finally {
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchFunction]);

    // Fetch data when dependencies change
    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies);

    // Note: Removed URL parameter refetch to prevent infinite loops
    // If you need to refetch on URL changes, call refetch() manually

    return {
        data,
        setData,
        isLoading,
        error,
        refetch: fetchData
    };
}
