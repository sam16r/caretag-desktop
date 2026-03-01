import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  Search,
  Calendar,
  AlertTriangle,
  FileText,
  Pill,
  BarChart3,
  Smartphone,
  Settings,
  LogOut,
  PieChart,
} from 'lucide-react';
import logoSvg from '@/assets/logo.svg';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const doctorNavItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Patients', url: '/patients', icon: Search },
  { title: 'Appointments', url: '/appointments', icon: Calendar },
  { title: 'Emergency', url: '/emergency', icon: AlertTriangle },
  { title: 'Records', url: '/records', icon: FileText },
  { title: 'Prescriptions', url: '/prescriptions', icon: Pill },
  { title: 'Analytics', url: '/analytics', icon: PieChart },
  { title: 'Reports', url: '/reports', icon: BarChart3 },
  { title: 'Devices', url: '/devices', icon: Smartphone },
  { title: 'Settings', url: '/settings', icon: Settings },
];

const adminNavItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Patients', url: '/patients', icon: Search },
  { title: 'Appointments', url: '/appointments', icon: Calendar },
  { title: 'Emergency', url: '/emergency', icon: AlertTriangle },
  { title: 'Analytics', url: '/analytics', icon: PieChart },
  { title: 'Reports', url: '/reports', icon: BarChart3 },
  { title: 'Settings', url: '/settings', icon: Settings },
];

const centerNavItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Patients', url: '/patients', icon: Search },
  { title: 'Reports', url: '/reports', icon: BarChart3 },
  { title: 'Analytics', url: '/analytics', icon: PieChart },
  { title: 'Settings', url: '/settings', icon: Settings },
];

const hospitalNavItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Patients', url: '/patients', icon: Search },
  { title: 'Appointments', url: '/appointments', icon: Calendar },
  { title: 'Emergency', url: '/emergency', icon: AlertTriangle },
  { title: 'Reports', url: '/reports', icon: BarChart3 },
  { title: 'Analytics', url: '/analytics', icon: PieChart },
  { title: 'Devices', url: '/devices', icon: Smartphone },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, signOut } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const navItems =
    role === 'admin' ? adminNavItems :
    role === 'center_admin' ? centerNavItems :
    role === 'hospital_admin' ? hospitalNavItems :
    doctorNavItems;

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getInitials = (email: string) => {
    return email?.substring(0, 2).toUpperCase() || 'U';
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <SidebarHeader className={cn(
        "border-b border-sidebar-border transition-all duration-200 overflow-hidden",
        collapsed ? "p-2" : "p-4"
      )}>
        <div className={cn(
          "flex items-center overflow-hidden transition-all duration-200",
          collapsed ? "justify-center" : "gap-3"
        )}>
          <img 
            src={logoSvg} 
            alt="CareTag Logo" 
            className={cn(
              "flex-shrink-0 transition-all duration-200",
              collapsed ? "h-8 w-8" : "h-9 w-9"
            )}
          />
          <div className={cn(
            "flex flex-col transition-all duration-200 ease-in-out",
            collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
          )}>
            <span className="text-sm font-semibold text-sidebar-foreground whitespace-nowrap">
              CareTag
            </span>
            <span className="text-xs text-sidebar-foreground/50 whitespace-nowrap italic">Your Health, Simplified</span>
          </div>
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className={cn(
        "py-3 transition-all duration-200",
        collapsed ? "px-1" : "px-2"
      )}>
        <SidebarGroup>
          <p className={cn(
            "px-3 mb-2 text-xs font-medium text-sidebar-foreground/40 uppercase tracking-wider transition-all duration-200 ease-in-out overflow-hidden whitespace-nowrap",
            collapsed ? "h-0 opacity-0 mb-0" : "h-auto opacity-100"
          )}>
            Menu
          </p>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {navItems.map((item) => {
                const isActive = location.pathname === item.url;
                const isEmergency = item.title === 'Emergency';
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        'transition-all duration-200 rounded-md h-9',
                        collapsed && 'flex items-center justify-center',
                        isActive && !isEmergency && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                        isEmergency && !isActive && 'text-destructive hover:text-destructive hover:bg-destructive/10',
                        isActive && isEmergency && 'bg-destructive text-destructive-foreground hover:bg-destructive',
                        !isActive && !isEmergency && 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                      )}
                    >
                      <button
                        onClick={() => navigate(item.url)}
                        className={cn(
                          "flex items-center w-full transition-all duration-200 ease-in-out",
                          collapsed ? "justify-center px-0" : "gap-3 px-3"
                        )}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0 transition-transform duration-200" />
                        <span className={cn(
                          "text-sm font-medium transition-all duration-200 ease-in-out whitespace-nowrap overflow-hidden",
                          collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                        )}>{item.title}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User Section */}
      <SidebarFooter className={cn(
        "border-t border-sidebar-border transition-all duration-200",
        collapsed ? "p-2" : "p-2"
      )}>
        <div className={cn(
          'flex items-center rounded-md hover:bg-sidebar-accent transition-all duration-200 ease-in-out overflow-hidden',
          collapsed ? 'justify-center p-1' : 'gap-3 p-2'
        )}>
          <Avatar className="h-8 w-8 flex-shrink-0 transition-transform duration-200">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
              {getInitials(user?.email || '')}
            </AvatarFallback>
          </Avatar>
          <div className={cn(
            "flex flex-1 items-center gap-2 min-w-0 transition-all duration-200 ease-in-out",
            collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
          )}>
            <div className="flex flex-1 flex-col min-w-0">
              <span className="text-sm font-medium text-sidebar-foreground truncate whitespace-nowrap">
                {user?.email?.split('@')[0]}
              </span>
              <span className="text-xs text-sidebar-foreground/50 capitalize whitespace-nowrap">
                {role || 'User'}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-md text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors duration-150 flex-shrink-0"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
