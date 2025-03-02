import { SidebarInset, SidebarProvider } from '@nova/ui/components/ui/sidebar';
import { PropsWithChildren } from 'react';
import { DashboardHeader } from '../../components/layout/dashboard-header';
import { DashboardSidebar } from '../../components/layout/sidebar';

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="py-2 h-[calc(100vh-4rem)]">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
