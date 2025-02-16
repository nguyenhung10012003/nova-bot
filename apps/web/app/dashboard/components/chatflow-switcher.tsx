'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@nova/ui/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@nova/ui/components/ui/sidebar';
import { ChevronsUpDown, Plus, Workflow } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import * as React from 'react';

export function ChatflowSwitcher({
  chatflows,
}: {
  chatflows: {
    name: string;
    // logo: React.ElementType;
    id: string;
  }[];
}) {
  const { isMobile } = useSidebar();
  const [activeChatflow, setActiveChatflow] = React.useState(chatflows[0]);
  const router = useRouter();
  const params = useParams<{ chatflowId: string }>();

  const handleChatflowChange = (chatflow: { name: string; id: string }) => {
    setActiveChatflow(chatflow);
    router.push(`/dashboard/${chatflow.id}`);
  };

  React.useEffect(() => {
    if (params.chatflowId) {
      const chatflow = chatflows.find(
        (chatflow) => chatflow.id === params.chatflowId,
      );
      if (chatflow) setActiveChatflow(chatflow);
    } else {
      setActiveChatflow(chatflows[0]);
    }
  }, [params.chatflowId]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              disabled={chatflows.length === 0}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                {activeChatflow && <Workflow className="size-4" />}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeChatflow?.name || ''}
                </span>
                <span className="truncate text-xs">
                  {activeChatflow?.id || ''}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Teams
            </DropdownMenuLabel>
            {chatflows.map((chatflow, index) => (
              <DropdownMenuItem
                key={index}
                onClick={() => handleChatflowChange(chatflow)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <Workflow className="size-4 shrink-0" />
                </div>
                {chatflow.name}
                {/* <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut> */}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                Add chatflow
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
