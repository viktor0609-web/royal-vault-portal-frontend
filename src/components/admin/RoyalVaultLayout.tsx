import { ReactNode } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";
import { useBreadcrumbs } from "@/hooks/useBreadcrumbs";

interface RoyalVaultLayoutProps {
  children: ReactNode;
}

export function RoyalVaultLayout({ children }: RoyalVaultLayoutProps) {
  const { breadcrumbs, loading } = useBreadcrumbs();

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

              <AdminSidebar />
              <SidebarInset className="flex-1 flex flex-col h-screen overflow-hidden min-w-0 max-w-full">
                <div className="md:hidden h-20 flex-shrink-0"></div> {/* Spacer for mobile header */}

                {/* Breadcrumb Navigation - Sticky */}
                {(breadcrumbs.length > 1 || loading) && (
                  <div className="sticky top-0 z-40 px-2 sm:px-4 py-1.5 bg-white border-b border-royal-light-gray shadow-sm min-w-0 flex-shrink-0">
                    {loading && breadcrumbs.length <= 1 ? (
                      <div className="flex items-center space-x-1 text-[10px] sm:text-xs text-royal-gray">
                        <div className="animate-spin h-2.5 w-2.5 sm:h-3 sm:w-3 border-2 border-royal-light-gray border-t-royal-blue rounded-full"></div>
                        <span>Loading...</span>
                      </div>
                    ) : (
                      <Breadcrumb items={breadcrumbs} />
                    )}
                  </div>
                )}

                <div className="flex-1 overflow-y-auto min-w-0 max-w-full">
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