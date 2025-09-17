import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuthDialog } from "@/context/AuthDialogContext";
import { useAuth } from "@/context/AuthContext";
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
  { title: "Webinars", path: "/admin/webinars" },
  { title: "Courses", path: "/admin/courses" },
  { title: "Deals", path: "/admin/deals" },
];


export function AdminSidebar() {
  const location = useLocation();
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