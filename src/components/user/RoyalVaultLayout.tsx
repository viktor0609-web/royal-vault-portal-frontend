import { ReactNode, useState, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { RoyalVaultSidebar } from "./RoyalVaultSidebar";
import { UserBreadcrumb } from "@/components/ui/user-breadcrumb";
import { Link, useLocation, useParams } from "react-router-dom";
import { courseApi } from "@/lib/api";

interface RoyalVaultLayoutProps {
  children: ReactNode;
}

export function RoyalVaultLayout({ children }: RoyalVaultLayoutProps) {
  const location = useLocation();
  const params = useParams();
  const [breadcrumbData, setBreadcrumbData] = useState<{
    courseName?: string;
    groupName?: string;
    courseGroupId?: string;
  }>({});
  const [breadcrumbLoading, setBreadcrumbLoading] = useState(false);

  // Fetch breadcrumb data based on current route
  useEffect(() => {
    const fetchBreadcrumbData = async () => {
      const pathParts = location.pathname.split('/').filter(Boolean);

      // Clear previous breadcrumb data
      setBreadcrumbData({});
      setBreadcrumbLoading(true);

      try {
        // Fetch course name and group info if we're in a course detail page
        if (pathParts[0] === 'courses' && pathParts[1]) {
          try {
            const courseResponse = await courseApi.getCourseById(pathParts[1], 'basic');
            const groupId = typeof courseResponse.data.courseGroup === 'object' && courseResponse.data.courseGroup ? courseResponse.data.courseGroup._id : '';

            // Also fetch the group name
            let groupName = 'Group';
            try {
              const groupResponse = await courseApi.getCourseGroupById(groupId, 'basic');
              groupName = groupResponse.data.title;
            } catch (error) {
              console.warn('Failed to fetch group name for breadcrumb:', error);
            }

            setBreadcrumbData(prev => ({
              ...prev,
              courseName: courseResponse.data.title,
              courseGroupId: groupId,
              groupName: groupName
            }));
          } catch (error) {
            console.warn('Failed to fetch course data for breadcrumb:', error);
          }
        }

        // Fetch group name if we're in a course group page
        if (pathParts[0] === 'course-groups' && pathParts[1]) {
          try {
            const groupResponse = await courseApi.getCourseGroupById(pathParts[1], 'basic');
            setBreadcrumbData(prev => ({
              ...prev,
              groupName: groupResponse.data.title
            }));
          } catch (error) {
            console.warn('Failed to fetch group data for breadcrumb:', error);
          }
        }
      } catch (error) {
        console.warn('Failed to fetch breadcrumb data:', error);
      } finally {
        setBreadcrumbLoading(false);
      }
    };

    fetchBreadcrumbData();
  }, [location.pathname]);

  // Generate breadcrumbs for user pages
  const getBreadcrumbs = () => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [];

    if (pathParts.length > 0) {
      breadcrumbs.push({ label: 'Home', path: '/' });

      if (pathParts[0] === 'royal-tv') {
        breadcrumbs.push({ label: 'Royal TV', path: '/royal-tv', isActive: true });
      } else if (pathParts[0] === 'courses') {
        breadcrumbs.push({ label: 'Courses', path: '/courses' });
        if (pathParts[1]) {
          // Only show course breadcrumb if we have the actual name
          if (breadcrumbData.courseName) {
            // If we have course group info, show the group in the breadcrumb
            if (breadcrumbData.courseGroupId && breadcrumbData.groupName) {
              breadcrumbs.push({
                label: breadcrumbData.groupName,
                path: `/course-groups/${breadcrumbData.courseGroupId}`
              });
            }
            // Show actual course name
            breadcrumbs.push({ label: breadcrumbData.courseName, isActive: true });
          }
        }
      } else if (pathParts[0] === 'course-groups') {
        breadcrumbs.push({ label: 'Courses', path: '/courses' });
        if (pathParts[1]) {
          // Only show group breadcrumb if we have the actual name
          if (breadcrumbData.groupName) {
            breadcrumbs.push({ label: breadcrumbData.groupName, isActive: true });
          }
        }
      } else if (pathParts[0] === 'deals') {
        breadcrumbs.push({ label: 'Deals', path: '/deals', isActive: true });
      } else if (pathParts[0] === 'profile') {
        breadcrumbs.push({ label: 'My Profile', path: '/profile', isActive: true });
      } else if (pathParts[0] === 'registration') {
        breadcrumbs.push({ label: 'Webinar Registration', path: '/registration', isActive: true });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <>
      <style>{`
        /* Constrain fixed sidebar within max-width container */
        @media (min-width: 1600px) {
          [data-sidebar-container] [data-side="left"] > div:last-child {
            left: max(0px, calc((100vw - 1600px) / 2)) !important;
          }
        }
      `}</style>
      <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
        <div className="w-full max-w-[1600px] mx-auto min-h-screen bg-white shadow-2xl" data-sidebar-container>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              {/* Mobile Header */}
              <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar border-b border-royal-light-gray">
                <div className="flex items-center justify-between p-4">
                  <Link to="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                    <img src='/imgs/logo.svg' className="w-5" />
                    <span className="font-bold text-sm text-royal-dark-gray">ROYAL VAULT</span>
                  </Link>
                  <SidebarTrigger className="h-8 w-8" />
                </div>
              </div>

              <RoyalVaultSidebar />
              <SidebarInset className="flex-1 flex flex-col h-screen overflow-hidden">
                <div className="md:hidden h-20 flex-shrink-0"></div> {/* Spacer for mobile header */}

                {/* Breadcrumb Navigation - Sticky */}
                {(breadcrumbs.length > 1 || breadcrumbLoading) && (
                  <div className="sticky top-0 z-40 px-2 sm:px-4 py-1.5 bg-white border-b border-royal-light-gray shadow-sm overflow-x-auto flex-shrink-0">
                    {breadcrumbLoading && breadcrumbs.length <= 1 ? (
                      <div className="flex items-center space-x-1 text-[10px] sm:text-xs text-royal-gray">
                        <div className="animate-spin h-2.5 w-2.5 sm:h-3 sm:w-3 border-2 border-royal-light-gray border-t-royal-blue rounded-full"></div>
                        <span>Loading...</span>
                      </div>
                    ) : (
                      <UserBreadcrumb items={breadcrumbs} />
                    )}
                  </div>
                )}

                <div className="flex-1 overflow-y-auto min-w-0">
                  {children}
                </div>
              </SidebarInset>
            </div>
          </SidebarProvider>
        </div>
      </div>
    </>
  );
}