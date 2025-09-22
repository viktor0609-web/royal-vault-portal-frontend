import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Custom hook to manage URL state and ensure proper navigation on page refresh
 * This helps maintain state across page refreshes by using URL parameters
 */
export function useUrlState<T>(
    key: string,
    defaultValue: T,
    serializer?: {
        serialize: (value: T) => string;
        deserialize: (value: string) => T;
    }
) {
    const location = useLocation();
    const navigate = useNavigate();

    const urlParams = new URLSearchParams(location.search);
    const urlValue = urlParams.get(key);

    const [state, setState] = useState<T>(() => {
        if (urlValue && serializer) {
            try {
                return serializer.deserialize(urlValue);
            } catch {
                return defaultValue;
            }
        }
        return defaultValue;
    });

    const updateState = (newValue: T) => {
        setState(newValue);

        // Update URL with new state
        const newParams = new URLSearchParams(location.search);
        if (serializer) {
            newParams.set(key, serializer.serialize(newValue));
        } else {
            newParams.set(key, String(newValue));
        }

        const newSearch = newParams.toString();
        const newUrl = `${location.pathname}${newSearch ? `?${newSearch}` : ''}`;

        // Only update URL if it's different to avoid unnecessary navigation
        if (newUrl !== location.pathname + location.search) {
            navigate(newUrl, { replace: true });
        }
    };

    // Sync state with URL on location change (e.g., browser back/forward)
    useEffect(() => {
        if (urlValue && serializer) {
            try {
                const parsedValue = serializer.deserialize(urlValue);
                if (parsedValue !== state) {
                    setState(parsedValue);
                }
            } catch {
                // If parsing fails, keep current state
            }
        }
    }, [location.search, serializer, state]);

    return [state, updateState] as const;
}

/**
 * Hook to handle admin page state persistence
 * Ensures admin pages maintain their state on refresh
 */
export function useAdminPageState() {
    const location = useLocation();
    const navigate = useNavigate();

    // Get current admin section from URL
    const getCurrentSection = () => {
        const pathParts = location.pathname.split('/').filter(Boolean);
        if (pathParts[0] === 'admin') {
            return pathParts[1] || 'dashboard';
        }
        return null;
    };

    // Navigate to admin section with proper URL structure
    const navigateToAdminSection = (section: string, params?: Record<string, string>) => {
        let path = `/admin/${section}`;

        if (params) {
            // Handle specific route patterns
            if (section === 'courses/groups' && params.groupId) {
                path = `/admin/courses/groups/${params.groupId}`;
                if (params.courseId) {
                    path += `/courses/${params.courseId}`;
                }
            } else {
                // Generic parameter replacement
                Object.entries(params).forEach(([key, value]) => {
                    path = path.replace(`:${key}`, value);
                });
            }
        }

        navigate(path);
    };

    // Check if current page is an admin page
    const isAdminPage = () => {
        return location.pathname.startsWith('/admin');
    };

    // Get breadcrumb data for admin pages
    const getBreadcrumbs = () => {
        const pathParts = location.pathname.split('/').filter(Boolean);
        const breadcrumbs = [];

        if (pathParts[0] === 'admin') {
            breadcrumbs.push({ label: 'Admin', path: '/admin' });

            if (pathParts[1]) {
                breadcrumbs.push({
                    label: pathParts[1].charAt(0).toUpperCase() + pathParts[1].slice(1),
                    path: `/admin/${pathParts[1]}`
                });
            }

            if (pathParts[2]) {
                breadcrumbs.push({
                    label: pathParts[2].charAt(0).toUpperCase() + pathParts[2].slice(1),
                    path: `/admin/${pathParts[1]}/${pathParts[2]}`
                });
            }
        }

        return breadcrumbs;
    };

    return {
        getCurrentSection,
        navigateToAdminSection,
        isAdminPage,
        getBreadcrumbs,
        currentPath: location.pathname,
        searchParams: new URLSearchParams(location.search)
    };
}
