import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";

//For Client
import { RoyalVaultLayout } from "./components/user/RoyalVaultLayout";
import { WelcomeSection } from "./components/user/WelcomeSection";
import { WebinarsSection } from "./components/user/WebinarsSection";
import { CoursesSection } from "./components/user/CoursesSection";
import { DealsSection } from "./components/user/DealsSection";
import { CourseDetailSection } from "./components/user/CourseDetailSection";
import { CourseGroupDetailSection } from "./components/user/CourseGroupDetailSection";
import { ProfileSection } from "./components/user/ProfileSection";
import { WebinarRegistration } from "./components/user/WebinarRegistration";

//For Admin
import { RoyalVaultLayout as AdminLayout } from "./components/admin/RoyalVaultLayout";
import { DealsSection as AdminDeals } from "./components/admin/DealsSection/DealsSection";
import { WebinarSection as AdminWebinar } from "./components/admin/WebinarSection/WebinarSection";
import { CoursesSection as AdminCourses } from "./components/admin/CoursesSection/CoursesSection";
import { CourseGroupDetail } from "./components/admin/CoursesSection/CourseGroupDetail";
import { CourseDetail } from "./components/admin/CoursesSection/CourseDetail";
import { StatsSection as AdminStats } from "./components/admin/StatsSection";


import NotFound from "./pages/NotFound";

import { Login } from "./components/auth/LoginModal";
import { SignUp } from "./components/auth/SignUpModal";
import { ResetPassword } from "./components/auth/ResetPasswordModal";
import { AuthDialogProvider } from "./context/AuthDialogContext";
import { SetPassword } from "./components/auth/SettingPasswordPage";
import { ReSettingPasswordPage } from "./components/auth/ReSettingPasswordPage";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";

import { VideoMeeting as AdminMeeting } from "./components/VideoMeeting/Admin/VideoMeeting";
import { VideoMeeting as UserMeeting } from "./components/VideoMeeting/User/VideoMeeting";
import { VideoMeeting as GuestMeeting } from "./components/VideoMeeting/Guest/VideoMeeting";
import { DailyMeetingProvider } from "./context/DailyMeetingContext";

const queryClient = new QueryClient();

const webinarData = {
  title: "Next Big Webinar",
  date: "Tuesday September 9th",
  time: "4:00pm",
  status: "upcoming",
};
function AdminRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  console.log(user);

  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

function UserRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;

  // Allow both regular users and admins to access Profile page
  return children;
}
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
                  <Routes>
                    {/* Client Routes*/}
                    <Route path="/" element={<RoyalVaultLayout><WelcomeSection /></RoyalVaultLayout>} />
                    <Route path="/royal-tv" element={<RoyalVaultLayout><WebinarsSection /></RoyalVaultLayout>} />
                    <Route path="/courses" element={<RoyalVaultLayout><CoursesSection /></RoyalVaultLayout>} />
                    <Route path="/course-groups/:groupId" element={<RoyalVaultLayout><CourseGroupDetailSection /></RoyalVaultLayout>} />
                    <Route path="/courses/:courseId" element={<RoyalVaultLayout><CourseDetailSection /></RoyalVaultLayout>} />
                    <Route path="/deals" element={<RoyalVaultLayout><DealsSection /></RoyalVaultLayout>} />
                    <Route path="/profile" element={<UserRoute><RoyalVaultLayout><ProfileSection /></RoyalVaultLayout></UserRoute>} />

                    {/* Admin Routes */}
                    <Route path="/admin" element={<AdminRoute><AdminLayout><Navigate to="/admin/courses" replace /></AdminLayout></AdminRoute>} />
                    <Route path="/admin/deals" element={<AdminRoute><AdminLayout><AdminDeals /></AdminLayout></AdminRoute>} />
                    <Route path="/admin/webinars" element={<AdminRoute><AdminLayout><AdminWebinar /></AdminLayout></AdminRoute>} />
                    <Route path="/admin/webinars/stats" element={<AdminRoute><AdminLayout><AdminStats /></AdminLayout></AdminRoute>} />
                    <Route path="/admin/courses" element={<AdminRoute><AdminLayout><AdminCourses /></AdminLayout></AdminRoute>} />
                    <Route path="/admin/courses/groups/:groupId" element={<AdminRoute><AdminLayout><CourseGroupDetail /></AdminLayout></AdminRoute>} />
                    <Route path="/admin/courses/groups/:groupId/courses/:courseId" element={<AdminRoute><AdminLayout><CourseDetail /></AdminLayout></AdminRoute>} />


                    <Route path="/verify/:token" element={<SetPassword />} />
                    <Route path="/reset-password/:token" element={<ReSettingPasswordPage />} />

                    {/* Guest webinar route - no authentication required */}
                    <Route path="/royal-tv/:slug/guest" element={<GuestMeeting />} />
                    <Route path="/royal-tv/:slug/admin" element={<AdminMeeting />} />
                    <Route path="/royal-tv/:slug/user" element={<UserMeeting />} />


                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>

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
