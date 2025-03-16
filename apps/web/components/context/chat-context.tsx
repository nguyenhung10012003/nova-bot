'use client';
import { ChatMessage } from '@/@types/chat';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface ChatContextType {
  socket: Socket | null;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  chatSessionId: string | null;
  setChatSessionId: React.Dispatch<React.SetStateAction<string | null>>;
}

// Tạo context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL, {
      transports: ['websocket'],
    });
    setSocket(socket);

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <ChatContext.Provider value={{ socket, messages, setMessages, chatSessionId, setChatSessionId }}>{children}</ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
