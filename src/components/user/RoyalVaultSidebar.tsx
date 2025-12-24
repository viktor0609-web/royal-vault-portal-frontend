import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAuthDialog } from "@/context/AuthDialogContext";
import { useAuth } from "@/context/AuthContext";
import {
  HandIcon,
  MessageSquareIcon,
  TvIcon,
  GraduationCapIcon,
  TagIcon,
  HelpCircleIcon,
  LogInIcon,
  LogOutIcon,
  AxeIcon,
  MessageCircleQuestionIcon,
  UserIcon,
  ArrowLeftIcon,
  ReceiptIcon
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
  { title: "Royal TV", icon: TvIcon, path: "/royal-tv" },
  { title: "Courses", icon: GraduationCapIcon, path: "/courses" },
  { title: "Deals", icon: TagIcon, path: "/deals" },
];

const userOnlyNavigationItems = [
  { title: "Orders", icon: ReceiptIcon, path: "/orders" },
];

const bottomItemsForGuest = [
  // { title: "FAQ", icon: HelpCircleIcon, action: null },
  { title: "Log In", icon: LogInIcon, action: 'login' },
];
const bottomItemsForUser = [
  // { title: "FAQ", icon: HelpCircleIcon, action: null },
  { title: "Profile", icon: UserIcon, path: "/profile" },
  { title: "Log Out", icon: LogOutIcon, action: 'logout' },
];

export function RoyalVaultSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setOpenMobile } = useSidebar();
  const { openDialog } = useAuthDialog();
  const { user, logout } = useAuth();

  const isAdminView = location.pathname.startsWith('/admin');

  const menuItems = [
    ...navigationItems,
    ...(user ? userOnlyNavigationItems : []),
  ];

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

  const handleToggleView = () => {
    if (isAdminView) {
      navigate('/');
    } else {
      navigate('/admin/webinars');
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
        {/* Toggle Button for Admin/User View - Only for logged-in admins */}
        {user && user.role === "admin" && (
          <SidebarGroup className="border-b border-royal-light-gray pb-4 mb-4">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={handleToggleView}
                    className="w-full justify-start px-4 py-3 text-left hover:bg-royal-light-gray transition-colors bg-royal-blue text-white hover:bg-royal-blue-dark"
                  >
                    <ArrowLeftIcon className="mr-3 h-5 w-5" />
                    <span>{isAdminView ? "Back to User View" : "Switch to Admin"}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <div className="flex-1 flex items-start pt-4">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={`w-full justify-start px-4 py-3 text-left hover:bg-royal-light-gray transition-colors ${isActive(item.path)
                        ? "bg-royal-light-gray text-primary font-medium"
                        : "text-royal-gray"
                        }`}
                    >
                      <Link to={item.path} onClick={() => setOpenMobile(false)}>
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
              {(user ? bottomItemsForUser : bottomItemsForGuest).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`w-full justify-start px-4 py-3 text-left hover:bg-royal-light-gray transition-colors ${isActive(item.path || item.action)
                      ? "bg-royal-light-gray text-primary font-medium"
                      : "text-royal-gray"
                      }`}
                  >
                    {item.path ? (
                      <Link to={item.path} onClick={() => setOpenMobile(false)}>
                        <item.icon className="mr-3 h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    ) : item.action ? (
                      <Link to="#" onClick={() => handleLinkClick(item.action)}>
                        <item.icon className="mr-3 h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    ) : (
                      <div className="flex items-center cursor-default opacity-60">
                        <item.icon className="mr-3 h-5 w-5" />
                        <span>{item.title}</span>
                      </div>
                    )}
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