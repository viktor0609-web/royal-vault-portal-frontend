import { ReactNode } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { RoyalVaultSidebar } from "./RoyalVaultSidebar";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Link, useLocation } from "react-router-dom";

interface RoyalVaultLayoutProps {
  children: ReactNode;
}

export function RoyalVaultLayout({ children }: RoyalVaultLayoutProps) {
  const location = useLocation();

  // Generate breadcrumbs for user pages
  const getBreadcrumbs = () => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [];

    if (pathParts.length > 0) {
      breadcrumbs.push({ label: 'Home', path: '/' });

      if (pathParts[0] === 'royal-tv') {
        breadcrumbs.push({ label: 'Royal TV', path: '/royal-tv' });
      } else if (pathParts[0] === 'courses') {
        breadcrumbs.push({ label: 'Courses', path: '/courses' });
        if (pathParts[1]) {
          breadcrumbs.push({ label: 'Course Details', isActive: true });
        }
      } else if (pathParts[0] === 'course-groups') {
        breadcrumbs.push({ label: 'Course Groups', path: '/courses' });
        if (pathParts[1]) {
          breadcrumbs.push({ label: 'Group Details', isActive: true });
        }
      } else if (pathParts[0] === 'deals') {
        breadcrumbs.push({ label: 'Deals', path: '/deals' });
      } else if (pathParts[0] === 'profile') {
        breadcrumbs.push({ label: 'Profile', path: '/profile' });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
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
        <SidebarInset className="flex-1">
          <div className="md:hidden h-20"></div> {/* Spacer for mobile header */}

          {/* Breadcrumb Navigation */}
          {breadcrumbs.length > 1 && (
            <div className="px-4 py-2 bg-white border-b border-royal-light-gray">
              <Breadcrumb items={breadcrumbs} />
            </div>
          )}

          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}