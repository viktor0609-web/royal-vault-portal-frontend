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
            // Always start with Admin
            breadcrumbs.push({ label: 'Admin', path: '/admin' });

            // Handle different admin sections
            if (pathParts[1] === 'courses') {
                breadcrumbs.push({ label: 'Courses', path: '/admin/courses' });

                // Handle course groups
                if (pathParts[2] === 'groups' && pathParts[3]) {
                    breadcrumbs.push({
                        label: 'Group',
                        path: `/admin/courses/groups/${pathParts[3]}`,
                        isActive: pathParts.length === 4 // Only active if this is the final level
                    });

                    // Handle courses within groups
                    if (pathParts[4] === 'courses' && pathParts[5]) {
                        breadcrumbs.push({
                            label: 'Course',
                            path: `/admin/courses/groups/${pathParts[3]}/courses/${pathParts[5]}`,
                            isActive: pathParts.length === 6 // Only active if this is the final level
                        });

                        // Handle lectures within courses
                        if (pathParts[6] === 'lectures' && pathParts[7]) {
                            breadcrumbs.push({
                                label: 'Lecture',
                                isActive: true // Always active as this is the deepest level
                            });
                        }
                    }
                }
            } else if (pathParts[1]) {
                // Handle other admin sections (dashboard, deals, webinars, etc.)
                const sectionName = pathParts[1].charAt(0).toUpperCase() + pathParts[1].slice(1);
                breadcrumbs.push({
                    label: sectionName,
                    path: `/admin/${pathParts[1]}`,
                    isActive: pathParts.length === 2 // Only active if this is the final level
                });

                if (pathParts[2]) {
                    const subSectionName = pathParts[2].charAt(0).toUpperCase() + pathParts[2].slice(1);
                    breadcrumbs.push({
                        label: subSectionName,
                        path: `/admin/${pathParts[1]}/${pathParts[2]}`,
                        isActive: pathParts.length === 3 // Only active if this is the final level
                    });
                }
            }
        }

        return breadcrumbs;
    };

    // Get URL parameters for admin pages
    const getUrlParams = () => {
        const pathParts = location.pathname.split('/').filter(Boolean);
        const params: Record<string, string> = {};

        if (pathParts[0] === 'admin') {
            if (pathParts[1] === 'courses' && pathParts[2] === 'groups' && pathParts[3]) {
                params.groupId = pathParts[3];
                if (pathParts[4] === 'courses' && pathParts[5]) {
                    params.courseId = pathParts[5];
                    if (pathParts[6] === 'lectures' && pathParts[7]) {
                        params.lectureId = pathParts[7];
                    }
                }
            }
        }

        return params;
    };

    // Check if we're on a specific admin page
    const isOnPage = (page: string) => {
        return location.pathname === `/admin/${page}`;
    };

    // Check if we're on a specific admin section
    const isOnSection = (section: string) => {
        return location.pathname.startsWith(`/admin/${section}`);
    };

    return {
        getCurrentSection,
        navigateToAdminSection,
        isAdminPage,
        getBreadcrumbs,
        getUrlParams,
        isOnPage,
        isOnSection,
        currentPath: location.pathname,
        searchParams: new URLSearchParams(location.search)
    };
}
