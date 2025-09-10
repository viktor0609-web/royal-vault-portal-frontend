import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuthDialog } from "@/context/AuthDialogContext";
import {
  HandIcon,
  MessageSquareIcon,
  TvIcon,
  GraduationCapIcon,
  TagIcon,
  HelpCircleIcon,
  LogInIcon
} from "lucide-react";
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
  { title: "Welcome", icon: HandIcon, path: "/" },
  { title: "Webinars", icon: TvIcon, path: "/royal-tv" },
  { title: "Courses", icon: GraduationCapIcon, path: "/courses" },
  { title: "Deals", icon: TagIcon, path: "/deals" },
];

const bottomItems = [
  { title: "Log In", icon: LogInIcon, action:'login'},
];

export function RoyalVaultSidebar() {
  const location = useLocation();
  const { setOpenMobile } = useSidebar();
  const {openDialog} = useAuthDialog();

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleLinkClick = (action: string) => {
    // Close mobile sidebar when a link is clicked
    if(action == 'login'){
      openDialog(action);
    } else if(action == 'faq'){

    }
    setOpenMobile(false);
  };

  return (
    <Sidebar className="w-48">
      {/* Desktop Header */}
      <div className="sm:flex items-center p-6 border-b border-royal-light-gray">
        <div className="flex items-center gap-2">
          <img src='/imgs/logo.svg' className="w-5"/>
          <span className="font-bold text-sm text-royal-dark-gray">ROYAL VAULT</span>
        </div>
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
                      <Link to={item.path} onClick={()=> setOpenMobile(false)}>
                        <item.icon className="mr-3 h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        <SidebarGroup className="border-t border-royal-light-gray pt-4">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {bottomItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`w-full justify-start px-4 py-3 text-left hover:bg-royal-light-gray transition-colors ${isActive(item.action)
                        ? "bg-royal-light-gray text-primary font-medium"
                        : "text-royal-gray"
                      }`}
                  >
                    <Link to="#" onClick={() => handleLinkClick(item.action)}>
                      <item.icon className="mr-3 h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}