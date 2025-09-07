import { ReactNode } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { RoyalVaultSidebar } from "./RoyalVaultSidebar";

interface RoyalVaultLayoutProps {
  children: ReactNode;
}

export function RoyalVaultLayout({ children }: RoyalVaultLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        {/* Mobile Header */}
        <div className="sm:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b border-royal-light-gray">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">RV</span>
              </div>
              <span className="font-bold text-lg text-royal-dark-gray">ROYAL VAULT</span>
            </div>
            <SidebarTrigger className="h-8 w-8" />
          </div>
        </div>

        <RoyalVaultSidebar />
        <SidebarInset className="flex-1">
          <div className="sm:hidden h-20"></div> {/* Spacer for mobile header */}
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}