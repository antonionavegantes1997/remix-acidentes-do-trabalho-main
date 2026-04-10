import { LayoutDashboard, AlertTriangle, FileText, Settings, GraduationCap, ClipboardList, Search } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
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

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Lançar Acidente", url: "/acidentes", icon: AlertTriangle },
  { title: "Ações", url: "/acoes", icon: ClipboardList },
  { title: "Etapas Investigação", url: "/etapas-investigacao", icon: Search },
  { title: "Treinamentos", url: "/treinamentos", icon: GraduationCap },
  { title: "Relatórios", url: "/relatorios", icon: FileText },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <div className="p-4 flex items-center gap-2 border-b border-sidebar-border">
        <img src="/cgb.png" alt="CGB" className="h-10 w-auto max-w-[140px] shrink-0 object-contain object-left" />
        {!collapsed && (
          <div>
            <p className="font-semibold text-sm text-foreground leading-tight">Portal</p>
            <p className="text-xs text-muted-foreground">Controle de acidentes</p>
          </div>
        )}
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
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
