import { useState } from "react";
import { Users, Building2, ShoppingBag, Package, Tag, Euro, Settings, Home, QrCode, UserPlus, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, useSidebar } from "@/components/ui/sidebar";

interface AppSidebarProps {
  viewMode: string;
  onViewModeChange: (mode: string) => void;
  newOrderCount?: number;
}

const navigationItems = {
  "Overzicht": [{
    key: "statistics",
    title: "Statistieken",
    icon: BarChart3,
    description: "Real-time bezoekersstatistieken"
  }],
  "Gebruikers & Data": [{
    key: "memberships",
    title: "Lidmaatschappen",
    icon: Users,
    description: "Beheer lidmaatschappen en gebruikers"
  }, {
    key: "profiles",
    title: "Bedrijven",
    icon: Building2,
    description: "Beheer bedrijfsprofielen"
  }, {
    key: "partners",
    title: "Partners",
    icon: Building2,
    description: "Beheer partneraccounts"
  }],
  "Webshop": [{
    key: "orders",
    title: "Bestellingen",
    icon: ShoppingBag,
    description: "Bekijk en beheer bestellingen"
  }, {
    key: "products",
    title: "Producten",
    icon: Package,
    description: "Beheer productcatalogus"
  }, {
    key: "discounts",
    title: "Kortingen",
    icon: Tag,
    description: "Beheer kortingscodes"
  }],
  "Configuratie": [{
    key: "partner-pricing",
    title: "Partner Prijzen",
    icon: Settings,
    description: "Stel partnerprijzen in"
  }, {
    key: "lidmaatschappen-prijzen",
    title: "Lidmaatschappen Prijzen",
    icon: Euro,
    description: "Stel lidmaatschappen prijzen in"
  }, {
    key: "onze-partners-prijzen",
    title: "Onze Partners Prijzen",
    icon: Euro,
    description: "Beheer partnerprijzen"
  }],
  "Tools": [{
    key: "qrcode",
    title: "QR Code Generator",
    icon: QrCode,
    description: "Genereer QR codes"
  }]
};

export function AppSidebar({
  viewMode,
  onViewModeChange,
  newOrderCount = 0
}: AppSidebarProps) {
  const {
    state
  } = useSidebar();
  const collapsed = state === "collapsed";
  
  return <Sidebar className="border-r border-border/50 bg-card/50 backdrop-blur-sm">
      <SidebarHeader className="border-b border-border/50 p-6 mt-16 pt-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Home className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && <div>
              <h2 className="font-semibold text-foreground">Dashboard</h2>
              <p className="text-xs text-muted-foreground">Bouw met Respect</p>
            </div>}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        {Object.entries(navigationItems).map(([groupName, items]) => <SidebarGroup key={groupName} className="mb-6">
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
              {!collapsed && groupName}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {items.map(item => <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton onClick={() => onViewModeChange(item.key)} className={`
                        w-full justify-start px-3 py-2.5 rounded-lg transition-all duration-200 relative
                        ${viewMode === item.key ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}
                      `} tooltip={collapsed ? item.title : undefined}>
                      <item.icon className={`
                        w-4 h-4 shrink-0
                        ${viewMode === item.key ? 'text-primary' : ''}
                      `} />
                      {!collapsed && <div className="flex-1 min-w-0 flex items-center justify-between">
                          <div className="font-medium text-sm">{item.title}</div>
                          {item.key === 'orders' && newOrderCount > 0 && (
                            <Badge variant="destructive" className="ml-2 min-w-[20px] h-5 text-xs px-1.5 animate-pulse">
                              {newOrderCount > 99 ? '99+' : newOrderCount}
                            </Badge>
                          )}
                        </div>}
                      {collapsed && item.key === 'orders' && newOrderCount > 0 && (
                        <Badge variant="destructive" className="absolute -top-1 -right-1 min-w-[16px] h-4 text-xs px-1 animate-pulse">
                          {newOrderCount > 9 ? '9+' : newOrderCount}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>)}
      </SidebarContent>
    </Sidebar>;
}