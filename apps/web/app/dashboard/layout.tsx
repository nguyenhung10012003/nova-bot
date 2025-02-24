import { ScrollArea } from '@nova/ui/components/ui/scroll-area';
import { SidebarInset, SidebarProvider } from '@nova/ui/components/ui/sidebar';
import { PropsWithChildren } from 'react';
import { DashboardHeader } from '../../components/layout/dashboard-header';
import { DashboardSidebar } from '../../components/layout/sidebar';

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <ScrollArea className="h-[100vh] w-full pt-2 pb-4">
          <DashboardHeader />
          <main className="px-4 py-2">{children}</main>
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  );
}
