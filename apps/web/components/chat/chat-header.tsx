'use client';
import { ChatSession } from '@/@types/chat';
import revalidate from '@/api/action';
import { api } from '@/api/api';
import { Button } from '@nova/ui/components/ui/button';
import { Input } from '@nova/ui/components/ui/input';
import { ScrollArea } from '@nova/ui/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@nova/ui/components/ui/sheet';
import { toast } from '@nova/ui/components/ui/sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@nova/ui/components/ui/tooltip';
import { Clock, Plus, Search, Trash } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

type ChatHeaderProps = {
  title?: string;
  chatSessions: ChatSession[];
};

export function ChatHeader({ title, chatSessions }: ChatHeaderProps) {
  const router = useRouter();
  const { chatflowId, chatSessionId } = useParams<{
    chatflowId: string;
    chatSessionId: string;
  }>();

  const handleNewSession = async () => {
    router.push(`/dashboard/${chatflowId}/playground`);
  };

  const handleDeleteSession = async (id?: string) => {
    if (!id) return;
    const res = await api.delete(`/chat-session/${id}`);
    if (!res.error) {
      revalidate('chat-sessions');
      toast.success('Chat session deleted successfully');
    } else {
      toast.error('Failed to delete chat session');
    }
    if (id === chatSessionId) {
      router.push(`/dashboard/${chatflowId}/playground`);
    }
  };

  return (
    <div className="flex justify-between gap-4 items-center w-full py-2 border-b max-w-[650px]">
      <Button className="gap-2" variant={'outline'} onClick={handleNewSession}>
        <Plus />
        <span>New chat</span>
      </Button>
      <Tooltip>
        <TooltipTrigger>
          <h2 className="text-lg font-semibold line-clamp-1">{title}</h2>
        </TooltipTrigger>
        <TooltipContent>{title}</TooltipContent>
      </Tooltip>
      <Sheet>
        <SheetTrigger>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-9 h-9 p-1 hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                <Clock size={24} />
              </div>
            </TooltipTrigger>
            <TooltipContent>See chat histories</TooltipContent>
          </Tooltip>
        </SheetTrigger>
        <SheetContent side="right" className="p-0 flex flex-col gap-0">
          <SheetHeader className="p-4">
            <SheetTitle>Chat histories</SheetTitle>
            <SheetDescription />
            <div className="border-b border-dashed pb-4 relative flex items-center">
              <Input
                className="rounded-full pr-10"
                placeholder="Search chat..."
              />
              <Search className="absolute right-4 text-muted-foreground" />
            </div>
          </SheetHeader>
          <ScrollArea className="px-4 h-full pb-4">
            <div className="flex flex-col gap-1 mt-4">
              {chatSessions.map((session, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between hover:bg-muted px-4 py-2 rounded-lg cursor-pointer group transition-colors ${session.id === chatSessionId ? 'bg-muted' : ''}`}
                >
                  <div
                    onClick={() =>
                      router.push(
                        `/dashboard/${chatflowId}/playground/${session.id}`,
                      )
                    }
                    className="flex-1 h-7 items-center flex"
                  >
                    <span className='line-clamp-1'>{session.title || 'Untitled'}</span>
                  </div>
                  <Button
                    className="group-hover:visible flex invisible opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    variant="destructive"
                    onClick={() => handleDeleteSession(session.id)}
                    size={'tiny'}
                  >
                    <Trash size={20} />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
