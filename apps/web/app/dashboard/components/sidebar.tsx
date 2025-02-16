import { api } from '@/api/api';
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

const getChatflows = async () => {
  try {
    return await api.get('/chatflow', {
      next: {
        tags: ['chatflows'],
      },
    });
  } catch (error) {
    console.error(error);
    return null;
  }
};

export async function DashboardSidebar() {
  const chatflows = await getChatflows();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <ChatflowSwitcher chatflows={chatflows || []} />
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
