import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";

//For Client
import { RoyalVaultLayout } from "./components/user/RoyalVaultLayout";
import { WelcomeSection } from "./components/user/WelcomeSection";
import { WebinarsSection } from "./components/user/WebinarsSection";
import { CoursesSection } from "./components/user/CoursesSection";
import { DealsSection } from "./components/user/DealsSection";
import { CourseDetailSection } from "./components/user/CourseDetailSection";
import { WebinarRegistration } from "./components/user/WebinarRegistration";

//For Admin
import { RoyalVaultLayout as AdminLayout } from "./components/admin/RoyalVaultLayout";
import { DealsSection as AdminDeals } from "./components/admin/DealsSection/DealsSection";
import { WebinarSection as AdminWebinar } from "./components/admin/WebinarSection/WebinarSection";

import NotFound from "./pages/NotFound";

import { Login } from "./components/auth/LoginModal";
import { SignUp } from "./components/auth/SignUpModal";
import { ResetPassword } from "./components/auth/ResetPasswordModal";
import { AuthDialogProvider } from "./context/AuthDialogContext";

const queryClient = new QueryClient();

const webinarData = {
  title: "Next Big Webinar",
  date: "Tuesday September 9th",
  time: "4:00pm",
  status: "upcoming",
};
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthDialogProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <Routes>
              {/* Client Routes*/}
              <Route path="/" element={<RoyalVaultLayout><WelcomeSection /></RoyalVaultLayout>} />
              <Route path="/royal-tv" element={<RoyalVaultLayout><WebinarsSection /></RoyalVaultLayout>} />
              <Route path="/courses" element={<RoyalVaultLayout><CoursesSection /></RoyalVaultLayout>} />
              <Route path="/courses/:id" element={<RoyalVaultLayout><CourseDetailSection /></RoyalVaultLayout>} />
              <Route path="/deals" element={<RoyalVaultLayout><DealsSection /></RoyalVaultLayout>} />
              <Route path="/registration" element={<WebinarRegistration webinar={webinarData} />} />

              {/* Admin Routes */}
              <Route path="/admin/deals" element={<AdminLayout><AdminDeals /></AdminLayout>} />
              <Route path="/admin/webinars" element={<AdminLayout><AdminWebinar /></AdminLayout>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SidebarProvider>
        </BrowserRouter>
        <Login/>
        <SignUp/>
        <ResetPassword/>
      </AuthDialogProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
