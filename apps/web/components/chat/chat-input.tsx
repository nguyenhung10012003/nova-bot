'use client';
import { ChatSession } from '@/@types/chat';
import revalidate from '@/api/action';
import { Button } from '@nova/ui/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@nova/ui/components/ui/tooltip';
import { ArrowUp, Paperclip } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '../context/chat-context';

type ChatInputProps = {
  disableAttach?: boolean;
  onValueChange?: (text: string) => void;
};
const ChatInput: React.FC = ({
  onValueChange,
  disableAttach = true,
}: ChatInputProps) => {
  const [text, setText] = useState('');
  const { socket } = useChat();
  const { chatflowId } = useParams<{
    chatflowId: string;
  }>();

  const [chatSessionId, setChatSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (socket) {
      socket.on('chatSession', (data: ChatSession) => {
        setChatSessionId(data.id || null);
        revalidate('chat-sessions');
      });
    }

    return () => {
      if (socket) {
        socket.off('chatSession');
      }
    };
  }, [socket]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
    onValueChange?.(event.target.value);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleSendMessage = async () => {
    if (!text || !socket) return;
    const message = {
      message: text,
      type: 'TEXT',
      chatSessionId,
      chatflowId,
    };
    socket.emit('message', message);
    setText('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.nativeEvent.isComposing) return; // Tránh gửi tin nhắn khi đang gõ bộ gõ IME
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col w-full max-w-[650px] rounded-2xl border border-input bg-background text-foreground shadow-md sticky">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Ask a follow up..."
        className="w-full resize-none bg-transparent text-foreground text-sm outline-none p-3 pb-1.5 rounded-xl overflow-hidden"
        rows={1}
      />
      <div className="flex justify-between p-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="h-7 w-7 p-0"
              disabled={disableAttach}
            >
              <Paperclip size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Attach a file</TooltipContent>
        </Tooltip>
        <Button
          variant={'secondary'}
          className="h-7 w-7 p-0"
          disabled={!text}
          onClick={handleSendMessage}
        >
          <ArrowUp size={16} />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
