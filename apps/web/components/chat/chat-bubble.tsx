'use client';
import { ChatMessage } from '@/@types/chat';
import useCopyToClipboard from '@/hooks/useCopyToClipboard';
import { Button } from '@nova/ui/components/ui/button';
import { Clipboard, ClipboardCheck, ThumbsDown, ThumbsUp } from 'lucide-react';
import Markdown from 'react-markdown';

import { motion } from "framer-motion";

export const ChatBubbleTyping = () => {
  return (
    <div className="flex items-center gap-2 rounded-xl px-3 py-3 w-fit bg-secondary text-secondary-foreground self-start">
      <div className="flex gap-1">
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            className="w-2 h-2 bg-gray-500 rounded-full"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              repeat: Infinity,
              duration: 1.2,
              ease: "easeInOut",
              delay: index * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );
};

type ChatBubbleProps = {
  message: ChatMessage;
  index?: number;
  setRef?: (el: HTMLDivElement | null, index: number) => void;
};

export default function ChatBubble({ message, setRef, index }: ChatBubbleProps) {
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  const handleThumbsUp = async () => {
    console.log('Thumbs up');
  };

  const handleThumbsDown = async () => {
    console.log('Thumbs down');
  };

  return (
    <div
      ref={(el) => setRef?.(el, index || 0)}
      className={`flex w-full items-center ${message.recipientType === 'USER' ? 'justify-start' : 'justify-end'}`}
    >
      <div className="flex max-w-[80%] flex-col gap-0.5 group">
        <div
          className={`rounded-xl px-3 py-2 ${message.recipientType === 'USER' ? 'bg-secondary text-secondary-foreground self-start' : 'bg-primary text-primary-foreground self-end'}`}
        >
          <Markdown>{message.message}</Markdown>
        </div>
        <div
          className={`flex items-center h-7 ${message.recipientType === 'USER' ? 'justify-end' : 'justify-start'} invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300`}
        >
          <Button
            variant="ghost"
            className="h-7 w-7 p-1"
            onClick={handleThumbsUp}
          >
            <ThumbsUp size={16} />
          </Button>
          <Button
            variant="ghost"
            className="h-7 w-7 p-1"
            onClick={handleThumbsDown}
          >
            <ThumbsDown size={16} />
          </Button>
          <Button
            variant="ghost"
            className="h-7 w-7 p-1"
            onClick={() => copyToClipboard(message.message || '')}
            disabled={isCopied}
          >
            {isCopied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
          </Button>
        </div>
      </div>
    </div>
  );
}