import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";

import { Login } from "@/components/auth/LoginModal";
import { SignUp } from "@/components/auth/SignUpModal";
import { ResetPassword } from "@/components/auth/ResetPasswordModal";
import { AuthDialogProvider } from "@/context/AuthDialogContext";
import { AuthProvider } from "@/context/AuthContext";
import { DailyMeetingProvider } from "@/context/DailyMeetingContext";
import { AppRoutes } from "@/routes";

const queryClient = new QueryClient();

const App = () => (
  <div className="min-w-0 max-w-full overflow-hidden">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AuthDialogProvider>
            <DailyMeetingProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <SidebarProvider>
                  <AppRoutes />
                </SidebarProvider>
              </BrowserRouter>
            </DailyMeetingProvider>
            <Login />
            <SignUp />
            <ResetPassword />
          </AuthDialogProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </div>
);

export default App;
