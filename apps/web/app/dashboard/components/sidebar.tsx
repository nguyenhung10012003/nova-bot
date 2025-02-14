import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
} from '@nova/ui/components/ui/sidebar';
import { ChatbotMenu } from './chatbot-menu';
import { ChatflowSwitcher } from './chatflow-switcher';
import { HelpMenu } from './help-menu';
import { UserMenu } from './user-menu';

const data = {
  chatflows: [
    {
      name: 'Chatflow 1',
      id: '1',
    },
    {
      name: 'Chatflow 2',
      id: '2',
    },
  ],
};

export function DashboardSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <ChatflowSwitcher chatflows={data.chatflows} />
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <ChatbotMenu />
        <HelpMenu />
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <UserMenu user={{ email: 'nguyenhung1012003@gmail.com', avatar: '' }} />
      </SidebarFooter>
    </Sidebar>
  );
}
