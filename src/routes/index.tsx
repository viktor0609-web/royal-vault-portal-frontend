// Application routes configuration
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// Client Components
import { RoyalVaultLayout } from "@/components/user/RoyalVaultLayout";
import { WelcomeSection } from "@/components/user/WelcomeSection";
import { WebinarsSection } from "@/components/user/WebinarsSection";
import { CoursesSection } from "@/components/user/CoursesSection";
import { DealsSection } from "@/components/user/DealsSection";
import { CourseDetailSection } from "@/components/user/CourseDetailSection";
import { CourseGroupDetailSection } from "@/components/user/CourseGroupDetailSection";
import { CourseSectionPage } from "@/components/user/CourseSectionPage";
import { ProfileSection } from "@/components/user/ProfileSection";
import { OrdersSection } from "@/components/user/OrdersSection";
import { WebinarRegistrationPage } from "@/components/user/WebinarRegistrationPage";
import { WebinarReplayPage } from "@/components/user/WebinarReplayPage";

// Admin Components
import { RoyalVaultLayout as AdminLayout } from "@/components/admin/RoyalVaultLayout";
import { DealsSection as AdminDeals } from "@/components/admin/DealsSection/DealsSection";
import { WebinarSection as AdminWebinar } from "@/components/admin/WebinarSection/WebinarSection";
import { CoursesSection as AdminCourses } from "@/components/admin/CoursesSection/CoursesSection";
import { CourseGroupDetail } from "@/components/admin/CoursesSection/CourseGroupDetail";
import { CourseDetail } from "@/components/admin/CoursesSection/CourseDetail";
import { StatsSection as AdminStats } from "@/components/admin/StatsSection";
import { UsersSection as AdminUsers } from "@/components/admin/UsersSection/UsersSection";

// Auth Components
import { SetPassword } from "@/components/auth/SettingPasswordPage";
import { ReSettingPasswordPage } from "@/components/auth/ReSettingPasswordPage";
import { ViewAsPage } from "@/components/auth/ViewAsPage";

// Video Meeting Components
import { VideoMeeting as AdminMeeting } from "@/components/VideoMeeting/Admin/VideoMeeting";
import { VideoMeeting as UserMeeting } from "@/components/VideoMeeting/User/VideoMeeting";
import { VideoMeeting as GuestMeeting } from "@/components/VideoMeeting/Guest/VideoMeeting";

// Other
import NotFound from "@/pages/NotFound";

// Route Guards
function AdminRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

function SupaadminRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (!user.supaadmin) return <Navigate to="/" replace />;
  return children;
}

function UserRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return children;
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Client Routes */}
      <Route
        path="/"
        element={
          <RoyalVaultLayout>
            <WelcomeSection />
          </RoyalVaultLayout>
        }
      />
      <Route
        path="/royal-tv"
        element={
          <RoyalVaultLayout>
            <WebinarsSection />
          </RoyalVaultLayout>
        }
      />
      <Route
        path="/courses"
        element={
          <RoyalVaultLayout>
            <CoursesSection />
          </RoyalVaultLayout>
        }
      />
      <Route
        path="/courses/section/:categoryId"
        element={
          <RoyalVaultLayout>
            <CourseSectionPage />
          </RoyalVaultLayout>
        }
      />
      <Route
        path="/course-groups/:groupId"
        element={
          <RoyalVaultLayout>
            <CourseGroupDetailSection />
          </RoyalVaultLayout>
        }
      />
      <Route
        path="/courses/:courseId"
        element={
          <RoyalVaultLayout>
            <CourseDetailSection />
          </RoyalVaultLayout>
        }
      />
      <Route
        path="/deals"
        element={
          <RoyalVaultLayout>
            <DealsSection />
          </RoyalVaultLayout>
        }
      />
      <Route path="/webinar-register" element={<WebinarRegistrationPage />} />
      <Route
        path="/replay/:slug"
        element={<WebinarReplayPage />}
      />
      <Route
        path="/profile"
        element={
          <UserRoute>
            <RoyalVaultLayout>
              <ProfileSection />
            </RoyalVaultLayout>
          </UserRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <UserRoute>
            <RoyalVaultLayout>
              <OrdersSection />
            </RoyalVaultLayout>
          </UserRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout>
              <Navigate to="/admin/courses" replace />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/deals"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminDeals />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/webinars"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminWebinar />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/webinars/stats"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminStats />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/courses"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminCourses />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/courses/groups/:groupId"
        element={
          <AdminRoute>
            <AdminLayout>
              <CourseGroupDetail />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/courses/groups/:groupId/courses/:courseId"
        element={
          <AdminRoute>
            <AdminLayout>
              <CourseDetail />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <SupaadminRoute>
            <AdminLayout>
              <AdminUsers />
            </AdminLayout>
          </SupaadminRoute>
        }
      />

      {/* Auth Routes */}
      <Route path="/verify/:token" element={<SetPassword />} />
      <Route path="/reset-password/:token" element={<ReSettingPasswordPage />} />
      <Route path="/view-as" element={<ViewAsPage />} />

      {/* Video Meeting Routes */}
      <Route path="/royal-tv/:slug/guest" element={<GuestMeeting />} />
      <Route path="/royal-tv/:slug/admin" element={<AdminMeeting />} />
      <Route path="/royal-tv/:slug/user" element={<UserMeeting />} />

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

