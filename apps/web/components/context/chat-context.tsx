'use client';
import { socket } from '@/socket/socket';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';

interface ChatContextType {
  socket: Socket | null;
}

// Tạo context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {

  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <ChatContext.Provider value={{ socket }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
