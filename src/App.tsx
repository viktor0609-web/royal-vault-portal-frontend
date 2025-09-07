import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { RoyalVaultLayout } from "./components/RoyalVaultLayout";
import { WelcomeSection } from "./components/WelcomeSection";
import { WebinarsSection } from "./components/WebinarsSection";
import { CoursesSection } from "./components/CoursesSection";
import { DealsSection } from "./components/DealsSection";
import { CourseDetailSection } from "./components/CourseDetailSection";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <Routes>
            <Route path="/" element={<RoyalVaultLayout><WelcomeSection /></RoyalVaultLayout>} />
            <Route path="/royal-tv" element={<RoyalVaultLayout><WebinarsSection /></RoyalVaultLayout>} />
            <Route path="/courses" element={<RoyalVaultLayout><CoursesSection /></RoyalVaultLayout>} />
            <Route path="/courses/anonymity" element={<RoyalVaultLayout><CourseDetailSection /></RoyalVaultLayout>} />
            <Route path="/deals" element={<RoyalVaultLayout><DealsSection /></RoyalVaultLayout>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
