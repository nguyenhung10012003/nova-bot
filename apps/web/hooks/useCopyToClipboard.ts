import { useCallback, useState } from 'react';

const useCopyToClipboard = (resetTime: number = 2000) => {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const copyToClipboard = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), resetTime);
      } catch (error) {
        console.error('Failed to copy: ', error);
        setIsCopied(false);
      }
    },
    [resetTime],
  );

  return { copyToClipboard, isCopied };
};

export default useCopyToClipboard;
