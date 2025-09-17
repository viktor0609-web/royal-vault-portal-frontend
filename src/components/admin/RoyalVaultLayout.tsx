import { ReactNode } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { Link } from "react-router-dom";

interface RoyalVaultLayoutProps {
  children: ReactNode;
}

export function RoyalVaultLayout({ children }: RoyalVaultLayoutProps) {
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

        <AdminSidebar />
        <SidebarInset className="flex-1">
          <div className="md:hidden h-20"></div> {/* Spacer for mobile header */}
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}