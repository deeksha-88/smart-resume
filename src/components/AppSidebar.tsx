import { LayoutDashboard, Upload, BarChart3, AlertTriangle, Briefcase, IndianRupee, GraduationCap, FileText, MessageSquare, Bot } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Upload Resume", url: "/upload", icon: Upload },
  { title: "Analysis Score", url: "/analysis", icon: BarChart3 },
  { title: "Skill Gaps", url: "/skill-gaps", icon: AlertTriangle },
  { title: "Job Recommendations", url: "/jobs", icon: Briefcase },
  { title: "Salary Insights", url: "/salary", icon: IndianRupee },
  { title: "Learning Roadmap", url: "/roadmap", icon: GraduationCap },
  { title: "Modified Resume", url: "/resume", icon: FileText },
  { title: "Mock Interview", url: "/interview", icon: MessageSquare },
  { title: "Chatbot", url: "/chatbot", icon: Bot },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="glass-sidebar">
      <SidebarContent>
        <div className="p-4 pb-2">
          {!collapsed && <h2 className="text-lg font-bold gradient-text">AI Resume Pro</h2>}
          {collapsed && <div className="w-8 h-8 rounded-lg gradient-button flex items-center justify-center text-xs font-bold">AI</div>}
        </div>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/60 text-xs uppercase tracking-wider">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200"
                      activeClassName="bg-sidebar-accent text-primary font-medium glow-border"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
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
