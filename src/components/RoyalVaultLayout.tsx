import { ReactNode } from "react";
import { RoyalVaultSidebar } from "./RoyalVaultSidebar";

interface RoyalVaultLayoutProps {
  children: ReactNode;
}

export function RoyalVaultLayout({ children }: RoyalVaultLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <RoyalVaultSidebar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}