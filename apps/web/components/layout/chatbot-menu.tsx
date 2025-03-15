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
  Settings,
  Share2,
  SquareTerminal,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export function ChatbotMenu() {
  const params = useParams<{ chatflowId: string }>();

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
              <Link
                href={`/dashboard/${params.chatflowId}/playground`}
                prefetch={false}
              >
                <SquareTerminal />
                <span>Playground</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <Collapsible>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild className="group/collapsible">
                <SidebarMenuButton>
                  <FileStack />
                  <span>Sources</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link
                        href={`/dashboard/${params.chatflowId}/sources/web`}
                        prefetch={false}
                      >
                        <span>Web</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link
                        href={`/dashboard/${params.chatflowId}/sources/file`}
                        prefetch={false}
                      >
                        <span>File</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link
                        href={`/dashboard/${params.chatflowId}/sources/text`}
                        prefetch={false}
                      >
                        <span>Text</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link
                href={`/dashboard/${params.chatflowId}/integration`}
                prefetch={false}
              >
                <Share2 />
                <span>Integration</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link
                href={`/dashboard/${params.chatflowId}/embed`}
                prefetch={false}
              >
                <Code />
                <span>Embed</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link
                href={`/dashboard/${params.chatflowId}/setting`}
                prefetch={false}
              >
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
