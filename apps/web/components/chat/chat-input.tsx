'use client';
import { Button } from '@nova/ui/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@nova/ui/components/ui/tooltip';
import { ArrowUp, Paperclip } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

type ChatInputProps = {
  disableAttach?: boolean;
  value?: string;
  onValueChange?: (text: string) => void;
};
const ChatInput: React.FC = ({
  value,
  onValueChange,
  disableAttach = true,
}: ChatInputProps) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setText(value || '');
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
    onValueChange?.(event.target.value);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="flex flex-col w-full max-w-[650px] rounded-2xl border border-input bg-background text-foreground shadow-md sticky">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
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
        <Button variant={'secondary'} className="h-7 w-7 p-0">
          <ArrowUp size={16} />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
