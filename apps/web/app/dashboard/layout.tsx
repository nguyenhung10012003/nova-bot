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
        <main className="px-4 py-2">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
