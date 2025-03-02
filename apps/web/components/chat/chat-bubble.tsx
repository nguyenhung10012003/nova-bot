'use client';
import { ChatMessage } from '@/@types/chat';
import useCopyToClipboard from '@/hooks/useCopyToClipboard';
import { Button } from '@nova/ui/components/ui/button';
import { Clipboard, ClipboardCheck, ThumbsDown, ThumbsUp } from 'lucide-react';
import Markdown from 'react-markdown';

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
          className={`rounded-xl px-3 py-2 ${message.recipientType === 'USER' ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground'}`}
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
