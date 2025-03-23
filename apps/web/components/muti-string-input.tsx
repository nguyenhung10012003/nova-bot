'use client';

import { Badge } from '@nova/ui/components/ui/badge';
import { Button } from '@nova/ui/components/ui/button';
import { Input } from '@nova/ui/components/ui/input';
import { X } from 'lucide-react';
import { useState, type ChangeEvent, type KeyboardEvent } from 'react';

type MutiStringInputProps = {
  strs?: string[];
  onAddTag?: (tag: string) => void;
  onRemoveTag?: (tag: string) => void;
} & React.HTMLAttributes<HTMLInputElement>;

export default function MultiStringInput({
  onAddTag,
  onRemoveTag,
  strs,
  ...props
}: MutiStringInputProps) {
  const [tags, setTags] = useState<string[]>(strs || []);
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    if (inputValue.trim() !== '') {
      setTags([...tags, inputValue.trim()]);
      onAddTag?.(inputValue.trim());
      setInputValue('');
    }
  };

  const removeTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
    if (tags[indexToRemove]) onRemoveTag?.(tags[indexToRemove]);
  };

  return (
    <div className="w-full flex items-center gap-2">
      <div className="flex flex-wrap gap-2 p-1 px-2 border rounded-md min-h-9 items-center w-full">
        {tags.map((tag, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="flex items-center gap-1 px-2 py-0 h-6"
          >
            {tag}
            <X
              className="w-3 h-3 cursor-pointer hover:text-destructive transition-colors"
              onClick={() => removeTag(index)}
            />
          </Badge>
        ))}
        <div className="flex-1 flex items-center min-w-[80px]">
          <Input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-auto p-0"
            placeholder={tags.length === 0 ? 'Enter pattern...' : ''}
            {...props}
          />
        </div>
      </div>
      <div className="">
        <Button
          onClick={addTag}
          size="sm"
          disabled={inputValue.trim() === ''}
          className="w-full"
        >
          Add
        </Button>
      </div>
    </div>
  );
}
