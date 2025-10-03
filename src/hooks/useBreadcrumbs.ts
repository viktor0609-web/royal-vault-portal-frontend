import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { courseApi } from '@/lib/api';

interface BreadcrumbItem {
    label: string;
    path?: string;
    isActive?: boolean;
}

interface BreadcrumbData {
    groupName?: string;
    courseName?: string;
    lectureName?: string;
}

export function useBreadcrumbs() {
    const location = useLocation();
    const params = useParams();
    const [breadcrumbData, setBreadcrumbData] = useState<BreadcrumbData>({});
    const [loading, setLoading] = useState(false);

    // Fetch breadcrumb data based on current route
    const fetchBreadcrumbData = async () => {
        const pathParts = location.pathname.split('/').filter(Boolean);

        if (pathParts[0] === 'admin' && pathParts[1] === 'courses') {
            setLoading(true);
            try {
                const data: BreadcrumbData = {};

                // Fetch group name if we're in a group
                if (pathParts[2] === 'groups' && pathParts[3]) {
                    try {
                        const groupResponse = await courseApi.getCourseGroupById(pathParts[3]);
                        data.groupName = groupResponse.data.title;
                    } catch (error) {
                        console.warn('Failed to fetch group name:', error);
                        data.groupName = 'Group';
                    }
                }

                // Fetch course name if we're in a course
                if (pathParts[4] === 'courses' && pathParts[5]) {
                    try {
                        const courseResponse = await courseApi.getCourseById(pathParts[5]);
                        data.courseName = courseResponse.data.title;
                    } catch (error) {
                        console.warn('Failed to fetch course name:', error);
                        data.courseName = 'Course';
                    }
                }

                // Fetch lecture name if we're in a lecture
                if (pathParts[6] === 'lectures' && pathParts[7]) {
                    try {
                        const lectureResponse = await courseApi.getLectureById(pathParts[7]);
                        data.lectureName = lectureResponse.data.title;
                    } catch (error) {
                        console.warn('Failed to fetch lecture name:', error);
                        data.lectureName = 'Lecture';
                    }
                }

                setBreadcrumbData(data);
            } catch (error) {
                console.error('Error fetching breadcrumb data:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchBreadcrumbData();
    }, [location.pathname]);

    const getBreadcrumbs = (): BreadcrumbItem[] => {
        const pathParts = location.pathname.split('/').filter(Boolean);
        const breadcrumbs: BreadcrumbItem[] = [];

        if (pathParts[0] === 'admin') {
            // Always start with Admin
            breadcrumbs.push({ label: 'Admin', path: '/admin' });

            // Handle different admin sections
            if (pathParts[1] === 'courses') {
                breadcrumbs.push({ label: 'Courses', path: '/admin/courses' });

                // Handle course groups - only show if we have the actual name
                if (pathParts[2] === 'groups' && pathParts[3]) {
                    if (breadcrumbData.groupName) {
                        breadcrumbs.push({
                            label: breadcrumbData.groupName,
                            path: `/admin/courses/groups/${pathParts[3]}`,
                            isActive: pathParts.length === 4
                        });
                    }

                    // Handle courses within groups - only show if we have the actual name
                    if (pathParts[4] === 'courses' && pathParts[5]) {
                        if (breadcrumbData.courseName) {
                            breadcrumbs.push({
                                label: breadcrumbData.courseName,
                                path: `/admin/courses/groups/${pathParts[3]}/courses/${pathParts[5]}`,
                                isActive: pathParts.length === 6
                            });
                        }

                        // Handle lectures within courses - only show if we have the actual name
                        if (pathParts[6] === 'lectures' && pathParts[7]) {
                            if (breadcrumbData.lectureName) {
                                breadcrumbs.push({
                                    label: breadcrumbData.lectureName,
                                    isActive: true
                                });
                            }
                        }
                    }
                }
            } else if (pathParts[1]) {
                // Handle other admin sections (dashboard, deals, webinars, etc.)
                const sectionName = pathParts[1].charAt(0).toUpperCase() + pathParts[1].slice(1);
                breadcrumbs.push({
                    label: sectionName,
                    path: `/admin/${pathParts[1]}`,
                    isActive: pathParts.length === 2
                });

                if (pathParts[2]) {
                    const subSectionName = pathParts[2].charAt(0).toUpperCase() + pathParts[2].slice(1);
                    breadcrumbs.push({
                        label: subSectionName,
                        path: `/admin/${pathParts[1]}/${pathParts[2]}`,
                        isActive: pathParts.length === 3
                    });
                }
            }
        }

        return breadcrumbs;
    };

    return {
        breadcrumbs: getBreadcrumbs(),
        loading,
        breadcrumbData
    };
}
