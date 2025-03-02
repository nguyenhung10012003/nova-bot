'use client';
import { ChatMessage } from '@/@types/chat';
import { api } from '@/api/api';
import { ScrollArea } from '@nova/ui/components/ui/scroll-area';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useChat } from '../context/chat-context';
import ChatBubble, { ChatBubbleTyping } from './chat-bubble';

export function MessageContainer() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { chatSessionId } = useParams<{
    chatSessionId: string;
    chatflowId: string;
  }>();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [botIsTyping, setBotIsTyping] = useState(false);
  const [scrollToNewMessage, setScrollToNewMessage] = useState<boolean | null>(
    null,
  );
  const { socket } = useChat();

  // load history messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatSessionId) return;
      setLoading(true);
      const res = await api.get(`/chat-session/${chatSessionId}/messages`);
      if (!res.error) {
        setMessages(res);
        scrollToIndex(res.length - 1, { behavior: 'smooth' });
      } else {
        setError('Something went wrong');
      }
      setLoading(false);
    };

    fetchMessages();
  }, [chatSessionId]);

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
    if (socket) {
      socket.on(
        'message',
        (message: { data: ChatMessage & { botIsThinking?: boolean } }) => {
          setBotIsTyping(message.data?.botIsThinking || false);
          setMessages((prevMessages) => [...prevMessages, message.data]);
          setScrollToNewMessage(true);
        },
      );
    }

    return () => {
      if (socket) {
        socket.off('message');
      }
    };
  }, [socket]);

  useEffect(() => {
    if (scrollToNewMessage) {
      scrollToIndex(messages.length - 1, { behavior: 'smooth' });
      setScrollToNewMessage(false);
    }
  }, [scrollToNewMessage]);

  return (
    <ScrollArea className="h-full w-full py-4 px-3">
      <div
        className="flex flex-col gap-1 max-w-[650px] mx-auto"
        ref={containerRef}
      >
        {messages.map((message, index) => (
          <ChatBubble
            key={index}
            message={message}
            setRef={setItemRef}
            index={index}
          />
        ))}
        {botIsTyping && <ChatBubbleTyping />}
      </div>
    </ScrollArea>
  );
}
