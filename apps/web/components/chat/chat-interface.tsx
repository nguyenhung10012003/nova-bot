import { api } from '@/api/api';
import { ChatHeader } from './chat-header';
import ChatInput from './chat-input';
import { MessageContainer } from './message-container';

const getChatSessions = async (chatflowId: string) => {
  const res = await api.get(`/chat-session?chatflowId=${chatflowId}`, {
    next: {
      tags: ['chat-sessions'],
    }
  });
  if (!res.error) {
    return res;
  }

  return null;
};

const getChatSession = async (chatSessionId: string) => {
  const res = await api.get(`/chat-session/${chatSessionId}`, {
    next: {
      tags: [`chat-session-${chatSessionId}`],
    }
  });

  if (!res.error) {
    return res;
  }

  return null;
};

type ChatInterfaceProps = {
  chatflowId: string;
  chatSessionId?: string;
  ignoreInput?: boolean;
};

export async function ChatInterface({
  chatflowId,
  chatSessionId,
  ignoreInput,
}: ChatInterfaceProps) {
  const chatSessions = await getChatSessions(chatflowId);
  const chatSession = chatSessionId ? await getChatSession(chatSessionId) : null;
  return (
    <div className="flex flex-col h-full w-full items-center justify-between mx-auto pb-6">
      <ChatHeader title={chatSession?.title} chatSessions={chatSessions || []}/>
      <MessageContainer />
      {!ignoreInput && <ChatInput />}
    </div>
  );
}
