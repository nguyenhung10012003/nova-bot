'use client';
import { ChatMessage } from '@/@types/chat';
import { ScrollArea } from '@nova/ui/components/ui/scroll-area';
import ChatBubble from './chat-bubble';
import { useEffect, useRef } from 'react';

const messages: ChatMessage[] = [
  {
    id: '1',
    message: 'Hello!',
    chatSessionId: '1',
    type: 'TEXT',
    status: 'CREATED',
    recipientType: 'USER',
    createdAt: new Date(),
  },
  {
    id: '2',
    message: 'Hi Alice!',
    chatSessionId: '1',
    type: 'TEXT',
    status: 'CREATED',
    recipientType: 'BOT',
    createdAt: new Date(),
  },
  {
    id: '3',
    message: 'How are you?',
    chatSessionId: '1',
    type: 'TEXT',
    status: 'CREATED',
    recipientType: 'USER',
    createdAt: new Date(),
  },
  {
    id: '4',
    message: 'I am good, thanks! How about you?',
    chatSessionId: '1',
    type: 'TEXT',
    status: 'CREATED',
    recipientType: 'BOT',
    createdAt: new Date(),
  },
  {
    id: '5',
    message: 'I am doing well, thank you!',
    chatSessionId: '1',
    type: 'TEXT',
    status: 'CREATED',
    recipientType: 'USER',
    createdAt: new Date(),
  },
  {
    id: '6',
    message: 'What are you up to?',
    chatSessionId: '1',
    type: 'TEXT',
    status: 'CREATED',
    recipientType: 'BOT',
    createdAt: new Date(),
  },
  {
    id: '7',
    message: 'Just working on a project.',
    chatSessionId: '1',
    type: 'TEXT',
    status: 'CREATED',
    recipientType: 'USER',
    createdAt: new Date(),
  },
  {
    id: '8',
    message: 'Sounds interesting!',
    chatSessionId: '1',
    type: 'TEXT',
    status: 'CREATED',
    recipientType: 'BOT',
    createdAt: new Date(),
  },
  {
    id: '9',
    message: 'Yes, it is quite challenging.',
    chatSessionId: '1',
    type: 'TEXT',
    status: 'CREATED',
    recipientType: 'USER',
    createdAt: new Date(),
  },
  {
    id: '10',
    message: 'I am sure you will do great!',
    chatSessionId: '1',
    type: 'TEXT',
    status: 'CREATED',
    recipientType: 'BOT',
    createdAt: new Date(),
  },
  {
    id: '11',
    message: 'Thanks for the encouragement!',
    chatSessionId: '1',
    type: 'TEXT',
    status: 'CREATED',
    recipientType: 'USER',
    createdAt: new Date(),
  },
  {
    id: '12',
    message: 'Anytime!',
    chatSessionId: '1',
    type: 'TEXT',
    status: 'CREATED',
    recipientType: 'BOT',
    createdAt: new Date(),
  },
  {
    id: '13',
    message: 'What about you?',
    chatSessionId: '1',
    type: 'TEXT',
    status: 'CREATED',
    recipientType: 'USER',
    createdAt: new Date(),
  },
  {
    id: '14',
    message: 'Just relaxing and reading a book.',
    chatSessionId: '1',
    type: 'TEXT',
    status: 'CREATED',
    recipientType: 'BOT',
    createdAt: new Date(),
  },
  {
    id: '15',
    message: 'Nice! What book are you reading?. I am looking for recommendations. Can you suggest one? I like mystery novels.',
    chatSessionId: '1',
    type: 'TEXT',
    status: 'CREATED',
    recipientType: 'USER',
    createdAt: new Date(),
  },
];

export function MessageContainer() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const setItemRef = (el: HTMLDivElement | null, index: number) => {
    if (el) {
      itemRefs.current[index] = el;
    }
  };

  const scrollToIndex = (index: number, viewOptions: ScrollIntoViewOptions) => {
    if (itemRefs.current[index]) {
      itemRefs.current[index]?.scrollIntoView(viewOptions);
    }
  };

  useEffect(() => {
    scrollToIndex(messages.length - 1, { behavior: 'smooth' });
  }, []);

  return (
    <ScrollArea className="h-full w-full py-4">
      <div className="flex flex-col gap-1 max-w-[650px] mx-auto" ref={containerRef}>
        {messages.map((message, index) => (
          <ChatBubble key={index} message={message} setRef={setItemRef} index={index}/>
        ))}
      </div>
    </ScrollArea>
  );
}
