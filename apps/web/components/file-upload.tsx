'use client';
import useDragDrop from '@/hooks/useDragDrop';
import { cn } from '@nova/ui/lib/utils';
import { useRef } from 'react';

type FileUploadProps = {
  onUpload?: (files: File[]) => void;
  accept?: string;
  className?: string;
};
export const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  accept,
  className,
}: FileUploadProps) => {
  const onDrop = (files: FileList) => {
    const filesArray = Array.from(files);
    if (onUpload) {
      onUpload(filesArray);
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);
  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const {
    isDragging,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  } = useDragDrop(onDrop);

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      className={cn(
        `w-72 h-32 border-2 border-dashed flex flex-col items-center justify-center transition-colors rounded-xl hover:cursor-pointer hover:bg-accent ${isDragging ? 'bg-accent' : 'bg-background'}`,
        className,
      )}
    >
      <p className="text-muted-foreground">
        {isDragging ? 'Drop files here...' : 'Drag and drop files here'}
      </p>
      <input
        type="file"
        ref={inputRef}
        multiple
        onChange={(e) => {
          if (e.target.files) {
            onDrop(e.target.files);
          }
        }}
        className="hidden"
        accept={accept}
      />
    </div>
  );
};
