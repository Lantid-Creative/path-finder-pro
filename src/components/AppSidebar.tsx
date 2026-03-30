import { useState } from "react";
import {
  Shield, Home, Users, Bell, Settings, User, Map as MapIcon,
  Phone, Video, Mic, History, Star, HelpCircle, LogOut, ChevronDown
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "Map", url: "/", icon: MapIcon },
  { title: "Alerts", url: "/alerts", icon: Bell },
  { title: "Community", url: "/community", icon: Users },
  { title: "Contacts", url: "/contacts", icon: Phone },
  { title: "Evidence", url: "/evidence", icon: Video },
];

const secondaryNav = [
  { title: "History", url: "/history", icon: History },
  { title: "Safe Zones", url: "/safe-zones", icon: Star },
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Help", url: "/help", icon: HelpCircle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="offcanvas" className="border-r-0">
      <SidebarHeader className="p-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-safe flex items-center justify-center shadow-lg">
            <Shield size={20} className="text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-display font-bold text-lg text-foreground tracking-tight">PATHLY</h2>
              <p className="text-xs text-muted-foreground">Stay safe, stay connected</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* User profile card */}
      {!collapsed && (
        <div className="mx-3 mb-2 p-3 rounded-xl bg-secondary/50 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
              <User size={16} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Alex Johnson</p>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-safe" />
                <span className="text-xs text-muted-foreground">Safe</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-4">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-secondary/60 rounded-lg mx-1 px-3 py-2.5 flex items-center gap-3 text-muted-foreground"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="h-[18px] w-[18px]" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-4">
            More
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-secondary/60 rounded-lg mx-1 px-3 py-2.5 flex items-center gap-3 text-muted-foreground"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="h-[18px] w-[18px]" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        {!collapsed && (
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary/60 transition-colors text-sm">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
