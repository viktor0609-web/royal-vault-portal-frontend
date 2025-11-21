import { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAuthDialog } from "@/context/AuthDialogContext";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeftIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";


const navigationItems = [
  { title: "Webinars", path: "/admin/webinars", icon: null },
  { title: "Courses", path: "/admin/courses", icon: null },
  { title: "Deals", path: "/admin/deals", icon: null },
  { title: "Users", path: "/admin/users", icon: null },
];


export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setOpenMobile } = useSidebar();
  const { openDialog } = useAuthDialog();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleLinkClick = async (action: string) => {
    // Close mobile sidebar when a link is clicked
    if (action == 'login') {
      openDialog(action);
    } else if (action == 'logout') {
      await logout();
    }
    setOpenMobile(false);
  };

  const handleToggleToUser = () => {
    navigate('/');
    setOpenMobile(false);
  };

  return (
    <Sidebar className="w-48">
      {/* Desktop Header */}
      <div className="sm:flex items-center p-6 border-b border-royal-light-gray">
        <Link to="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <img src='/imgs/logo.svg' className="w-5" />
          <span className="font-bold text-sm text-royal-dark-gray">ROYAL VAULT</span>
        </Link>
      </div>

      <SidebarContent className="flex flex-col justify-between h-full">
        {/* Toggle Button to User View - Only for logged-in admins */}
        {user && user.role === "admin" && (
          <SidebarGroup className="border-b border-royal-light-gray pb-4 mb-4">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={handleToggleToUser}
                    className="w-full justify-start px-4 py-3 text-left hover:bg-royal-light-gray transition-colors bg-royal-blue text-white hover:bg-royal-blue-dark"
                  >
                    <ArrowLeftIcon className="mr-3 h-5 w-5" />
                    <span>Back to User View</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <div className="flex-1 flex items-center justify-center">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={`w-full justify-start px-4 py-3 text-left hover:bg-royal-light-gray transition-colors ${isActive(item.path)
                        ? "bg-royal-light-gray text-primary font-medium"
                        : "text-royal-gray"
                        }`}
                    >
                      <Link to={item.path} onClick={() => setOpenMobile(false)}>
                        {item.icon && <item.icon className="mr-3 h-5 w-5" />}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className="w-full justify-start px-4 py-3 text-left hover:bg-royal-light-gray transition-colors text-royal-gray"
                  >
                    <Link to="#" onClick={() => handleLinkClick(user ? 'logout' : 'login')}>
                      <span>{user ? 'Log Out' : 'Log In'}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}