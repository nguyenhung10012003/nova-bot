'use client';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@nova/ui/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@nova/ui/components/ui/sidebar';
import {
  ChevronRight,
  Code,
  FileStack,
  History,
  Settings,
  Share2,
  SquareTerminal,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';

export function ChatbotMenu() {
  const params = useParams<{ chatflowId: string }>();

  const isActive = useMemo(() => {
    return params.chatflowId ? true : false;
  }, [params.chatflowId]);

  if (!params.chatflowId) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Chatbot</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href={`/${params.chatflowId}/playground`} prefetch={false}>
                <SquareTerminal />
                <span>Playground</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href={`/${params.chatflowId}/history`} prefetch={false}>
                <History />
                <span>History</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href={`/${params.chatflowId}/sources`} prefetch={false}>
                <FileStack />
                <span>Sources</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <Collapsible>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild className="group/collapsible">
                <SidebarMenuButton>
                  <Share2 />
                  <span>Connect</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link
                        href={`/${params.chatflowId}/connect?channel=fb`}
                        prefetch={false}
                      >
                        <span>Facebook</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link
                        href={`/${params.chatflowId}/connect?channel=telegram`}
                        prefetch={false}
                      >
                        <span>Telegram</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href={`/${params.chatflowId}/integration`} prefetch={false}>
                <Code />
                <span>Integration</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href={`/${params.chatflowId}/setting`} prefetch={false}>
                <Settings />
                <span>Setting</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
