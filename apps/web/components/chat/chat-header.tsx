'use client';
import { ChatSession } from '@/@types/chat';
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@nova/ui/components/ui/tooltip';
import { Clock, Plus, Search, Trash } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

type ChatHeaderProps = {
  title?: string;
};

const demoChatSessions: ChatSession[] = [
  {
    id: '1',
    title: 'Chat with Alice',
    createdAt: new Date('2023-01-01T10:00:00Z'),
  },
  {
    id: '2',
    title: 'Project discussion',
    createdAt: new Date('2023-02-15T14:30:00Z'),
  },
  {
    id: '3',
    title: 'Support chat',
    createdAt: new Date('2023-03-20T09:45:00Z'),
  },
  {
    id: '4',
    title: 'Team meeting',
    createdAt: new Date('2023-04-10T11:00:00Z'),
  },
  {
    id: '5',
    title: 'Client call',
    createdAt: new Date('2023-05-05T16:00:00Z'),
  },
  {
    id: '6',
    title: 'Brainstorming session',
    createdAt: new Date('2023-06-01T10:00:00Z'),
  },
  {
    id: '7',
    title: 'Weekly sync',
    createdAt: new Date('2023-06-08T11:00:00Z'),
  },
  {
    id: '8',
    title: 'One-on-one',
    createdAt: new Date('2023-06-15T14:00:00Z'),
  },
  {
    id: '9',
    title: 'Design review',
    createdAt: new Date('2023-06-22T15:00:00Z'),
  },
  {
    id: '10',
    title: 'Code review',
    createdAt: new Date('2023-06-29T16:00:00Z'),
  },
  {
    id: '11',
    title: 'Sprint planning',
    createdAt: new Date('2023-07-06T10:00:00Z'),
  },
  {
    id: '12',
    title: 'Retrospective',
    createdAt: new Date('2023-07-13T11:00:00Z'),
  },
  {
    id: '13',
    title: 'Client feedback',
    createdAt: new Date('2023-07-20T14:00:00Z'),
  },
  {
    id: '14',
    title: 'Product demo',
    createdAt: new Date('2023-07-27T15:00:00Z'),
  },
  {
    id: '15',
    title: 'Team building',
    createdAt: new Date('2023-08-03T16:00:00Z'),
  },
  {
    id: '16',
    title: 'Marketing strategy',
    createdAt: new Date('2023-08-10T10:00:00Z'),
  },
  {
    id: '17',
    title: 'Sales call',
    createdAt: new Date('2023-08-17T11:00:00Z'),
  },
  {
    id: '18',
    title: 'Tech talk',
    createdAt: new Date('2023-08-24T14:00:00Z'),
  },
  {
    id: '19',
    title: 'Customer support',
    createdAt: new Date('2023-08-31T15:00:00Z'),
  },
  {
    id: '20',
    title: 'Investor meeting',
    createdAt: new Date('2023-09-07T16:00:00Z'),
  },
];

export function ChatHeader({ title }: ChatHeaderProps) {
  const router = useRouter();
  const { chatflowId, sessionId } = useParams<{
    chatflowId: string;
    sessionId: string;
  }>();

  const handleNewSession = async () => {
    router.push(`/dashboard/${chatflowId}/playground`);
  };

  const handleDeleteSession = async (id?: string) => {
    if (!id) return;
    if (id === sessionId) {
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
        <SheetContent side="right" className='p-0'>
          <SheetHeader className='p-4'>
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
          <ScrollArea className='px-4 h-full'>
            <div className="flex flex-col gap-1 mt-4">
              {demoChatSessions.map((session, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between hover:bg-muted px-4 py-2 rounded-lg cursor-pointer group transition-colors ${session.id === sessionId ? 'bg-muted' : ''}`}
                >
                  <div
                    onClick={() =>
                      router.push(
                        `/dashboard/${chatflowId}/playground/${session.id}`,
                      )
                    }
                    className="flex-1 h-7 items-center flex"
                  >
                    {session.title}
                  </div>
                  <Button
                    className="group-hover:flex hidden opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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
