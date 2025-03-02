import { ChatHeader } from './chat-header';
import ChatInput from './chat-input';
import { MessageContainer } from './message-container';

export function ChatInterface() {
  return (
    <div className="flex flex-col h-full w-full items-center justify-between mx-auto pb-6">
      <ChatHeader />
      <MessageContainer />
      <ChatInput />
    </div>
  );
}
