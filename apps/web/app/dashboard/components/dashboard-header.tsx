'use client';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from '@nova/ui/components/ui/breadcrumb';
import { Separator } from '@nova/ui/components/ui/separator';
import { SidebarTrigger } from '@nova/ui/components/ui/sidebar';
import { useParams } from 'next/navigation';

export function DashboardHeader() {
  const params = useParams<{ chatflowId: string }>();
  // const path = usePathname();
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href={params.chatflowId ? `/${params.chatflowId}` : '/'}
              >
                Chatbot
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
