import { SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@nova/ui/components/ui/sidebar";
import { FileText } from "lucide-react";
import Link from "next/link";


export function HelpMenu() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Help</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/doc" prefetch={false}>
                <FileText />
                <span>Documentations</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
